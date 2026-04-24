# Interactive ITIL Dashboard — Technical Architecture

## 1. Overview

A centralized, interactive dashboard for managing ITIL processes within Managed Services. Replaces 16+ scattered process documents with clickable visual workflows, integrated actions (incident creation, RCA reports, meeting scheduling), and role-based editing — all built on the existing Azure stack.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USERS (Browser)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Process      │  │  Admin       │  │  SharePoint Pages        │  │
│  │  Viewer       │  │  Editor UI   │  │  (Document Content)      │  │
│  │  (React Flow) │  │  (React Flow │  │                          │  │
│  │              │  │   Edit Mode) │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘  │
└─────────┼─────────────────┼────────────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 AZURE STATIC WEB APPS (SWA)                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  React SPA                                                    │  │
│  │  ├── Process Viewer      (React Flow — read-only mode)       │  │
│  │  ├── Process Editor      (React Flow — edit mode, RBAC)      │  │
│  │  ├── Action Panel        (checklists, forms, triggers)       │  │
│  │  ├── Dashboard Home      (process catalog, search, status)   │  │
│  │  └── Admin Panel         (user roles, audit log)             │  │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                    SWA Managed API                                   │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 AZURE FUNCTIONS (.NET 8, Isolated)                   │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│  │ Workflow API    │  │ Integration    │  │ Admin API            │  │
│  │                │  │ API            │  │                      │  │
│  │ GET  /processes│  │ POST /topdesk/ │  │ GET  /users/roles    │  │
│  │ GET  /process/ │  │      incidents │  │ PUT  /users/{id}/    │  │
│  │      {id}      │  │ POST /topdesk/ │  │      role            │  │
│  │ PUT  /process/ │  │      rca       │  │ GET  /audit-log      │  │
│  │      {id}      │  │ POST /graph/   │  │                      │  │
│  │ POST /process  │  │      meeting   │  │                      │  │
│  │ DELETE /process│  │ GET  /topdesk/ │  │                      │  │
│  │      /{id}     │  │      status    │  │                      │  │
│  └───────┬────────┘  └───────┬────────┘  └──────────┬───────────┘  │
└──────────┼───────────────────┼──────────────────────┼──────────────┘
           │                   │                      │
           ▼                   ▼                      ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐
│ Azure Cosmos DB  │ │ External APIs    │ │ Microsoft Entra ID       │
│ (Workflow Store) │ │                  │ │ (Authentication + RBAC)  │
│                  │ │ ├─ TopDesk REST  │ │                          │
│ ├─ processes     │ │ │  API           │ │ App Roles:               │
│ ├─ steps         │ │ ├─ MS Graph API  │ │ ├─ Viewer               │
│ ├─ actions       │ │ │  (Calendar,    │ │ ├─ Operator              │
│ ├─ checklists    │ │ │   Teams,       │ │ ├─ ProcessEditor         │
│ └─ audit_log     │ │ │   OneDrive)    │ │ └─ Admin                 │
│                  │ │ └─ SharePoint    │ │                          │
│                  │ │    API           │ │                          │
└──────────────────┘ └──────────────────┘ └──────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18 + TypeScript | Team skill reuse, component ecosystem |
| **Workflow Engine** | [React Flow](https://reactflow.dev) v12 | Industry-standard interactive flowcharts, built-in editing mode |
| **Styling** | Tailwind CSS | Consistent with existing hackathon POCs |
| **Hosting** | Azure Static Web Apps | Existing infrastructure, zero-config auth |
| **Backend API** | .NET 8 Azure Functions (Isolated) | Matches existing stack, serverless scaling |
| **Workflow Storage** | Azure Cosmos DB (NoSQL) | JSON document model fits graph/flow data naturally |
| **Authentication** | Microsoft Entra ID | SSO, app roles, already in use |
| **ITSM Integration** | TopDesk REST API | Direct HTTP calls from backend |
| **Calendar/Teams** | Microsoft Graph API | Meeting scheduling, Teams integration |
| **Document Content** | SharePoint Online | Native page editing for non-technical users |

---

## 4. Core Components

### 4.1 Process Viewer (Read-Only)

Interactive flowchart rendering ITIL process steps. Users click any step node to open its detail panel.

```
┌─────────────────────────────────────────────────────────┐
│  Incident Management Process                    [Edit]  │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │ Detect   │───▶│ Classify │───▶│ Investigate      │  │
│  │          │    │ & Log    │    │ & Diagnose       │  │
│  └──────────┘    └──────────┘    └────────┬─────────┘  │
│                                           │             │
│                                           ▼             │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │ Close    │◀───│ Review   │◀───│ Resolve          │◀─┤ SELECTED
│  │          │    │          │    │ ☑ Checklist (4/6) │  │
│  └──────────┘    └──────────┘    └──────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ STEP: Resolve                                    │   │
│  │                                                  │   │
│  │ ☑ Apply fix / workaround                        │   │
│  │ ☑ Verify with customer                          │   │
│  │ ☐ Generate RCA report         [Create RCA ▶]    │   │
│  │ ☐ Schedule RCA meeting        [Schedule ▶]      │   │
│  │ ☐ Update TopDesk ticket       [Update ▶]        │   │
│  │ ☐ Notify stakeholders         [Notify ▶]        │   │
│  │                                                  │   │
│  │ 📄 Related Docs: SP link 1 | SP link 2          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Process Editor (Admin Mode)

Authorized users (`ProcessEditor`, `Admin` roles) toggle edit mode to visually modify workflows.

**Capabilities:**
- Add / remove / reorder process step nodes
- Edit step title, description, and checklist items
- Connect / disconnect step relationships (edges)
- Attach action buttons to steps (TopDesk, Graph, SharePoint triggers)
- Drag-and-drop repositioning
- Save with version history (audit trail)

**Implementation:** React Flow's built-in `onNodesChange`, `onEdgesChange`, `onConnect` handlers + custom node editor sidebar.

### 4.3 Integrated Actions

Each process step can have attached **action buttons** that trigger backend operations:

| Action | Backend Integration | API |
|---|---|---|
| Create Incident | TopDesk | `POST /api/topdesk/incidents` |
| Generate RCA Report | Template engine + TopDesk data | `POST /api/topdesk/rca` |
| Schedule RCA Meeting | Microsoft Graph Calendar | `POST /api/graph/meeting` |
| Update Ticket Status | TopDesk | `PATCH /api/topdesk/incidents/{id}` |
| Notify Stakeholders | Microsoft Graph Mail / Teams | `POST /api/graph/notify` |
| Link Document | SharePoint | `GET /api/sharepoint/search` |

### 4.4 Dashboard Home

Landing page showing:
- **Process Catalog** — all ITIL processes (Incident, Problem, Change, Alerting, etc.) as cards
- **Search** — full-text search across process steps and checklists
- **Recent Activity** — last edited processes, recent actions taken
- **Quick Stats** — open incidents, pending RCAs, upcoming meetings

---

## 5. Data Model (Cosmos DB)

### 5.1 Process Document

```json
{
  "id": "proc-incident-mgmt",
  "partitionKey": "process",
  "name": "Incident Management",
  "category": "ITIL",
  "description": "End-to-end incident lifecycle for managed services",
  "version": 12,
  "status": "published",
  "lastModifiedBy": "user@company.com",
  "lastModifiedAt": "2026-04-20T14:30:00Z",
  "nodes": [
    {
      "id": "step-1",
      "type": "processStep",
      "label": "Detect",
      "description": "Identify the incident via monitoring, customer report, or alert.",
      "position": { "x": 100, "y": 200 },
      "checklist": [
        { "id": "chk-1", "label": "Confirm alert source", "required": true },
        { "id": "chk-2", "label": "Validate impact scope", "required": true }
      ],
      "actions": [
        {
          "id": "act-1",
          "type": "topdesk-create-incident",
          "label": "Create Incident",
          "config": { "category": "Infrastructure", "priority": "P1" }
        }
      ],
      "linkedDocs": [
        { "title": "Alerting Runbook", "url": "https://company.sharepoint.com/..." }
      ]
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "step-1", "target": "step-2", "label": "Classified" }
  ]
}
```

### 5.2 Audit Log Entry

```json
{
  "id": "audit-uuid",
  "partitionKey": "audit",
  "processId": "proc-incident-mgmt",
  "action": "step_added",
  "userId": "user@company.com",
  "timestamp": "2026-04-20T14:35:00Z",
  "before": null,
  "after": { "id": "step-7", "label": "Escalate to Vendor" }
}
```

---

## 6. Authentication & Authorization

### 6.1 Entra ID App Roles

| Role | Permissions |
|---|---|
| `Viewer` | View processes, use checklists, trigger read-only actions |
| `Operator` | All Viewer permissions + trigger write actions (create incident, schedule meeting) |
| `ProcessEditor` | All Operator permissions + add/edit/remove process steps and workflows |
| `Admin` | All permissions + manage user roles, view audit log, publish/unpublish processes |

### 6.2 Implementation

- Entra ID app registration with `appRoles` defined in the manifest
- Azure SWA `staticwebapp.config.json` enforces route-level access:

```json
{
  "routes": [
    { "route": "/api/process/*", "methods": ["PUT", "POST", "DELETE"], "allowedRoles": ["ProcessEditor", "Admin"] },
    { "route": "/api/admin/*", "allowedRoles": ["Admin"] },
    { "route": "/api/*", "allowedRoles": ["Viewer", "Operator", "ProcessEditor", "Admin"] }
  ]
}
```

- Backend Azure Functions validate roles from the `x-ms-client-principal` header (SWA-managed auth).

---

## 7. Integration Architecture

### 7.1 TopDesk Integration

```
React SPA ──▶ Azure Function ──▶ TopDesk REST API
                  │                  (Basic Auth or API Token)
                  │
                  ├── POST /tas/api/incidents
                  ├── GET  /tas/api/incidents/{id}
                  ├── PATCH /tas/api/incidents/{id}
                  └── GET  /tas/api/incidents?query=...
```

**Key points:**
- TopDesk API credentials stored in **Azure Key Vault**, referenced by Function App settings
- Backend proxies all TopDesk calls — frontend never holds ITSM credentials
- Incident templates configurable per process step (category, subcategory, priority, caller)

### 7.2 Microsoft Graph Integration

```
React SPA ──▶ Azure Function ──▶ Microsoft Graph API
                  │                  (App-level or delegated auth via Entra ID)
                  │
                  ├── POST /me/events              (schedule RCA meeting)
                  ├── POST /me/sendMail            (notify stakeholders)
                  ├── POST /teams/{id}/channels/    (post to Teams channel)
                  │        {id}/messages
                  └── GET  /sites/{id}/pages        (fetch SharePoint docs)
```

### 7.3 SharePoint Document Layer

- Existing process documents migrated to structured **SharePoint Modern Pages**
- Dashboard links to SharePoint pages from process step `linkedDocs`
- Authorized users edit document content directly in SharePoint (no custom UI needed)
- SharePoint Search API enables cross-referencing documents from the dashboard

---

## 8. Supported ITIL Processes

The dashboard is process-agnostic — any workflow can be defined. Initial rollout covers:

| Process | Steps (approx.) | Key Actions |
|---|---|---|
| **Incident Management** | 6-8 | Create incident, RCA report, schedule meeting |
| **Problem Management** | 5-7 | Link incidents, root cause analysis, known error DB |
| **Alerting Process** | 4-6 | Acknowledge alert, escalate, resolve |
| **Change Management** | 6-8 | Change request, CAB review, implementation plan |
| **Service Request** | 4-5 | Categorize, fulfill, verify |

---

## 9. Project Structure

```
itil-dashboard/
├── app/                              # React SPA (Azure SWA frontend)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── flow/                 # React Flow components
│   │   │   │   ├── ProcessViewer.tsx      # Read-only flow renderer
│   │   │   │   ├── ProcessEditor.tsx      # Edit-mode flow editor
│   │   │   │   ├── StepNode.tsx           # Custom node component
│   │   │   │   ├── ActionPanel.tsx        # Step detail + actions sidebar
│   │   │   │   └── ChecklistPanel.tsx     # Interactive checklist
│   │   │   ├── dashboard/
│   │   │   │   ├── ProcessCatalog.tsx     # Process cards grid
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── RecentActivity.tsx
│   │   │   └── admin/
│   │   │       ├── RoleManager.tsx
│   │   │       └── AuditLog.tsx
│   │   ├── services/
│   │   │   ├── processApi.ts              # Workflow CRUD
│   │   │   ├── topdeskApi.ts              # TopDesk action triggers
│   │   │   ├── graphApi.ts                # Meeting/notification triggers
│   │   │   └── authService.ts             # Entra ID + role helpers
│   │   ├── types/
│   │   │   ├── process.ts                 # Process, Step, Edge types
│   │   │   └── actions.ts                 # Action configuration types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── api/                              # .NET 8 Azure Functions (Isolated)
│   ├── Functions/
│   │   ├── ProcessFunctions.cs            # Workflow CRUD endpoints
│   │   ├── TopDeskFunctions.cs            # TopDesk proxy endpoints
│   │   ├── GraphFunctions.cs              # Graph API proxy endpoints
│   │   └── AdminFunctions.cs              # Role + audit endpoints
│   ├── Services/
│   │   ├── CosmosDbService.cs             # Data access layer
│   │   ├── TopDeskService.cs              # TopDesk API client
│   │   ├── GraphService.cs                # Microsoft Graph client
│   │   └── AuditService.cs                # Audit logging
│   ├── Models/
│   │   ├── ProcessEntity.cs
│   │   ├── StepEntity.cs
│   │   └── AuditEntry.cs
│   ├── Program.cs
│   └── api.csproj
│
├── staticwebapp.config.json          # SWA routes, auth, headers
└── .github/
    └── workflows/
        └── deploy.yml                # GitHub Actions CI/CD
```

---

## 10. Deployment Architecture

```
GitHub Repo
    │
    ▼ (push to main)
GitHub Actions
    │
    ├── Build React SPA ──▶ Azure Static Web Apps (Frontend)
    │                          │
    │                          ├── Custom domain + SSL
    │                          ├── Entra ID authentication
    │                          └── CDN edge distribution
    │
    └── Build .NET API   ──▶ Azure Functions (Managed API)
                               │
                               ├── Azure Key Vault (secrets)
                               ├── Azure Cosmos DB (data)
                               └── Application Insights (telemetry)
```

---

## 11. Implementation Phases

### Phase 1 — Foundation (Weeks 1-3)
- [ ] Azure resource provisioning (Cosmos DB, SWA, Function App, Key Vault)
- [ ] React project scaffold with React Flow
- [ ] .NET API scaffold with Cosmos DB integration
- [ ] Entra ID app registration with roles
- [ ] Read-only process viewer with hardcoded Incident Management flow
- [ ] CI/CD pipeline (GitHub Actions to Azure SWA)

### Phase 2 — Core Features (Weeks 4-6)
- [ ] Dynamic process loading from Cosmos DB
- [ ] Process Editor UI (add/edit/remove/connect steps)
- [ ] Checklist component with state tracking
- [ ] Process catalog dashboard (home page)
- [ ] Role-based UI (hide edit controls for Viewers)

### Phase 3 — Integrations (Weeks 7-9)
- [ ] TopDesk API integration (create/update incidents)
- [ ] RCA report generation (template-based)
- [ ] Microsoft Graph meeting scheduling
- [ ] SharePoint document linking and search
- [ ] Notification system (Teams/email)

### Phase 4 — Content & Polish (Weeks 10-12)
- [ ] Migrate Incident Management process content from documents
- [ ] Migrate Problem Management process content
- [ ] Migrate Alerting process content
- [ ] SharePoint page migration for detailed documentation
- [ ] Audit log viewer for Admins
- [ ] Search across all processes and steps
- [ ] User acceptance testing

### Phase 5 — Expansion (Weeks 13+)
- [ ] Remaining ITIL processes (Change, Service Request, etc.)
- [ ] Analytics dashboard (most-used steps, action completion rates)
- [ ] Process versioning with diff view
- [ ] Export process as PDF (for offline/compliance use)

---

## 12. Key Technical Decisions

| Decision | Choice | Alternative Considered | Rationale |
|---|---|---|---|
| Workflow visualization | React Flow v12 | BPMN.js, GoJS | Best React integration, MIT license, native edit mode |
| Data store | Cosmos DB (NoSQL) | Azure Table Storage, SQL | JSON document model matches flow graph structure |
| Backend runtime | .NET 8 Isolated | Python, Node.js | Matches existing hackathon stack, team proficiency |
| Auth provider | Entra ID via SWA | Azure AD B2C, Auth0 | Native SWA integration, already in use |
| Document content | SharePoint Pages | Custom CMS, Notion | Already licensed, non-technical user editing |
| Hosting | Azure Static Web Apps | App Service, Container Apps | Existing infra, managed auth, serverless API |

---

## 13. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Availability** | 99.9% (Azure SWA + Functions SLA) |
| **Response time** | < 2s for process load, < 5s for TopDesk actions |
| **Concurrent users** | 20-50 (Managed Services team) |
| **Browser support** | Edge, Chrome (latest 2 versions) |
| **Accessibility** | WCAG 2.1 AA (keyboard navigation for flow nodes) |
| **Data retention** | Audit logs retained 12 months |
| **Backup** | Cosmos DB continuous backup (point-in-time restore) |

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| TopDesk API rate limits | Action failures | Backend queuing + retry logic, cache frequent reads |
| React Flow learning curve | Slower delivery | Start with read-only viewer (simpler), add editor in Phase 2 |
| Process content migration effort | Delayed rollout | Prioritize P1 incident process first, migrate others incrementally |
| User adoption resistance | Low usage | Involve end users in Phase 2 UAT, keep SharePoint as fallback |
| Cosmos DB cost growth | Budget overrun | Use serverless tier (pay-per-request), set budget alerts |

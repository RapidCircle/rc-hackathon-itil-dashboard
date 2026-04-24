# RC Hackathon: ITIL Process Dashboard

An interactive visual dashboard for IT service management (ITIL) processes. Explore Incident Management, Problem Management, and Alerting flows as interactive flowcharts built with React Flow.

## Live App

| Item | Value |
|------|-------|
| **Live URL** | https://orange-stone-01656f903.7.azurestaticapps.net |
| **Repo** | https://github.com/RapidCircle/rc-hackathon-itil-dashboard |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Flowcharts | React Flow v12 (@xyflow/react) |
| Styling | Tailwind CSS v4 |
| Hosting | Azure Static Web Apps |

## Features

- **3 ITIL Process Flowcharts** — Incident Management, Problem Management, Alerting
- **Interactive** — Zoom, pan, click nodes to see details
- **MiniMap** — Overview navigation for large flowcharts
- **Detail Panel** — Click any node to see step info, SLA targets, and legend
- **Sidebar Navigation** — Switch between processes with stats
- **Color-coded** — Nodes colored by role (L1, L2, L3, Decision, Resolution)

## Getting Started

### Option A: GitHub Codespaces (Recommended)

1. Click **Code** → **Codespaces** → **Create codespace on main**
2. Wait ~1 minute for setup
3. In terminal run: `npm run dev`
4. Click **Open in Browser** for port **5173**

### Option B: Local Development

```bash
git clone https://github.com/RapidCircle/rc-hackathon-itil-dashboard.git
cd rc-hackathon-itil-dashboard
npm install
npm run dev
# Open http://localhost:5173
```

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app with sidebar and process switching |
| `src/components/FlowChart.tsx` | React Flow wrapper with detail panel |
| `src/data/incident-process.ts` | Incident Management nodes & edges |
| `src/data/problem-process.ts` | Problem Management nodes & edges |
| `src/data/alerting-process.ts` | Alerting flow nodes & edges |
| `src/index.css` | Tailwind + React Flow styles |

## Deploying

1. Push to `main` branch
2. Go to **Actions** → **Deploy to Azure Static Web Apps** → **Run workflow**
3. Wait ~2 minutes

## What to Build Next

- [ ] Add more detail to node click panel (description, responsible role, tips)
- [ ] Search/filter across all processes
- [ ] Dark mode toggle
- [ ] Add process metrics (average time, SLA compliance)
- [ ] Export flowchart as image/PDF
- [ ] Animate flow — show token moving through steps
- [ ] Add custom process creation
- [ ] Mobile responsive layout

## Team

| Member | Focus |
|--------|-------|
| Jainam | Frontend development, Copilot Enterprise |
| Rahul R | UI/UX, data modeling |

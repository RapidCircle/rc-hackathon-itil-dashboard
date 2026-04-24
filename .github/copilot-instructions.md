# Copilot Coding Agent Instructions — ITIL Dashboard

> This file tells GitHub Copilot (and other AI coding tools) about the project architecture,
> safe patterns, and what to avoid. Copilot reads this automatically.

## Project Overview

This is an **ITIL Process Dashboard** — an interactive flowchart viewer for IT service management processes.
Built with React 18, TypeScript, React Flow v12, Tailwind CSS v4, and Vite.

## Tech Stack

- **Framework:** React 18 + TypeScript (strict mode)
- **Flowcharts:** React Flow v12 (`@xyflow/react`) — NOT the old `reactflow` package
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin (imported as `@import "tailwindcss"` in CSS)
- **Build:** Vite
- **Hosting:** Azure Static Web Apps (static output, no backend API)

## Architecture

```
src/
  App.tsx              — Main app: sidebar + header + FlowChart
  main.tsx             — React entry point
  index.css            — Tailwind + React Flow imports
  components/
    FlowChart.tsx      — React Flow wrapper with controls, minimap, detail panel
  data/
    incident-process.ts   — Incident Management nodes & edges
    problem-process.ts    — Problem Management nodes & edges
    alerting-process.ts   — Alerting flow nodes & edges
```

## Key Patterns

### Adding a New Process Flow
1. Create `src/data/my-process.ts` exporting `nodes: Node[]`, `edges: Edge[]`, and `info` object
2. Import in `App.tsx` and add to the `processes` object
3. It automatically appears in the sidebar

### Node Styling Convention
- **Blue** (`bg-blue-*`): L1 Support / User actions
- **Orange** (`bg-orange-*`): L2 Support / Escalation
- **Red** (`bg-red-*`): L3 / Critical / Alert triggers
- **Green** (`bg-green-*`): Resolution / Success
- **Yellow** (`bg-yellow-*`): Decision points (questions ending with ?)
- **Indigo** (`bg-indigo-*`): Process management steps

### React Flow v12 Import Pattern
```typescript
// CORRECT — v12 uses @xyflow/react
import { ReactFlow, Controls, Background, MiniMap, useNodesState, useEdgesState } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';

// WRONG — old package name
// import ReactFlow from 'reactflow';
```

## Rules

1. **Always use `@xyflow/react`** — never `reactflow` (old package)
2. **TypeScript strict** — no `any` types, use proper interfaces
3. **Tailwind v4** — use `@import "tailwindcss"` not `@tailwind base/components/utilities`
4. **No backend** — this is a static frontend app, no API calls needed
5. **Keep flowcharts in data files** — don't hardcode nodes/edges in components
6. **Use `key={activeProcess}`** on FlowChart component to force re-render when switching processes

## Development

```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server → http://localhost:5173
npm run build      # Build for production → dist/
```

## Deployment

Manual trigger only: GitHub Actions → "Deploy to Azure Static Web Apps" → Run workflow.
Output directory: `dist/` (Vite build output).

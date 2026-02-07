# AGMS - Release Analyzer

Desktop application for PMs and Tech Leads to analyze Jira release data, track SLA compliance, and visualize release compositions.

Built with Electron + React + TypeScript.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron 28 (Main + Renderer + Preload) |
| Frontend | React 18, TypeScript 5.3 (strict) |
| Build | Vite via `electron-vite` |
| Styling | TailwindCSS (glassmorphism theme, dark/light) |
| Charts | Recharts |
| Icons | Lucide React |
| Dates | date-fns |
| Persistence | electron-store + local filesystem |
| Packaging | electron-builder (Windows NSIS + Mac DMG) |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install & Run

```bash
npm install
npm run dev
```

The app opens with an onboarding wizard on first launch:

1. **Storage** — choose where project data is saved
2. **Jira** — connect with host, email, and API token
3. **Project** — create your first project with a Jira project key

### Build

```bash
npm run build          # Typecheck + production build
npm run build:mac      # Mac DMG/ZIP
npm run build:win      # Windows NSIS/Portable
npm run build:all      # All platforms
```

## Architecture

```
src/
├── shared/            # TypeScript interfaces (Main ↔ Renderer contract)
│   ├── jira-types.ts
│   ├── sla-types.ts
│   └── project-types.ts
├── main/              # Electron Main Process (Node.js)
│   ├── index.ts       # IPC handlers, window creation
│   ├── sla-parser.ts  # SLA calculation engine
│   └── services/
│       ├── JiraService.ts      # REST API v3, Basic Auth, pagination
│       ├── StorageService.ts   # electron-store + file I/O
│       └── ProjectService.ts   # Project CRUD, release data, SLA cache
├── preload/           # Context Bridge (window.api)
│   ├── index.ts
│   └── index.d.ts
└── renderer/          # React UI
    └── src/
        ├── contexts/          # Theme (dark/light), Project
        ├── design-system/     # Atomic Design
        │   ├── atoms/         # Button, Input, Badge, Card, Typography, ThemeToggle
        │   ├── molecules/     # Modal, SearchField, FormGroup, StatCard
        │   └── organisms/     # Sidebar, SLATable, SLACharts, JiraFetchModal
        └── components/        # Pages & layouts
            ├── Onboarding/    # 3-step wizard
            ├── SLADashboard.tsx
            ├── ReleaseDetail.tsx
            ├── SettingsPage.tsx
            └── HelpPage.tsx
```

## SLA Logic

The engine in `sla-parser.ts` calculates reaction and resolution times with these rules:

- **Business hours**: Mon–Fri, 09:00–18:00
- **Holidays**: Italian national holidays + Easter Monday (Pasquetta)
- **Reaction time**: creation → first transition out of Open/New (Tasks excluded)
- **Resolution time (net)**: first work status → Done/Released, minus pause time
- **Pause statuses**: `Waiting for support`, `In pausa`, `Sospeso`, `Pausa`, `Dipendenza Adesso.it`, `Dipendenza GNV`
- **24x7 rule**: Highest/Critical issues created after 2026-02-01 bypass business hours

### SLA Targets

| Priority | Tier | Resolution | Reaction |
|----------|------|-----------|----------|
| Highest/Critical | Expedite | 4h | 15min |
| High | Critical | 8h | 15min |
| Medium | Major | 16h | 15min |
| Low | Minor | 32h | 15min |
| Lowest | Trivial | 40h | 15min |

## Project Data

Each project stores its data on disk:

```
<storage-root>/<ProjectName>/
├── config.json        # Jira credentials, SLA groups
├── logo.png           # Optional project logo
├── release-data.json  # Fetched Jira issues
└── sla-cache.json     # Last generated SLA report
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot-reload |
| `npm run build` | Typecheck + production build |
| `npm run build:mac` | Mac installer |
| `npm run build:win` | Windows installer |
| `npm run build:all` | All platforms |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier formatting |
| `npm run typecheck` | Full TypeScript validation |
| `npm start` | Run built app |

## License

Private — agiemme

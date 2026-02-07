# Granular Implementation Roadmap: Release Analyzer

This document provides a highly detailed, step-by-step technical breakdown for recreating the application.

## Phase 1: Foundation & Environment Setup
- [ ] **Project Bootstrapping**
    - [ ] Run `npm create electron-vite@latest` with React and TypeScript templates.
    - [ ] Setup `.gitignore` for `node_modules`, `dist`, `out`, and `.DS_Store`.
    - [ ] Configure `vite.config.ts` for path aliasing (`@renderer`, `@shared`, `@main`).
- [ ] **Dependency Injection**
    - [ ] UI: `tailwindcss`, `autoprefixer`, `postcss`, `lucide-react`.
    - [ ] Charts: `recharts`.
    - [ ] Logic: `date-fns`, `pdf-parse` (for release note extraction).
    - [ ] State/Persistence: `electron-store`.
- [ ] **Tailwind Configuration**
    - [ ] Define `brand-deep` (#0a0a0f), `brand-card` (#16161f), and `brand-cyan` (#00f2ff).
    - [ ] Configure `glassmorphism` utility classes (blur, semi-transparent backgrounds).

## Phase 2: Shared Layer (The Contract)
- [ ] **Type Definitions (`src/shared/`)**
    - [ ] `JiraIssue`: Map fields `summary`, `status`, `issuetype`, `created`, `priority`, `resolutiondate` + `changelog`.
    - [ ] `SLAIssue`: Include `reactionTime`, `resolutionTime`, `timeInPause`, `reactionSLAMet`, `resolutionSLAMet`.
    - [ ] `ProjectConfig`: Define `priorities` mapping and `sla` target objects.
- [ ] **Bridge Protocol (`src/preload/`)**
    - [ ] Expose `window.api` with methods for: `getProjects`, `saveConfig`, `jiraTestConnection`, `jiraSearchIssues`, `parseSLA`.

## Phase 3: Main Process & Business Logic
- [ ] **Services Implementation (`src/main/services/`)**
    - [ ] `StorageService`: Manage local JSON files for project persistence.
    - [ ] `JiraService`: 
        - [ ] Basic Auth encoding using `Buffer.from(email + ':' + apiToken).toString('base64')`.
        - [ ] Pagination logic using `do...while` with `startAt` and `total` comparison.
- [ ] **SLA Engine Core (`src/main/sla-parser.ts`)**
    - [ ] **History Analysis**: Map `changelog.histories` to a sorted timeline of state events.
    - [ ] **Segment Logic**: Calculate business minutes between each state change.
    - [ ] **Pause Rule**: If status matches `pauseStatuses` or `dipendenza` starts with `Dipendenza`, subtract duration from Resolution time.
    - [ ] **Expedite Clause**: Check `createdDate > '2026-02-01'` AND `priority === 'Highest'` to bypass business hour limits.

## Phase 4: Atomic Design System Components
- [ ] **Atoms**
    - [ ] `Button`: Implement `glass` variant with `backdrop-blur` and `border-white/10`.
    - [ ] `Badge`: Color-coded for `SLAMet` (Green), `SLAMissed` (Red), and `InPause` (Default/Cyan).
- [ ] **Molecules**
    - [ ] `StatCard`: Display Label, Value, and Trend/Sub-value with neon-glow borders.
    - [ ] `FilterGroup`: A horizontal grouping of selects and toggles.
- [ ] **Organisms**
    - [ ] `Sidebar`: collapsible navigation panel with project selector.
    - [ ] `SLATable`: Virtualized list (if large data) with row expansion for breakdown details.

## Phase 5: Onboarding & Configuration Flow
- [ ] **Wizard State Machine**
    - [ ] Step 1: **Storage Root**. Verify directory exists and is writable.
    - [ ] Step 2: **Jira Sync**. Validate Host (regex test) and API key (connectivity test).
    - [ ] Step 3: **SLA Policy**. Define default targets (Reaction: 15m, Resolution per tier).
- [ ] **Persistence**: Save final `config.json` to the storage root.

## Phase 6: Features & Data Visualization
- [ ] **Releases View**
    - [ ] Parse Release PDF/CSV to extract composition labels.
    - [ ] Render `IssueTypeDistributionChart` (Pie chart: Bug vs Evo).
    - [ ] Render `ReleaseCadenceChart` (Area chart: Release frequency).
- [ ] **SLA Dashboards**
    - [ ] **Overview**: Global compliance percentage and "Failed Issues" highlight.
    - [ ] **Trend Analysis**: `groupIssuesByPeriod` utility to show SLA performance over months.
    - [ ] **Projection Engine**: For active issues, calculate `target - consumed` to predict breach dates.

## Phase 7: Polish & Documentation
- [ ] **Theme Manager**: Use CSS variables for colors to allow easy Dark/Light switching.
- [ ] **Animations**: Add `fade-in-up` class to dashboard cards on mount.
- [ ] **Technical Docs**: Update `TECHNICAL_DOCS.md` with auto-generated class diagrams (Mermaid).
- [ ] **Build Process**: Configure `electron-builder` with icons and codesigning (if applicable).

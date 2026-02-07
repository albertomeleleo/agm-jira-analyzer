# Release Analyzer - Recreation Specifications

This document provides all the context, technical specs, and logic required to recreate the **Release Analyzer** application from scratch.

---

## 1. Project Overview
**Release Analyzer** is a desktop application (Electron) designed for PMs and Tech Leads to analyze Jira data, track SLA compliance, and visualize release compositions.

---

## 2. Technology Stack
- **Framework**: Electron (Main + Renderer + Preload)
- **Frontend**: React + TypeScript
- **Build Tool**: Vite (via `electron-vite`)
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Date Utilities**: date-fns
- **Persistence**: `electron-store` (settings) and local filesystem (project data).

---

## 3. Coding Guidelines & Best Practices

### 3.1 Clean Code
- **Composition over Inheritance**: Use functional components and custom hooks for shared logic.
- **Strict Typing**: No `any` types. Define interfaces for all data structures (Jira items, SLA reports).
- **Service Isolation**: Infrastructure logic (Jira API, File System) must stay in the **Main Process** services. The Renderer should only interact via IPC.
- **Utility Purity**: Keep formatting and calculation logic (like date diffs) in pure utility functions.

### 3.2 Design Patterns
- **IPC Handler Pattern**: Centralized handlers in `main/index.ts` that delegate to specific services.
- **Service Pattern**: Singleton-like services in `main/services/` for Jira, Storage, and Projects.
- **Context Pattern**: Use React Context for global state like Theme (Dark/Light) and Project Context.
- **Shared Types**: Always keep common models in `src/shared` to ensure consistency between Main and Renderer.

---

## 4. Atomic Design Architecture
The frontend follows a strict **Atomic Design** philosophy to ensure modularity:

| Level | Description | Examples |
| :--- | :--- | :--- |
| **Atoms** | Basic HTML elements with styles. | `Button`, `Input`, `Typography`, `Badge`. |
| **Molecules** | Simple groups of atoms. | `SearchField` (Input + Icon), `FormGroup`. |
| **Organisms** | Complex UI sections forming a feature. | `SLATable`, `SLACharts`, `JiraFetchModal`, `Sidebar`. |
| **Templates** | Page layouts (wireframes). | `MainLayout` (Sidebar + Content Area). |
| **Pages** | Final views populated with data. | `SLADashboard`, `ReleaseView`, `HelpPage`. |

> [!IMPORTANT]
> All design system components are aliased via `@design-system`.

---

## 5. Core Logic: SLA Calculations & Constraints

The application calculates SLA metrics with high precision, respecting business constraints.

### 5.1 Business Hours & Holidays
- **Work Hours**: 09:00 - 18:00.
- **Business Days**: Monday to Friday.
- **Lunch Break**: (Optional) 13:00 - 14:00 can be excluded.
- **Italian Holidays**: Fixed dates (Jan 1, Jan 6, Apr 25, May 1, Jun 2, Aug 15, Nov 1, Dec 8, Dec 25, Dec 26) + Easter Monday (Pasquetta).

### 5.2 Specific Logic Constraints
1. **Reaction Time**: 
   - Start: Issue Creation (or first entry in `Backlog`).
   - Stop: First transition out of "Open/New" (usually to a work status).
   - **Constraint**: *Task* issue types do not have a Reaction SLA (target set to ∞).
2. **Resolution Time (Net)**:
   - Start: For *Tasks*, creation date. For *Bugs/Requests*, transition to a "Work" status (`In Progress`, `Presa in carico`, `Developer Testing`, `READY IN HOTFIX`).
   - Stop: Transition to `Done` or `Released`.
   - **Pause Logic**: Deduction of minutes spent in "Pause" statuses:
     - *Statuses*: `Waiting for support`, `In pausa`, `Sospeso`, `Pausa`.
     - *Dependencies*: `Dipendenza Adesso.it`, `Dipendenza GNV`.
3. **The 24x7 Rule**: 
   - "Expedite" priorities (High/Critical) for issues created after **Feb 1st, 2026** bypass business hours and follow a 24x7 calendar (including weekends/holidays).

### 5.3 Priority & Tier Mapping
| Jira Priority | SLA Tier | Target Resolution | Target Reaction |
| :--- | :--- | :--- | :--- |
| Highest/Critical | **Expedite** | 4 hours | 15 min |
| High | **Critical** | 8 hours | 15 min |
| Medium | **Major** | 16 hours | 15 min |
| Low | **Minor** | 32 hours | 15 min |
| Lowest | **Trivial** | 40 hours | 15 min |

---

## 6. Onboarding Flow (Configuration)

When the app starts for the first time or no projects exist, an **Onboarding Wizard** must guide the user:

1. **Storage Setup**: Select the local directory where all project data will be stored.
2. **Jira Connectivity**:
   - Host (e.g., `company.atlassian.net`).
   - Email & API Token (linked to Basic Auth).
   - Test Connection verification.
3. **Project Initialization**:
   - Create the first project.
   - Map Jira Project Key.
   - Configure SLA Tiers (Tolerances and Targets).
4. **Environment Ready**: Redirect to the main dashboard.

---

## 7. Implementation Roadmap
1. **Foundation**: Setup Electron with Vite and Tailwind.
2. **Shared Models**: Define `SLAIssue`, `JiraConfig`, and `Project` types.
3. **Main Services**: Implement file system storage and Jira API wrapper.
4. **Onboarding UI**: Build the wizard using the Atomic Design system.
5. **Logic Engine**: Port the SLA parsing algorithms from `sla-parser.ts`.
6. **Dashboard & Visualization**: Implement Recharts dashboards and PDF content parsing.
7. **Verification**: Validate business hour calculations against manual edge cases.

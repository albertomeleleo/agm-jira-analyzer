# Research: Jira Localization and Priority Mapping

## 1. Technical Context & Unknowns

**Unknown 1: Scope of Localization**
- **Finding**: Jira data (status, priority) comes from the API in English (or the Jira project's default language). The user wants Italian labels in the UI.
- **Resolution**: Implement a mapping utility in `src/shared/localization-utils.ts` that provides Italian labels for known English Jira terms.

**Unknown 2: Priority Sorting Logic**
- **Finding**: Current sorting in `SLATable.tsx` for priority uses `localeCompare` on the priority name string.
- **Resolution**: Implement a `comparePriorities(a: string, b: string): number` function in `src/shared/jira-utils.ts` that uses a weight-based system (Critical=5, High=4, Medium=3, Low=2, Lowest=1).

**Unknown 3: Filter Integration**
- **Finding**: Filters in `SLAFilters.tsx` use raw values from `SLAIssue`.
- **Resolution**: Update `SLAFilters.tsx` to display localized labels while maintaining the raw values for logic/filtering, or handle the translation in the filter utility. *Decision: Display localized labels in the UI but keep raw values in the `FilterState` for consistency with data.*

## 2. Technology Choices

- **Mapping Logic**: Simple object-based mapping in `src/shared/localization-utils.ts`.
- **Sorting**: Custom weight-based comparison in `src/shared/jira-utils.ts`.
- **UI Integration**: Inline localization calls in components or a shared `renderLocalized` utility.

## 3. Implementation Plan Refinement

1. **Shared Logic**:
   - `src/shared/localization-utils.ts`:
     - `getLocalizedStatus(status: string): string`
     - `getLocalizedPriority(priority: string): string`
   - `src/shared/jira-utils.ts`:
     - `comparePriorities(a: string, b: string): number`
2. **UI Updates**:
   - `src/renderer/src/design-system/organisms/SLATable.tsx`: Use localized labels.
   - `src/renderer/src/design-system/molecules/SLAFilters.tsx`: Use localized labels for chips.
3. **Filtering Logic**:
   - Ensure `applyFilters` still works correctly with raw Jira values.

## 4. Alternatives Considered

- **Library-based i18n (e.g., react-i18next)**:
  - *Pros*: Scalable, standard.
  - *Cons*: High overhead for just a few mappings. Project constitution favors simplicity.
  - *Verdict*: Rejected. Use simple mapping objects.
- **Backend Mapping**: Map values in `sla-parser.ts`.
  - *Pros*: Logic is centralized.
  - *Cons*: Breaks consistency if we need raw English values for other integrations or exports.
  - *Verdict*: Rejected. Map only in the presentation layer.

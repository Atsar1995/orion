# ORION Business Workspace Pattern

| Field | Value |
|-------|-------|
| **Version** | v1.2.0 |
| **Status** | Approved |
| **Architecture Reference** | [PA-001](./ORION_Platform_Architecture.md) · [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) |
| **Reference Implementation** | Finance Workspace (Mission 15) |
| **Owner** | CTO |
| **Last Reviewed** | 23 July 2026 |
| **Next Review** | After every major version release (v1.3, v2.0, etc.) |

---

# Purpose

This document defines the standard implementation pattern for ORION Business Workspaces.

Every new workspace (CRM, Commerce, Hospitality, Marketing, and future modules) must follow this pattern unless an ADR documents a justified deviation.

---

# Pattern Overview

```
Executive Shell (DashboardLayout)
        │
        ▼
Business Workspace Layout (workspace sub-nav)
        │
        ├── Overview          ← executive briefing for the domain
        ├── Metrics           ← KPIs, health score, trends
        ├── Operational Views ← domain-specific sections
        ├── Executive Insights← prioritised decisions and alerts
        ├── Reports           ← reporting and exports
        └── Settings          ← workspace preferences
        │
        ▼
Shared Platform Services
(Design System · Command Palette · Navigation · Auth)
        │
        ▼
Executive Brief (/advisor)
(workspace insights card + briefing integration)
```

---

# Folder Structure

```
app/(platform)/<workspace>/
  layout.tsx              ← workspace shell + sub-navigation
  page.tsx                ← Overview (default route)
  <section>/page.tsx      ← operational views

components/<workspace>/
  <Workspace>SubNav.tsx
  <Workspace>SectionHeader.tsx
  <domain-specific sections>.tsx

lib/
  <workspace>-nav.ts        ← sub-navigation registry
  <workspace>-data.ts      ← core placeholder / domain data
  <workspace>-insights.ts  ← metrics, insights, brief exports (optional)
  <workspace>-*.ts         ← additional domain logic layers as needed
```

---

# Layer Responsibilities

| Layer | Responsibility | Example (Finance) |
|-------|----------------|-------------------|
| **Route** | Thin Server Component page; composes sections | `finance/page.tsx` |
| **Layout** | Workspace sub-nav; no platform shell duplication | `finance/layout.tsx` |
| **Components** | Presentation only; no business rules | `FinanceHealthScore.tsx` |
| **Data** | Typed placeholder data and domain entities | `lib/finance-data.ts` |
| **Insights** | Metrics, alerts, Executive Brief exports | `lib/finance-insights.ts` |
| **Navigation** | Sub-nav registry + Command Palette entries | `lib/finance-nav.ts`, `search-data.ts` |

Business logic lives in `lib/`. UI components import from `lib/` — never the reverse.

---

# Required Integration Points

## Executive Shell

- Workspace routes live under `app/(platform)/`.
- Platform `DashboardLayout` provides sidebar, header, and command palette.
- **Do not** create a separate shell, dashboard framework, or duplicate navigation.

## Sidebar Navigation

Register the workspace in `lib/navigation.ts` (`moduleNav` or `primaryNav`).

Sidebar active state uses `pathname.startsWith(href)` — sub-routes highlight automatically.

## Command Palette

Add static `SearchItem` entries in `lib/search/search-data.ts` for the workspace and each major sub-route.

## Executive Brief

Every workspace must contribute executive insights to `/advisor`:

- A workspace insights card (e.g. `FinanceInsightsCard`)
- Briefing narrative line exported from the insights layer
- Highest-priority items surfaced for founder action

## Design System

Use shared tokens and components:

- `WORKSPACE_*` layout classes from `lib/constants.ts`
- `Card`, `StatCard`, `SectionHeader`, `StatusIndicator`, `EmptyState`
- ORION colour tokens and typography — no ad-hoc styling

---

# Standard Section Mapping

| Standard Section | Finance Implementation |
|------------------|------------------------|
| **Overview** | `/finance` — executive summary, health, KPIs, snapshots |
| **Metrics** | Health score, enhanced KPIs, revenue trend, expense breakdown |
| **Operational Views** | Cash, Revenue, Expenses, Receivables, Payables, Forecast |
| **Executive Insights** | Insights card, alerts, collection/payment priorities |
| **Reports** | `/finance/reports` |
| **Settings** | `/finance/settings` |

Domain-specific sections are permitted when mapped to an operational need (e.g. Finance Receivables/Payables as operational views).

---

# Reusable Component Patterns

Extract shared UI when a pattern appears twice:

| Pattern | Finance Example | Reuse Target |
|---------|-----------------|--------------|
| Sub-navigation | `FinanceSubNav.tsx` | CRM, Commerce, etc. |
| Section header | `FinanceSectionHeader.tsx` | All workspaces |
| Ledger / list rows | `FinanceLedgerList.tsx` | CRM contacts, Commerce orders |
| Priority action cards | `FinancePriorityActionCards.tsx` | Any workspace recommendations |
| Bar / breakdown charts | `FinanceBarChart`, `FinanceHorizontalBreakdown` | Metrics sections |

---

# Governance Checklist

Before approving any Business Workspace, verify **Business Workspace Compliance** ([Engineering Standards — Business Workspace Compliance](../09_Standards/Engineering_Standards.md#business-workspace-compliance)):

- [ ] Executive Shell integration
- [ ] Business Workspace Pattern compliance ([ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md))
- [ ] Design System compliance
- [ ] Executive Brief contribution
- [ ] Separation of business logic and presentation
- [ ] Reuse of existing components
- [ ] Verification Hierarchy passed
- [ ] Release documentation complete

Additional workspace requirements:

- [ ] Engineering Specification approved
- [ ] Command Palette entries added
- [ ] Technical Debt registered if shortcuts taken
- [ ] No new runtime dependencies without CTO justification

---

# Reference Implementation

| Mission | Deliverable | Release Record |
|---------|-------------|----------------|
| 15A | Workspace foundation, sub-nav, routes | [RR-009](../06_Releases/RR-009-Mission15A-Finance-Workspace-Foundation.md) |
| 15B | Metrics, charts, Executive Brief card | [RR-010](../06_Releases/RR-010-Mission15B-Financial-Metrics-Executive-Insights.md) |
| 15C | Operational views, AR/AP management | [RR-011](../06_Releases/RR-011-Mission15C-Receivables-Payables-Management.md) |
| 16A | Customer Intelligence foundation, shared sub-nav | [RR-012](../06_Releases/RR-012-Mission16A-Customer-Intelligence-Foundation.md) |

---

# Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · CTO |
| **Date** | 23 July 2026 |
| **Next Review** | After every major version release (v1.3, v2.0, etc.) |

# CRM Workspace Module

Public API: import from `@/lib/crm` only.

**Release:** CRM Workspace v1.0 (Mission 16A.8) · Placeholder data per [TD-002](../../docs/09_Standards/Technical_Debt_Register.md)

## Architecture

```
app/(platform)/crm/          → pages (Executive Shell, WORKSPACE_PAGE_CLASS layout)
components/crm/              → presentation components (props-driven)
lib/crm/
  models/                    → view models and domain types
  data/                      → placeholder records (TD-002)
  repositories/              → CrmRepository + InMemoryCrmRepository
  services/                  → business logic (CrmService facade)
  services/intelligence/     → rule-based intelligence engine (10 services)
  mappers/                   → view-model and brief mappers
  index.ts                   → public API
```

**Executive Brief:** CRM contributes via `crmExecutiveProvider` (ADR-006) and `getCrmBriefContribution()`. The shared `/brief` page uses `IntelligenceBusBriefRepository` (Mission 16A.7).

**Intelligence Bus:** `crmService.getIntelligence()` → `CrmIntelligenceEngine` → mappers for insights, advisor snapshot, and brief contribution.

## Routes (Mission 16A.1–16A.8)

| Route | Purpose | Status |
|-------|---------|--------|
| `/crm` | Executive dashboard | v1.0 |
| `/crm/customers` | Customer directory | v1.0 |
| `/crm/customers/[customerId]` | Customer detail | v1.0 |
| `/crm/opportunities` | Pipeline Kanban + list | v1.0 |
| `/crm/opportunities/[opportunityId]` | Opportunity detail | v1.0 |
| `/crm/activities` | Activity timeline, list, tasks, meetings, calls, emails | v1.0 |
| `/crm/insights` | Intelligence insights and decision support | v1.0 |
| `/crm/activity` | Redirect → `/crm/activities` | v1.0 |
| `/crm/relationships` | Legacy management UI (not in sub-nav) | Legacy |
| `/crm/communications` | Placeholder | Future |
| `/crm/reports` | Placeholder | Future |
| `/crm/settings` | Placeholder | Future |

Sub-navigation (`CRM_NAV`): Overview, Customers, Opportunities, Activities, Insights.

## Services

| Method | Purpose |
|--------|---------|
| `crmService.getDashboard()` | Dashboard view model (16A.2) |
| `crmService.listCustomers(query)` | Customer list — search, filters, sort, pagination (16A.3) |
| `crmService.getCustomerDetail(customerId)` | Customer detail (16A.3) |
| `crmService.getOpportunityWorkspace()` | Opportunities workspace with metrics (16A.4) |
| `crmService.listOpportunities(query)` | Opportunity list (16A.4) |
| `crmService.getOpportunityDetail(opportunityId)` | Opportunity detail (16A.4) |
| `crmService.getActivityWorkspace()` | Activities workspace metrics (16A.5) |
| `crmService.listActivities(query)` | Activity list (16A.5) |
| `crmService.getInsights()` | Intelligence insights dashboard (16A.6) |
| `crmService.getIntelligence()` | Full intelligence pipeline (16A.6 / brief) |
| `crmService.getBriefContribution()` | Executive Brief workspace contribution (16A.7) |
| `getCrmBriefContribution()` | Convenience export for brief integration |

Brief mappers: `mapCrmBriefRecommendations`, `mapCrmBriefAlerts`, `mapCrmBriefOvernightChanges`, `mapCrmBriefBusinessHealth`, `mapCrmBriefExecutiveSummary`.

## Shared Services & Platform Integration

| Integration | Mechanism |
|-------------|-----------|
| Executive Shell | `app/(platform)/crm/layout.tsx` |
| Workspace sub-nav | `WorkspaceSubNav` + `CRM_NAV` |
| Executive Brief | `crmExecutiveProvider`, `IntelligenceBusBriefRepository` |
| Command Palette | `lib/search/search-data.ts` — 5 CRM routes indexed |
| Advisor | `CustomerInsightsCard` → `/crm/insights` |
| RBAC (future) | `CRM_ROUTE_PERMISSIONS` metadata on nav items |

## Design System Reuse

CRM uses shared platform components: `Card`, `StatCard`, `Button`, `Badge`, `EmptyState`, `SearchBox`, `WorkspacePageHeader`, `WorkspaceSubNav`, `RecommendationCard`, `ExecutiveRecommendationCard`, `StatusIndicator`, and `WORKSPACE_*` layout tokens from `@/lib/constants`.

CRM-specific badge wrappers (`CustomerHealthBadge`, `OpportunityHealthBadge`, `ActivityTypeBadge`, etc.) wrap shared `Badge` with domain labels.

## Known Limitations (v1.0)

1. **Placeholder data only (TD-002)** — no API or persistence layer.
2. **Dual opportunity datasets** — intelligence engine uses legacy `getManagedOpportunities()`; module directories use `CRM_OPPORTUNITY_RECORDS`.
3. **Client-side query** — customer, opportunity, and activity directories filter/sort in the browser.
4. **No dedicated Table/Pagination DS components** — semantic HTML tables with `Button` pagination.
5. **Business Health Engine** — CRM contributes via mapper; not wired into platform `BusinessHealthEngine` runtime.
6. **Legacy routes** — `/crm/relationships`, `/crm/communications`, `/crm/reports`, `/crm/settings` remain but are not in sub-nav.
7. **ES-027 gaps** — organisations route, dimensional relationship health, full communications — Construction Phase alignment pending.

## Technical Debt (Cleanup Candidates)

| Item | Notes |
|------|-------|
| `CrmIntelligencePanel` | Superseded by `CrmInsightsWorkspace`; unused |
| `CrmCustomersManagement` | Superseded by `CrmCustomerDirectory` |
| `CrmOpportunitiesManagement` | Superseded by `CrmOpportunityWorkspace` |
| `CrmRelationshipsManagement` | Only on legacy `/crm/relationships` route |
| `ExecutiveRecommendations` | Provider-based; used only in legacy management components |
| Unify opportunity data sources | Merge `MANAGED_OPPORTUNITIES` and `CRM_OPPORTUNITY_RECORDS` |

## Future Enhancements

- Connect TD-002 placeholder data to business platform API
- Server-side pagination and filtering
- Promote CRM badge wrappers to shared domain-badge pattern if reused elsewhere
- Wire CRM business health into platform `BusinessHealthEngine`
- Remove or redirect legacy routes after ES-027 alignment
- RBAC enforcement via `CRM_ROUTE_PERMISSIONS`

## References

- [ES-027 CRM Workspace](../../docs/02_Engineering/ES-027-CRM-Workspace.md)
- [RR-018 CRM v1.0 Release Readiness](../../docs/06_Releases/RR-018-Mission16A8-CRM-Workspace-v1-Release-Readiness.md)
- ADR-005 Business Workspace Pattern · ADR-006 Executive Provider

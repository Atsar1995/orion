# ES-017 – Customer Intelligence Metrics & Executive Brief Integration

## Executive Summary

**Status:** Approved

**Priority:** High

**Product Version:** v1.2.0 – Business Platform

**Document Version:** 1.0

**Mission:** 16B

**Outcome:** Customer Intelligence transforms from structural placeholders into an executive intelligence workspace with metrics, insights, alerts, and Executive Brief integration.

---

## Founder Promise

The Customer Intelligence Workspace answers one question: *What should the Founder do today to strengthen customer relationships and grow the business?*

Every metric, insight, and alert contributes to that answer within 60 seconds.

---

## Success Criteria

- Customer Health Score operational with trend and driver breakdown
- Enhanced KPI cards replace placeholders
- Opportunity pipeline with counts, trend, and executive summary
- Relationship health segmentation (Healthy, Needs Attention, At Risk)
- Executive insights generated from business logic layer
- Customer alerts surfaced with severity indicators
- Executive Brief displays Customer Intelligence card with health, profiles, and recommended action
- All business logic in `lib/crm-insights.ts` — no logic in React components

---

## Architecture

### Business Logic Layer

| Module | Responsibility |
|--------|----------------|
| `lib/crm-insights.ts` | Health score, KPIs, pipeline, relationship health, insights, alerts, Executive Brief snapshot |
| `lib/crm-data.ts` | Placeholder customer and activity data (TD-002) |

### Presentation Components

| Component | Purpose |
|-----------|---------|
| `CustomerHealthScore.tsx` | Overall health score, status, trend, drivers |
| `CrmEnhancedKpiCards.tsx` | Six KPI metrics with trend indicators |
| `CrmOpportunityPipeline.tsx` | Five-stage pipeline with bar chart |
| `RelationshipHealth.tsx` | Relationship segmentation display |
| `CrmExecutiveInsights.tsx` | Prioritised executive insights |
| `CustomerAlerts.tsx` | Severity-coded customer alerts |
| `CustomerInsightsCard.tsx` | Executive Brief integration |

### Executive Brief Integration

- `CRM_INSIGHTS_READY = true` activates insights
- `CRM_EXECUTIVE_BRIEFING_LINE` appended to daily brief narrative
- `CustomerInsightsCard` on `/advisor` displays health, profiles, and recommended action
- `BUSINESS_SNAPSHOT` CRM row updated with health score

---

## Component Reuse

- `WorkspaceSubNav`, `WorkspaceSectionHeader` — shared workspace pattern
- `Card`, `StatCard`, `StatusIndicator` — Design System
- `FinanceBarChart` — pipeline visualisation (shared chart component)
- `DashboardLayout`, Sidebar, Command Palette — Executive Shell (no duplication)

---

## Reference Implementation

Mirrors Finance Mission 15B pattern:

- `lib/finance-insights.ts` → `lib/crm-insights.ts`
- `FinanceInsightsCard` → `CustomerInsightsCard`

---

## Out of Scope

- Email, calendar, WhatsApp integration
- AI conversations
- CRM API and authentication
- Multi-user collaboration
- Contact synchronisation

---

## Technical Debt

| ID | Description |
|----|-------------|
| TD-002 | Placeholder CRM data until customer intelligence service integration |

---

## Verification

All Verification Hierarchy gates and Business Workspace Compliance items must pass before CTO Approval.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | ORION CTO |
| **Date** | 24 July 2026 |
| **Release Record** | RR-013 |

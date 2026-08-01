# ES-027 — CRM Workspace

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** 16A–16D (delivered) · Construction Phase canonical spec

**Author:** Founder & Chief Architect

**Product name:** CRM Workspace (Relationship Intelligence Centre) · implemented in UI as **Customer Intelligence** at `/crm`

---

# Purpose

The CRM Workspace is the Relationship Intelligence Centre of ORION.

Its purpose is to provide a complete view of every business relationship, including customers, guests, suppliers, distributors, partners, consultants, and strategic contacts.

Rather than acting as a contact database, ORION CRM transforms relationship data into executive intelligence.

**Current state:** CRM Workspace is **implemented** (Missions 16A–16D). Routes, sub-navigation, relationship and opportunity management, customer intelligence, executive insights, intelligence pipeline, and `crmExecutiveProvider` are operational. This specification is the canonical Engineering Specification for the workspace and defines remaining Construction Phase alignment (see [Implementation Status](#implementation-status)).

**Technical debt:** [TD-002](../09_Standards/Technical_Debt_Register.md) — placeholder CRM data until connected business platform (v2.x).

**Mission delivery specs:** [ES-017](./ES-017-Customer-Intelligence-Metrics-Executive-Brief.md) (16B) · [ES-018](./ES-018-Relationship-Opportunity-Management.md) (16C) · [ES-019](./ES-019-Executive-Relationship-Intelligence.md) (16D)

---

# Objectives

The CRM Workspace shall:

- Manage relationships.
- Track customer history.
- Monitor customer lifetime value.
- Identify relationship opportunities.
- Improve customer retention.
- Generate executive recommendations.
- Detect relationship risks.
- Support business development.

---

# Primary Users

Founder · CEO · Sales Director · Business Development · Marketing · Customer Service · Hospitality Manager · Relationship Manager

---

# Executive Questions

The workspace shall answer:

- Which customers require follow-up today?
- Which guests are returning?
- Which customers generate the highest lifetime value?
- Which relationships are weakening?
- Which suppliers require attention?
- Which partners create the most value?
- Which customers are inactive?
- Which customers deserve VIP treatment?
- What opportunities exist?
- What relationship risks require action?

---

# Workspace Sections

1. Executive Summary
2. Contacts
3. Organisations
4. Relationship Timeline
5. Opportunities
6. Activities
7. Communications
8. Customer Intelligence
9. Relationship Health
10. Alerts
11. Recommendations

---

# Executive Summary

**Displays:** Relationship Health · Active Customers · Returning Customers · VIP Customers · New Leads · Open Opportunities · Pending Follow-Ups · Business Health Contribution

**Delivered:** Overview at `/crm` — `CrmExecutiveSummary` · `CustomerHealthScore` · `CrmEnhancedKpiCards` · [RR-012](../06_Releases/RR-012-Mission16A-Customer-Intelligence-Foundation.md) · [RR-013](../06_Releases/RR-013-Mission16B-Customer-Intelligence-Metrics-Executive-Brief.md)

---

# Contacts

**Displays:** Name · Company · Position · Email · Phone · Country · Relationship Owner · Status · VIP Status · Last Contact

**Delivered:** `/crm/customers` — `CrmCustomersManagement` · customer profiles — RR-012 · RR-013

**Naming alignment:** ES-027 *Contacts* maps to nav label *Customers* — **planned label alignment**.

---

# Organisations

**Displays:** Company Name · Industry · Country · Annual Revenue · Relationship Value · Customer Since · Primary Contact · Business Status

**Delivered (partial):** Organisation data embedded in customer and relationship views. Dedicated `/crm/companies` — **planned alignment** with ES-027.

---

# Relationship Timeline

**Displays:** Calls · Meetings · Emails · Bookings · Orders · Invoices · Complaints · Compliments · Notes · Documents

**Delivered (partial):** `RelationshipTimeline` component · activity on overview and `/crm/relationships`. Full cross-domain timeline (orders, invoices) — **planned alignment**.

---

# Opportunities

**Displays:** Opportunity Name · Expected Revenue · Probability · Expected Close Date · Owner · Stage · Priority

**Delivered:** `/crm/opportunities` — `CrmOpportunitiesManagement` · `OpportunityManagement` · pipeline on overview — [RR-014](../06_Releases/RR-014-Mission16C-Relationship-Opportunity-Management.md)

---

# Activities

**Displays:** Calls · Meetings · Tasks · Follow-Ups · Appointments · Travel · Reminders · Approvals

**Delivered:** `/crm/activity` · `CrmRecentActivity` on overview — RR-012

---

# Communications

**Displays:** Email History · Phone Calls · WhatsApp · SMS · Meeting Notes · Documents Shared · Attachments

**Delivered (partial):** `/crm/communications` — RR-012. WhatsApp · SMS · full attachment history — **planned alignment**.

---

# Customer Intelligence

**Displays:** Customer Lifetime Value · Average Order Value · Purchase Frequency · Favourite Products · Preferred Services · Guest Preferences · Travel Preferences · Payment Behaviour · Satisfaction Score · Loyalty Status

**Delivered:** `/crm/insights` · `CustomerProfileCard` · `CustomerPortfolio` · intelligence pipeline — RR-013 · RR-015

---

# Relationship Health

**Displays:** Engagement Score · Response Rate · Activity Trend · Retention Score · Growth Opportunity · Risk Score · Overall Relationship Health · Trend · Confidence

**Delivered (partial):** `RelationshipHealth` · `CustomerHealthScore` · `lib/crm/crm-health-compute.ts` · Health Engine integration — RR-015 · [ES-019](./ES-019-Executive-Relationship-Intelligence.md). Multi-dimensional score breakdown per ES-027 — **planned alignment**.

---

# Alerts

**Examples:** Customer Inactive · High Value Opportunity · Contract Expiring · No Contact · Payment Issue · Guest Birthday · VIP Arrival · Supplier Risk · Complaint Escalation

**Delivered:** `CustomerAlerts` on overview · alert generation via intelligence pipeline — RR-013

---

# Recommendations

**Examples:** Call VIP Customer · Schedule Meeting · Offer Loyalty Benefit · Reconnect With Dormant Customer · Request Testimonial · Upsell Premium Service · Invite Customer To Event · Resolve Complaint Immediately

**Delivered:** `ExecutiveRecommendations` · `RelationshipActions` · `crmExecutiveProvider.getRecommendations()` — RR-015 · Mission 17B

---

# Workspace Navigation

**Route:** `/crm`

| ES-027 Section | Route | Nav Label (current) | Status |
|----------------|-------|---------------------|--------|
| Overview | `/crm` | Overview | Delivered |
| Contacts | `/crm/customers` | Customers | Delivered |
| Companies | `/crm/companies` | — | Planned (ES-027 alignment) |
| Activities | `/crm/activity` | Activity | Delivered |
| Opportunities | `/crm/opportunities` | Opportunities | Delivered |
| Communications | `/crm/communications` | Communications | Delivered |
| Analytics | `/crm/insights` | Insights | Delivered |
| Relationships | `/crm/relationships` | Relationships | Delivered (extends ES-027) |
| Reports | `/crm/reports` | Reports | Delivered |
| Settings | `/crm/settings` | Settings | Delivered |

Uses `WorkspaceSubNav` via [crm-nav.ts](../../lib/crm-nav.ts) per [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md).

---

# Search

Supports: Customer · Guest · Company · Phone · Email · Country · Product · Opportunity

**Delivered:** Command Palette entries for all CRM routes — Mission 14C · RR-012

---

# Filters

Industry · Country · VIP · Relationship Owner · Status · Lead Source · Customer Type · Business Unit

**Delivered (partial):** Segment and portfolio filters in customer views — full filter bar — **planned alignment**.

---

# Responsive Behaviour

| Viewport | Layout |
|----------|--------|
| Desktop | Three-column layout |
| Tablet | Two-column layout |
| Mobile | Single-column layout |

**Delivered:** Responsive platform patterns — RR-012 through RR-015

---

# Empty States

Display: illustration · helpful explanation · suggested action

**Delivered:** `CrmSectionPlaceholder` where applicable

---

# Error States

Display: simple explanation · retry button · hide technical details by default

---

# Performance

| Target | Requirement |
|--------|-------------|
| Initial load | < 2 seconds |
| Search | < 300ms |
| Navigation | Instant |

**Delivered:** Verification Hierarchy passed — RR-012 through RR-015

---

# Accessibility

Keyboard navigation · screen reader support · WCAG 2.2 AA

**Delivered:** Verification Hierarchy passed — RR-012 through RR-015

---

# Architecture Requirements

Per [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md):

| Requirement | Implementation |
|-------------|----------------|
| Executive Shell integration | `app/(platform)/crm/` · `DashboardLayout` · [layout.tsx](../../app/(platform)/crm/layout.tsx) |
| Business logic in `lib/` | `lib/crm-data.ts` · `lib/crm-business-data.ts` · `lib/crm-insights.ts` · `lib/crm-relationships-opportunities.ts` |
| Intelligence pipeline | [crm-intelligence-pipeline.ts](../../lib/crm/crm-intelligence-pipeline.ts) · [crm-health-compute.ts](../../lib/crm/crm-health-compute.ts) |
| Presentation in components | `components/crm/` |
| Executive Provider | [crm-executive-provider.ts](../../lib/intelligence/workspace-providers/crm-executive-provider.ts) |
| Executive Brief contribution | Intelligence Bus · Customer Insights card |
| Registry registration | [register-executive-providers.ts](../../lib/intelligence/register-executive-providers.ts) |

---

# Provider Dependencies

| Provider | Responsibility | Status |
|----------|----------------|--------|
| Contact Provider | Contact profiles and status | Delivered (customers layer) |
| Organisation Provider | Company and account data | Partial |
| Activity Provider | Tasks, meetings, follow-ups | Delivered |
| Communication Provider | Message and call history | Partial |
| Opportunity Provider | Pipeline and revenue forecast | Delivered |
| Customer Intelligence Provider | CLV, preferences, loyalty | Delivered |
| Recommendation Provider | Executive actions | Delivered |
| Alert Provider | Relationship risk alerts | Delivered |
| Relationship Health Provider | Composite and dimensional health | Partial |
| Trend Provider | Relationship trends | Planned (future engine) |

Consolidated through [crmExecutiveProvider](../../lib/intelligence/workspace-providers/crm-executive-provider.ts) implementing [ExecutiveProvider](../../lib/intelligence/provider.ts) + ADR-006.

---

# Platform Dependencies

| Dependency | Status |
|------------|--------|
| Mission 17B — Intelligence Engines | Complete |
| Mission 17A — Provider Framework | Complete |
| crmExecutiveProvider | Registered |
| ES-022 — Executive Dashboard | Specified |
| Connected CRM / ERP API | Out of scope (TD-002) |

---

# Business Rules

- Every contact belongs to an organisation or individual profile.
- Communication history is immutable.
- VIP contacts receive priority.
- Relationship Health updates automatically.
- Recommendations ranked by executive value.
- Historical interactions are never deleted.

---

# Acceptance Criteria

The workspace shall:

- [x] Manage contacts (customers)
- [x] Manage organisations (partial — embedded in profiles)
- [x] Track communications (partial)
- [x] Track opportunities
- [x] Generate Relationship Health (partial — composite scores)
- [x] Generate recommendations
- [x] Generate alerts
- [x] Support responsive layouts
- [x] Meet accessibility standards (Missions 16A–16D)
- [ ] Dedicated organisations route (`/crm/companies`)
- [ ] Full dimensional Relationship Health scores (ES-027 alignment)
- [ ] Full cross-domain Relationship Timeline
- [ ] Pass re-verification when ES-027 gaps closed

---

# Implementation Status

| Area | Missions | Release Records |
|------|----------|-----------------|
| Foundation | 16A | [RR-012](../06_Releases/RR-012-Mission16A-Customer-Intelligence-Foundation.md) |
| Metrics & Executive Brief | 16B | [RR-013](../06_Releases/RR-013-Mission16B-Customer-Intelligence-Metrics-Executive-Brief.md) |
| Relationships & opportunities | 16C | [RR-014](../06_Releases/RR-014-Mission16C-Relationship-Opportunity-Management.md) |
| Executive relationship intelligence | 16D | [RR-015](../06_Releases/RR-015-Mission16D-Executive-Relationship-Intelligence-AI-Readiness.md) |
| Executive Provider | 17A | [RR-016](../06_Releases/RR-016-Mission17A-Executive-Intelligence-Foundation.md) |
| Intelligence engines refactor | 17B | [RR-017](../06_Releases/RR-017-Mission17B-Executive-Intelligence-Engines.md) |
| CRM v1.0 release readiness | 16A.8 | [RR-018](../06_Releases/RR-018-Mission16A8-CRM-Workspace-v1-Release-Readiness.md) |
| ES-027 canonical spec | — | This document |

**Construction Phase gaps:** `/crm/companies` · nav label alignment (Contacts/Analytics) · dimensional Relationship Health · full communications channels · cross-domain timeline

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Contact Created | Customer list and summary update |
| Company Updated | Organisation views reflect change |
| Meeting Logged | Activity and timeline update |
| Opportunity Won | Pipeline and revenue metrics update |
| Opportunity Lost | Stage closed; insights refresh |
| Customer Becomes VIP | Priority alerts and recommendations |
| Relationship Declines | Health score and alert visible |
| Recommendation Generated | Provider and Brief updated |
| Provider Failure | Widget error; workspace usable |
| Mobile Layout | Sections stack; navigation usable |

---

# Out of Scope

- Email Client
- Call Centre Software
- Marketing Automation
- Customer Support Ticketing
- Social CRM
- AI Voice Calling

These capabilities belong to specialised systems or future ORION releases.

---

# Future Enhancements

- AI Relationship Assistant · Customer Sentiment Analysis · Meeting Intelligence
- Executive Networking Graph · Relationship Forecasting · Automatic Follow-Up Suggestions
- Voice Notes · Cross-Business Customer Intelligence

---

# Definition of Done

The CRM Workspace is complete when:

- Contact management functions correctly
- Organisation management is operational
- Relationship timelines are available
- Opportunities are tracked
- Relationship Health is calculated (dimensional scores)
- Recommendations function correctly via Executive Provider
- Alerts operate correctly
- Executive Brief receives CRM contribution
- Accessibility requirements are met
- Performance targets are achieved
- ES-027 acceptance gaps closed or documented as TD
- Founder approval is received

**Status:** Core workspace **complete** (16A–16D). ES-027 organisations route and dimensional health — **Construction Phase alignment pending**.

---

# References

| Document | Location |
|----------|----------|
| ES-017 Customer Intelligence Metrics | [ES-017-Customer-Intelligence-Metrics-Executive-Brief.md](./ES-017-Customer-Intelligence-Metrics-Executive-Brief.md) |
| ES-018 Relationship & Opportunity Mgmt | [ES-018-Relationship-Opportunity-Management.md](./ES-018-Relationship-Opportunity-Management.md) |
| ES-019 Executive Relationship Intelligence | [ES-019-Executive-Relationship-Intelligence.md](./ES-019-Executive-Relationship-Intelligence.md) |
| ES-021 Intelligence Engines | [ES-021-Executive-Intelligence-Engines.md](./ES-021-Executive-Intelligence-Engines.md) |
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-023 Hospitality Workspace | [ES-023-Hospitality-Workspace.md](./ES-023-Hospitality-Workspace.md) |
| ES-024 Commerce Workspace | [ES-024-Commerce-Workspace.md](./ES-024-Commerce-Workspace.md) |
| ES-025 Finance Workspace | [ES-025-Finance-Workspace.md](./ES-025-Finance-Workspace.md) |
| ES-026 Marketing Workspace | [ES-026-Marketing-Workspace.md](./ES-026-Marketing-Workspace.md) |
| ADR-005 Business Workspace | [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) |
| ADR-006 Provider Framework | [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Product Constitution | [ORION_Product_Constitution.md](../01_Product/ORION_Product_Constitution.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| TD-002 | [Technical_Debt_Register.md](../09_Standards/Technical_Debt_Register.md) |

---

# Closing Statement

The CRM Workspace is the relationship intelligence centre of ORION.

Its purpose is to help executives build stronger, longer, and more valuable relationships by transforming interactions into meaningful business intelligence.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | RR-012 · RR-013 · RR-014 · RR-015 (delivered) · ES-027 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**

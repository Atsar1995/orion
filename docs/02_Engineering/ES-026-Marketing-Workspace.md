# ES-026 — Marketing Workspace

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** 21A (Construction Phase)

**Author:** Founder & Chief Architect

**Supersedes:** [ES-016 – Marketing Workspace](./ES-016%20%E2%80%93%20Marketing%20Workspace.md) (Draft · founder promise only)

---

# Purpose

The Marketing Workspace provides executives with a unified view of all marketing activities, campaign performance, customer acquisition, digital presence, and return on investment.

Rather than focusing solely on marketing metrics, this workspace measures marketing's contribution to business growth, profitability, and customer relationships.

**Current state:** Marketing has an **overview foundation** at `/marketing` with placeholder data (`lib/marketing-data.ts`) and executive-oriented components. Sub-navigation, dedicated section routes, Executive Provider registration, and intelligence pipeline integration are **not yet implemented**. This specification defines the full Business Workspace per [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) and [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md).

**Placeholder data:** Marketing metrics use static placeholder content until marketing platform integrations ship (future Technical Debt entry aligned with [TD-001](../09_Standards/Technical_Debt_Register.md) / [TD-002](../09_Standards/Technical_Debt_Register.md) pattern).

---

# Objectives

The Marketing Workspace shall:

- Monitor marketing performance.
- Track campaign effectiveness.
- Measure Return on Investment (ROI).
- Monitor customer acquisition.
- Evaluate lead quality.
- Generate marketing recommendations.
- Detect underperforming campaigns.
- Improve marketing efficiency.

---

# Primary Users

Founder · CEO · Marketing Director · Marketing Manager · Digital Marketing Team · Sales Manager · Business Development Manager

---

# Executive Questions

The workspace shall answer:

- Which campaigns generated the highest revenue?
- What is our Customer Acquisition Cost (CAC)?
- Which marketing channels perform best?
- What is our Return on Marketing Investment (ROMI)?
- Which campaigns should be stopped?
- Which campaigns deserve additional investment?
- Where are leads coming from?
- Which channels are underperforming?
- What marketing risks exist?
- What should we do next?

**Behavioural input:** [FA-001 Project Sunrise](../01_Product/FA-001-Project-Sunrise.md) · [FA-003 Project Pulse](../01_Product/FA-003-Project-Pulse.md)

---

# Workspace Sections

1. Executive Summary
2. Campaign Performance
3. Lead Generation
4. Customer Acquisition
5. Digital Channels
6. Website Performance
7. Marketing ROI
8. Budget Performance
9. Marketing Alerts
10. Executive Recommendations
11. Marketing Health

---

# Executive Summary

**Displays:** Marketing Health Score · Campaign Spend · Revenue Generated · Return on Marketing Investment · Customer Acquisition Cost · Lead Conversion Rate · Website Traffic · Business Growth Contribution

**Delivered (partial):** Overview at `/marketing` — `MarketingSummary` · `MarketingHealth` · `ExecutiveBriefing` components

---

# Campaign Performance

**Displays:** Campaign Name · Status · Budget · Spend · Revenue · ROI · Leads Generated · Conversions · Cost Per Lead · Cost Per Conversion

**Delivered (partial):** `CampaignInsights` on overview. Dedicated `/marketing/campaigns` — **planned (ES-026)**.

---

# Lead Generation

**Displays:** New Leads · Qualified Leads · Lead Sources · Lead Quality Score · Lead Age · Assigned Sales Representative · Conversion Status

**Delivered:** `/marketing/leads` — **planned (ES-026)**.

---

# Customer Acquisition

**Displays:** New Customers · Returning Customers · Acquisition Cost · Acquisition Channel · Lifetime Value · Customer Retention · Repeat Purchase Rate

**Delivered:** `/marketing/customers` — **planned (ES-026)**.

---

# Digital Channels

**Displays:** Website · Google Ads · Meta Ads · Instagram · Facebook · LinkedIn · Email Marketing · Organic Search · Referral Traffic

**Delivered (partial):** `ChannelPerformance` on overview. Dedicated `/marketing/channels` — **planned (ES-026)**.

---

# Website Performance

**Displays:** Visitors · Sessions · Bounce Rate · Average Session Duration · Pages Per Session · Top Landing Pages · Top Exit Pages · Conversion Rate

**Delivered:** `/marketing/website` — **planned (ES-026)**.

---

# Marketing ROI

**Displays:** Revenue Generated · Campaign Cost · Profit · ROI · ROMI · Best Performing Campaign · Worst Performing Campaign

**Delivered (partial):** ROI metrics on overview summary. Dedicated ROI views — **planned (ES-026)**.

---

# Budget Performance

**Displays:** Marketing Budget · Spend To Date · Remaining Budget · Forecast Spend · Variance · Budget Utilisation

**Delivered:** `/marketing/budget` — **planned (ES-026)**.

---

# Marketing Alerts

**Examples:** Campaign Budget Exceeded · High Cost Per Lead · Declining Website Traffic · Poor Conversion Rate · Email Bounce Spike · Ad Account Issue · Tracking Failure · SEO Ranking Drop

**Delivered (partial):** `CriticalIssues` on overview. Full alert integration — **planned (ES-026)**.

---

# Executive Recommendations

**Examples:** Increase budget for Campaign Alpha · Pause Campaign Beta · Improve Landing Page Conversion · Retarget Existing Customers · Launch Email Campaign · Optimise Google Ads Keywords · Reduce Spend on Low ROI Campaigns

**Delivered (partial):** `RecommendedActions` · `TopOpportunities` on overview. Executive Provider integration — **planned (ES-026)**.

---

# Marketing Health

**Displays:** Campaign Performance Score · Lead Quality Score · Customer Acquisition Score · ROI Score · Website Health · Overall Marketing Health · Trend · Confidence

**Delivered (partial):** Composite health score on overview (`MarketingHealth`). Multi-dimensional health breakdown — **planned alignment** with Health Engine patterns from [ES-021](./ES-021-Executive-Intelligence-Engines.md).

---

# Workspace Navigation

**Route:** `/marketing`

| Section | Route | Status |
|---------|-------|--------|
| Overview | `/marketing` | Delivered (foundation) |
| Campaigns | `/marketing/campaigns` | Planned |
| Leads | `/marketing/leads` | Planned |
| Customers | `/marketing/customers` | Planned |
| Website | `/marketing/website` | Planned |
| Channels | `/marketing/channels` | Planned |
| Budget | `/marketing/budget` | Planned |
| Analytics | `/marketing/analytics` | Planned |
| Reports | `/marketing/reports` | Planned |
| Settings | `/marketing/settings` | Planned |

Uses `WorkspaceSubNav` per [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md) — **planned**.

---

# Search

Supports: Campaign · Lead · Customer · Keyword · Landing Page · Advertisement · Channel

**Delivered (partial):** Command Palette entry for `/marketing` — Mission 14C

---

# Filters

Date · Campaign · Channel · Region · Device · Audience · Budget · Status

---

# Responsive Behaviour

| Viewport | Layout |
|----------|--------|
| Desktop | Three-column layout |
| Tablet | Two-column layout |
| Mobile | Single-column layout |

**Delivered (partial):** Responsive overview layout

---

# Empty States

Display: illustration · helpful explanation · suggested action

---

# Error States

Display: simple explanation · retry button · hide technical details by default

---

# Performance

| Target | Requirement |
|--------|-------------|
| Initial load | < 2 seconds |
| Search | < 300ms |
| Dashboard refresh | Instant |

---

# Accessibility

Keyboard navigation · screen reader support · WCAG 2.2 AA

---

# Architecture Requirements

Per [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md):

| Requirement | Implementation |
|-------------|----------------|
| Executive Shell integration | `app/(platform)/marketing/` · `DashboardLayout` |
| Business logic in `lib/` | `lib/marketing-data.ts` (foundation) · `lib/marketing-insights.ts` — **planned** |
| Presentation in components | `components/marketing/` (foundation) |
| Executive Provider | `marketingExecutiveProvider` — **planned** |
| Executive Brief contribution | Intelligence Bus · Marketing card — **planned** |
| Intelligence pipeline | `lib/marketing/marketing-intelligence-pipeline.ts` — **planned** |
| Registry registration | [register-executive-providers.ts](../../lib/intelligence/register-executive-providers.ts) — **planned** |

---

# Provider Dependencies

| Provider | Responsibility | Status |
|----------|----------------|--------|
| Campaign Provider | Campaign performance and ROI | Planned |
| Lead Provider | Lead generation and quality | Planned |
| Website Analytics Provider | Traffic and conversion metrics | Planned |
| Advertising Provider | Paid channel performance | Planned |
| Customer Provider | Acquisition and retention | Planned |
| Revenue Provider | Revenue attribution | Planned |
| Recommendation Provider | Executive actions | Planned |
| Alert Provider | Marketing risk alerts | Planned |
| Marketing Health Provider | Composite and dimensional health | Planned |
| Trend Provider | Marketing trends | Planned (future engine) |

Consolidated through `marketingExecutiveProvider` implementing [ExecutiveProvider](../../lib/intelligence/provider.ts) + ADR-006 — **planned**.

---

# Platform Dependencies

| Dependency | Status |
|------------|--------|
| Mission 17B — Intelligence Engines | Complete |
| Mission 17A — Provider Framework | Complete |
| marketingExecutiveProvider | Not registered |
| ES-022 — Executive Dashboard | Specified |
| ES-025 — Finance Workspace | Approved (revenue cross-reference) |
| Connected marketing API (Google, Meta, analytics) | Out of scope (v2.x) |

---

# Business Rules

- Campaign budgets cannot become negative.
- Closed campaigns become read-only.
- Recommendations ranked by business impact.
- Revenue attribution follows approved attribution model.
- Historical campaign data remains immutable.

---

# Acceptance Criteria

The workspace shall:

- [ ] Display marketing summary (partial — overview foundation)
- [ ] Track campaign performance (partial — insights on overview)
- [ ] Monitor lead generation
- [ ] Measure customer acquisition
- [ ] Calculate marketing ROI (partial — summary metrics)
- [ ] Generate recommendations (partial — static recommended actions)
- [ ] Generate alerts (partial — critical issues on overview)
- [ ] Support responsive layouts (partial — overview)
- [ ] Meet accessibility standards
- [ ] Register `marketingExecutiveProvider`
- [ ] Contribute to Executive Brief via Intelligence Bus
- [ ] Pass Verification Hierarchy on Mission 21A completion

---

# Implementation Status

| Area | Status | Notes |
|------|--------|-------|
| Overview foundation | Delivered | `/marketing` · `lib/marketing-data.ts` · `components/marketing/` |
| Sub-navigation & routes | Planned | Mission 21A |
| Executive Provider | Planned | Mirror `financeExecutiveProvider` / `crmExecutiveProvider` |
| Intelligence pipeline | Planned | Mirror CRM pattern from ES-021/17B |
| Release record | Pending | RR-021+ on Mission 21A delivery |

**Construction Phase work:** Full workspace per this specification · provider registration · Executive Brief card · dimensional Marketing Health · dedicated section routes

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Campaign Created | Campaign list and summary update |
| Campaign Completed | Status read-only; ROI finalised |
| Budget Exceeded | Alert generated |
| Lead Generated | Lead views and summary update |
| Lead Converted | Conversion metrics and CRM cross-reference |
| Website Traffic Declines | Trend and alert visible |
| Recommendation Generated | Provider and Brief updated |
| Provider Failure | Widget error; workspace usable |
| Mobile Layout | Sections stack; navigation usable |
| Tracking Failure | Alert surfaced; graceful degradation |

---

# Out of Scope

- Social Media Publishing
- Graphic Design Tools
- Video Editing
- Marketing Automation Builder
- CRM Email Composer
- Affiliate Network Management

These capabilities belong to dedicated marketing platforms or future ORION releases.

---

# Future Enhancements

- Predictive Marketing · AI Campaign Optimisation · Sentiment Analysis
- Competitor Monitoring · SEO Intelligence · Content Performance Analysis
- Executive Marketing Forecast · Cross-Business Attribution

---

# Definition of Done

The Marketing Workspace is complete when:

- Campaign management functions correctly
- Lead tracking is operational
- Website analytics are integrated
- ROI calculations are accurate
- Marketing Health is calculated (dimensional scores)
- Recommendations function correctly via Executive Provider
- Alerts operate correctly
- Executive Brief receives marketing contribution
- Accessibility requirements are met
- Performance targets are achieved
- ES-026 acceptance criteria met
- Founder approval is received

**Status:** Overview foundation **delivered**. Full ES-026 workspace — **Construction Phase · Mission 21A pending**.

---

# References

| Document | Location |
|----------|----------|
| ES-016 Marketing Workspace (superseded) | [ES-016 – Marketing Workspace.md](./ES-016%20%E2%80%93%20Marketing%20Workspace.md) |
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-024 Commerce Workspace | [ES-024-Commerce-Workspace.md](./ES-024-Commerce-Workspace.md) |
| ES-025 Finance Workspace | [ES-025-Finance-Workspace.md](./ES-025-Finance-Workspace.md) |
| ES-021 Intelligence Engines | [ES-021-Executive-Intelligence-Engines.md](./ES-021-Executive-Intelligence-Engines.md) |
| ADR-005 Business Workspace | [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) |
| ADR-006 Provider Framework | [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Product Constitution | [ORION_Product_Constitution.md](../01_Product/ORION_Product_Constitution.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |

---

# Closing Statement

The Marketing Workspace transforms marketing data into executive intelligence.

Its purpose is not merely to measure campaigns, but to help executives invest confidently, eliminate waste, and maximise sustainable business growth.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | Pending (Mission 21A) |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**

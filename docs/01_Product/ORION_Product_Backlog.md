# ORION Product Backlog

**Version:** 1.0  
**Status:** Active  
**Owner:** Mohammad Shafi Goroo (Founder & CEO)

---

# Purpose

The ORION Product Backlog is the master list of business capabilities planned for the ORION Platform.

Engineering Specifications (ES) describe **how** features are built.

The Product Backlog defines **what** ORION will eventually do.

All future sprints originate from this document.

Every feature must pass review against the [ORION Product Bible](../00_BLUEPRINT/ORION_Product_Bible.md), the [Product Test](../01_Product/ORION_Product_Constitution.md#product-test), and the [Decision Filter](../00_BLUEPRINT/ORION_Non_Negotiables.md#decision-filter).

---

## Active Product Discovery

| Assignment | Title | Status | Output |
|------------|-------|--------|--------|
| [FA-001](../01_Product/FA-001-Project-Sunrise.md) | Project Sunrise | Active | Executive questions → Phase II requirements |
| [FA-002](../01_Product/FA-002-Project-Compass.md) | Project Compass | Active | Decision patterns → Intelligence Platform design |
| [FA-003](../01_Product/FA-003-Project-Pulse.md) | Project Pulse | Active | Attention patterns → Dashboard and workflow design |

Per FA-001: *We do not build features. We build answers to executive questions.*

Per FA-002: *ORION should support better decisions — not simply present information.*

Per FA-003: *ORION should reduce executive effort — not increase it.*

---

## Construction Phase (Mission 18+)

| Capability | ES | Status | Priority |
|------------|-----|--------|----------|
| Executive Dashboard | [ES-022](../02_Engineering/ES-022-Executive-Dashboard.md) · [ES-044](../02_Engineering/ES-044-Sprint-2-Implementation-Plan.md) · [ES-062](../02_Engineering/ES-062-Sprint-4-Implementation-Plan.md) | **In Progress** — `/dashboard` live · widget registry pending | Critical |
| Executive Brief Engine | [ES-028](../02_Engineering/ES-028-Executive-Brief-Engine.md) | **In Progress** — Sprint 4 module delivered · Advisor wiring pending | Critical |
| Recommendation Engine | [ES-029](../02_Engineering/ES-029-Recommendation-Engine.md) | **In Progress** — Sprint 4 rule engine delivered · explainability UI pending | Critical |
| Alert Engine | [ES-030](../02_Engineering/ES-030-Alert-Engine.md) | **In Progress** — Sprint 4 module delivered · legacy interim remains | Critical |
| Trend Engine | [ES-031](../02_Engineering/ES-031-Trend-Engine.md) | **In Progress** — pipeline aggregation only · standalone engine pending | High |
| Business Health Engine | [ES-032](../02_Engineering/ES-032-Business-Health-Engine.md) | **In Progress** — orchestrator stage · 4 mock drivers | Critical |
| Event & Messaging Architecture | [ES-033](../02_Engineering/ES-033-Event-Messaging-Architecture.md) | Approved — in-memory foundation · full architecture pending | High |
| Provider & Data Contract Standards | [ES-034](../02_Engineering/ES-034-Provider-Data-Contract-Standards.md) | Approved — Executive Provider delivered · full standard pending | High |
| API Design Standards | [ES-035](../02_Engineering/ES-035-API-Design-Standards.md) | Approved — not implemented | High |
| Database & Persistence Architecture | [ES-036](../02_Engineering/ES-036-Database-Persistence-Architecture.md) | Approved — foundation delivered · full architecture pending | High |
| Authentication & Authorisation Architecture | [ES-037](../02_Engineering/ES-037-Authentication-Authorisation-Architecture.md) | Approved — foundation delivered · full architecture pending | High |
| Audit Logging & Observability Architecture | [ES-038](../02_Engineering/ES-038-Audit-Logging-Observability-Architecture.md) | Approved — foundation delivered · full architecture pending | High |
| AI Orchestration & Agent Framework | [ES-039](../02_Engineering/ES-039-AI-Orchestration-Agent-Framework.md) | Approved — intelligence foundation · AI agents pending | Critical |
| Sprint 1 Implementation Plan | [ES-040](../02_Engineering/ES-040-Sprint-1-Implementation-Plan.md) | Approved — foundation partial · gaps open | Critical |
| Sprint 1 Work Breakdown Structure | [ES-041](../02_Engineering/ES-041-Sprint-1-Work-Breakdown-Structure.md) | Approved — 12 work packages mapped | Critical |
| Sprint 1 Engineering Task Catalogue | [ES-042](../02_Engineering/ES-042-Sprint-1-Engineering-Task-Catalogue.md) | Approved — 56 tasks catalogued | Critical |
| Engineering Governance & Delivery Standards | [ES-043](../02_Engineering/ES-043-Engineering-Governance-Delivery-Standards.md) | Approved — standards documented · CI enforcement pending | High |
| Sprint 2 Implementation Plan | [ES-044](../02_Engineering/ES-044-Sprint-2-Implementation-Plan.md) | Approved — Advisor/Brief partial · dashboard alignment pending | Critical |
| Sprint 2 Work Breakdown Structure | [ES-045](../02_Engineering/ES-045-Sprint-2-Work-Breakdown-Structure.md) | Approved — 11 work packages mapped | Critical |
| Sprint 2 Engineering Task Catalogue | [ES-046](../02_Engineering/ES-046-Sprint-2-Engineering-Task-Catalogue.md) | Approved — 55 tasks catalogued | Critical |
| Sprint 3 Implementation Plan | [ES-047](../02_Engineering/ES-047-Sprint-3-Implementation-Plan.md) | Approved — overview delivered · operational pending | Critical |
| Sprint 3 Work Breakdown Structure | [ES-048](../02_Engineering/ES-048-Sprint-3-Work-Breakdown-Structure.md) | Approved — 12 work packages mapped | Critical |
| Sprint 3 Engineering Task Catalogue | [ES-049](../02_Engineering/ES-049-Sprint-3-Engineering-Task-Catalogue.md) | Approved — 72 tasks catalogued | Critical |
| Enterprise Reference Architecture | [ES-050](../02_Engineering/ES-050-ORION-Enterprise-Reference-Architecture.md) | Approved — master architecture · six layers | Critical |
| Technical Roadmap & Product Evolution | [ES-051](../02_Engineering/ES-051-ORION-Technical-Roadmap-Product-Evolution-Strategy.md) | Approved — five-year strategy · Phase 1 in progress | Critical |
| Architecture Decision Record Framework | [ES-052](../02_Engineering/ES-052-Architecture-Decision-Record-Framework.md) | Approved — ADR lifecycle · 6 ADRs · 3 Accepted | High |
| Risk Management & Technical Debt Framework | [ES-053](../02_Engineering/ES-053-ORION-Risk-Management-Technical-Debt-Framework.md) | Approved — TD register · risk register planned | High |
| Quality Assurance & Engineering Excellence | [ES-054](../02_Engineering/ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) | **In Progress** — Vitest locally · CI planned | Critical |
| DevSecOps & Continuous Delivery Architecture | [ES-055](../02_Engineering/ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md) | Approved — manual delivery · pipeline planned | Critical |
| Data Governance & Information Architecture | [ES-056](../02_Engineering/ES-056-ORION-Data-Governance-Information-Architecture.md) | Approved — static data · persistence partial | High |
| AI Governance & Responsible Intelligence | [ES-057](../02_Engineering/ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md) | Approved — deterministic intelligence · no LLM | High |
| Enterprise Operations & Service Management | [ES-058](../02_Engineering/ES-058-ORION-Enterprise-Operations-Service-Management-Framework.md) | Approved — manual delivery · no production ops | Critical |
| Platform Security & Zero Trust Architecture | [ES-059](../02_Engineering/ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md) | Approved — placeholder auth · no MFA | Critical |
| Platform Extensibility, Plugin & Marketplace | [ES-060](../02_Engineering/ES-060-ORION-Platform-Extensibility-Plugin-Marketplace-Architecture.md) | **In Progress** — Sprint 4 Provider Framework delivered | Medium |
| ORION v0.4 Master Development Plan | [ES-061](../02_Engineering/ES-061-ORION-v0.4-Master-Development-Plan.md) | **In Progress** — ~45% Phase 1 complete | Critical |
| Sprint 4 Implementation Plan | [ES-062](../02_Engineering/ES-062-Sprint-4-Implementation-Plan.md) | **In Progress** — core intelligence delivered · M9 pending | Critical |
| Sprint 4 Work Breakdown Structure | [ES-063](../02_Engineering/ES-063-Sprint-4-Work-Breakdown-Structure.md) | **In Progress** — 12 Done · 38 Partial · 60 Open | Critical |
| Sprint 4 Engineering Task Catalogue | [ES-064](../02_Engineering/ES-064-Sprint-4-Engineering-Task-Catalogue.md) | **In Progress** — 18 Done · 42 Partial · 33 Open | Critical |
| Executive Intelligence Architecture | [ES-065](../02_Engineering/ES-065-Executive-Intelligence-Architecture.md) | **In Progress** — orchestrator delivered · legacy migration pending | Critical |
| Hospitality Workspace | [ES-023](../02_Engineering/ES-023-Hospitality-Workspace.md) · [ES-047](../02_Engineering/ES-047-Sprint-3-Implementation-Plan.md) · [ES-048](../02_Engineering/ES-048-Sprint-3-Work-Breakdown-Structure.md) · [ES-049](../02_Engineering/ES-049-Sprint-3-Engineering-Task-Catalogue.md) | Partial — overview at `/hospitality` | High |
| Commerce Workspace | — | Specified ([ES-024](./02_Engineering/ES-024-Commerce-Workspace.md)) | High |
| Marketing Workspace | [ES-026](../02_Engineering/ES-026-Marketing-Workspace.md) | Approved — overview foundation only | Medium |

---

## Status Definitions

| Status | Meaning |
|---------|----------|
| Planned | Approved but not started |
| In Progress | Currently being implemented |
| In Verification | Development complete; under testing/review |
| Completed | Implemented, verified and released |

---

# Platform Core

| Feature | Status | Priority |
|----------|--------|----------|
| Identity Platform | Completed | High |
| Authentication | In Progress · [ES-037](../02_Engineering/ES-037-Authentication-Authorisation-Architecture.md) | High |
| Persistence Foundation | In Progress · [ES-036](../02_Engineering/ES-036-Database-Persistence-Architecture.md) | High |
| User Management | Planned | High |
| Roles & Permissions | In Progress | High |
| Notifications | Planned | Medium |
| Activity Log | Planned · [ES-038](../02_Engineering/ES-038-Audit-Logging-Observability-Architecture.md) | Medium |
| Settings | Planned | Medium |
| Audit Trail | Planned · [ES-038](../02_Engineering/ES-038-Audit-Logging-Observability-Architecture.md) | Medium |

---

# ORANIA

| Feature | Status | Priority |
|----------|--------|----------|
| Reservations | Planned | High |
| Availability Calendar | Planned | High |
| Guest Messaging | Planned | High |
| Housekeeping | Planned | High |
| Payments | Planned | High |
| Invoices | Planned | Medium |
| Reviews | Planned | Medium |
| Maintenance | Planned | Medium |
| Concierge | Planned | Low |

---

# ATSAR

| Feature | Status | Priority |
|----------|--------|----------|
| Products | Planned | High |
| Inventory | Planned | High |
| Orders | Planned | High |
| Customers | Planned | High |
| Shipping | Planned | Medium |
| Returns | Planned | Medium |
| Suppliers | Planned | Medium |
| Analytics | Planned | Medium |

---

# CRM

**Workspace:** [ES-027 — CRM Workspace](../02_Engineering/ES-027-CRM-Workspace.md) (Approved · Missions 16A–16D delivered · UI: Customer Intelligence)

| Feature | Status | Priority |
|----------|--------|----------|
| CRM Workspace (Overview, Customers, Opportunities, Relationships, Activity, Communications, Insights) | Completed | High |
| Dedicated Organisations route (`/crm/companies`) | Planned (ES-027 alignment) | High |
| Dimensional Relationship Health scores | Planned (ES-027 alignment) | Medium |
| Full cross-domain Relationship Timeline | Planned (ES-027 alignment) | Medium |
| CRM AI | Planned | Medium |

---

# Marketing

**Workspace:** [ES-026 — Marketing Workspace](../02_Engineering/ES-026-Marketing-Workspace.md) (Approved · overview foundation only)

| Feature | Status | Priority |
|----------|--------|----------|
| Marketing Overview (summary, health, channels, campaigns) | In Progress | High |
| Sub-navigation & section routes | Planned (ES-026 · Mission 21A) | High |
| Lead generation & customer acquisition views | Planned (ES-026) | High |
| Marketing ROI & budget performance | Planned (ES-026) | High |
| marketingExecutiveProvider | Planned (ES-026) | High |
| Marketing AI | Planned | Medium |

---

# Finance

**Workspace:** [ES-025 — Finance Workspace](../02_Engineering/ES-025-Finance-Workspace.md) (Approved · Missions 15A–15C delivered)

| Feature | Status | Priority |
|----------|--------|----------|
| Finance Workspace (Executive Summary, Cash, Revenue, Expenses, AR/AP) | Completed | High |
| Budget Performance section | Planned (ES-025 alignment) | High |
| Dimensional Financial Health scores | Planned (ES-025 alignment) | Medium |
| Dedicated Profitability views | Planned (ES-025 alignment) | Medium |
| Finance AI | Planned | Medium |

---

# AI

| Feature | Status | Priority |
|----------|--------|----------|
| Founder AI | Planned | High |
| Hotel AI | Planned | High |
| Marketing AI | Planned | High |
| Sales AI | Planned | Medium |
| Finance AI | Planned | Medium |
| CRM AI | Planned | Medium |

---

# Future Modules

- Knowledge Vault
- Integrations Marketplace
- Workflow Automation
- Mobile Applications
- Public API
- AI Agents
- Analytics Platform

---

# Sprint 4 — Remaining Work (v0.4 Phase 1)

**Status:** In Progress · M9 not met · Last synced 25 July 2026

| Area | Completed | Remaining |
|------|-----------|-----------|
| Provider Framework | Mock providers · registry · manager · health | Real domain providers · TD-001/002 |
| Intelligence Orchestrator | 10-stage pipeline · observability | Context sharing · caching · dedupe fetches |
| Brief Engine | Sprint 4 module · dashboard wiring | Advisor migration · brief history · scheduling |
| Recommendation Engine | Rule engine · scoring · dashboard cards | Explainability UI · Advisor wiring · acceptance tracking |
| Alert Engine | Rule engine · alert panel · pipeline stage | Legacy interim removal · notification bridge · API |
| Trend Engine | Pipeline aggregation from mock providers | Standalone ES-031 engine · chart widgets |
| Executive Dashboard | `/dashboard` route · core widgets | Widget registry · canonical nav · loading states |
| Quality | Vitest locally · audit reports | CI Phase B · M9 sign-off · RR-018 |
| Platform | — | Auth · REST API · CI/CD · integrations · Copilot |

**References:** [ES-062](../02_Engineering/ES-062-Sprint-4-Implementation-Plan.md) · [ES-063](../02_Engineering/ES-063-Sprint-4-Work-Breakdown-Structure.md) · [ES-064](../02_Engineering/ES-064-Sprint-4-Engineering-Task-Catalogue.md) · [Engineering Audit](../03_Quality/Engineering-Audit-Report.md) · [Performance Audit](../03_Quality/Performance-Audit.md)

---

# Platform Milestones

| Version | Milestone | Status |
|----------|-----------|--------|
| v0.1.0 | Foundation Documents | Completed |
| v0.2.0 | Design System Foundation | Completed |
| v0.3.0 | Identity Platform Foundation | Completed |
| v0.4.0 | Business Intelligence (Sprint 4) | **In Progress** · orchestrator · `/dashboard` |
| v0.4.0 | Persistence Foundation (RR-002) | Completed |
| v0.5.0 | Platform Services | Planned |
| v0.6.0 | ORANIA MVP | Planned |
| v0.7.0 | ATSAR MVP | Planned |
| v0.8.0 | CRM Foundation | Completed (Missions 16A–16D) |
| v0.9.0 | ORION Intelligence | **In Progress** (Sprint 4) |
| v1.0.0 | Production Release | Planned |

---

# Product Roadmap

## Phase 1 — Platform Foundation

- Identity
- Persistence
- Platform Services

## Phase 2 — Business Modules

- ORANIA
- ATSAR

## Phase 3 — Business Growth

- CRM
- Marketing
- Finance

## Phase 4 — Intelligence

- AI Platform
- AI Agents
- Knowledge Vault

---

# Development Rule

Every new Engineering Specification (ES) must trace back to one or more Product Backlog items.

Features may not enter development unless they appear in this backlog.

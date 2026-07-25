# ES-061 — ORION v0.4 Master Development Plan

**Version:** 1.0.0

**Status:** Approved

**Classification:** Enterprise Engineering Specification

**Author:** Founder & Chief Architect

**Related specifications:** [ES-051 — Technical Roadmap & Product Evolution](./ES-051-ORION-Technical-Roadmap-Product-Evolution-Strategy.md) · [ES-050 — Enterprise Reference Architecture](./ES-050-ORION-Enterprise-Reference-Architecture.md) · [ES-044 — Sprint 2 Plan](./ES-044-Sprint-2-Implementation-Plan.md) · [ES-047 — Sprint 3 Plan](./ES-047-Sprint-3-Implementation-Plan.md) · [ES-039 — AI Orchestration](./ES-039-AI-Orchestration-Agent-Framework.md) · [ES-035 — API Design Standards](./ES-035-API-Design-Standards.md) · [ORION Project Charter](../00_BLUEPRINT/ORION_Project_Charter.md)

**Baseline release:** [v0.3.0-enterprise-foundation](../06_Releases/CHANGELOG.md) · tag `v0.3.0-enterprise-foundation`

---

# Purpose

The ORION v0.4 Master Development Plan establishes the official engineering programme for **ORION Version 0.4** — the release cycle that completes the Business Platform, Executive Intelligence engines, first AI capabilities, and foundational external integrations.

It consolidates sprint backlogs, workspace specifications, intelligence engine gaps, and integration priorities into a single authoritative plan for engineering execution, release governance, and executive approval.

**Current state:** ORION completed the **Enterprise Foundation** milestone (`v0.3.0-enterprise-foundation`) and has **delivered Sprint 4 Phase 1 intelligence foundations** (Provider Framework, Brief/Recommendation/Alert engines, Intelligence Orchestrator, `/dashboard` Executive Dashboard — `main` @ `cc4a282`). **v0.4 work remains partially open**: widget registry (ES-022), legacy intelligence-bus migration, standalone Trend Engine (ES-031), REST API layer, production authentication, CI/CD, real domain providers, LLM copilot, and external integrations. This document **defines the v0.4 target state** mapped against codebase reality (last synced 25 July 2026).

**Version note:** Historical semver `v0.4.0` (Persistence Foundation · RR-002) remains in release history. **ORION Version 0.4** in this plan denotes the **Business Platform Completion & Intelligence** programme building on the enterprise foundation tag.

---

# Executive Summary

ORION Version 0.4 transforms the platform from **enterprise foundation + partial workspaces** into a **production-capable Executive Operating System** with six operational business workspaces, completed executive intelligence engines, governed AI copilot capabilities, and first-wave external integrations.

| Dimension | v0.3.0 Enterprise Foundation | v0.4 Target |
|-----------|------------------------------|-------------|
| Engineering specs | ES-006–ES-060 complete | ES-061 execution · RR-018+ |
| Workspaces | Finance/CRM substantial · Hospitality/Marketing overview · Commerce absent | Six workspaces operational |
| Executive Intelligence | Health/Recommendation/Brief engines · pipeline partial | All six engines · Advisor fully wired |
| AI | Deterministic only · null `AI_PROVIDER_REGISTRY` | Executive Copilot · NL interface · agent foundation |
| Integrations | None operational | Phase 1 connectors (Google · M365 · payments · ads · PMS) |
| Platform | Placeholder auth · static data · no CI | Auth · API · CI · domain providers · persistence path |

**Estimated programme shape:** 4 engineering phases · 2–4 sprints per phase · gated by [ES-043](./ES-043-Engineering-Governance-Delivery-Standards.md) · [ES-054](./ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) · [ES-055](./ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md).

**Target tag:** `v0.4.0-business-intelligence` (proposed · Release Record pending)

---

# Objectives

| # | Objective | Success Measure | Baseline | v0.4 Target |
|---|-----------|-----------------|----------|-------------|
| O1 | Complete six business workspaces | Each workspace meets ES acceptance | 2 substantial · 2 overview · 0 commerce | 6 operational |
| O2 | Deliver unified Executive Dashboard | ES-022 acceptance met | `/advisor` partial | `/dashboard` + widget registry |
| O3 | Complete Executive Intelligence engines | Six engines per ES-028–032 | 3 engines · 2 interim | 6 engines production-ready |
| O4 | Launch governed AI copilot | ES-057 · ES-039 acceptance | Placeholder Ask ORION | LLM + approval workflow |
| O5 | Establish integration foundation | REST API + 3+ connectors live | No API · no connectors | `/api/v1/` + Phase 1 integrations |
| O6 | Achieve production engineering baseline | CI · tests · auth · observability | Manual only | ES-054/055 Phase A–B minimum |
| O7 | Replace static domain data | TD-001/TD-002 remediated | `lib/*-data.ts` | Domain providers + persistence ADR |
| O8 | Release with full governance | RR · CHANGELOG · verification | Enterprise foundation RR | RR-018+ v0.4 series |

---

# Scope

## In Scope

- Advisor Workspace completion and ES-022 alignment
- CRM · Finance · Marketing · Hospitality · Commerce workspace operational delivery
- Executive Intelligence engine completion (Brief · Recommendation · Alert · Trend · Health · Dashboard)
- Executive Copilot · AI orchestration foundation · natural language interface
- REST API layer (`/api/v1/`) and provider framework expansion
- Phase 1 external integrations (9 connector categories)
- Authentication upgrade (placeholder → production path)
- CI/CD Phase A–B · test suite foundation
- Domain executive providers for all six workspaces
- Release Records RR-018 through RR-0XX for v0.4 milestones

## Out of Scope

See [Out of Scope](#out-of-scope) section.

---

# Business Goals

| Goal | Description | v0.4 Contribution |
|------|-------------|-------------------|
| Executive decision velocity | Executives act on unified intelligence | Completed Advisor · Brief · Recommendations |
| Operational workspace coverage | Run hospitality, commerce, finance, marketing, CRM from one OS | Six workspace completion |
| AI-assisted leadership | Copilot augments judgement without replacing accountability | Executive Copilot · ES-057 governance |
| Integration without silos | Connect tools executives already use | Google · M365 · Shopify · Stripe · ads · PMS |
| Production readiness | First paying/customer deployments | Auth · CI · API · observability baseline |
| Measurable business outcomes | KPIs per workspace drive actions | Domain providers · trend/alert engines |

**Alignment:** [ORION Product Bible](../00_BLUEPRINT/ORION_Product_Bible.md) · [ORION Product Backlog](../01_Product/ORION_Product_Backlog.md) · [FA-001](../01_Product/FA-001-Project-Sunrise.md) · [FA-002](../01_Product/FA-002-Project-Compass.md) · [FA-003](../01_Product/FA-003-Project-Pulse.md)

---

# Technical Goals

| Goal | Specification | Baseline | v0.4 Target |
|------|---------------|----------|-------------|
| Unified dashboard architecture | ES-022 | Multiple surfaces · no registry | Widget registry · `/dashboard` |
| Intelligence engine separation | ES-028–032 | Engines in `lib/intelligence/` · Alert/Trend open | Dedicated Alert · Trend engines |
| Provider-driven intelligence | ADR-006 · ES-034 | Finance/CRM providers | All six workspace providers |
| API-first integration | ES-035 | No REST routes | `/api/v1/` core resources |
| Real identity | ES-037 · PRD-001 | Placeholder session | Auth provider ADR + implementation |
| Automated quality gates | ES-054 · ES-055 | Manual lint/build | CI pipeline · test suite |
| Durable observability | ES-038 | In-memory audit | Structured logging · health endpoint |
| Governed AI runtime | ES-039 · ES-057 | Null AI registry | Registered LLM provider · audit schema |
| Single source of truth | ES-036 · TD-001/002 | Static modules | Domain repositories or providers |
| Zero-trust progression | ES-059 | RBAC types only | Auth enforcement · API security |

---

# Deliverables

| ID | Deliverable | Type | Priority | Spec | Status |
|----|-------------|------|----------|------|--------|
| D1 | Unified Executive Dashboard (`/dashboard`) | Product | P0 | ES-022 | **Partial** · route live · orchestrator-fed |
| D2 | Widget registry and preferences | Platform | P0 | ES-022 · ES-044 | **Open** |
| D3 | Advisor full Intelligence Bus wiring | Product | P0 | ES-020 · ES-044 | **Partial** · legacy bus · `/dashboard` uses orchestrator |
| D4 | CRM workspace completion | Workspace | P1 | ES-027 | **Partial** |
| D5 | Finance workspace completion | Workspace | P1 | ES-025 | **Partial** |
| D6 | Marketing workspace completion | Workspace | P1 | ES-026 | **Partial** |
| D7 | Hospitality operational workspace | Workspace | P0 | ES-023 · ES-049 | **Partial** |
| D8 | Commerce workspace foundation | Workspace | P1 | ES-024 | **Open** |
| D9 | Alert Engine extraction | Engine | P0 | ES-030 | **Partial** · `lib/intelligence/alerts/` delivered · legacy interim remains |
| D10 | Trend Engine | Engine | P1 | ES-031 | **Partial** · pipeline trend aggregation · no standalone engine |
| D11 | Executive Copilot (Ask ORION) | AI | P0 | ES-039 · ES-057 | **Partial** |
| D12 | REST API v1 foundation | Platform | P0 | ES-035 · S1-120 | **Open** |
| D13 | Production authentication | Platform | P0 | ES-037 · PRD-001 | **Partial** |
| D14 | CI/CD pipeline Phase A–B | Platform | P0 | ES-055 | **Open** |
| D15 | Phase 1 integrations (9 categories) | Integration | P1 | ES-034 · ES-061 | **Open** |
| D16 | Domain provider remediation (TD-001/002) | Platform | P0 | ES-034 · TD register | **Open** |
| D17 | v0.4 Release Record series | Governance | P1 | RR template | **Open** |

---

# Architecture Dependencies

| Dependency | Required For | Spec | Baseline | v0.4 Action |
|------------|--------------|------|----------|-------------|
| Executive Provider Framework | All workspace intelligence | ADR-006 · ES-034 | Finance/CRM registered | Register Marketing · Hospitality · Commerce |
| Intelligence Pipeline | Dashboard · Advisor · engines | ES-020 · ES-021 | Delivered · partial wiring | End-to-end bus · remove static bypass |
| Event Bus | Integrations · domain events | ES-033 | In-memory registry | Domain event catalogue · emitters |
| Persistence ADR | Domain data · integrations | ES-036 · ES-052 | In-memory only | ADR for production DB · repositories |
| Authentication | API · integrations · RBAC | ES-037 | Placeholder | Real auth provider |
| REST API | External connectors · mobile future | ES-035 | Not implemented | `/api/v1/` Phase 1 |
| DevSecOps CI | Quality gates · releases | ES-055 | Manual | GitHub Actions Phase A–B |
| AI Governance | Copilot · agents | ES-057 · ES-039 | Docs only | Prompt library · audit · approval |
| Data Governance | Integration data handling | ES-056 | Classification documented | Enforce on API payloads |
| Security architecture | Integrations · auth · API | ES-059 | Placeholder auth | OAuth · secrets vault · rate limits |

**Dependency graph:**

```
ES-037 Auth ──┬── ES-035 API ──┬── Integrations (Section 11)
              │                │
ES-036 Persistence ADR ── ES-034 Providers ── lib/intelligence/
              │
ES-055 CI ─── ES-054 QA ─── All v0.4 deliverables
              │
ES-057 AI Governance ── ES-039 Agents ── Executive Copilot
```

---

# Workspace Completion Plan

Each workspace shall deliver: Overview dashboard · Sub-navigation · Domain sections · Executive provider · Intelligence pipeline integration · Command palette entries · ES acceptance criteria met.

## Advisor Workspace

**Route:** `/advisor` (default landing) · target `/dashboard` alias per ES-022

| Capability | Spec | Baseline | v0.4 Target |
|------------|------|----------|-------------|
| Executive Brief surface | ES-028 | Delivered · partial static | Full pipeline · no static bypass |
| Finance/CRM insight cards | ES-025 · ES-027 | Pipeline integrated | All workspace cards |
| Decision support | ES-029 | Static decisions | Pipeline recommendations |
| Ask ORION panel | ES-039 | Placeholder UI | Executive Copilot |
| Widget layout | ES-022 | Fixed layout | Configurable registry |

**Open backlog:** [ES-046](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) S2-082 explainability · S2-070+ dashboard API

## CRM Workspace

**Route:** `/crm` · 9 sub-routes

| Capability | Baseline | v0.4 Target |
|------------|----------|-------------|
| Overview · KPIs · health | **Delivered** | Maintain · provider-only data |
| Customers · relationships · opportunities | **Partial** · static | Domain provider · CRUD services |
| Insights pipeline | **Delivered** · `crm-intelligence-pipeline.ts` | Event-driven updates |
| Reports · communications · settings | Placeholder sections | Functional minimum |
| Executive provider | **Delivered** | Extend with live data |

**Spec:** [ES-027 — CRM Workspace](./ES-027-CRM-Workspace.md)

## Finance Workspace

**Route:** `/finance` · 9 sub-routes

| Capability | Baseline | v0.4 Target |
|------------|----------|-------------|
| Overview · KPIs · charts | **Delivered** | Provider-only · Stripe integration hook |
| Receivables · payables | **Delivered** · static | Live ledger adapter |
| Cash · revenue · expenses · forecast | **Partial** | Operational sections |
| Executive provider | **Delivered** | Stripe · accounting connector |
| Advisor integration | **Delivered** | Maintain |

**Spec:** [ES-025 — Finance Workspace](./ES-025-Finance-Workspace.md)

## Marketing Workspace

**Route:** `/marketing` · overview only

| Capability | Baseline | v0.4 Target |
|------------|----------|-------------|
| Overview dashboard | **Partial** · 15 components · static | Sub-nav · campaigns · channels |
| Google Ads integration | — | **Open** · Phase 1 connector |
| Meta integration | — | **Open** · Phase 1 connector |
| Executive provider | — | Register `marketingExecutiveProvider` |
| Campaign analytics | Static KPIs | Connector-driven metrics |

**Spec:** [ES-026 — Marketing Workspace](./ES-026-Marketing-Workspace.md)

## Hospitality Workspace

**Route:** `/hospitality` · overview only

| Capability | Baseline | v0.4 Target |
|------------|----------|-------------|
| Overview dashboard | **Partial** · 15 components | Maintain · enhance |
| Reservations · guests · rooms | — | **Open** · [ES-049](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) WP2–4 |
| Housekeeping · maintenance | — | **Open** · ES-049 WP5–6 |
| PMS integration | — | **Open** · Phase 1 connector |
| Channel manager | — | **Open** · Phase 1 connector |
| Executive provider | — | Register · pipeline |

**Sprint 3 completion:** **~32%** · **49 Open tasks** · M9 not met

**Spec:** [ES-023 — Hospitality Workspace](./ES-023-Hospitality-Workspace.md)

## Commerce Workspace

**Route:** — (not implemented)

| Capability | Baseline | v0.4 Target |
|------------|----------|-------------|
| Workspace shell | — | Layout · sub-nav · overview |
| Product catalogue | — | Foundation module |
| Orders · inventory | — | Foundation module |
| Shopify integration | — | **Open** · Phase 1 connector |
| Executive provider | — | Register · pipeline |

**Spec:** [ES-024 — Commerce Workspace](./ES-024-Commerce-Workspace.md)

### Workspace Completion Summary

| Workspace | ES | Routes | Provider | Pipeline | v0.4 Status Target |
|-----------|-----|--------|----------|----------|-------------------|
| Advisor | ES-022 | `/advisor` | N/A | Partial | **Complete** |
| CRM | ES-027 | 9 | Yes | Yes | **Complete** |
| Finance | ES-025 | 9 | Yes | Yes | **Complete** |
| Marketing | ES-026 | 1 | No | No | **Operational** |
| Hospitality | ES-023 | 1 | No | No | **Operational** |
| Commerce | ES-024 | 0 | No | No | **Foundation** |

---

# Executive Intelligence Completion

| Engine | Spec | Code | Baseline | v0.4 Deliverables |
|--------|------|------|----------|-------------------|
| **Executive Dashboard** | ES-022 | `/dashboard` · Sprint 4 widgets · orchestrator snapshot | `/advisor` · `/command-center` · no registry | Widget registry · canonical nav · preferences API |
| **Executive Brief Engine** | ES-028 | `lib/intelligence/brief/` + legacy `brief-engine.ts` | Sprint 4 engine delivered · dual stack | Full Advisor wiring · brief history · scheduled generation |
| **Recommendation Engine** | ES-029 | `lib/intelligence/recommendations/` + legacy engine | Rule-driven Sprint 4 engine · explainability UI pending | Explainability schema · acceptance tracking · ES-057 fields |
| **Alert Engine** | ES-030 | `lib/intelligence/alerts/` | Dedicated Sprint 4 module · legacy interim remains | Deprecate interim path · notification bridge |
| **Trend Engine** | ES-031 | Pipeline trend stage only | Aggregation from mock providers | Standalone `trend-engine.ts` · chart widgets |
| **Business Health Engine** | ES-032 | Orchestrator stage + legacy `health-engine.ts` | 4 mock workspace drivers on `/dashboard` | All six providers · unify legacy and Sprint 4 paths |

**Intelligence platform code:** `lib/intelligence/` · [README](../../lib/intelligence/README.md)

**v0.4 intelligence acceptance:**

- All six engines implemented as standalone modules per `engine-interfaces.ts`
- Advisor and `/dashboard` consume pipeline exclusively (no `advisor-data.ts` bypass for Finance/CRM)
- `ExecutiveRecommendation` extended with reasoning · evidence · confidence ([ES-057](./ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md))
- Platform metrics exposed via health endpoint

**Open sprint references:** ES-046 S2-060–S2-090 · ES-049 intelligence tasks

---

# AI Development

Governance: [ES-057 — AI Governance](./ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md) · [ES-039 — Agent Framework](./ES-039-AI-Orchestration-Agent-Framework.md) · [Intelligence Constitution](../05_AI/ORION_Intelligence_Constitution.md)

| Capability | Description | Baseline | v0.4 Target |
|------------|-------------|----------|-------------|
| **Executive Copilot** | AI assistant for executives on Advisor/Intelligence surfaces | `AskOrionPanel` placeholder | LLM provider in `AI_PROVIDER_REGISTRY` · governed prompts |
| **AI Orchestration** | Coordinate agents · workflows · approvals | Pipeline only | Orchestrator module · approval engine MVP |
| **Agent Framework** | Specialised agents with tool boundaries | Empty contracts | Brief Agent · Recommendation Agent · Integration Agent stubs |
| **Natural Language Interface** | Conversational query across workspaces | Static prompt buttons | NL query → intelligence bus → governed response with citations |

**v0.4 AI phases:**

| Phase | Scope | Deliverables |
|-------|-------|--------------|
| AI-1 | Foundation | ADR for LLM provider · prompt library · audit schema · register first provider |
| AI-2 | Copilot MVP | Ask ORION live · workspace context · human approval for actions |
| AI-3 | Agent stubs | Brief Agent · Recommendation Agent · tool restrictions per ES-039 |
| AI-4 | Governance ops | ES-057 monitoring · interaction log · monthly review template |

**Non-negotiables:** No autonomous financial/legal actions · Human approval for high-impact outputs · Full audit trail · ES-057 compliance before production AI

**Out of v0.4 AI scope:** RAG knowledge base · autonomous agents · model fine-tuning · multi-agent orchestration at scale

---

# Integration Roadmap

Integration architecture: [ES-034 — Provider Standards](./ES-034-Provider-Data-Contract-Standards.md) · [ES-035 — API Design](./ES-035-API-Design-Standards.md) · [ES-060 — Extensibility](./ES-060-ORION-Platform-Extensibility-Plugin-Marketplace-Architecture.md)

**Prerequisite:** REST API `/api/v1/` · OAuth/token management · integration provider registry

| Integration | Category | v0.4 Phase | Priority | Use Case | Status |
|-------------|----------|------------|----------|----------|--------|
| **Google Workspace** | Productivity | INT-1 | P1 | Calendar · email context for Brief | **Planned** |
| **Microsoft 365** | Productivity | INT-1 | P1 | Calendar · Teams · executive scheduling | **Planned** |
| **Shopify** | Commerce | INT-1 | P1 | Orders · products · Commerce workspace | **Planned** |
| **Stripe** | Payments | INT-1 | P0 | Revenue · receivables · Finance workspace | **Planned** |
| **WhatsApp** | Communications | INT-2 | P2 | Guest/customer messaging · Hospitality/CRM | **Planned** |
| **Google Ads** | Marketing | INT-1 | P1 | Campaign metrics · Marketing workspace | **Planned** |
| **Meta** | Marketing | INT-1 | P1 | Social/ad performance · Marketing workspace | **Planned** |
| **Hospitality PMS** | Operations | INT-1 | P0 | Reservations · guests · rooms · Hospitality | **Planned** |
| **Channel Managers** | Distribution | INT-2 | P1 | OTA sync · rates · availability | **Planned** |

**Integration delivery pattern:**

1. Define data contract ([ES-034](./ES-034-Provider-Data-Contract-Standards.md))
2. Implement connector in `lib/integrations/{provider}/`
3. Register as domain or executive provider
4. Expose via `/api/v1/integrations/{provider}/`
5. Emit domain events ([ES-033](./ES-033-Event-Messaging-Architecture.md))
6. Document in Release Record · register in Technical Debt if stubbed

**INT-1 (v0.4 core):** Stripe · PMS · Google Ads · Meta · Shopify · Google Workspace · M365

**INT-2 (v0.4 stretch):** WhatsApp · Channel Managers

---

# Success Criteria

| # | Criterion | Measurement | Target |
|---|-----------|-------------|--------|
| SC1 | Six workspaces meet ES minimum acceptance | ES checklist per workspace | 6/6 |
| SC2 | Executive Dashboard ES-022 complete | `/dashboard` · widget registry · pipeline | Pass |
| SC3 | Six intelligence engines operational | Engine unit coverage · pipeline integration | 6/6 engines |
| SC4 | Executive Copilot live with governance | LLM registered · audit · approval | MVP accepted |
| SC5 | REST API operational | `/api/v1/` health · workspace resources | Core routes live |
| SC6 | CI/CD Phase A–B | GitHub Actions green on PR | lint · tsc · build · tests |
| SC7 | Real authentication | No placeholder session in production | Auth ADR implemented |
| SC8 | Phase 1 integrations | ≥4 connectors in INT-1 list operational | 4+ live |
| SC9 | TD-001/TD-002 remediated | No static bypass for Finance/CRM intelligence | Provider-only |
| SC10 | Release governance | RR-018+ · CHANGELOG · tag `v0.4.0-business-intelligence` | Published |

---

# Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|----|------|--------|------------|------------|
| R1 | Scope overload across 6 workspaces + AI + integrations | High | High | Phased delivery · P0/P1 gates · defer INT-2 |
| R2 | Static data debt (TD-001/002) blocks real integrations | High | Medium | P0 provider remediation before INT-1 |
| R3 | No CI/tests allows regression | High | High | ES-055 Phase A first sprint gate |
| R4 | AI governance lag vs Copilot delivery | High | Medium | ES-057 gates · ADR before LLM registration |
| R5 | Hospitality Sprint 3 backlog (49 open tasks) | Medium | High | Dedicated v0.4 Phase 2 · re-baseline ES-049 |
| R6 | Commerce workspace from zero | Medium | Medium | Foundation-only target · full ops v0.5 |
| R7 | Integration vendor API complexity | Medium | Medium | Stub adapters · contract-first · TD register |
| R8 | Persistence ADR delay blocks production | High | Medium | Parallel ADR track · in-memory providers interim |
| R9 | Placeholder auth blocks API/integrations | High | High | Auth P0 in Phase 1 platform work |
| R10 | Engine extraction breaks pipeline | Medium | Low | Engine interfaces · incremental extraction |

**Risk register:** [ES-053 — Risk Management](./ES-053-ORION-Risk-Management-Technical-Debt-Framework.md) · operational risk register **Planned**

---

# Out of Scope

The following are explicitly **excluded from ORION Version 0.4**:

| Item | Rationale | Target |
|------|-----------|--------|
| Marketplace / plugin runtime | ES-060 · Phase 5 | v0.5+ |
| Full MDM / enterprise data platform | ES-056 operational | v0.5+ |
| SOC 2 / ISO certification execution | ES-059 readiness only | v0.6+ |
| Multi-tenant production deployment at scale | Infrastructure Phase 3 | v0.5+ |
| RAG / vector knowledge base | ES-057 · ES-039 | v0.5+ |
| Autonomous AI agents | ES-039 full orchestration | v0.5+ |
| Mobile native applications | Product roadmap | v0.6+ |
| Full Commerce operations (fulfilment · warehouse) | Scope control | v0.5 |
| Hospitality housekeeping/maintenance full ops | ES-049 lower priority WPs | v0.5 if stretch |
| GraphQL API | ES-035 future | v0.5+ |
| Streaming event bus | ES-033 future | v0.5+ |
| Internationalisation (i18n) | ES-051 Phase 3 | v0.6+ |

---

# Acceptance Criteria

The ORION v0.4 Master Development Plan is complete when:

| Criterion | Status |
|-----------|--------|
| Executive Summary documents v0.4 scope and baseline | **Delivered** · this document |
| Objectives and success criteria are defined | **Delivered** |
| All six workspaces have completion plans | **Delivered** |
| Executive Intelligence completion plan covers six engines | **Delivered** |
| AI development plan aligns with ES-039 · ES-057 | **Delivered** |
| Integration roadmap covers nine categories | **Delivered** |
| Risks and out-of-scope documented | **Delivered** |
| Deliverables checklist provided | **Delivered** |
| Architecture dependencies mapped | **Delivered** |
| Founder approval received | **Approved** |

**Plan documentation:** **Complete**.

**v0.4 implementation:** **In progress** — Sprint 4 intelligence layer committed (`cc4a282`) · ~45% Phase 1 complete · M9 acceptance not met · see [ES-062](./ES-062-Sprint-4-Implementation-Plan.md).

---

# Deliverables Checklist

Use this checklist for v0.4 programme tracking. Mark complete in Release Records.

## Platform Foundation

- [ ] Production authentication (ES-037 · PRD-001 · ADR)
- [ ] CI/CD Phase A — lint · tsc · build (ES-055)
- [ ] CI/CD Phase B — test suite (ES-054)
- [ ] REST API `/api/v1/` foundation (ES-035)
- [ ] HTTP health endpoint (ES-038)
- [ ] Persistence ADR accepted (ES-036 · ES-052)
- [ ] TD-001 remediated — Finance provider-only
- [ ] TD-002 remediated — CRM provider-only
- [ ] Secrets management for integrations (ES-059)

## Executive Intelligence

- [x] Unified `/dashboard` route (ES-022) — **Partial** · orchestrator-fed · widget registry pending
- [ ] Widget registry and preferences
- [ ] Advisor full Intelligence Bus wiring
- [ ] Brief Engine — history · scheduling (ES-028)
- [ ] Recommendation Engine — explainability (ES-029 · ES-057)
- [x] Alert Engine module (ES-030) — **Partial** · `lib/intelligence/alerts/` · legacy interim not removed
- [ ] Trend Engine implemented (ES-031) — pipeline aggregation only
- [ ] Business Health Engine — all providers (ES-032)
- [ ] Six workspace executive providers registered

## Workspaces

- [ ] Advisor — ES-022 acceptance
- [ ] CRM — ES-027 acceptance
- [ ] Finance — ES-025 acceptance
- [ ] Marketing — ES-026 operational minimum
- [ ] Hospitality — ES-023 operational minimum (ES-049 core WPs)
- [ ] Commerce — ES-024 foundation

## AI

- [ ] LLM provider ADR accepted
- [ ] Prompt library governed (ES-057)
- [ ] AI interaction audit schema
- [ ] Executive Copilot MVP live
- [ ] Human approval workflow for high-impact actions
- [ ] Agent framework stubs (Brief · Recommendation)

## Integrations (Phase 1)

- [ ] Stripe
- [ ] Hospitality PMS
- [ ] Google Ads
- [ ] Meta
- [ ] Shopify
- [ ] Google Workspace
- [ ] Microsoft 365
- [ ] WhatsApp (stretch)
- [ ] Channel Managers (stretch)

## Governance & Release

- [ ] RR-018+ Release Record series
- [ ] CHANGELOG v0.4 section
- [ ] Tag `v0.4.0-business-intelligence`
- [ ] ES-061 implementation status review
- [ ] Sprint 4 task execution per ES-064 checklist
- [ ] Sprint plans updated or superseded for v0.4 phases

---

# Executive Approval

| Role | Name | Decision | Date |
|------|------|----------|------|
| Founder | Founder | **Approved** | 2026 |
| Chief Architect | Chief Architect | **Approved** | 2026 |

**Authorisation:** ORION Version 0.4 engineering programme is **authorised** to proceed under [ORION Project Charter](../00_BLUEPRINT/ORION_Project_Charter.md) Construction Phase authority.

**Next actions:**

1. Create RR-018 — v0.4 Programme Kickoff
2. Register v0.4 phases in [ORION Product Backlog](../01_Product/ORION_Product_Backlog.md)
3. Prioritise Phase 1 platform work (auth · CI · API · TD remediation)
4. Execute Sprint 4 tasks per [ES-064 — Sprint 4 Task Catalogue](./ES-064-Sprint-4-Engineering-Task-Catalogue.md)
5. Supersede or extend ES-044/ES-047 sprint plans with v0.4 phase structure

---

# References

| Document | Location |
|----------|----------|
| ORION Project Charter | [ORION_Project_Charter.md](../00_BLUEPRINT/ORION_Project_Charter.md) |
| ORION Product Backlog | [ORION_Product_Backlog.md](../01_Product/ORION_Product_Backlog.md) |
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-023–ES-027 Workspace Specs | [ES-023](./ES-023-Hospitality-Workspace.md) · [ES-024](./ES-024-Commerce-Workspace.md) · [ES-025](./ES-025-Finance-Workspace.md) · [ES-026](./ES-026-Marketing-Workspace.md) · [ES-027](./ES-027-CRM-Workspace.md) |
| ES-028–ES-032 Intelligence Engines | [ES-028](./ES-028-Executive-Brief-Engine.md) · [ES-029](./ES-029-Recommendation-Engine.md) · [ES-030](./ES-030-Alert-Engine.md) · [ES-031](./ES-031-Trend-Engine.md) · [ES-032](./ES-032-Business-Health-Engine.md) |
| ES-039 AI Orchestration | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| ES-044–ES-049 Sprint Plans | [ES-044](./ES-044-Sprint-2-Implementation-Plan.md) · [ES-047](./ES-047-Sprint-3-Implementation-Plan.md) · [ES-046](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) · [ES-049](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) |
| ES-062 Sprint 4 Implementation Plan | [ES-062-Sprint-4-Implementation-Plan.md](./ES-062-Sprint-4-Implementation-Plan.md) |
| ES-063 Sprint 4 Work Breakdown Structure | [ES-063-Sprint-4-Work-Breakdown-Structure.md](./ES-063-Sprint-4-Work-Breakdown-Structure.md) |
| ES-064 Sprint 4 Engineering Task Catalogue | [ES-064-Sprint-4-Engineering-Task-Catalogue.md](./ES-064-Sprint-4-Engineering-Task-Catalogue.md) |
| ES-065 Executive Intelligence Architecture | [ES-065-Executive-Intelligence-Architecture.md](./ES-065-Executive-Intelligence-Architecture.md) |
| ES-050 Enterprise Reference Architecture | [ES-050-ORION-Enterprise-Reference-Architecture.md](./ES-050-ORION-Enterprise-Reference-Architecture.md) |
| ES-051 Technical Roadmap | [ES-051-ORION-Technical-Roadmap-Product-Evolution-Strategy.md](./ES-051-ORION-Technical-Roadmap-Product-Evolution-Strategy.md) |
| ES-054 Quality Assurance | [ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md](./ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) |
| ES-055 DevSecOps | [ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md](./ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md) |
| ES-057 AI Governance | [ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md](./ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md) |
| Technical Debt Register | [Technical_Debt_Register.md](../09_Standards/Technical_Debt_Register.md) |
| CHANGELOG | [CHANGELOG.md](../06_Releases/CHANGELOG.md) |
| Release Record Template | [Release_Record_Template.md](../09_Standards/Release_Record_Template.md) |

---

# Closing Statement

The ORION v0.4 Master Development Plan establishes the engineering programme required to evolve ORION from enterprise foundation into a production-capable Executive Operating System.

By completing six business workspaces, six intelligence engines, governed AI copilot capabilities, and first-wave integrations — under the discipline of ES-043 through ES-060 governance — ORION Version 0.4 delivers the business value executives expect from the world's leading AI-native operating system.

**Current assessment:** v0.4 is **fully planned and approved** · **Sprint 4 intelligence foundations delivered** · **P0 path: legacy migration · widget registry · CI/tests · pipeline optimisation → auth · API → workspace operations → integrations → AI copilot**.

---

Approved

Founder

Chief Architect

---

ORION

Engineering clarity for better executive decisions.

Let's build something remarkable.

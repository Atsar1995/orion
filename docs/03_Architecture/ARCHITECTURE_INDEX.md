# ORION Architecture Index

Central index for ORION platform architecture documentation.

**Master Blueprint:** [ORION Product Bible](../00_BLUEPRINT/ORION_Product_Bible.md) (Living Document)

**Governance:** [ORION Governance Framework](../09_Standards/ORION_Governance_Framework.md) (Foundational)

**Baseline:** [ORION v1.0 Architecture Baseline](./ORION_v1.0_Architecture_Baseline.md) (Frozen · 24 July 2026)

**Enterprise Reference Architecture:** [ES-050 — ORION Enterprise Reference Architecture](../02_Engineering/ES-050-ORION-Enterprise-Reference-Architecture.md) (Approved · master blueprint · ES-006–ES-049 consolidated)

**Technical Roadmap:** [ES-051 — ORION Technical Roadmap & Product Evolution Strategy](../02_Engineering/ES-051-ORION-Technical-Roadmap-Product-Evolution-Strategy.md) (Approved · five-year phases · AI maturity L1–L5)

---

## Platform Layers

| Layer | Document | Status |
|-------|----------|--------|
| Enterprise Reference Architecture | [ES-050](../02_Engineering/ES-050-ORION-Enterprise-Reference-Architecture.md) | Approved · master spec |
| Technical Roadmap & Product Evolution | [ES-051](../02_Engineering/ES-051-ORION-Technical-Roadmap-Product-Evolution-Strategy.md) | Approved · five-year strategy |
| Architecture Decision Record Framework | [ES-052](../02_Engineering/ES-052-Architecture-Decision-Record-Framework.md) · [10_Decisions/](../10_Decisions/) | Approved · ADR-001–006 |
| Risk Management & Technical Debt | [ES-053](../02_Engineering/ES-053-ORION-Risk-Management-Technical-Debt-Framework.md) · [Technical Debt Register](../09_Standards/Technical_Debt_Register.md) | Approved · TD-001–002 |
| Quality Assurance & Engineering Excellence | [ES-054](../02_Engineering/ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) | Approved · 0% coverage · CI planned |
| DevSecOps & Continuous Delivery | [ES-055](../02_Engineering/ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md) | Approved · manual delivery · pipeline planned |
| Data Governance & Information Architecture | [ES-056](../02_Engineering/ES-056-ORION-Data-Governance-Information-Architecture.md) · [ES-036](../02_Engineering/ES-036-Database-Persistence-Architecture.md) | Approved · in-memory · static domain data |
| AI Governance & Responsible Intelligence | [ES-057](../02_Engineering/ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md) · [ES-039](../02_Engineering/ES-039-AI-Orchestration-Agent-Framework.md) | Approved · deterministic intelligence · no LLM |
| Enterprise Operations & Service Management | [ES-058](../02_Engineering/ES-058-ORION-Enterprise-Operations-Service-Management-Framework.md) · [ES-038](../02_Engineering/ES-038-Audit-Logging-Observability-Architecture.md) | Approved · manual ops · no production stack |
| Platform Security & Zero Trust | [ES-059](../02_Engineering/ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md) · [ES-037](../02_Engineering/ES-037-Authentication-Authorisation-Architecture.md) | Approved · placeholder auth · RBAC partial |
| Platform Extensibility & Marketplace | [ES-060](../02_Engineering/ES-060-ORION-Platform-Extensibility-Plugin-Marketplace-Architecture.md) · [ES-034](../02_Engineering/ES-034-Provider-Data-Contract-Standards.md) · [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) | Approved · provider registry · Phase 5 marketplace |
| v0.4 Master Development Plan | [ES-061](../02_Engineering/ES-061-ORION-v0.4-Master-Development-Plan.md) · [ES-051](../02_Engineering/ES-051-ORION-Technical-Roadmap-Product-Evolution-Strategy.md) | Approved · workspaces · intelligence · AI · integrations |
| Executive Intelligence Architecture | [ES-065](../02_Engineering/ES-065-Executive-Intelligence-Architecture.md) · [ES-020](../02_Engineering/ES-020-Executive-Intelligence-Foundation.md) · [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) | Approved · pipeline · 3 engines delivered · Alert/Trend open |
| System Context | [SYSTEM_CONTEXT.md](./SYSTEM_CONTEXT.md) | Approved |
| System Map | [SYSTEM_MAP.md](./SYSTEM_MAP.md) | Approved |
| Platform Architecture (PA-001) | [ORION_Platform_Architecture.md](./ORION_Platform_Architecture.md) | Frozen |
| Business Workspace Pattern | [BUSINESS_WORKSPACE_PATTERN.md](./BUSINESS_WORKSPACE_PATTERN.md) | Approved |
| Event & Messaging Architecture | [ES-033](../02_Engineering/ES-033-Event-Messaging-Architecture.md) · `lib/platform/events/` | Partial · in-memory |
| Provider & Data Contract Standards | [ES-034](../02_Engineering/ES-034-Provider-Data-Contract-Standards.md) · ADR-006 | Executive profile delivered |
| API Design Standards | [ES-035](../02_Engineering/ES-035-API-Design-Standards.md) | Not implemented |
| Database & Persistence | `lib/persistence/` · [ES-036](../02_Engineering/ES-036-Database-Persistence-Architecture.md) · [ES-056](../02_Engineering/ES-056-ORION-Data-Governance-Information-Architecture.md) | Foundation delivered |
| Authentication & Authorisation | `lib/auth/` · [ES-037](../02_Engineering/ES-037-Authentication-Authorisation-Architecture.md) · [ES-059](../02_Engineering/ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md) | Foundation delivered · placeholder session |
| Audit & Observability | `lib/platform/audit/` · `lib/platform/activity/` · [ES-038](../02_Engineering/ES-038-Audit-Logging-Observability-Architecture.md) | Foundation delivered · in-memory |
| Sprint 1 Foundation Plan | [ES-040](../02_Engineering/ES-040-Sprint-1-Implementation-Plan.md) | Partial · gaps open |
| Sprint 1 WBS | [ES-041](../02_Engineering/ES-041-Sprint-1-Work-Breakdown-Structure.md) | Approved · execution partial |
| Sprint 1 Task Catalogue | [ES-042](../02_Engineering/ES-042-Sprint-1-Engineering-Task-Catalogue.md) | Approved · 56 tasks · 28 done |
| Engineering Governance | [ES-043](../02_Engineering/ES-043-Engineering-Governance-Delivery-Standards.md) · [Engineering Standards](../09_Standards/Engineering_Standards.md) | Approved · CI enforcement pending |
| Sprint 3 Hospitality Workspace | [ES-047](../02_Engineering/ES-047-Sprint-3-Implementation-Plan.md) · [ES-048](../02_Engineering/ES-048-Sprint-3-Work-Breakdown-Structure.md) · [ES-049](../02_Engineering/ES-049-Sprint-3-Engineering-Task-Catalogue.md) · [ES-023](../02_Engineering/ES-023-Hospitality-Workspace.md) | Partial · overview delivered |
| Sprint 2 Executive Experience | [ES-044](../02_Engineering/ES-044-Sprint-2-Implementation-Plan.md) · [ES-045](../02_Engineering/ES-045-Sprint-2-Work-Breakdown-Structure.md) · [ES-046](../02_Engineering/ES-046-Sprint-2-Engineering-Task-Catalogue.md) · [ES-022](../02_Engineering/ES-022-Executive-Dashboard.md) | Partial · Advisor delivered |

---

## Executive Intelligence Platform

| Component | Location | ADR |
|-----------|----------|-----|
| Provider Contract | `lib/intelligence/provider.ts` · [ES-034](../02_Engineering/ES-034-Provider-Data-Contract-Standards.md) | ADR-006 |
| Provider Registry | `lib/intelligence/provider-registry.ts` · [ES-060](../02_Engineering/ES-060-ORION-Platform-Extensibility-Plugin-Marketplace-Architecture.md) | ADR-006 · internal extensibility |
| Intelligence Bus | `lib/intelligence/intelligence-bus.ts` | ADR-006 |
| Platform Models | `lib/intelligence/models.ts` | Mission 17A |
| Health Engine | `lib/intelligence/health-engine.ts` · [ES-032](../02_Engineering/ES-032-Business-Health-Engine.md) | Mission 17B |
| Recommendation Engine | `lib/intelligence/recommendation-engine.ts` · [ES-029](../02_Engineering/ES-029-Recommendation-Engine.md) | Mission 17B |
| Alert Engine | Interim via Recommendation Engine · [ES-030](../02_Engineering/ES-030-Alert-Engine.md) | Partial · extraction pending |
| Trend Engine | Not implemented · [ES-031](../02_Engineering/ES-031-Trend-Engine.md) | Planned |
| Brief Engine | `lib/intelligence/brief-engine.ts` · [ES-028](../02_Engineering/ES-028-Executive-Brief-Engine.md) | Mission 17B |
| Intelligence Pipeline | `lib/intelligence/pipeline.ts` | Mission 17B |
| Engine Interfaces | `lib/intelligence/engine-interfaces.ts` | Mission 17B |
| Engine Models | `lib/intelligence/engine-models.ts` | Mission 17B |
| Platform Metrics | `lib/intelligence/platform-metrics.ts` | Mission 17B |
| AI Provider Contracts | `lib/intelligence/ai-providers.ts` · [ES-039](../02_Engineering/ES-039-AI-Orchestration-Agent-Framework.md) · [ES-057](../02_Engineering/ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md) | Architecture only · not registered |
| Intelligence Constitution | [05_AI/ORION_Intelligence_Constitution.md](../05_AI/ORION_Intelligence_Constitution.md) | Foundational |
| Decision Framework | [05_AI/ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) | Foundational |
| Platform README | [lib/intelligence/README.md](../../lib/intelligence/README.md) | Mission 17A |

---

## Platform Events

| Component | Location | Spec |
|-----------|----------|------|
| Event Bus | `lib/platform/events/EventBus.ts` | [ES-033](../02_Engineering/ES-033-Event-Messaging-Architecture.md) |
| Event Factory | `lib/platform/events/PlatformEventFactory.ts` | ES-033 |
| In-memory Publisher / Subscriber | `lib/platform/events/InMemory*.ts` | ES-011 · ES-033 |
| Platform Event Contract | `types/services.ts` · `PlatformEvent` | ES-011 · ES-033 |
| Audit Event Consumer | `lib/platform/audit/AuditService.ts` | ES-033 |

---

## Architecture Decision Records

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](../10_Decisions/ADR-001-Executive-Shell.md) | Executive Shell | Pending |
| [ADR-002](../10_Decisions/ADR-002-Advisor-Default-Landing.md) | Advisor Default Landing | Pending |
| [ADR-003](../10_Decisions/ADR-003-Global-Command-Palette.md) | Global Command Palette | Pending |
| [ADR-004](../10_Decisions/ADR-004-Technical-Debt-Governance.md) | Technical Debt Governance | Accepted |
| [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) | Business Workspace Architecture | Accepted |
| [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) | Executive Intelligence Provider Framework | Accepted |

---

## Business Workspaces

| Workspace | Route | Missions | Provider |
|-----------|-------|----------|----------|
| Finance | `/finance` | 15A–15C · [ES-025](../02_Engineering/ES-025-Finance-Workspace.md) | `financeExecutiveProvider` |
| Customer Intelligence (CRM) | `/crm` | 16A–16D · [ES-027](../02_Engineering/ES-027-CRM-Workspace.md) | `crmExecutiveProvider` |
| Hospitality | `/hospitality` | Sprint 12 overview · [ES-023](../02_Engineering/ES-023-Hospitality-Workspace.md) (Mission 19A) | Planned |
| Commerce | — | Planned · [ES-024](../02_Engineering/ES-024-Commerce-Workspace.md) (Mission 20A) | — |
| Marketing | `/marketing` | Overview foundation · [ES-026](../02_Engineering/ES-026-Marketing-Workspace.md) | `marketingExecutiveProvider` (planned) |

---

## Governance

| Document | Location |
|----------|----------|
| ORION Governance Framework | [../09_Standards/ORION_Governance_Framework.md](../09_Standards/ORION_Governance_Framework.md) |
| ORION Product Bible | [../00_BLUEPRINT/ORION_Product_Bible.md](../00_BLUEPRINT/ORION_Product_Bible.md) |
| ORION Project Charter | [../00_BLUEPRINT/ORION_Project_Charter.md](../00_BLUEPRINT/ORION_Project_Charter.md) |
| ORION Non-Negotiables | [../00_BLUEPRINT/ORION_Non_Negotiables.md](../00_BLUEPRINT/ORION_Non_Negotiables.md) |
| ORION Decision Log | [../10_Decisions/ORION_Decision_Log.md](../10_Decisions/ORION_Decision_Log.md) |
| ORION Constitution | [../09_Standards/ORION_Constitution.md](../09_Standards/ORION_Constitution.md) |
| ORION Engineering Manifesto | [../09_Standards/ORION_Engineering_Manifesto.md](../09_Standards/ORION_Engineering_Manifesto.md) |
| ORION Intelligence Constitution | [../05_AI/ORION_Intelligence_Constitution.md](../05_AI/ORION_Intelligence_Constitution.md) |
| ORION Decision Framework | [../05_AI/ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| ORION Product Constitution | [../01_Product/ORION_Product_Constitution.md](../01_Product/ORION_Product_Constitution.md) |
| Founder's Letter | [../00_Strategy/ORION_Founders_Letter.md](../00_Strategy/ORION_Founders_Letter.md) |
| CTO Retrospective Template | [../09_Standards/CTO_Retrospective_Template.md](../09_Standards/CTO_Retrospective_Template.md) |
| Phase I Retrospective (CTO-001) | [../07_Meetings/CTO-001-Phase-I-Retrospective.md](../07_Meetings/CTO-001-Phase-I-Retrospective.md) |
| Engineering Standards | [../09_Standards/Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Architecture Compliance | [../09_Standards/Architecture_Compliance_Checklist.md](../09_Standards/Architecture_Compliance_Checklist.md) |
| Documentation Baseline | [../DOCUMENTATION_BASELINE.md](../DOCUMENTATION_BASELINE.md) |
| Technical Debt Register | [../09_Standards/Technical_Debt_Register.md](../09_Standards/Technical_Debt_Register.md) |

---

## Maintenance

Update this index when:

- A new ADR is accepted
- A new Business Workspace ships
- Executive Intelligence Platform modules change
- A major version milestone is reached

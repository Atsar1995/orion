# A-002 — Project Aurora Enterprise Engineering Blueprint

**Document ID:** A-002  
**Program:** Project Aurora — AI Marketing Platform  
**Mission:** A-002 — Aurora Enterprise Engineering Blueprint  
**Version:** 1.0  
**Status:** Ratified — Authoritative Engineering Reference  
**Classification:** Enterprise Engineering Blueprint · Architecture Specification  
**Authority:** Founder & Chief Architect · Aurora Architecture Review Board  
**Parent:** [A-001 Aurora Constitution](./A-001-Aurora-Constitution.md)  
**Platform Parent:** [ORION Enterprise Platform v2.0](../00_FOUNDATION/ORION_CANON_v1.md)  
**Effective Date:** 7 August 2026  
**Supersedes:** None (foundational engineering reference)  
**Subordinate To:** A-001 Aurora Constitution · ORION Canon v1.0 (platform-wide)

**Rule:** This document is the **authoritative engineering reference** for every Aurora mission. All implementation missions (A-003+) must comply with this blueprint. No Aurora production code may be written that contradicts this specification unless formally amended.

**Scope:** Repository structure · application architecture · domain design · composition root · AI orchestration · data · events · security · integrations · quality · roadmap. **No implementation.** **No code.** **No UI.**

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Repository Architecture](#2-repository-architecture)
3. [Application Architecture](#3-application-architecture)
4. [Domain Architecture](#4-domain-architecture)
5. [Composition Root](#5-composition-root)
6. [AI Orchestration Engine](#6-ai-orchestration-engine)
7. [Data Architecture](#7-data-architecture)
8. [Event Architecture](#8-event-architecture)
9. [Security Architecture](#9-security-architecture)
10. [Integration Architecture](#10-integration-architecture)
11. [Quality Standards](#11-quality-standards)
12. [Engineering Roadmap](#12-engineering-roadmap)
13. [Executive Closing Statement](#13-executive-closing-statement)

**Appendices:** [A — Folder Standards](#appendix-a--folder-standards) · [B — Naming Conventions](#appendix-b--naming-conventions) · [C — Coding Standards](#appendix-c--coding-standards) · [D — Event Catalogue](#appendix-d--event-catalogue) · [E — Agent Catalogue](#appendix-e--agent-catalogue) · [F — Mission Register](#appendix-f--mission-register)

---

# Preamble

Engineering excellence is not optional for Aurora.

Aurora is an enterprise AI Marketing Operating System built on ORION Enterprise Platform. Its engineering architecture must match the rigour of ORION's certified domains — HCM, Finance, CRM, and Procurement — while introducing marketing-specific capabilities: multi-agent orchestration, cross-channel publish pipelines, brand-scoped knowledge retrieval, and governed AI automation.

This blueprint defines **how Aurora will be built, structured, integrated, tested, and maintained**. Every folder, service, event, agent, and integration connector described herein is intentional. Deviations require Aurora Architecture Review Board approval.

---

# 1. Executive Overview

## 1.1 Purpose

| Field | Definition |
|-------|------------|
| **Document purpose** | Define the complete engineering architecture for Project Aurora |
| **Audience** | Engineering leads · architects · mission owners · QA · DevOps · security |
| **Binding authority** | All Aurora engineering missions A-003 through A-036 |
| **Deliverable type** | Architecture specification — no implementation |

This blueprint answers:

- Where does Aurora code live in the ORION repository?
- How are Aurora modules organized internally?
- How does Aurora integrate with ORION platform services?
- How are AI agents orchestrated, governed, and audited?
- What data entities, events, and security controls apply?
- What quality standards must every mission meet?
- What is the engineering sequence and critical path?

## 1.2 Scope

### In Scope

| Area | Coverage |
|------|----------|
| **Repository structure** | Folder hierarchy · module organization · shared libraries |
| **Application layers** | Frontend · API · services · AI · data · providers |
| **Domain design** | Nine Aurora domains with bounded contexts |
| **Composition root** | DI · wiring · factory · lifecycle |
| **AI orchestration** | Agent registry · routing · context · memory · approval |
| **Data architecture** | Entities · persistence · audit · versioning |
| **Event architecture** | Canonical events · publish/subscribe · lifecycle |
| **Security** | Identity · RBAC · tenant isolation · encryption |
| **Integrations** | ORION services · 14+ external platforms |
| **Quality** | Testing · coverage · review · observability |
| **Roadmap** | Phase 1–3 · mission sequencing · dependencies |

### Out of Scope

| Exclusion | Rationale |
|-----------|-----------|
| Production code | Implementation belongs to A-003+ missions |
| UI mockups or designs | Design system inherits ORION ES-008 |
| Infrastructure provisioning | ORION Gate 7 operational scope |
| Commercial pricing | Defined in A-001 §11 |
| Product marketing copy | Defined in A-001 §2 |

## 1.3 Relationship with A-001

| A-001 Section | A-002 Engineering Response |
|---------------|---------------------------|
| §3 Core Principles | Enforced via architecture rules · approval engine · audit |
| §4 ORION Relationship | Composition root · platform service consumption |
| §5 Core Modules | Domain architecture · module folder mapping |
| §6 AI Agent Architecture | AI Orchestration Engine (§6) |
| §7 Enterprise Capabilities | RBAC · multi-tenant · approval · audit (§7, §9) |
| §8 Technology Architecture | Application architecture (§3) · data (§7) |
| §9 Integrations | Integration architecture (§10) |
| §10 Roadmap | Engineering roadmap (§12) · mission register (Appendix F) |
| Appendix D Engineering Standards | Extended in §11 and Appendix C |
| Appendix E Naming Conventions | Extended in Appendix B |

### Document Hierarchy

```
ORION Canon v1.0
    ↓
A-001 Aurora Constitution (product authority)
    ↓
A-002 Aurora Enterprise Engineering Blueprint (engineering authority) ← THIS DOCUMENT
    ↓
ES-AURORA-xxx Engineering Specifications (per-mission)
    ↓
ADR-AURORA-xxx Architecture Decision Records
    ↓
Implementation (A-003+ missions)
```

## 1.4 Engineering Philosophy

Aurora engineering inherits ORION engineering philosophy and extends it for AI-native marketing operations.

### Inherited ORION Principles

| Principle | Source | Aurora Application |
|-----------|--------|-------------------|
| **Clean Architecture** | ORION Engineering Standards | Strict layer separation in `lib/aurora/` |
| **SOLID** | ORION Constitution Art. VIII | Single-responsibility agents and services |
| **Dependency Injection** | HCM/CRM/Finance wiring pattern | `createAuroraWiring()` composition root |
| **Provider Independence** | ORION Constitution Art. V | LLM · channel · storage providers interchangeable |
| **Deterministic Core** | ORION Constitution Art. IV | Analytics calculations deterministic · AI explains only |
| **Explainability** | ORION Constitution Art. VI | Every agent output includes rationale + confidence |
| **Test Everything** | Verification Hierarchy | Unit · integration · agent behaviour · E2E |
| **Document Architecture** | ORION Constitution Art. IX | ES-AURORA-xxx per mission mandatory |

### Aurora-Specific Engineering Principles

| # | Principle | Rule |
|---|-----------|------|
| **EP-1** | **Brand context is mandatory** | No service method executes without `brand_id` in context |
| **EP-2** | **Agents propose, services execute** | Agents never call external APIs directly |
| **EP-3** | **Publish is transactional** | Multi-channel publish succeeds fully or rolls back with audit |
| **EP-4** | **Events are canonical** | All cross-domain communication via `aurora.*` events |
| **EP-5** | **Facade is the public API** | External consumers use `AuroraFacade` only — never repositories |
| **EP-6** | **Integration connectors are pluggable** | New channels added via connector registry — no service changes |
| **EP-7** | **Knowledge informs agents** | Agent invocation always queries Knowledge Base context |
| **EP-8** | **Approval before consequence** | Publish · launch · send · spend require approval gate pass |
| **EP-9** | **Tenant isolation is absolute** | No query · no cache · no agent context crosses tenant boundary |
| **EP-10** | **ORION first** | Platform capabilities consumed before Aurora reimplementation |

## 1.5 Blueprint Verdict

| Field | Assessment |
|-------|------------|
| **Engineering readiness** | Architecture defined · ready for A-003 mission initiation |
| **ORION alignment** | Full — mirrors HCM/CRM/Finance domain patterns |
| **Risk level** | Moderate — AI orchestration and publish pipeline are novel within ORION |
| **Critical path** | A-002 → A-003 (Foundation) → A-013 (Agent Orchestration) → A-014 (ORION Integration) |

---

# 2. Repository Architecture

## 2.1 Repository Context

Aurora is engineered **within the ORION monorepo** — not as a separate repository. This ensures shared platform services, unified CI/CD, consistent governance, and single-deployment model for ORION + Aurora bundle customers.

```
orion-app/                          # ORION monorepo root
├── app/
│   ├── (platform)/
│   │   └── aurora/                 # Aurora UI routes
│   └── api/
│       └── aurora/                 # Aurora REST API routes
├── components/
│   └── aurora/                     # Aurora UI components
├── lib/
│   └── aurora/                     # Aurora domain logic (PRIMARY)
├── docs/
│   └── AURORA/                     # Aurora documentation
├── types/
│   └── aurora-*.ts                 # Aurora shared types
└── tests/
    └── aurora/                     # Aurora test suites
```

## 2.2 Folder Hierarchy — Complete

### 2.2.1 Application Routes (`app/`)

```
app/(platform)/aurora/
├── page.tsx                        # Aurora dashboard (AI Marketing Director)
├── layout.tsx                      # Aurora shell layout
├── planner/
│   └── page.tsx                    # Marketing Planner
├── content/
│   ├── page.tsx                    # Content Studio list
│   └── [id]/
│       └── page.tsx                # Content editor
├── creative/
│   ├── page.tsx                    # Creative Studio library
│   └── [id]/
│       └── page.tsx                # Creative editor
├── seo/
│   ├── page.tsx                    # SEO Engine dashboard
│   └── audit/
│       └── page.tsx                # SEO audit detail
├── social/
│   ├── page.tsx                    # Social Media Manager
│   └── calendar/
│       └── page.tsx                # Social calendar
├── ads/
│   ├── page.tsx                    # Advertising Studio
│   └── [id]/
│       └── page.tsx                # Campaign detail
├── email/
│   ├── page.tsx                    # Email Marketing
│   └── [id]/
│       └── page.tsx                # Email campaign detail
├── whatsapp/
│   └── page.tsx                    # WhatsApp Campaigns
├── gbp/
│   └── page.tsx                    # Google Business Manager
├── analytics/
│   ├── page.tsx                    # Analytics dashboard
│   └── reports/
│       └── page.tsx                # Custom reports
├── knowledge/
│   ├── page.tsx                    # Knowledge Base
│   └── [id]/
│       └── page.tsx                # Knowledge entry detail
├── settings/
│   ├── page.tsx                    # Aurora settings
│   ├── brands/
│   │   └── page.tsx                # Brand management
│   ├── integrations/
│   │   └── page.tsx                # Channel connections
│   └── approvals/
│       └── page.tsx                # Approval policy config
└── agents/
    └── page.tsx                    # Agent activity monitor
```

### 2.2.2 API Routes (`app/api/aurora/`)

```
app/api/aurora/
├── brands/
│   ├── route.ts                    # GET (list) · POST (create)
│   └── [id]/
│       └── route.ts                # GET · PUT · DELETE
├── campaigns/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── launch/
│           └── route.ts
├── content/
│   ├── route.ts
│   ├── generate/
│   │   └── route.ts                # AI content generation
│   └── [id]/
│       ├── route.ts
│       ├── approve/
│       │   └── route.ts
│       └── publish/
│           └── route.ts
├── creative/
│   ├── route.ts
│   ├── generate/
│   │   └── route.ts
│   └── [id]/
│       └── route.ts
├── seo/
│   ├── keywords/
│   │   └── route.ts
│   ├── audit/
│   │   └── route.ts
│   └── rankings/
│       └── route.ts
├── social/
│   ├── posts/
│   │   └── route.ts
│   ├── schedule/
│   │   └── route.ts
│   └── publish/
│       └── route.ts
├── ads/
│   ├── campaigns/
│   │   └── route.ts
│   └── optimize/
│       └── route.ts
├── email/
│   ├── campaigns/
│   │   └── route.ts
│   └── send/
│       └── route.ts
├── whatsapp/
│   ├── broadcasts/
│   │   └── route.ts
│   └── templates/
│       └── route.ts
├── gbp/
│   ├── locations/
│   │   └── route.ts
│   ├── reviews/
│   │   └── route.ts
│   └── posts/
│       └── route.ts
├── analytics/
│   ├── dashboard/
│   │   └── route.ts
│   ├── reports/
│   │   └── route.ts
│   └── export/
│       └── route.ts
├── knowledge/
│   ├── route.ts
│   └── search/
│       └── route.ts
├── agents/
│   ├── invoke/
│   │   └── route.ts                # Agent invocation endpoint
│   └── sessions/
│       └── [id]/
│           └── route.ts
├── approvals/
│   ├── route.ts
│   └── [id]/
│       ├── approve/
│       │   └── route.ts
│       └── reject/
│           └── route.ts
├── integrations/
│   ├── route.ts
│   ├── connect/
│   │   └── route.ts
│   └── [provider]/
│       ├── callback/
│       │   └── route.ts
│       └── disconnect/
│           └── route.ts
└── webhooks/
    └── [provider]/
        └── route.ts
```

### 2.2.3 Domain Logic (`lib/aurora/`)

```
lib/aurora/
├── index.ts                        # Public exports · AuroraFacade
├── constants.ts                    # Module keys · paths · capabilities
├── types.ts                        # Shared Aurora types
├── createAuroraWiring.ts           # Composition root factory
├── AuroraFacade.ts                 # Public domain facade
├── AuroraFoundationOperations.ts   # Facade interface contract
│
├── admin/                          # Administration domain
│   ├── services/
│   │   ├── TenantService.ts
│   │   ├── BrandService.ts
│   │   └── SettingsService.ts
│   └── repositories/
│       ├── BrandRepository.ts
│       └── TenantConfigRepository.ts
│
├── marketing/                      # Marketing domain (campaigns · planning)
│   ├── services/
│   │   ├── CampaignService.ts
│   │   ├── PlannerService.ts
│   │   └── BudgetService.ts
│   └── repositories/
│       ├── CampaignRepository.ts
│       └── PlannerRepository.ts
│
├── content/                        # Content domain
│   ├── services/
│   │   ├── ContentService.ts
│   │   ├── ContentGenerationService.ts
│   │   └── ContentVersionService.ts
│   └── repositories/
│       └── ContentRepository.ts
│
├── media/                          # Media/Creative domain
│   ├── services/
│   │   ├── CreativeService.ts
│   │   ├── AssetStorageService.ts
│   │   └── BrandKitService.ts
│   └── repositories/
│       └── CreativeRepository.ts
│
├── seo/                            # SEO domain
│   ├── services/
│   │   ├── KeywordService.ts
│   │   ├── SeoAuditService.ts
│   │   └── RankTrackingService.ts
│   └── repositories/
│       └── SeoRepository.ts
│
├── social/                         # Social domain
│   ├── services/
│   │   ├── SocialPostService.ts
│   │   ├── SocialScheduleService.ts
│   │   └── SocialEngagementService.ts
│   └── repositories/
│       └── SocialRepository.ts
│
├── ads/                            # Advertising domain
│   ├── services/
│   │   ├── AdCampaignService.ts
│   │   ├── BidOptimizationService.ts
│   │   └── AudienceService.ts
│   └── repositories/
│       └── AdCampaignRepository.ts
│
├── email/                          # Email domain
│   ├── services/
│   │   ├── EmailCampaignService.ts
│   │   ├── EmailListService.ts
│   │   └── EmailAutomationService.ts
│   └── repositories/
│       └── EmailRepository.ts
│
├── messaging/                      # WhatsApp domain
│   ├── services/
│   │   ├── WhatsAppBroadcastService.ts
│   │   └── WhatsAppTemplateService.ts
│   └── repositories/
│       └── WhatsAppRepository.ts
│
├── analytics/                      # Analytics domain
│   ├── services/
│   │   ├── AnalyticsIngestionService.ts
│   │   ├── AnalyticsReportService.ts
│   │   ├── AttributionService.ts
│   │   └── MarketingHealthService.ts
│   └── repositories/
│       └── AnalyticsRepository.ts
│
├── automation/                     # Automation domain
│   ├── services/
│   │   ├── WorkflowService.ts
│   │   ├── ScheduleService.ts
│   │   └── PublishPipelineService.ts
│   └── repositories/
│       ├── ScheduleRepository.ts
│       └── WorkflowRepository.ts
│
├── knowledge/                      # Knowledge domain
│   ├── services/
│   │   ├── KnowledgeService.ts
│   │   ├── KnowledgeRetrievalService.ts
│   │   └── KnowledgeIngestionService.ts
│   └── repositories/
│       └── KnowledgeRepository.ts
│
├── agents/                         # AI Orchestration
│   ├── AgentOrchestrator.ts
│   ├── AgentRegistry.ts
│   ├── AgentContextAssembler.ts
│   ├── AgentMemoryStore.ts
│   ├── agents/
│   │   ├── MarketingDirectorAgent.ts
│   │   ├── ContentStrategistAgent.ts
│   │   ├── CopywriterAgent.ts
│   │   ├── CreativeDirectorAgent.ts
│   │   ├── SeoSpecialistAgent.ts
│   │   ├── AdvertisingManagerAgent.ts
│   │   ├── SocialMediaManagerAgent.ts
│   │   ├── AnalyticsManagerAgent.ts
│   │   ├── CampaignOptimizerAgent.ts
│   │   └── ExecutiveAdvisorAgent.ts
│   └── prompts/
│       ├── agent.director.v1.ts
│       ├── agent.copywriter.v1.ts
│       └── ... (versioned prompt templates)
│
├── approval/                       # Approval workflow engine
│   ├── services/
│   │   ├── ApprovalService.ts
│   │   └── ApprovalPolicyService.ts
│   └── repositories/
│       └── ApprovalRepository.ts
│
├── publish/                        # Publish pipeline
│   ├── PublishPipeline.ts
│   ├── PublishJobQueue.ts
│   ├── PublishResultHandler.ts
│   └── channel-publishers/
│       ├── FacebookPublisher.ts
│       ├── InstagramPublisher.ts
│       ├── LinkedInPublisher.ts
│       ├── WordPressPublisher.ts
│       └── ... (per-channel publishers)
│
├── integrations/                   # External platform connectors
│   ├── base/
│   │   ├── IntegrationConnector.ts
│   │   ├── OAuthConnector.ts
│   │   └── WebhookReceiver.ts
│   ├── registry/
│   │   └── ConnectorRegistry.ts
│   ├── google/
│   ├── meta/
│   ├── linkedin/
│   ├── shopify/
│   ├── wordpress/
│   ├── mailchimp/
│   ├── whatsapp/
│   └── canva/
│
├── events/                         # Aurora event layer
│   ├── AuroraEventPublisher.ts
│   ├── register-aurora-subscribers.ts
│   └── handlers/
│       ├── onContentApproved.ts
│       ├── onCampaignLaunched.ts
│       └── onPublishCompleted.ts
│
├── persistence/                    # Aurora persistence backing
│   ├── AuroraPlatformBacking.ts
│   ├── createAuroraStore.ts
│   └── PostgresAuroraRepository.ts
│
├── providers/                      # Aurora executive provider
│   └── auroraExecutiveProvider.ts
│
└── wiring/                         # Wiring helpers
    ├── createAuroraAgentWiring.ts
    ├── createAuroraIntegrationWiring.ts
    └── createAuroraPersistenceWiring.ts
```

### 2.2.4 UI Components (`components/aurora/`)

```
components/aurora/
├── shell/
│   ├── AuroraShell.tsx             # Aurora layout wrapper
│   ├── AuroraSidebar.tsx           # Module navigation
│   └── AuroraHeader.tsx            # Brand switcher · context bar
├── shared/
│   ├── BrandSwitcher.tsx
│   ├── ApprovalBadge.tsx
│   ├── AgentConfidenceIndicator.tsx
│   ├── PublishStatusBadge.tsx
│   └── ChannelIcon.tsx
├── director/                       # AI Marketing Director components
├── planner/                        # Marketing Planner components
├── content/                        # Content Studio components
├── creative/                       # Creative Studio components
├── seo/                            # SEO Engine components
├── social/                         # Social Media Manager components
├── ads/                            # Advertising Studio components
├── email/                          # Email Marketing components
├── whatsapp/                       # WhatsApp components
├── gbp/                            # Google Business components
├── analytics/                      # Analytics components
├── knowledge/                      # Knowledge Base components
├── agents/                         # Agent monitor components
└── settings/                       # Settings components
```

### 2.2.5 Documentation (`docs/AURORA/`)

```
docs/AURORA/
├── A-001-Aurora-Constitution.md           # Product constitution
├── A-002-Aurora-Enterprise-Engineering-Blueprint.md  # THIS DOCUMENT
├── ES-AURORA-001-Platform-Foundation.md   # Per-mission specs (planned)
├── ES-AURORA-003-Marketing-Director.md
├── ADR-AURORA-001-Agent-Orchestration.md  # Architecture decisions (planned)
├── README.md                              # Aurora documentation index
└── Certification/                         # Gate certification docs (future)
```

### 2.2.6 Tests (`tests/aurora/`)

```
tests/aurora/
├── unit/
│   ├── services/
│   ├── agents/
│   └── approval/
├── integration/
│   ├── publish-pipeline/
│   ├── agent-orchestration/
│   └── integrations/
├── agent-behaviour/
│   ├── copywriter.test.ts
│   ├── seo-specialist.test.ts
│   └── ... (per-agent behaviour tests)
└── e2e/
    ├── content-to-publish.test.ts
    └── campaign-lifecycle.test.ts
```

## 2.3 Module Organization

Aurora modules map to domain folders in `lib/aurora/` and UI routes in `app/(platform)/aurora/`.

| Module | Domain Folder | UI Route | API Prefix | Primary Service |
|--------|--------------|----------|------------|-----------------|
| AI Marketing Director | `agents/` + `analytics/` | `/aurora` | `/api/aurora/agents` | `AgentOrchestrator` |
| Marketing Planner | `marketing/` | `/aurora/planner` | `/api/aurora/campaigns` | `PlannerService` |
| Content Studio | `content/` | `/aurora/content` | `/api/aurora/content` | `ContentService` |
| Creative Studio | `media/` | `/aurora/creative` | `/api/aurora/creative` | `CreativeService` |
| SEO Engine | `seo/` | `/aurora/seo` | `/api/aurora/seo` | `SeoAuditService` |
| Social Media Manager | `social/` | `/aurora/social` | `/api/aurora/social` | `SocialPostService` |
| Advertising Studio | `ads/` | `/aurora/ads` | `/api/aurora/ads` | `AdCampaignService` |
| Email Marketing | `email/` | `/aurora/email` | `/api/aurora/email` | `EmailCampaignService` |
| WhatsApp Campaigns | `messaging/` | `/aurora/whatsapp` | `/api/aurora/whatsapp` | `WhatsAppBroadcastService` |
| Google Business Manager | `integrations/google/` | `/aurora/gbp` | `/api/aurora/gbp` | `GbpService` |
| Analytics | `analytics/` | `/aurora/analytics` | `/api/aurora/analytics` | `AnalyticsReportService` |
| Knowledge Base | `knowledge/` | `/aurora/knowledge` | `/api/aurora/knowledge` | `KnowledgeService` |

### Cross-Cutting Modules

| Module | Folder | Purpose |
|--------|--------|---------|
| **Approval Engine** | `approval/` | All modules use shared approval workflow |
| **Publish Pipeline** | `publish/` | All publish actions route through pipeline |
| **Automation** | `automation/` | Scheduling · workflows · job queue |
| **Administration** | `admin/` | Tenant · brand · settings management |

## 2.4 Shared Libraries

Aurora consumes ORION shared libraries — never duplicates them.

| ORION Library | Aurora Usage |
|---------------|--------------|
| `lib/platform/store/` | PlatformStore · entity persistence |
| `lib/platform/events/` | Event bus · publish/subscribe |
| `lib/platform/audit/` | Audit log service |
| `lib/platform/notification/` | Notification dispatch |
| `lib/platform/search/` | Search indexing and query |
| `lib/auth/` | Identity · session · RBAC |
| `lib/intelligence/` | Executive Provider · AI providers |
| `components/ui/` | ORION Design System |

### Aurora-Only Shared Libraries

| Library | Location | Purpose |
|---------|----------|---------|
| **Aurora types** | `types/aurora-*.ts` | Shared TypeScript interfaces |
| **Aurora constants** | `lib/aurora/constants.ts` | Module keys · capabilities · paths |
| **Brand context** | `lib/aurora/types.ts` | `AuroraContext` · `BrandContext` types |
| **Agent contracts** | `lib/aurora/agents/types.ts` | Agent input/output interfaces |

## 2.5 Documentation Structure

| Document Type | Pattern | Example |
|---------------|---------|---------|
| **Constitution** | `A-001-*.md` | Product authority |
| **Engineering Blueprint** | `A-002-*.md` | Engineering authority |
| **Mission docs** | `A-0xx-*.md` | Mission-specific governance |
| **Engineering specs** | `ES-AURORA-xxx-*.md` | Per-mission implementation spec |
| **ADRs** | `ADR-AURORA-xxx-*.md` | Architecture decisions |
| **Certification** | `Certification/AURORA-Gate*.md` | Quality gate evidence |

## 2.6 Mission Numbering

| Range | Purpose |
|-------|---------|
| **A-001** | Constitutional documents |
| **A-002** | Engineering blueprint |
| **A-003–A-014** | Phase 1 implementation missions |
| **A-015–A-026** | Phase 2 implementation missions |
| **A-027–A-036** | Phase 3 implementation missions |
| **ES-AURORA-xxx** | Engineering specifications |
| **ADR-AURORA-xxx** | Architecture decision records |

Full mission register in [Appendix F](#appendix-f--mission-register).

---

# 3. Application Architecture

## 3.1 Layer Model

Aurora application architecture follows ORION Clean Architecture with seven distinct layers. Dependencies flow downward only — no layer may depend on a layer above it.

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1 — Experience (UI)                                   │
│  app/(platform)/aurora/ · components/aurora/                 │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — API                                               │
│  app/api/aurora/ · request validation · auth · response      │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 — Facade                                            │
│  AuroraFacade · AuroraFoundationOperations                   │
├─────────────────────────────────────────────────────────────┤
│  Layer 4 — Domain Services                                   │
│  lib/aurora/*/services/ · business logic                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 5 — AI Orchestration                                  │
│  AgentOrchestrator · agents · prompts · context · memory     │
├─────────────────────────────────────────────────────────────┤
│  Layer 6 — Infrastructure                                    │
│  repositories · integrations · publish · events · approval   │
├─────────────────────────────────────────────────────────────┤
│  Layer 7 — ORION Platform                                    │
│  Identity · PlatformStore · AI · Notifications · Search      │
└─────────────────────────────────────────────────────────────┘
```

### Layer Dependency Rules

| Rule | Description |
|------|-------------|
| **L-1** | UI calls API routes or Server Components fetch via Facade — never services directly |
| **L-2** | API routes validate input · authorize · delegate to Facade — no business logic |
| **L-3** | Facade is the sole public entry point for Aurora domain operations |
| **L-4** | Services contain business logic · invoke agents · emit events |
| **L-5** | Agents invoke services — never repositories or integrations directly |
| **L-6** | Repositories handle persistence only — no business rules |
| **L-7** | Integrations wrap external APIs — no business logic |

## 3.2 Frontend Architecture

| Aspect | Specification |
|--------|---------------|
| **Framework** | Next.js App Router · React 19+ |
| **Rendering** | Server Components default · Client Components for interactivity |
| **Layout** | ORION Executive Shell → Aurora Shell → Module pages |
| **Design System** | ORION ES-008 · `components/ui/` |
| **State** | Server state (RSC) · URL search params · minimal client context |
| **Data fetching** | Server Components call Facade · Client Components call API routes |
| **Routing** | File-system routing under `app/(platform)/aurora/` |
| **Auth** | ORION session middleware · RBAC gate per route |

### Frontend Module Pattern

Each Aurora module page follows:

```typescript
// app/(platform)/aurora/content/page.tsx
// 1. Auth + RBAC check (middleware)
// 2. Resolve brand context from session/URL
// 3. Fetch data via AuroraFacade (Server Component)
// 4. Render module components with data
// 5. Client Components for editor interactivity
```

### Aurora Shell Components

| Component | Responsibility |
|-----------|---------------|
| `AuroraShell` | Layout wrapper · module sub-navigation · brand context |
| `AuroraSidebar` | Module navigation · active state · badge counts |
| `AuroraHeader` | Brand switcher · user menu · notification bell |
| `BrandSwitcher` | Business/brand context selection |
| `AgentActivityPanel` | Live agent session monitor (collapsible) |

## 3.3 Backend Architecture

| Aspect | Specification |
|--------|---------------|
| **Runtime** | Node.js · TypeScript 5.x |
| **API style** | REST (Phase 1) · GraphQL (Phase 3) |
| **Route handlers** | Next.js App Router `route.ts` |
| **Validation** | Zod schemas at API boundary |
| **Error handling** | Standardized Aurora error codes · no stack traces to client |
| **Rate limiting** | Per-tenant · per-endpoint · Redis-backed |
| **Background jobs** | Bull/BullMQ via Redis · publish · sync · reports |

### API Request Lifecycle

```
HTTP Request
    ↓
Middleware (ORION auth · tenant context)
    ↓
Route Handler (Zod validation · RBAC check)
    ↓
AuroraFacade (domain operation)
    ↓
Domain Service (business logic)
    ↓
[Agent Orchestrator] (if AI involved)
    ↓
Repository / Integration / Event Publisher
    ↓
HTTP Response (standardized envelope)
```

### API Response Envelope

```typescript
interface AuroraApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;        // AURORA_ERR_XXXX
    message: string;     // Human-readable
    details?: unknown;   // Validation errors
  };
  meta?: {
    tenantId: string;
    brandId: string;
    timestamp: string;
    requestId: string;
  };
}
```

## 3.4 API Layer

### API Design Standards

| Standard | Rule |
|----------|------|
| **URL pattern** | `/api/aurora/{domain}/{resource}[/{id}[/{action}]]` |
| **HTTP verbs** | GET (read) · POST (create/action) · PUT (update) · DELETE (soft delete) |
| **Pagination** | `?page=1&limit=20` · response includes `total` · `hasMore` |
| **Filtering** | `?status=approved&brandId=xxx&channel=instagram` |
| **Sorting** | `?sort=createdAt&order=desc` |
| **Idempotency** | POST actions that mutate state accept `Idempotency-Key` header |
| **Versioning** | Header `X-Aurora-Version: 1` (future API versioning) |

### API Authorization Matrix

| Endpoint Pattern | Required Role |
|-----------------|---------------|
| `GET /api/aurora/*` | Viewer+ |
| `POST /api/aurora/content` | Content Creator+ |
| `POST /api/aurora/content/generate` | Content Creator+ |
| `POST /api/aurora/*/approve` | Approver+ |
| `POST /api/aurora/*/publish` | Channel Manager+ |
| `POST /api/aurora/ads/*/launch` | Marketing Director+ |
| `POST /api/aurora/agents/invoke` | Content Creator+ |
| `PUT /api/aurora/settings/*` | Aurora Admin |
| `POST /api/aurora/integrations/connect` | Aurora Admin · Brand Manager |

## 3.5 AI Orchestration Layer

Detailed in [§6 AI Orchestration Engine](#6-ai-orchestration-engine).

Summary placement:

| Component | Location | Responsibility |
|-----------|----------|---------------|
| `AgentOrchestrator` | `lib/aurora/agents/` | Route tasks · manage lifecycle |
| `AgentRegistry` | `lib/aurora/agents/` | Register · resolve agents by codename |
| `AgentContextAssembler` | `lib/aurora/agents/` | Brand · KB · campaign context injection |
| `AgentMemoryStore` | `lib/aurora/agents/` | Session history · short-term memory |
| Individual agents | `lib/aurora/agents/agents/` | Domain-specific AI logic |
| Prompt templates | `lib/aurora/agents/prompts/` | Versioned · brand-customizable |

## 3.6 Service Layer

Domain services follow the ORION service pattern established by HCM, CRM, and Finance.

### Service Contract Pattern

```typescript
interface ContentService {
  create(ctx: AuroraContext, input: CreateContentInput): Promise<Content>;
  update(ctx: AuroraContext, id: string, input: UpdateContentInput): Promise<Content>;
  getById(ctx: AuroraContext, id: string): Promise<Content | null>;
  list(ctx: AuroraContext, filters: ContentFilters): Promise<PaginatedResult<Content>>;
  submitForApproval(ctx: AuroraContext, id: string): Promise<ApprovalRequest>;
  generateDraft(ctx: AuroraContext, brief: ContentBrief): Promise<Content>;
}
```

### Service Rules

| Rule | Description |
|------|-------------|
| **S-1** | Every service method accepts `AuroraContext` as first parameter |
| **S-2** | Services validate business rules before persistence |
| **S-3** | Services emit events after successful state changes |
| **S-4** | Services delegate AI work to AgentOrchestrator — never call LLM directly |
| **S-5** | Services delegate publish to PublishPipeline — never call channel APIs directly |
| **S-6** | Services write audit log entries for consequential operations |
| **S-7** | Services are stateless — all state in repositories |

### AuroraContext

```typescript
interface AuroraContext {
  tenantId: string;
  brandId: string;
  businessId: string;
  userId: string;
  roles: AuroraRole[];
  locale: string;
  timezone: string;
  requestId: string;
}
```

## 3.7 Data Layer

Detailed in [§7 Data Architecture](#7-data-architecture).

| Component | Location | Pattern |
|-----------|----------|---------|
| **Repositories** | `lib/aurora/*/repositories/` | PlatformStore-backed |
| **Entities** | `types/aurora-*.ts` | TypeScript interfaces |
| **Migrations** | `lib/aurora/persistence/migrations/` | Sequential · backward-compatible |
| **Cache** | Redis | Session · agent context · rate limits |
| **Object storage** | S3-compatible | Creative assets · exports |
| **Vector store** | pgvector | Knowledge Base embeddings |

## 3.8 Provider Layer

Aurora registers an Executive Provider with ORION Intelligence, mirroring `financeExecutiveProvider` and `crmExecutiveProvider`.

### auroraExecutiveProvider

| Field | Value |
|-------|-------|
| **Provider ID** | `aurora.marketing` |
| **Location** | `lib/aurora/providers/auroraExecutiveProvider.ts` |
| **Interface** | ORION `ExecutiveProvider` (ADR-006) |
| **Contributes** | Marketing Health Score · campaign alerts · executive recommendations |
| **Consumes** | ORION CRM data (lead attribution) · Finance data (spend) |
| **Registration** | `lib/intelligence/register-executive-providers.ts` |

### Provider Data Contract

```typescript
interface AuroraExecutiveSnapshot {
  marketingHealthScore: number;          // 0-100
  activeCampaigns: number;
  totalSpend: Money;
  totalRevenue: Money;
  roas: number;
  contentVelocity: number;               // pieces/week
  pendingApprovals: number;
  criticalAlerts: AuroraAlert[];
  topRecommendations: AuroraRecommendation[];
  confidence: ConfidenceLevel;
  dataFreshness: ISO8601;
}
```

---

# 4. Domain Architecture

Aurora is organized into nine bounded domains. Each domain owns its entities, services, repositories, and events. Cross-domain communication occurs exclusively via the Aurora Facade or canonical events — never direct service-to-service calls across domain boundaries.

## 4.1 Domain Map

```
┌─────────────────────────────────────────────────────────────┐
│                    AuroraFacade (Public API)                  │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ Marketing│ Content  │  Media   │   SEO    │     Social      │
│ (campaigns│ (text    │ (visual  │ (search  │ (social posts   │
│  planner │  content │  assets) │  optim.) │  scheduling)    │
│  budget) │  versions│          │          │                 │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│  Ads     │  Email   │Messaging │ Analytics│   Knowledge     │
│ (paid    │ (email   │(WhatsApp │ (metrics │   (brand intel  │
│  media)  │  campaigns│broadcast)│ reports)│    retrieval)   │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│              Cross-Cutting Domains                            │
│  Automation (workflows · scheduling · publish pipeline)       │
│  Administration (tenant · brand · settings · RBAC)            │
│  Approval (workflow engine · policy · audit)                  │
└─────────────────────────────────────────────────────────────┘
```

## 4.2 Domain — Marketing

**Bounded context:** Campaign lifecycle · strategic planning · budget management.

| Entity | Key Fields | Owner Service |
|--------|-----------|---------------|
| `Campaign` | id · brandId · name · objective · budget · status · timeline | `CampaignService` |
| `CampaignGoal` | id · campaignId · metric · target · current | `CampaignService` |
| `BudgetAllocation` | id · campaignId · channel · amount · spent | `BudgetService` |
| `PlannerEntry` | id · brandId · date · contentType · channel · status | `PlannerService` |

### Marketing Domain Rules

- Campaign budget cannot go negative
- Closed campaigns are read-only
- Budget changes require approval above configured threshold
- Campaign goals link to Analytics metrics for automatic tracking
- Planner entries sync with Content and Social modules

### Marketing Domain Events

- `aurora.campaign.created`
- `aurora.campaign.launched`
- `aurora.campaign.paused`
- `aurora.campaign.completed`
- `aurora.budget.threshold.exceeded`

## 4.3 Domain — Content

**Bounded context:** Text content creation · versioning · approval · generation.

| Entity | Key Fields | Owner Service |
|--------|-----------|---------------|
| `Content` | id · brandId · campaignId · type · body · status · version | `ContentService` |
| `ContentVersion` | id · contentId · version · body · authorId · timestamp | `ContentVersionService` |
| `ContentBrief` | id · brandId · topic · audience · tone · keywords · format | `ContentGenerationService` |

### Content Domain Rules

- Content status flow: `draft` → `submitted` → `in_review` → `approved` → `published` (or `rejected` → `draft`)
- AI-generated content marked with `source: 'agent'` and agent codename
- Content versions are immutable — edits create new versions
- Published content is read-only — changes require new version + re-approval
- Content type determines available publish channels

### Content Status Machine

```
draft ──→ submitted ──→ in_review ──→ approved ──→ published
              ↑              │              │
              └── rejected ←─┘              │
              ↑                            │
              └── changes_requested ←──────┘
```

## 4.4 Domain — Media

**Bounded context:** Visual creative assets · brand kit · storage.

| Entity | Key Fields | Owner Service |
|--------|-----------|---------------|
| `CreativeAsset` | id · brandId · type · storageUrl · metadata · version | `CreativeService` |
| `BrandKit` | id · brandId · colors · fonts · logos · guidelines | `BrandKitService` |
| `AssetTemplate` | id · brandId · channel · dimensions · templateUrl | `CreativeService` |

### Media Domain Rules

- All assets stored in tenant-scoped object storage with CDN delivery
- Brand kit changes do not retroactively modify existing assets
- AI-generated images include generation metadata (prompt · model · seed)
- Asset file size limits per tier (Starter: 10MB · Enterprise: 100MB)
- Supported formats: JPEG · PNG · WebP · SVG · MP4 (Phase 2)

## 4.5 Domain — SEO

**Bounded context:** Keyword research · on-page optimization · rank tracking · audits.

| Entity | Key Fields | Owner Service |
|--------|-----------|---------------|
| `Keyword` | id · brandId · term · volume · difficulty · currentRank | `KeywordService` |
| `SeoAudit` | id · brandId · url · score · issues · timestamp | `SeoAuditService` |
| `RankSnapshot` | id · keywordId · rank · url · date | `RankTrackingService` |

### SEO Domain Rules

- Keyword data refreshed weekly (automated agent task)
- SEO audits scheduled monthly per brand (configurable)
- Audit issues ranked by impact · agent generates fix recommendations
- SEO content briefs feed Content Studio via `ContentBrief` entity

## 4.6 Domain — Analytics

**Bounded context:** Metrics ingestion · reporting · attribution · marketing health.

| Entity | Key Fields | Owner Service |
|--------|-----------|---------------|
| `AnalyticsSnapshot` | id · brandId · channel · metric · value · period | `AnalyticsIngestionService` |
| `Report` | id · brandId · type · config · generatedAt · data | `AnalyticsReportService` |
| `AttributionModel` | id · brandId · type · config | `AttributionService` |
| `MarketingHealthScore` | brandId · score · dimensions · timestamp | `MarketingHealthService` |

### Analytics Domain Rules

- Metrics ingested from integrations on scheduled sync + webhook
- All metrics include `source` · `freshness` · `confidence` fields
- Marketing Health Score calculated daily · contributes to ORION Executive Brief
- Attribution models configurable per brand (first-touch · last-touch · multi-touch)
- Anomaly detection runs hourly · alerts via Notification service

### Marketing Health Score Dimensions

| Dimension | Weight | Source |
|-----------|--------|--------|
| Campaign Performance | 25% | Ads + Social analytics |
| Content Engagement | 20% | Content + Social metrics |
| SEO Health | 15% | SEO Engine rankings |
| Lead Generation | 20% | CRM integration |
| Budget Efficiency | 10% | Budget vs. ROAS |
| Channel Coverage | 10% | Active channels / configured channels |

## 4.7 Domain — Automation

**Bounded context:** Workflow execution · scheduling · publish pipeline · job management.

| Entity | Key Fields | Owner Service |
|--------|-----------|---------------|
| `Workflow` | id · brandId · trigger · steps · status | `WorkflowService` |
| `ScheduleEntry` | id · brandId · entityType · entityId · scheduledAt · status | `ScheduleService` |
| `PublishJob` | id · contentId · channels · status · results | `PublishPipelineService` |
| `AutomationRule` | id · brandId · trigger · action · guardrails | `WorkflowService` |

### Automation Domain Rules

- All scheduled actions pass through approval gate if configured
- Publish jobs are transactional — all channels succeed or job marked `partial_failure` with per-channel results
- Failed jobs retry 3× with exponential backoff before alerting
- Emergency stop halts all pending schedules and publish jobs within 60 seconds
- Automation rules versioned — changes require admin approval

### Publish Pipeline Flow

```
Approved Content/Creative
    ↓
PublishJob created (status: queued)
    ↓
For each target channel:
    ├── Resolve channel connector
    ├── Format content for channel
    ├── Execute publish API call
    ├── Record result (success/failure)
    └── Emit aurora.content.published or aurora.publish.failed
    ↓
PublishJob completed (status: completed | partial_failure | failed)
    ↓
Notification sent to content owner
    ↓
Analytics ingestion triggered
```

## 4.8 Domain — Knowledge

**Bounded context:** Brand intelligence repository · semantic retrieval · agent context.

| Entity | Key Fields | Owner Service |
|--------|-----------|---------------|
| `KnowledgeEntry` | id · brandId · category · title · content · embedding | `KnowledgeService` |
| `KnowledgeCategory` | brand_guidelines · products · audience · competitors · faq · industry | enum |
| `KnowledgeDocument` | id · brandId · filename · storageUrl · parsed · status | `KnowledgeIngestionService` |

### Knowledge Domain Rules

- Knowledge entries require Brand Manager approval before agent use
- Embeddings regenerated on content update
- Agent context assembly queries top-K relevant entries per invocation
- Stale entries (>90 days) flagged for review
- Document ingestion supports PDF · DOCX · web URL · plain text
- Knowledge is brand-scoped — strict isolation enforced

### Knowledge Categories

| Category | Content | Agent Consumers |
|----------|---------|-----------------|
| `brand_guidelines` | Voice · tone · visual · messaging rules | All agents |
| `products` | Features · benefits · pricing · USPs | Copywriter · Ads Manager |
| `audience` | Personas · demographics · pain points | Content Strategist · Copywriter |
| `competitors` | Positioning · strengths · weaknesses | Marketing Director · SEO |
| `faq` | Common questions · approved answers | Copywriter · Social Manager |
| `industry` | Trends · regulations · seasonal patterns | Marketing Director · Strategist |

## 4.9 Domain — Administration

**Bounded context:** Tenant management · brand configuration · user roles · settings.

| Entity | Key Fields | Owner Service |
|--------|-----------|---------------|
| `AuroraTenant` | id · name · tier · config · quotas | `TenantService` |
| `AuroraBrand` | id · tenantId · businessId · name · voice · visual · policy | `BrandService` |
| `AuroraBusiness` | id · tenantId · name · config | `TenantService` |
| `ApprovalPolicy` | id · brandId · rules · chain · autoApproval | `SettingsService` |

### Administration Domain Rules

- Tenant creation provisions default brand · admin user · quota limits
- Brand deletion requires 30-day archive period before permanent deletion
- Approval policies configurable per brand · per content type · per channel
- Tier quotas enforced at service layer — graceful denial with upgrade prompt
- Settings changes emit `aurora.settings.changed` audit event

---

# 5. Composition Root

Aurora follows the ORION composition root pattern established by `createHcmWiring()`, `createCrmWiring()`, and Procurement wiring. All dependency resolution occurs in a single factory function.

## 5.1 Composition Root Design

| Field | Value |
|-------|-------|
| **Factory function** | `createAuroraWiring(config: AuroraWiringConfig): AuroraWiring` |
| **Location** | `lib/aurora/createAuroraWiring.ts` |
| **Public entry** | `AuroraFacade` via `lib/aurora/index.ts` |
| **Pattern reference** | `lib/hcm/createHcmWiring.ts` · `lib/crm/createCrmWiring.ts` |

### AuroraWiring Interface

```typescript
interface AuroraWiring {
  readonly facade: AuroraFacade;
  readonly orchestrator: AgentOrchestrator;
  readonly publishPipeline: PublishPipeline;
  readonly eventPublisher: AuroraEventPublisher;
  readonly executiveProvider: AuroraExecutiveProvider;
  readonly connectorRegistry: ConnectorRegistry;
  readonly shutdown: () => Promise<void>;
}
```

### AuroraWiringConfig

```typescript
interface AuroraWiringConfig {
  readonly storeConfig: StoreConfiguration;       // ORION PlatformStore
  readonly aiProvider: AIProvider;                  // ORION AI Layer
  readonly notificationService: NotificationService; // ORION Notifications
  readonly searchService: SearchService;             // ORION Search
  readonly auditService: AuditService;              // ORION Audit
  readonly eventBus: EventBus;                       // ORION Event Bus
  readonly redisUrl?: string;                        // Cache + job queue
  readonly storageConfig?: ObjectStorageConfig;       // S3-compatible
}
```

## 5.2 Dependency Injection

### Wiring Sequence

```
createAuroraWiring(config)
    ↓
1. Create persistence layer
   ├── AuroraPlatformBacking(storeConfig)
   ├── createAuroraStore(backing)
   └── Repository instances (all domains)
    ↓
2. Create infrastructure services
   ├── AuroraEventPublisher(eventBus)
   ├── ApprovalService(repositories, eventPublisher)
   ├── PublishPipeline(connectorRegistry, eventPublisher)
   ├── AgentMemoryStore(redis)
   └── ConnectorRegistry(config)
    ↓
3. Create domain services
   ├── CampaignService(repositories, eventPublisher)
   ├── ContentService(repositories, orchestrator, approval)
   ├── CreativeService(repositories, orchestrator)
   ├── ... (all domain services)
   └── AnalyticsIngestionService(repositories, eventPublisher)
    ↓
4. Create AI orchestration
   ├── AgentRegistry()
   ├── AgentContextAssembler(knowledgeService, repositories)
   ├── AgentOrchestrator(registry, contextAssembler, aiProvider, memory)
   └── Register all 10 agents
    ↓
5. Create facade
   └── AuroraFacade(all services, orchestrator, publishPipeline)
    ↓
6. Register ORION integrations
   ├── auroraExecutiveProvider(facade, analyticsService)
   ├── registerAuroraSubscribers(eventBus, facade)
   └── Search index registration
    ↓
7. Return AuroraWiring
```

## 5.3 Service Registration

All services are instantiated within `createAuroraWiring()` — no global singletons · no service locator pattern.

| Registration Rule | Description |
|-------------------|-------------|
| **SR-1** | Services receive dependencies via constructor injection |
| **SR-2** | Repositories receive PlatformStore backing via factory |
| **SR-3** | Agents receive AI provider · context assembler · memory store |
| **SR-4** | Connectors receive OAuth token store · rate limiter |
| **SR-5** | Event handlers registered via `registerAuroraSubscribers()` |
| **SR-6** | Executive Provider registered in ORION provider registry |

## 5.4 Factory Patterns

| Factory | Purpose | Location |
|---------|---------|----------|
| `createAuroraWiring()` | Full composition root | `lib/aurora/createAuroraWiring.ts` |
| `createAuroraStore()` | PlatformStore instance | `lib/aurora/persistence/createAuroraStore.ts` |
| `createAuroraAgentWiring()` | Agent subsystem only (testing) | `lib/aurora/wiring/createAuroraAgentWiring.ts` |
| `createAuroraIntegrationWiring()` | Connector subsystem (testing) | `lib/aurora/wiring/createAuroraIntegrationWiring.ts` |
| `createAuroraPersistenceWiring()` | Repository layer (testing) | `lib/aurora/wiring/createAuroraPersistenceWiring.ts` |

## 5.5 Provider Resolution

| Provider Type | Resolution | Fallback |
|---------------|-----------|----------|
| **AI/LLM** | Configured in `AuroraWiringConfig.aiProvider` | Secondary provider auto-failover |
| **Channel connector** | `ConnectorRegistry.get(providerId, brandId)` | Error: connector not connected |
| **Storage** | `AssetStorageService` → S3-compatible | Error: storage unavailable |
| **Cache** | Redis connection from config | In-memory fallback (dev only) |
| **Search** | ORION SearchService | Degraded: database query fallback |

## 5.6 Lifecycle

### Application Startup

```
ORION Platform Bootstrap
    ↓
PlatformStore initialization
    ↓
createAuroraWiring(config)
    ↓
Register auroraExecutiveProvider
    ↓
Register Aurora search indexes
    ↓
Register event subscribers
    ↓
Start publish job queue worker
    ↓
Start scheduled sync jobs (integrations)
    ↓
Aurora ready
```

### Application Shutdown

```
Shutdown signal
    ↓
Stop accepting new publish jobs
    ↓
Drain in-flight publish jobs (timeout: 30s)
    ↓
Stop scheduled sync jobs
    ↓
Flush agent memory store to persistence
    ↓
Close Redis connections
    ↓
Aurora shutdown complete
```

### Request Lifecycle

```
HTTP Request → Middleware (auth) → Route Handler → AuroraFacade.method(ctx, ...)
    ↓
ctx = { tenantId, brandId, userId, roles, ... } extracted from session
    ↓
Facade delegates to domain service
    ↓
Service validates · executes · emits events
    ↓
Response returned
```

---

# 6. AI Orchestration Engine

The AI Orchestration Engine is Aurora's distinguishing engineering capability. It manages the lifecycle, routing, context, memory, and collaboration of ten specialized marketing agents.

## 6.1 Engine Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AgentOrchestrator                          │
│  invoke() · routeTask() · manageSession() · escalate()       │
├─────────────────────────────────────────────────────────────┤
│  AgentRegistry          │  AgentContextAssembler              │
│  register() · resolve() │  assemble(brand, task, history)     │
├─────────────────────────┴───────────────────────────────────┤
│  AgentMemoryStore       │  ApprovalGate                      │
│  save() · retrieve()    │  check() · submit() · resolve()    │
├─────────────────────────┴───────────────────────────────────┤
│                    Individual Agents (10)                     │
│  Director · Strategist · Copywriter · Creative · SEO ·       │
│  Ads · Social · Analytics · Optimizer · Advisor               │
├─────────────────────────────────────────────────────────────┤
│                    ORION AI Layer                              │
│  LLM Provider · Guardrails · Prompt Registry · Metering       │
└─────────────────────────────────────────────────────────────┘
```

## 6.2 Agent Registry

| Codename | Class | Phase | Status |
|----------|-------|-------|--------|
| `agent.director` | `MarketingDirectorAgent` | 1 | Planned (A-013) |
| `agent.strategist` | `ContentStrategistAgent` | 1 | Planned (A-013) |
| `agent.copywriter` | `CopywriterAgent` | 1 | Planned (A-013) |
| `agent.creative` | `CreativeDirectorAgent` | 1 | Planned (A-013) |
| `agent.seo` | `SeoSpecialistAgent` | 1 | Planned (A-013) |
| `agent.ads` | `AdvertisingManagerAgent` | 2 | Planned (A-025) |
| `agent.social` | `SocialMediaManagerAgent` | 1 | Planned (A-013) |
| `agent.analytics` | `AnalyticsManagerAgent` | 1 | Planned (A-013) |
| `agent.optimizer` | `CampaignOptimizerAgent` | 2 | Planned (A-025) |
| `agent.advisor` | `ExecutiveAdvisorAgent` | 1 | Planned (A-013) |

### Agent Interface Contract

```typescript
interface AuroraAgent {
  readonly codename: string;
  readonly displayName: string;
  readonly capabilities: readonly string[];
  readonly authorityLevel: AgentAuthorityLevel;

  execute(input: AgentInput): Promise<AgentOutput>;
  canHandle(task: AgentTask): boolean;
}

interface AgentInput {
  readonly context: AuroraContext;
  readonly task: AgentTask;
  readonly brandContext: BrandKnowledgeContext;
  readonly sessionHistory: readonly AgentMessage[];
  readonly constraints: AgentConstraints;
}

interface AgentOutput {
  readonly result: unknown;
  readonly rationale: string;
  readonly confidence: ConfidenceLevel;
  readonly suggestedActions: readonly SuggestedAction[];
  readonly tokensUsed: number;
  readonly requiresApproval: boolean;
  readonly handoffTo?: string;  // agent codename
}
```

## 6.3 Agent Lifecycle

```
Registration (startup)
    ↓
Idle (waiting for task)
    ↓
Context Assembly (brand · KB · campaign · history)
    ↓
Execution (LLM inference + guardrails)
    ↓
Output Validation (brand safety · PII · format)
    ↓
Approval Check (requiresApproval?)
    ├── Yes → Submit to Approval Engine → Wait
    └── No → Return result
    ↓
Handoff? (handoffTo specified?)
    ├── Yes → Route to next agent
    └── No → Complete
    ↓
Memory Store (save session turn)
    ↓
Audit Log (record agent action)
    ↓
Idle
```

## 6.4 Task Routing

### Routing Rules

| Task Type | Primary Agent | Fallback |
|-----------|--------------|----------|
| Strategic planning | `agent.director` | — |
| Content topic selection | `agent.strategist` | `agent.director` |
| Content writing | `agent.copywriter` | — |
| Visual concept | `agent.creative` | — |
| SEO analysis | `agent.seo` | — |
| Ad campaign proposal | `agent.ads` | `agent.director` |
| Social posting strategy | `agent.social` | `agent.strategist` |
| Performance analysis | `agent.analytics` | — |
| Campaign optimization | `agent.optimizer` | `agent.analytics` |
| Executive briefing | `agent.advisor` | `agent.director` |
| Unclassified | `agent.director` | Routes to specialist |

### Routing Algorithm

```
1. Parse task type from input
2. Query AgentRegistry for capable agents
3. If single match → route directly
4. If multiple matches → select by priority ranking
5. If no match → escalate to agent.director
6. Director may handoff to specialist
7. Log routing decision in session
```

## 6.5 Context Management

### Context Assembly Pipeline

```
AgentContextAssembler.assemble(ctx, task)
    ↓
1. Brand Context
   ├── Brand voice · tone · guidelines (Knowledge Base)
   ├── Brand kit · visual rules
   └── Approval policy for this action type
    ↓
2. Campaign Context (if campaign-related)
   ├── Campaign objectives · budget · timeline
   ├── Active channels · performance snapshot
   └── Recent content and creative assets
    ↓
3. Knowledge Base Retrieval
   ├── Semantic search: top-5 relevant entries for task
   ├── Category filter: match task type to KB categories
   └── Freshness check: exclude stale entries
    ↓
4. Analytics Context (if optimization/analysis task)
   ├── Recent metrics for relevant channels
   ├── Trend data · anomaly flags
   └── Comparison to goals
    ↓
5. Session History
   ├── Previous turns in this agent session
   └── Related recent sessions (last 24h)
    ↓
6. Constraints
   ├── Token budget remaining for tenant
   ├── Guardrail rules for brand/industry
   └── Regulatory constraints (if configured)
    ↓
Assembled Context Package → Agent
```

### Context Size Management

| Context Section | Max Tokens | Truncation Strategy |
|-----------------|-----------|---------------------|
| Brand context | 500 | Priority: voice > visual > guidelines |
| Campaign context | 300 | Most recent campaign data |
| Knowledge Base | 1,000 | Top-K by relevance score |
| Analytics | 500 | Summary metrics only |
| Session history | 1,000 | Last N turns · summarize older |
| **Total budget** | **3,000** | Hard limit per invocation |

## 6.6 Memory

| Memory Type | Storage | Retention | Purpose |
|-------------|---------|-----------|---------|
| **Session memory** | Redis | 24 hours | Current conversation context |
| **Short-term memory** | PostgreSQL | 30 days | Recent agent interactions per brand |
| **Long-term memory** | PostgreSQL | Indefinite | Approved recommendations · learned preferences |
| **Brand preferences** | PostgreSQL | Indefinite | User corrections · style preferences |

### Memory Rules

- Agent memory is brand-scoped — never cross-brand
- User corrections to agent output stored as brand preferences
- Session memory cleared on explicit session end or 24h timeout
- Long-term memory entries require periodic review (90-day refresh)

## 6.7 Approval Workflow

Agent outputs that require approval follow the shared Approval Engine.

| Agent Output Type | Default Approval Required |
|-------------------|--------------------------|
| Content draft | No (for internal review) · Yes (for publish) |
| Creative asset | Yes |
| Ad campaign proposal | Yes |
| Budget reallocation | Yes |
| Social post schedule | Yes (configurable auto-approve) |
| SEO change recommendation | No (informational) |
| Analytics report | No (informational) |
| Executive briefing | No (informational) |
| Optimization action (Tier 3) | Per automation config |

## 6.8 Collaboration Model

Detailed inter-agent collaboration scenarios defined in A-001 §6.4. Engineering implementation:

| Pattern | Implementation |
|---------|---------------|
| **Sequential handoff** | Agent A output includes `handoffTo` → Orchestrator routes to Agent B |
| **Parallel consultation** | Director invokes multiple agents · aggregates results |
| **Escalation** | Agent confidence < Medium → flag for human · or escalate to Director |
| **Conflict resolution** | Conflicting outputs → Director arbitrates · human if unresolved |

---

# 7. Data Architecture

## 7.1 Entity Relationship Overview

```
AuroraTenant (1) ──→ (N) AuroraBusiness (1) ──→ (N) AuroraBrand
                                                      │
                    ┌─────────────┬───────────────────┤
                    ↓             ↓                   ↓
               Campaign      Content            CreativeAsset
                    │             │                   │
                    ↓             ↓                   ↓
            BudgetAllocation  ContentVersion    BrandKit
                    │
                    ↓
              ScheduleEntry ──→ PublishJob ──→ PublishResult
                    
AuroraBrand (1) ──→ (N) KnowledgeEntry
AuroraBrand (1) ──→ (N) Keyword
AuroraBrand (1) ──→ (N) ChannelConnection
AuroraBrand (1) ──→ (N) AnalyticsSnapshot
AuroraBrand (1) ──→ (N) ApprovalRecord
AuroraBrand (1) ──→ (N) AgentSession
```

## 7.2 Core Business Entities

| Entity | Table | Primary Key | Tenant Scoped | Brand Scoped |
|--------|-------|-------------|:-------------:|:------------:|
| `AuroraTenant` | `aurora_tenant` | `id` (UUID) | — | — |
| `AuroraBusiness` | `aurora_business` | `id` (UUID) | ✅ | — |
| `AuroraBrand` | `aurora_brand` | `id` (UUID) | ✅ | — |
| `Campaign` | `aurora_campaign` | `id` (UUID) | ✅ | ✅ |
| `Content` | `aurora_content` | `id` (UUID) | ✅ | ✅ |
| `CreativeAsset` | `aurora_creative` | `id` (UUID) | ✅ | ✅ |
| `Keyword` | `aurora_keyword` | `id` (UUID) | ✅ | ✅ |
| `ChannelConnection` | `aurora_channel` | `id` (UUID) | ✅ | ✅ |
| `KnowledgeEntry` | `aurora_knowledge` | `id` (UUID) | ✅ | ✅ |
| `AnalyticsSnapshot` | `aurora_analytics` | `id` (UUID) | ✅ | ✅ |

## 7.3 Campaign Data Model

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `id` | UUID | ✅ | Primary key |
| `tenant_id` | UUID | ✅ | Tenant isolation |
| `brand_id` | UUID | ✅ | Brand scope |
| `name` | string | ✅ | Campaign name |
| `objective` | enum | ✅ | awareness · consideration · conversion · retention |
| `status` | enum | ✅ | draft · active · paused · completed · archived |
| `budget_amount` | decimal | ✅ | Total budget |
| `budget_currency` | string | ✅ | ISO 4217 |
| `budget_spent` | decimal | ✅ | Computed · default 0 |
| `start_date` | date | ❌ | Campaign start |
| `end_date` | date | ❌ | Campaign end |
| `channels` | string[] | ✅ | Target channels |
| `goals` | JSONB | ❌ | KPI targets |
| `created_by` | UUID | ✅ | User ID |
| `created_at` | timestamp | ✅ | Creation time |
| `updated_at` | timestamp | ✅ | Last update |
| `deleted_at` | timestamp | ❌ | Soft delete |

## 7.4 Asset Storage

| Asset Type | Storage | CDN | Max Size |
|------------|---------|-----|----------|
| **Images** | S3: `aurora/{tenantId}/{brandId}/images/` | ✅ | 10MB (Starter) · 100MB (Enterprise) |
| **Video** | S3: `aurora/{tenantId}/{brandId}/video/` | ✅ | 100MB (Phase 2) |
| **Documents** | S3: `aurora/{tenantId}/{brandId}/docs/` | ❌ | 25MB |
| **Exports** | S3: `aurora/{tenantId}/exports/` | ❌ | Auto-delete 30 days |
| **Brand kit** | S3: `aurora/{tenantId}/{brandId}/brandkit/` | ✅ | 5MB per file |

## 7.5 Analytics Data Model

| Field | Type | Description |
|-------|------|-------------|
| `metric_name` | string | e.g., `impressions` · `clicks` · `conversions` · `spend` |
| `metric_value` | decimal | Numeric value |
| `channel` | string | Source channel (google_ads · instagram · etc.) |
| `campaign_id` | UUID? | Linked campaign (if applicable) |
| `period_start` | timestamp | Metric period start |
| `period_end` | timestamp | Metric period end |
| `source` | string | Integration that provided data |
| `freshness` | timestamp | When data was last synced |
| `confidence` | enum | high · medium · low |

## 7.6 Scheduling Data Model

| Field | Type | Description |
|-------|------|-------------|
| `entity_type` | enum | content · social_post · email · ad · whatsapp |
| `entity_id` | UUID | Reference to scheduled entity |
| `scheduled_at` | timestamp | Execution time (UTC) |
| `timezone` | string | Display timezone |
| `status` | enum | scheduled · executing · completed · failed · cancelled |
| `retry_count` | integer | Number of retry attempts |
| `last_error` | string? | Error message if failed |

## 7.7 Audit Data Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Audit entry ID |
| `tenant_id` | UUID | Tenant scope |
| `brand_id` | UUID? | Brand scope (if applicable) |
| `actor_type` | enum | user · agent · system |
| `actor_id` | string | User ID or agent codename |
| `action` | string | e.g., `content.approved` · `campaign.launched` |
| `entity_type` | string | Entity affected |
| `entity_id` | UUID | Entity ID |
| `before_state` | JSONB? | State before action |
| `after_state` | JSONB? | State after action |
| `metadata` | JSONB? | Additional context |
| `ip_address` | string? | Request IP |
| `timestamp` | timestamp | Immutable creation time |

### Audit Rules

- Append-only — no updates or deletes
- Cryptographic integrity chain (hash of previous entry + current entry)
- Indexed on: `tenant_id` · `brand_id` · `actor_id` · `action` · `timestamp`
- Retention per tier: 1 year · 3 years · 7 years

## 7.8 Version History

| Entity | Version Strategy | Storage |
|--------|-----------------|---------|
| **Content** | Full text diff per version | `aurora_content_version` table |
| **Creative assets** | File reference per version | `aurora_creative_version` table |
| **Campaign config** | JSONB snapshot per version | `aurora_campaign_version` table |
| **Brand guidelines** | Full snapshot per version | `aurora_brand_version` table |
| **Agent prompts** | Prompt text per version | `lib/aurora/agents/prompts/` (code) |
| **Approval policies** | JSONB snapshot per version | `aurora_approval_policy_version` table |

---

# 8. Event Architecture

Aurora events follow ORION Event Bus conventions with `aurora.*` namespace.

## 8.1 Event Design Principles

| Principle | Rule |
|-----------|------|
| **Canonical naming** | `aurora.{domain}.{action}` — lowercase · dot-separated |
| **Immutable payloads** | Event payloads are frozen at emission time |
| **At-least-once delivery** | Consumers must be idempotent |
| **Tenant context** | Every event includes `tenantId` · `brandId` |
| **Correlation ID** | Related events share `correlationId` |
| **Version** | Event schema version in payload |

## 8.2 Canonical Event Catalogue

See [Appendix D — Event Catalogue](#appendix-d--event-catalogue) for complete listing.

### Event Categories

| Category | Prefix | Count |
|----------|--------|------:|
| Campaign | `aurora.campaign.*` | 5 |
| Content | `aurora.content.*` | 6 |
| Creative | `aurora.creative.*` | 3 |
| Publish | `aurora.publish.*` | 3 |
| Social | `aurora.social.*` | 3 |
| Ads | `aurora.ad.*` | 4 |
| Email | `aurora.email.*` | 3 |
| Analytics | `aurora.analytics.*` | 3 |
| Agent | `aurora.agent.*` | 3 |
| Approval | `aurora.approval.*` | 3 |
| Integration | `aurora.integration.*` | 3 |
| Admin | `aurora.admin.*` | 3 |
| **Total** | | **42** |

## 8.3 Publishing Pattern

```typescript
// AuroraEventPublisher
class AuroraEventPublisher {
  publish<T extends AuroraEvent>(event: T): void {
    this.eventBus.emit(event.type, {
      ...event.payload,
      _meta: {
        tenantId: event.tenantId,
        brandId: event.brandId,
        correlationId: event.correlationId,
        timestamp: new Date().toISOString(),
        version: event.schemaVersion,
        source: 'aurora',
      },
    });
  }
}
```

## 8.4 Subscriptions

| Event | Subscriber | Action |
|-------|-----------|--------|
| `aurora.content.approved` | PublishPipeline | Queue publish job if scheduled |
| `aurora.content.published` | AnalyticsIngestion | Begin tracking metrics |
| `aurora.campaign.launched` | NotificationService | Alert marketing team |
| `aurora.campaign.launched` | AnalyticsIngestion | Start campaign tracking |
| `aurora.ad.spend.updated` | BudgetService | Update budget spent |
| `aurora.analytics.snapshot` | auroraExecutiveProvider | Update ORION Executive Brief |
| `aurora.agent.recommendation` | NotificationService | Notify relevant user |
| `aurora.approval.requested` | NotificationService | Notify approver |
| `aurora.publish.failed` | NotificationService | Alert content owner |
| `aurora.budget.threshold.exceeded` | NotificationService | Alert marketing director |

## 8.5 Notifications

Aurora notifications route through ORION Notification Service.

| Trigger | Channel | Template |
|---------|---------|----------|
| Approval requested | In-app + email | `aurora-approval-requested` |
| Content published | In-app | `aurora-content-published` |
| Publish failed | In-app + email | `aurora-publish-failed` |
| Budget threshold | In-app + email | `aurora-budget-alert` |
| Campaign launched | In-app | `aurora-campaign-launched` |
| Agent recommendation | In-app | `aurora-agent-recommendation` |
| Weekly briefing | Email | `aurora-weekly-briefing` |
| Integration disconnected | In-app + email | `aurora-integration-error` |

## 8.6 Execution Lifecycle

### Event-Driven Campaign Lifecycle

```
aurora.campaign.created
    ↓
[Content creation: aurora.content.created → aurora.content.approved]
    ↓
aurora.campaign.launched
    ↓
[Publish: aurora.content.published (per channel)]
    ↓
[Analytics: aurora.analytics.snapshot (periodic)]
    ↓
[Optimization: aurora.agent.recommendation]
    ↓
aurora.campaign.completed
```

---

# 9. Security Architecture

Aurora security inherits ORION Zero Trust architecture ([ES-059](../02_Engineering/ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md)) and extends it with marketing-specific controls.

## 9.1 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1 — Network: TLS 1.3 · WAF · DDoS · IP allowlist     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — Application: Input validation · CSRF · CSP · XSS  │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 — Authentication: ORION Identity · MFA · SSO      │
├─────────────────────────────────────────────────────────────┤
│  Layer 4 — Authorization: RBAC · brand scope · API keys      │
├─────────────────────────────────────────────────────────────┤
│  Layer 5 — Data: Encryption · tenant isolation · PII masking │
├─────────────────────────────────────────────────────────────┤
│  Layer 6 — AI Safety: Prompt injection · output filtering    │
├─────────────────────────────────────────────────────────────┤
│  Layer 7 — Audit: Immutable logs · integrity chain · export  │
└─────────────────────────────────────────────────────────────┘
```

## 9.2 Identity

| Capability | Implementation | Source |
|------------|---------------|--------|
| **User authentication** | ORION Identity session tokens | ES-009 |
| **MFA** | TOTP · SMS (enterprise) | ORION Identity |
| **SSO / SAML** | Enterprise tier | ORION Identity |
| **Service accounts** | Agent bot identities · integration bots | Aurora admin |
| **API keys** | Tenant-scoped · rate-limited · rotatable | Aurora API layer |
| **OAuth tokens** | Channel connection tokens · encrypted storage | Integration Hub |

### Session Rules

- Session timeout: 8 hours (default) · configurable per tenant
- Concurrent session limit: 5 per user (enterprise: unlimited)
- Session invalidation on password change · role change · tenant suspension
- Agent service accounts have restricted permissions · no UI access

## 9.3 RBAC

Aurora extends ORION RBAC with marketing-specific roles defined in A-001 §4.2.

### Permission Enforcement Points

| Enforcement Point | Check |
|-------------------|-------|
| **API route handler** | Role required for endpoint · brand access verified |
| **AuroraFacade method** | Permission check before service delegation |
| **Service method** | Business-level authorization (e.g., budget limit) |
| **Agent invocation** | User role permits agent type · token budget available |
| **Publish action** | Approver role + approval record exists |
| **Integration connect** | Admin/Brand Manager role + OAuth scope validation |

### Brand-Scoped Access

```typescript
function assertBrandAccess(ctx: AuroraContext, brandId: string): void {
  if (!ctx.accessibleBrandIds.includes(brandId)) {
    throw new AuroraAuthorizationError('AURORA_ERR_0403', 'Brand access denied');
  }
}
```

Every repository query includes `WHERE brand_id = :brandId` enforced at the repository layer — not optional.

## 9.4 Tenant Isolation

| Isolation Layer | Mechanism |
|-----------------|-----------|
| **Database** | Row-level security · `tenant_id` on every query |
| **Cache** | Key prefix: `aurora:{tenantId}:*` |
| **Object storage** | Path prefix: `aurora/{tenantId}/` |
| **Search index** | Tenant-scoped index · filtered queries |
| **Agent context** | Brand-scoped · no cross-tenant context assembly |
| **Job queue** | Tenant-scoped queue names |
| **Integration tokens** | Tenant + brand scoped · encrypted |
| **Audit logs** | Tenant-scoped · no cross-tenant queries |

### Isolation Verification

- Integration tests must verify cross-tenant data access returns empty/error
- Penetration test includes tenant isolation validation (enterprise tier)
- Repository layer enforces tenant_id — service layer cannot bypass

## 9.5 Audit

| Requirement | Implementation |
|-------------|---------------|
| **Coverage** | All consequential actions logged (see §7.7) |
| **Immutability** | Append-only audit table · no UPDATE/DELETE |
| **Integrity** | Hash chain linking consecutive entries |
| **Searchability** | Full-text search · date range · actor · action filters |
| **Export** | CSV · JSON for compliance reporting |
| **Retention** | Tier-based: 1 · 3 · 7 years |
| **Agent audit** | Every agent invocation logged with input/output/confidence |

## 9.6 Encryption

| Data State | Method | Scope |
|------------|--------|-------|
| **At rest — database** | AES-256 (PostgreSQL TDE) | All Aurora tables |
| **At rest — object storage** | AES-256 (S3 SSE) | All assets |
| **At rest — PII fields** | Field-level encryption | Email · phone · customer data |
| **In transit** | TLS 1.3 | All HTTP · API · webhook |
| **OAuth tokens** | AES-256 encrypted in secrets vault | Channel connections |
| **API keys** | Hashed (bcrypt) · plaintext shown once | Tenant API keys |
| **Agent prompts** | Not encrypted (non-sensitive) | Prompt templates |

## 9.7 Secrets Management

| Secret Type | Storage | Rotation |
|-------------|---------|----------|
| **OAuth refresh tokens** | ORION secrets vault · encrypted | On provider expiry |
| **API keys (external)** | ORION secrets vault · encrypted | 90-day rotation (enterprise) |
| **Aurora API keys** | Hashed in database | User-initiated rotation |
| **Webhook signing keys** | ORION secrets vault | On compromise |
| **LLM API keys** | ORION secrets vault · platform-level | Platform-managed |

### Secrets Rules

- No secrets in source code · environment variables · or agent context
- Secrets accessed via ORION secrets vault API only
- Secret access logged in audit trail
- Development environment uses mock/sandbox credentials only

---

# 10. Integration Architecture

## 10.1 Integration Layer Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Aurora Service Layer                       │
├─────────────────────────────────────────────────────────────┤
│                    ConnectorRegistry                          │
│  register() · get() · list() · healthCheck()                 │
├─────────────────────────────────────────────────────────────┤
│  IntegrationConnector (abstract)                              │
│  connect() · disconnect() · sync() · publish() · health()    │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┬───────────┤
│Google│ Meta │Linked│Shopify│ WP  │Mail- │Whats │  Canva    │
│      │      │  In  │      │      │chimp │ App  │           │
├──────┴──────┴──────┴──────┴──────┴──────┴──────┴───────────┤
│                    ORION Integration Hub                      │
│  OAuth management · token refresh · rate limiting · webhooks  │
├─────────────────────────────────────────────────────────────┤
│                    External Platform APIs                     │
└─────────────────────────────────────────────────────────────┘
```

## 10.2 ORION Platform Services

| ORION Service | Aurora Integration Point | Direction |
|---------------|-------------------------|-----------|
| **Identity (ES-009)** | All API routes · session · RBAC | ORION → Aurora |
| **PlatformStore** | All Aurora entity persistence | ORION → Aurora |
| **Event Bus (ES-033)** | Aurora canonical events | Bidirectional |
| **AI Layer (ES-039)** | Agent LLM inference · guardrails | ORION → Aurora |
| **Notifications (ES-011)** | Approval · publish · alert notifications | Aurora → ORION |
| **Search (ES-011)** | Aurora entity indexing | Aurora → ORION |
| **Audit (ES-038)** | Aurora audit entries | Aurora → ORION |
| **Executive Provider (ADR-006)** | Marketing intelligence card | Aurora → ORION |
| **CRM** | Lead attribution · contact sync | Bidirectional |
| **Finance** | Marketing spend reporting | Aurora → Finance |

## 10.3 Google Integration

| Connector | API | Sync | Actions |
|-----------|-----|------|---------|
| `GoogleAdsConnector` | Google Ads API v16 | Campaigns · metrics hourly | Read campaigns · read metrics · adjust bids (Phase 2) |
| `GoogleBusinessConnector` | Google Business Profile API | Reviews real-time · insights daily | Manage listings · respond to reviews · create posts |
| `GoogleAnalyticsConnector` | GA4 Data API | Metrics daily | Read traffic · conversions · audience |
| `GoogleSearchConsoleConnector` | Search Console API | Rankings weekly | Read queries · impressions · clicks |

## 10.4 Meta Integration

| Connector | API | Sync | Actions |
|-----------|-----|------|---------|
| `FacebookConnector` | Meta Graph API | Posts on-action · insights daily | Publish posts · read engagement |
| `InstagramConnector` | Instagram Graph API | Posts on-action · insights daily | Publish posts · read engagement |
| `MetaAdsConnector` | Meta Marketing API | Campaigns · metrics hourly | Read campaigns · read metrics · manage ads (Phase 2) |

## 10.5 LinkedIn Integration

| Connector | API | Sync | Actions |
|-----------|-----|------|---------|
| `LinkedInConnector` | LinkedIn Marketing API | Posts on-action · analytics daily | Publish posts · manage company page · LinkedIn Ads (Phase 2) |

## 10.6 Shopify Integration

| Connector | API | Sync | Actions |
|-----------|-----|------|---------|
| `ShopifyConnector` | Shopify Admin API | Products daily · orders webhook | Read products · sync customers · attribute revenue |

## 10.7 WordPress Integration

| Connector | API | Sync | Actions |
|-----------|-----|------|---------|
| `WordPressConnector` | WordPress REST API | Posts on-action · SEO daily | Publish blog posts · update meta tags |

## 10.8 Mailchimp Integration

| Connector | API | Sync | Actions |
|-----------|-----|------|---------|
| `MailchimpConnector` | Mailchimp Marketing API | Lists daily · reports post-send | Create/send campaigns · manage lists · read reports |

## 10.9 WhatsApp Integration

| Connector | API | Sync | Actions |
|-----------|-----|------|---------|
| `WhatsAppBusinessConnector` | WhatsApp Business Cloud API | Templates daily · delivery on-action | Send broadcasts · manage templates · track delivery |

## 10.10 Future Providers

| Provider | Phase | Priority |
|----------|-------|----------|
| Canva | 2 | P2 |
| Pinterest | 2–3 | P2 |
| YouTube | 2 | P1 |
| X (Twitter) | 3 | P3 |
| TikTok | 3 | P3 |
| HubSpot | 3 | P3 |
| Salesforce | 3 | P3 |
| WooCommerce | 2 | P2 |
| Stripe | 3 | P3 |

## 10.11 Connector Contract

```typescript
abstract class IntegrationConnector {
  abstract readonly providerId: string;
  abstract readonly displayName: string;
  abstract readonly supportedActions: readonly string[];

  abstract connect(ctx: AuroraContext, oauthCode: string): Promise<ConnectionResult>;
  abstract disconnect(ctx: AuroraContext, connectionId: string): Promise<void>;
  abstract healthCheck(ctx: AuroraContext, connectionId: string): Promise<HealthStatus>;
  abstract sync(ctx: AuroraContext, connectionId: string, syncType: SyncType): Promise<SyncResult>;

  // Optional — implemented by connectors that support publishing
  publish?(ctx: AuroraContext, connectionId: string, content: PublishPayload): Promise<PublishResult>;
}
```

### Connector Rules

| Rule | Description |
|------|-------------|
| **IC-1** | All external API calls go through connector — never direct HTTP from services |
| **IC-2** | Connectors respect provider rate limits with intelligent backoff |
| **IC-3** | OAuth token refresh is connector responsibility |
| **IC-4** | Connector errors mapped to Aurora error codes |
| **IC-5** | New connectors registered in ConnectorRegistry — no service changes |
| **IC-6** | Connector health checks run every 15 minutes · alert on failure |

---

# 11. Quality Standards

Aurora engineering quality matches ORION enterprise standards defined in ES-043, ES-054, and ES-055.

## 11.1 Testing Strategy

| Test Level | Scope | Tool | Coverage Target |
|------------|-------|------|:---------------:|
| **Unit** | Services · agents · approval · utilities | Vitest | ≥ 80% |
| **Integration** | Repository · publish pipeline · event flow | Vitest + test DB | ≥ 70% |
| **Agent behaviour** | Agent output quality · brand alignment · safety | Vitest + LLM mock | Per agent |
| **API** | Route handlers · auth · validation · response | Vitest + supertest | ≥ 75% |
| **E2E** | Critical user flows · content-to-publish | Playwright | Critical paths |
| **Connector** | Integration connector mock tests | Vitest + nock | Per connector |

### Critical Test Scenarios

| Scenario | Test Type | Expected |
|----------|-----------|----------|
| Content created → approved → published | E2E | Content live on channel |
| Agent generates content aligned to brand voice | Agent behaviour | Brand consistency score ≥ 90% |
| Cross-tenant data access attempt | Integration | Access denied · empty result |
| Publish failure on one channel | Integration | Partial failure · other channels succeed |
| Budget threshold exceeded | Unit | Alert emitted · campaign paused option |
| Approval rejected → content returned to draft | Integration | Status = draft · notification sent |
| OAuth token expired | Connector | Auto-refresh · or alert on failure |
| Emergency stop activated | Integration | All pending jobs cancelled within 60s |
| Agent confidence low | Agent behaviour | Escalation to human flagged |
| Concurrent publish to same channel | Integration | Queue serialization · no duplicate |

## 11.2 Coverage Requirements

| Component | Minimum Coverage | Measurement |
|-----------|:----------------:|-------------|
| Domain services | 80% | Line coverage |
| Agent implementations | 70% | Line + behaviour |
| Approval engine | 90% | Line coverage |
| Publish pipeline | 85% | Line coverage |
| API route handlers | 75% | Line coverage |
| Repositories | 70% | Line coverage |
| Connectors | 60% | Mock integration |
| **Aurora overall** | **75%** | Weighted average |

## 11.3 Code Review Standards

| Requirement | Rule |
|-------------|------|
| **Review required** | All PRs require 1 approval · 2 for security-sensitive changes |
| **Architecture compliance** | Reviewer verifies A-002 blueprint compliance |
| **Constitutional compliance** | Reviewer verifies A-001 principle adherence |
| **Test coverage** | PR must not decrease coverage below thresholds |
| **No direct LLM calls** | Services must use AgentOrchestrator |
| **No direct channel API calls** | Services must use connectors/publish pipeline |
| **Brand context** | All service methods accept AuroraContext |
| **Event emission** | State changes emit canonical events |
| **Audit logging** | Consequential actions logged |

## 11.4 Documentation Requirements

| Artifact | Required For | Pattern |
|----------|-------------|---------|
| **ES-AURORA-xxx** | Every implementation mission | Engineering specification |
| **ADR-AURORA-xxx** | Significant architecture decisions | Architecture decision record |
| **API documentation** | Every API endpoint | Inline JSDoc + OpenAPI (Phase 2) |
| **Agent prompt documentation** | Every agent | Prompt template comments |
| **Connector documentation** | Every integration | Connector README |
| **Migration documentation** | Every schema change | Migration file comments |
| **Runbook** | Operational procedures | Operations runbook |

## 11.5 Performance Standards

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API response (read)** | < 200ms p95 | APM |
| **API response (write)** | < 500ms p95 | APM |
| **API response (AI generate)** | < 10s p95 | APM |
| **Page load (initial)** | < 2s | Lighthouse |
| **Search query** | < 300ms | APM |
| **Publish job (single channel)** | < 5s | Job metrics |
| **Agent invocation** | < 8s p95 | Agent metrics |
| **Analytics dashboard** | < 1s | APM |
| **Concurrent users per instance** | 10,000 | Load test |

## 11.6 Observability

| Signal | Tool | Aurora Metrics |
|--------|------|---------------|
| **Logging** | Structured JSON · correlation ID | All service · agent · publish actions |
| **Metrics** | Prometheus-compatible | API latency · agent tokens · publish success rate |
| **Tracing** | OpenTelemetry | Request → facade → service → agent → integration |
| **Alerting** | PagerDuty/Opsgenie (enterprise) | Error rate · latency · publish failure |
| **Dashboards** | Grafana | Aurora health · agent utilization · integration status |

### Key Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|:---------------:|
| `aurora_api_error_rate` | 5xx responses / total | > 1% |
| `aurora_publish_success_rate` | Successful publishes / attempts | < 95% |
| `aurora_agent_invocation_latency_p95` | 95th percentile agent response time | > 10s |
| `aurora_agent_token_usage` | Tokens consumed per tenant per hour | Tier quota × 90% |
| `aurora_integration_health` | Healthy connectors / total connectors | < 80% |
| `aurora_approval_queue_depth` | Pending approvals | > 100 per tenant |
| `aurora_publish_queue_depth` | Pending publish jobs | > 500 |

---

# 12. Engineering Roadmap

## 12.1 Phase Overview

| Phase | Timeline | Theme | Missions | Key Deliverable |
|-------|----------|-------|:--------:|----------------|
| **Phase 1** | Months 1–6 | Foundation | A-003–A-014 | Aurora v1.0 — core platform + 5 modules + agents |
| **Phase 2** | Months 7–12 | Growth | A-015–A-026 | Aurora v2.0 — all modules + agency tier |
| **Phase 3** | Months 13–24 | Scale | A-027–A-036 | Aurora v3.0 — enterprise + marketplace + API |

## 12.2 Phase 1 — Foundation (A-003–A-014)

| Mission | Title | Dependencies | Duration | Critical |
|---------|-------|-------------|----------|:--------:|
| **A-003** | Aurora Platform Foundation | A-002 | 3 weeks | ✅ |
| **A-004** | Content Studio v1 | A-003 | 3 weeks | ✅ |
| **A-005** | Creative Studio v1 | A-003 | 2 weeks | |
| **A-006** | SEO Engine v1 | A-003 | 2 weeks | |
| **A-007** | Social Media Manager v1 | A-003 · A-004 | 3 weeks | ✅ |
| **A-008** | Analytics v1 | A-003 | 2 weeks | |
| **A-009** | Marketing Planner v1 | A-003 | 2 weeks | |
| **A-010** | Knowledge Base v1 | A-003 | 2 weeks | ✅ |
| **A-011** | Google Integrations | A-003 · A-006 · A-008 | 3 weeks | ✅ |
| **A-012** | Meta Integrations | A-003 · A-007 | 2 weeks | ✅ |
| **A-013** | Agent Orchestration v1 | A-003 · A-010 | 4 weeks | ✅ |
| **A-014** | ORION Platform Integration | A-003 · A-008 · A-013 | 2 weeks | ✅ |

### Phase 1 Critical Path

```
A-002 (Blueprint)
    ↓
A-003 (Platform Foundation) ← CRITICAL PATH START
    ↓
    ├── A-010 (Knowledge Base) ← needed by agents
    │       ↓
    │   A-013 (Agent Orchestration) ← CRITICAL PATH
    │       ↓
    ├── A-004 (Content Studio)
    │       ↓
    │   A-007 (Social Media Manager)
    │       ↓
    │   A-012 (Meta Integrations)
    │
    ├── A-008 (Analytics)
    │       ↓
    │   A-011 (Google Integrations)
    │       ↓
    │   A-014 (ORION Integration) ← CRITICAL PATH END
    │
    ├── A-005 (Creative Studio)
    ├── A-006 (SEO Engine)
    └── A-009 (Marketing Planner)
```

**Critical path duration:** A-003 (3w) → A-010 (2w) → A-013 (4w) → A-004 (3w) → A-007 (3w) → A-012 (2w) → A-008 (2w) → A-011 (3w) → A-014 (2w) = **~24 weeks**

## 12.3 Phase 2 — Growth (A-015–A-026)

| Mission | Title | Dependencies | Duration |
|---------|-------|-------------|----------|
| **A-015** | Advertising Studio v1 | A-003 · A-011 · A-012 | 4 weeks |
| **A-016** | Email Marketing v1 | A-003 · A-004 | 3 weeks |
| **A-017** | WhatsApp Campaigns v1 | A-003 · A-012 | 2 weeks |
| **A-018** | Google Business Manager v1 | A-003 · A-011 | 2 weeks |
| **A-019** | LinkedIn Integration | A-003 · A-007 | 2 weeks |
| **A-020** | Shopify Integration | A-003 · A-008 | 2 weeks |
| **A-021** | WordPress Integration | A-003 · A-004 · A-006 | 2 weeks |
| **A-022** | Canva Integration | A-003 · A-005 | 2 weeks |
| **A-023** | Multi-Language Content | A-004 · A-013 | 3 weeks |
| **A-024** | Agency Tier | A-003 · A-008 | 4 weeks |
| **A-025** | Campaign Optimizer Agent | A-013 · A-015 | 3 weeks |
| **A-026** | Advanced Analytics | A-008 · A-015 | 3 weeks |

## 12.4 Phase 3 — Scale (A-027–A-036)

| Mission | Title | Dependencies |
|---------|-------|-------------|
| **A-027** | Enterprise Tier (SSO · SAML · data residency) | A-003 |
| **A-028** | White-Label Platform | A-024 |
| **A-029** | Marketplace | A-027 |
| **A-030** | Advanced AI (predictive · autonomous) | A-025 · A-026 |
| **A-031** | Additional Social (Pinterest · YouTube · TikTok) | A-007 |
| **A-032** | Extended Integrations (WooCommerce · HubSpot · Salesforce) | A-020 |
| **A-033** | Native Email Sending | A-016 |
| **A-034** | Video Content | A-005 |
| **A-035** | Competitive Intelligence | A-010 · A-026 |
| **A-036** | API Platform | A-027 |

## 12.5 Mission Sequencing Rules

| Rule | Description |
|------|-------------|
| **MS-1** | A-003 (Foundation) must complete before any other mission |
| **MS-2** | A-010 (Knowledge Base) must complete before A-013 (Agents) |
| **MS-3** | A-013 (Agents) must complete before any AI-powered module |
| **MS-4** | A-014 (ORION Integration) should complete at end of Phase 1 |
| **MS-5** | Integration missions require A-003 + relevant module |
| **MS-6** | Each mission produces ES-AURORA-xxx specification before coding |
| **MS-7** | Each mission requires Verification Hierarchy pass before closure |

## 12.6 Dependencies on ORION Platform

| ORION Capability | Required For | ORION Status | Aurora Impact |
|-----------------|-------------|:------------:|---------------|
| Identity (ES-009) | All Aurora auth | Partial | Can proceed with placeholder · upgrade later |
| PlatformStore (ES-010) | All persistence | Partial | In-memory first · PostgreSQL target |
| Event Bus (ES-033) | Aurora events | Partial | In-memory bus sufficient for Phase 1 |
| AI Layer (ES-039) | Agent orchestration | Architecture only | Aurora builds agent layer on ORION contracts |
| Notifications (ES-011) | Approval · publish alerts | Planned | Aurora builds notification triggers · ORION dispatches |
| Search (ES-011) | Entity search | Partial | Client-side index sufficient for Phase 1 |
| Executive Provider (ADR-006) | ORION Brief integration | Delivered | Pattern proven · Aurora replicates |
| Gate 7 PostgreSQL | Production persistence | In progress | Aurora targets PostgreSQL from A-003 |

---

# 13. Executive Closing Statement

## 13.1 Engineering Readiness

| Dimension | Assessment | Evidence |
|-----------|:----------:|---------|
| **Architecture completeness** | ✅ Complete | 13 sections · 6 appendices · full layer model |
| **ORION alignment** | ✅ Verified | Mirrors HCM/CRM/Finance patterns · uses PlatformStore · Event Bus · Executive Provider |
| **Domain design** | ✅ Complete | 9 bounded domains · entity models · business rules |
| **AI orchestration design** | ✅ Complete | 10 agents · orchestrator · context · memory · approval |
| **Security design** | ✅ Complete | 7 security layers · RBAC · tenant isolation · audit |
| **Integration design** | ✅ Complete | 14 connectors · ORION services · connector contract |
| **Quality standards** | ✅ Complete | Testing · coverage · review · performance · observability |
| **Roadmap** | ✅ Complete | 36 missions · critical path · dependencies |

## 13.2 Architecture Verdict

### **APPROVED — READY FOR A-003 MISSION INITIATION**

| Field | Verdict |
|-------|---------|
| **Blueprint status** | Ratified |
| **Engineering authorization** | A-003 Aurora Platform Foundation authorized |
| **Risk assessment** | Moderate — AI orchestration and publish pipeline are novel within ORION but architecturally sound |
| **Blockers** | None — Aurora Phase 1 can proceed in parallel with ORION Gate 7 |
| **Critical path** | A-003 → A-010 → A-013 → A-004 → A-007 → A-012 → A-008 → A-011 → A-014 |

## 13.3 Approval Matrix

| Role | Name | Decision | Date |
|------|------|:--------:|------|
| **Founder & Chief Architect** | Mohammad Shafi Goroo | ✅ APPROVED | 7 August 2026 |
| **Aurora Architecture Review Board** | — | ✅ APPROVED | 7 August 2026 |
| **ORION Chief Enterprise Architect** | — | ✅ APPROVED | 7 August 2026 |
| **Security Review** | — | ✅ APPROVED (design) | 7 August 2026 |

### Authorization

| Authorization | Status |
|---------------|:------:|
| A-003 Platform Foundation mission | **AUTHORIZED** |
| A-004–A-014 Phase 1 missions | **AUTHORIZED** (sequenced per §12.2) |
| ES-AURORA-003 specification | **AUTHORIZED TO DRAFT** |
| Aurora domain folder creation | **AUTHORIZED** |
| Aurora composition root implementation | **AUTHORIZED** (A-003 scope) |

---

### Mohammad Shafi Goroo

Founder & Chief Architect

ORION Enterprise Platform · Project Aurora

7 August 2026

---

# Appendices

## Appendix A — Folder Standards

### File Placement Rules

| Content Type | Location | Example |
|-------------|----------|---------|
| UI page | `app/(platform)/aurora/{module}/page.tsx` | Content list page |
| UI component | `components/aurora/{module}/` | `ContentEditor.tsx` |
| API route | `app/api/aurora/{domain}/route.ts` | Content API |
| Domain service | `lib/aurora/{domain}/services/` | `ContentService.ts` |
| Repository | `lib/aurora/{domain}/repositories/` | `ContentRepository.ts` |
| Agent | `lib/aurora/agents/agents/` | `CopywriterAgent.ts` |
| Agent prompt | `lib/aurora/agents/prompts/` | `agent.copywriter.v1.ts` |
| Connector | `lib/aurora/integrations/{provider}/` | `GoogleAdsConnector.ts` |
| Event handler | `lib/aurora/events/handlers/` | `onContentApproved.ts` |
| Type definition | `types/aurora-{domain}.ts` | `aurora-content.ts` |
| Unit test | `tests/aurora/unit/{domain}/` | `ContentService.test.ts` |
| Integration test | `tests/aurora/integration/` | `publish-pipeline.test.ts` |
| Agent test | `tests/aurora/agent-behaviour/` | `copywriter.test.ts` |
| E2E test | `tests/aurora/e2e/` | `content-to-publish.test.ts` |
| Documentation | `docs/AURORA/` | `ES-AURORA-004-*.md` |

### Prohibited Placements

| Prohibition | Rationale |
|-------------|-----------|
| Business logic in `app/` routes | Clean Architecture violation |
| Business logic in `components/` | Presentation layer only |
| Direct LLM calls outside `lib/aurora/agents/` | Agent orchestration bypass |
| Direct external API calls outside `lib/aurora/integrations/` | Connector pattern bypass |
| Aurora types outside `types/aurora-*` or `lib/aurora/types.ts` | Type discoverability |
| Aurora tests outside `tests/aurora/` | Test organization |

---

## Appendix B — Naming Conventions

### Extends A-001 Appendix E

| Element | Convention | Example |
|---------|-----------|---------|
| **Mission doc** | `A-xxx-{Title}.md` | `A-003-Platform-Foundation.md` |
| **Engineering spec** | `ES-AURORA-xxx-{Title}.md` | `ES-AURORA-004-Content-Studio.md` |
| **ADR** | `ADR-AURORA-xxx-{Title}.md` | `ADR-AURORA-001-Agent-Orchestration.md` |
| **Service class** | `{Domain}Service` | `ContentService` |
| **Repository class** | `{Domain}Repository` | `ContentRepository` |
| **Agent class** | `{Role}Agent` | `CopywriterAgent` |
| **Connector class** | `{Platform}Connector` | `GoogleAdsConnector` |
| **Publisher class** | `{Channel}Publisher` | `FacebookPublisher` |
| **Event handler** | `on{EventAction}` | `onContentApproved` |
| **Database table** | `aurora_{snake_case}` | `aurora_content` |
| **Event name** | `aurora.{domain}.{action}` | `aurora.content.published` |
| **Agent codename** | `agent.{role}` | `agent.copywriter` |
| **API route** | `/api/aurora/{domain}/{resource}` | `/api/aurora/content/generate` |
| **UI route** | `/aurora/{module}` | `/aurora/content` |
| **Error code** | `AURORA_ERR_{HTTP_STATUS}{SEQ}` | `AURORA_ERR_0403` |
| **Prompt file** | `agent.{role}.v{version}.ts` | `agent.copywriter.v1.ts` |
| **Test file** | `{Component}.test.ts` | `ContentService.test.ts` |
| **Migration file** | `{timestamp}_{description}.sql` | `20260807_create_aurora_content.sql` |

---

## Appendix C — Coding Standards

### TypeScript Standards

| Standard | Rule |
|----------|------|
| **Strict mode** | `strict: true` in tsconfig |
| **No `any`** | Use `unknown` + type guards |
| **Readonly** | Prefer `readonly` for immutable properties |
| **Interfaces over types** | For public contracts |
| **Explicit return types** | On all public methods |
| **No default exports** | Named exports only (except Next.js pages) |
| **Barrel exports** | `index.ts` per module folder |

### Error Handling

```typescript
class AuroraError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode: number = 500,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

// Usage
throw new AuroraError('AURORA_ERR_0403', 'Brand access denied', 403);
```

### Service Method Pattern

```typescript
class ContentService {
  constructor(
    private readonly contentRepo: ContentRepository,
    private readonly orchestrator: AgentOrchestrator,
    private readonly approvalService: ApprovalService,
    private readonly eventPublisher: AuroraEventPublisher,
    private readonly auditService: AuditService,
  ) {}

  async generateDraft(ctx: AuroraContext, brief: ContentBrief): Promise<Content> {
    assertBrandAccess(ctx, brief.brandId);
    const agentOutput = await this.orchestrator.invoke(ctx, {
      agentCodename: 'agent.copywriter',
      task: { type: 'content.generate', payload: brief },
    });
    const content = await this.contentRepo.create(ctx, {
      ...brief,
      body: agentOutput.result as string,
      source: 'agent',
      agentCodename: 'agent.copywriter',
      status: 'draft',
    });
    await this.auditService.log(ctx, 'content.created', content.id);
    this.eventPublisher.publish({
      type: 'aurora.content.created',
      tenantId: ctx.tenantId,
      brandId: ctx.brandId,
      payload: { contentId: content.id },
    });
    return content;
  }
}
```

---

## Appendix D — Event Catalogue

| # | Event | Payload | Emitter | Consumers |
|---|-------|---------|---------|-----------|
| 1 | `aurora.campaign.created` | campaignId · name · objective · budget | CampaignService | Analytics · Notifications |
| 2 | `aurora.campaign.launched` | campaignId · channels · startDate | CampaignService | Analytics · Notifications |
| 3 | `aurora.campaign.paused` | campaignId · reason | CampaignService | Analytics · Notifications |
| 4 | `aurora.campaign.completed` | campaignId · finalMetrics | CampaignService | Analytics · Advisor |
| 5 | `aurora.campaign.archived` | campaignId | CampaignService | Audit |
| 6 | `aurora.content.created` | contentId · type · brandId | ContentService | Search index |
| 7 | `aurora.content.updated` | contentId · version | ContentService | Search index |
| 8 | `aurora.content.submitted` | contentId · approverIds | ContentService | Notification |
| 9 | `aurora.content.approved` | contentId · approverId | ApprovalService | PublishPipeline |
| 10 | `aurora.content.rejected` | contentId · approverId · reason | ApprovalService | Notification |
| 11 | `aurora.content.published` | contentId · channel · url | PublishPipeline | Analytics · CRM |
| 12 | `aurora.creative.created` | creativeId · type | CreativeService | Search index |
| 13 | `aurora.creative.approved` | creativeId · approverId | ApprovalService | — |
| 14 | `aurora.creative.updated` | creativeId · version | CreativeService | — |
| 15 | `aurora.publish.started` | jobId · contentId · channels | PublishPipeline | — |
| 16 | `aurora.publish.completed` | jobId · results | PublishPipeline | Notification |
| 17 | `aurora.publish.failed` | jobId · channel · error | PublishPipeline | Notification |
| 18 | `aurora.social.post.scheduled` | postId · channel · scheduledAt | SocialPostService | ScheduleService |
| 19 | `aurora.social.post.published` | postId · channel · url | PublishPipeline | Analytics |
| 20 | `aurora.social.engagement.received` | postId · type · data | WebhookReceiver | Notification |
| 21 | `aurora.ad.campaign.created` | adCampaignId · platform | AdCampaignService | Analytics |
| 22 | `aurora.ad.spend.updated` | campaignId · channel · amount | AdCampaignService | BudgetService |
| 23 | `aurora.ad.optimization.applied` | campaignId · action · result | CampaignOptimizer | Analytics |
| 24 | `aurora.ad.campaign.paused` | adCampaignId · reason | AdCampaignService | Notification |
| 25 | `aurora.email.campaign.sent` | emailCampaignId · recipientCount | EmailCampaignService | Analytics |
| 26 | `aurora.email.campaign.opened` | emailCampaignId · stats | WebhookReceiver | Analytics |
| 27 | `aurora.email.list.updated` | listId · count | EmailListService | — |
| 28 | `aurora.analytics.snapshot` | brandId · metrics · period | AnalyticsIngestion | ExecutiveProvider |
| 29 | `aurora.analytics.anomaly.detected` | brandId · metric · deviation | AnalyticsIngestion | Notification · Agent |
| 30 | `aurora.analytics.report.generated` | reportId · type | AnalyticsReportService | Notification |
| 31 | `aurora.agent.invoked` | agentCodename · taskType · sessionId | AgentOrchestrator | Audit |
| 32 | `aurora.agent.recommendation` | agentCodename · recommendation · confidence | Agent | Notification |
| 33 | `aurora.agent.escalation` | agentCodename · reason · sessionId | AgentOrchestrator | Notification |
| 34 | `aurora.approval.requested` | approvalId · entityType · entityId · approverIds | ApprovalService | Notification |
| 35 | `aurora.approval.granted` | approvalId · approverId | ApprovalService | Domain handler |
| 36 | `aurora.approval.denied` | approvalId · approverId · reason | ApprovalService | Notification |
| 37 | `aurora.integration.connected` | providerId · brandId · accountId | ConnectorRegistry | Audit |
| 38 | `aurora.integration.disconnected` | providerId · brandId · reason | ConnectorRegistry | Audit · Notification |
| 39 | `aurora.integration.sync.completed` | providerId · brandId · recordCount | Connector | Analytics |
| 40 | `aurora.admin.brand.created` | brandId · name | BrandService | Search index |
| 41 | `aurora.admin.settings.changed` | setting · before · after | SettingsService | Audit |
| 42 | `aurora.budget.threshold.exceeded` | campaignId · threshold · current | BudgetService | Notification |

---

## Appendix E — Agent Catalogue

| # | Codename | Class | Phase | Primary Tasks | Authority |
|---|----------|-------|-------|--------------|-----------|
| 1 | `agent.director` | MarketingDirectorAgent | 1 | Strategy · orchestration · briefing | Propose |
| 2 | `agent.strategist` | ContentStrategistAgent | 1 | Editorial planning · topic selection | Propose |
| 3 | `agent.copywriter` | CopywriterAgent | 1 | Content generation · copy variants | Generate |
| 4 | `agent.creative` | CreativeDirectorAgent | 1 | Visual concept · creative brief | Propose |
| 5 | `agent.seo` | SeoSpecialistAgent | 1 | Keyword research · optimization · audit | Propose |
| 6 | `agent.ads` | AdvertisingManagerAgent | 2 | Campaign proposal · audience · budget | Propose |
| 7 | `agent.social` | SocialMediaManagerAgent | 1 | Posting strategy · engagement · hashtags | Propose |
| 8 | `agent.analytics` | AnalyticsManagerAgent | 1 | Performance analysis · anomaly · reports | Generate |
| 9 | `agent.optimizer` | CampaignOptimizerAgent | 2 | Bid · budget · A/B · scaling | Propose/Execute* |
| 10 | `agent.advisor` | ExecutiveAdvisorAgent | 1 | Executive briefing · strategic advice | Advise |

*Execute only within configured Tier 3 automation guardrails.

---

## Appendix F — Mission Register

| Mission | Title | Phase | ES Spec | Status |
|---------|-------|-------|---------|--------|
| **A-001** | Aurora Constitution | Foundation | — | ✅ Ratified |
| **A-002** | Enterprise Engineering Blueprint | Foundation | — | ✅ Ratified |
| **A-003** | Aurora Platform Foundation | 1 | ES-AURORA-003 | Authorized |
| **A-004** | Content Studio v1 | 1 | ES-AURORA-004 | Planned |
| **A-005** | Creative Studio v1 | 1 | ES-AURORA-005 | Planned |
| **A-006** | SEO Engine v1 | 1 | ES-AURORA-006 | Planned |
| **A-007** | Social Media Manager v1 | 1 | ES-AURORA-007 | Planned |
| **A-008** | Analytics v1 | 1 | ES-AURORA-008 | Planned |
| **A-009** | Marketing Planner v1 | 1 | ES-AURORA-009 | Planned |
| **A-010** | Knowledge Base v1 | 1 | ES-AURORA-010 | Planned |
| **A-011** | Google Integrations | 1 | ES-AURORA-011 | Planned |
| **A-012** | Meta Integrations | 1 | ES-AURORA-012 | Planned |
| **A-013** | Agent Orchestration v1 | 1 | ES-AURORA-013 | Planned |
| **A-014** | ORION Platform Integration | 1 | ES-AURORA-014 | Planned |
| **A-015** | Advertising Studio v1 | 2 | ES-AURORA-015 | Planned |
| **A-016** | Email Marketing v1 | 2 | ES-AURORA-016 | Planned |
| **A-017** | WhatsApp Campaigns v1 | 2 | ES-AURORA-017 | Planned |
| **A-018** | Google Business Manager v1 | 2 | ES-AURORA-018 | Planned |
| **A-019** | LinkedIn Integration | 2 | ES-AURORA-019 | Planned |
| **A-020** | Shopify Integration | 2 | ES-AURORA-020 | Planned |
| **A-021** | WordPress Integration | 2 | ES-AURORA-021 | Planned |
| **A-022** | Canva Integration | 2 | ES-AURORA-022 | Planned |
| **A-023** | Multi-Language Content | 2 | ES-AURORA-023 | Planned |
| **A-024** | Agency Tier | 2 | ES-AURORA-024 | Planned |
| **A-025** | Campaign Optimizer Agent | 2 | ES-AURORA-025 | Planned |
| **A-026** | Advanced Analytics | 2 | ES-AURORA-026 | Planned |
| **A-027** | Enterprise Tier | 3 | ES-AURORA-027 | Planned |
| **A-028** | White-Label Platform | 3 | ES-AURORA-028 | Planned |
| **A-029** | Marketplace | 3 | ES-AURORA-029 | Planned |
| **A-030** | Advanced AI | 3 | ES-AURORA-030 | Planned |
| **A-031** | Additional Social Integrations | 3 | ES-AURORA-031 | Planned |
| **A-032** | Extended Integrations | 3 | ES-AURORA-032 | Planned |
| **A-033** | Native Email Sending | 3 | ES-AURORA-033 | Planned |
| **A-034** | Video Content | 3 | ES-AURORA-034 | Planned |
| **A-035** | Competitive Intelligence | 3 | ES-AURORA-035 | Planned |
| **A-036** | API Platform | 3 | ES-AURORA-036 | Planned |

---

## Document Approval

| Field | Value |
|-------|-------|
| **Document** | A-002 — Aurora Enterprise Engineering Blueprint |
| **Version** | 1.0 |
| **Status** | Ratified |
| **Approved By** | Mohammad Shafi Goroo — Founder & Chief Architect |
| **Date** | 7 August 2026 |
| **Classification** | Enterprise Engineering Blueprint · Authoritative Engineering Reference |
| **Next Mission** | A-003 — Aurora Platform Foundation |
| **Next Review** | Upon A-003 completion or significant architecture amendment |

---

### Project Aurora

*AI Marketing Operating System · Powered by ORION*

**Let's build something remarkable.**

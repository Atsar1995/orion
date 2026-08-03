# ADR-015 — Domain Service Boundaries

**Identifier:** ADR-015  
**Mission:** ADR-015 — Domain Service Boundaries  
**Program:** P-016 — ORION Enterprise Platform v2.0  
**Status:** Proposed  
**Date:** 2026-08-02  
**Authors:** Chief Enterprise Architect · Platform Engineering Lead · HCM Domain Lead · Finance Domain Lead  
**Reviewers:** Architecture Review Board · Security Architect · CRM Domain Lead  
**Version:** 1.0  
**Architecture Baseline:** v1.0 GA Candidate → v2.0 Multi-Domain Baseline

**Builds on:** [ADR-013 Durable IIL](./ADR-013-Durable-Intelligent-Integration-Layer.md) · [ADR-014 Cross-Domain Event Contracts](./ADR-014-Cross-Domain-Event-Contracts.md) · [P-016.2 Architecture Charter](../../00_Governance/P-016.2-ORION-v2-Architecture-Charter.md) · [Architecture Handbook v1.0](../../00_Governance/ORION_Enterprise_Architecture_Handbook_v1.0.md)  
**Enables:** [ES-FIN-002 Finance Engineering Specification](../../Finance/Engineering/ES-FIN-002-Finance-Engineering-Specification.md) · P-009 Gate 5 · P-008 CRM Phase II · P-016.3 ADR Program  
**Related:** [ES-097 ADR Policy](../../00_Governance/ES-097-ORION-Architecture-Governance-ADR-Policy.md) · [ES-HCM-001 Reference Domain](../../HCM/Engineering/ES-HCM-001_Enterprise_HCM_Engineering_Specification.md) · [P-009.2 Finance Domain Model](../../Finance/Architecture/P-009.2-Finance-Domain-Model.md) · [ADR-020 Versioning & Domain Compatibility](./ADR-020-Versioning-Domain-Compatibility.md) *(planned)*

---

## Decision Summary

ORION adopts **constitutional domain service boundaries** — explicit bounded contexts, ownership rules, dependency law, and communication patterns for every authoritative domain and platform service.

Each domain owns its aggregates, repositories, and business rules. Cross-domain **authoritative integration** occurs **only through the durable IIL** ([ADR-013](./ADR-013-Durable-Intelligent-Integration-Layer.md)) with **governed event contracts** ([ADR-014](./ADR-014-Cross-Domain-Event-Contracts.md)). Direct cross-domain repository access, internal module imports, and synchronous cross-domain mutation are **forbidden**.

The **HCM reference domain** ([ES-HCM-001](../../HCM/Engineering/ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)) is the replication template for Finance, CRM, Hospitality, and Operations.

**Implementation is deferred** until this ADR reaches **Accepted** status. This record defines constitutional architecture only — no APIs, no service code, no implementation authorization.

---

## 1. Context

### 1.1 Why Explicit Service Boundaries Are Required

ORION v2.0 extends a **production-certified platform** (HCM reference domain, PlatformStore, RBAC, in-process IIL) into a **multi-domain authoritative Executive Operating System**. [P-016.2](../../00_Governance/P-016.2-ORION-v2-Architecture-Charter.md) commits to:

- **Replicate, do not reinvent** — every authoritative domain follows the HCM reference pattern
- **Finance is the hub** — workforce cost, revenue, and folio events converge on Finance via IIL
- **Event-driven integration** — no direct repository reads across domain boundaries
- **Governance before Gate 5** — boundary law ratified before domain implementation

Without explicit service boundaries, domains couple through shared stores, cross-imports, and ad-hoc synchronous calls. Financial truth diverges from operational truth. CRM pre-handbook patterns persist alongside HCM reference architecture. Certification cannot prove isolation. Gate 5 work proceeds without constitutional law.

### 1.2 Problems Solved

| Problem | Current / Risk State | ADR-015 Resolution |
|---------|---------------------|-------------------|
| **Cross-domain repository reads** | Finance, CRM, Hospitality risk direct store access | Forbidden · IIL-only integration |
| **Facade bypass** | External code imports internal repositories | Single public facade per domain |
| **Inconsistent layering** | CRM pre-handbook patterns differ from HCM | HCM reference replication law |
| **Synchronous cross-domain mutation** | Implicit service-to-service calls | IIL events + idempotent consumers |
| **Unclear ownership** | Who owns employee vs journal vs folio | System-of-record matrix |
| **Platform/domain blur** | Domain logic in platform or vice versa | Service classification |
| **Finance Gate 5 blocked** | ES-FIN-002 requires boundary ADR | Constitutional boundary standard |
| **Certification gap** | No architecture tests for import law | Boundary compliance certification |

### 1.3 Architecture Goals

| Goal | Measure |
|------|---------|
| **Domain autonomy** | Each domain evolves independently within its bounded context |
| **Financial integrity** | Finance receives business facts via IIL; owns all ledger mutations |
| **Reference replication** | Finance · CRM · Hospitality conform to HCM facade/repository pattern |
| **Platform reuse** | Identity · IIL · Workflow · PlatformStore · RBAC consumed — not duplicated |
| **Auditability** | Every cross-domain state change traceable via IIL correlation |
| **Certification evidence** | Architecture tests prove import law at Gate 5–6 |
| **AI-safe boundaries** | Explicit rules prevent agent-improvised cross-domain coupling |

### 1.4 Architectural Baseline

| Document | Relevance |
|----------|-----------|
| [ADR-013](./ADR-013-Durable-Intelligent-Integration-Layer.md) | Sole cross-domain event transport |
| [ADR-014](./ADR-014-Cross-Domain-Event-Contracts.md) | Cross-domain contract law |
| [P-016.2 §2.1](../../00_Governance/P-016.2-ORION-v2-Architecture-Charter.md) | Commitment A1 · A3 · event-driven principle |
| [P-009.2 §2–3](../../Finance/Architecture/P-009.2-Finance-Domain-Model.md) | Finance bounded context · context map |
| [ES-HCM-001 §4–5](../../HCM/Engineering/ES-HCM-001_Enterprise_HCM_Engineering_Specification.md) | HCM layered architecture · facade law |
| [HCM Dependency Matrix](../../HCM/Engineering/HCM-Dependency-Matrix.md) | Layer import matrix reference |
| [Handbook §3](../../00_Governance/ORION_Enterprise_Architecture_Handbook_v1.0.md) | Bounded contexts · domain independence |
| [ES-097](../../00_Governance/ES-097-ORION-Architecture-Governance-ADR-Policy.md) | ADR lifecycle · Gate 4 before Gate 5 |

---

## 2. Problem Statement

ADR-013 defines **how** events are delivered. ADR-014 defines **what** event contracts contain. Neither defines **who owns which services**, **which dependencies are permitted**, or **how domains may communicate**.

Without ADR-015:

- **Finance Gate 5 is blocked** — ES-FIN-002 EC-001/EC-008 require domain boundary law
- **CRM facade convergence lacks constitutional basis** — pre-handbook patterns persist
- **Hospitality isolation undefined** — folio authority vs Finance financial truth unclear
- **Intelligence may bypass events** — direct repository reads for Brief signals
- **Platform duplication risk** — domains rebuild identity, workflow, or persistence locally
- **TD-DOMAIN-PERSIST-001** remains architectural debt without boundary resolution

This ADR resolves the **boundary** question. It does **not** authorize implementation until Accepted.

---

## 3. Decision

ORION adopts **constitutional domain service boundaries** governing all authoritative domains and platform services.

### 3.1 Domain Ownership

Each authoritative domain is a **bounded context** owning:

| Owned Asset | Rule |
|-------------|------|
| **Aggregates** | Domain owns aggregate roots and invariants |
| **Repositories** | Domain owns persistence contracts and implementations |
| **Business rules** | Domain owns rules engines and domain services |
| **Public facade** | Single entry point — e.g. `hcmFacade`, `financeService`, `crmService` |
| **Event catalogue** | Domain owns published and subscribed IIL contracts |
| **REST namespace** | Domain owns `app/api/<domain>/` |
| **Types** | Domain owns `types/<domain>/` or `types/<domain>-*.ts` |
| **Package** | Domain owns `lib/<domain>/` |

**System of record (authoritative ownership):**

| Data / Capability | Owning Domain |
|-------------------|---------------|
| Employee · payroll · workforce cost | **HCM** |
| GL · journals · fiscal periods · financial invoices | **Finance** |
| CRM account · opportunity · pipeline | **CRM** |
| Guest folio · reservation · hospitality operations | **Hospitality** |
| Purchase orders · inventory · operational cost *(future)* | **Operations** |
| Executive Brief · KPI synthesis · alert composition | **Intelligence** |
| Identity · IIL · Workflow · PlatformStore · RBAC · Observability | **Platform** |

**Cross-domain references:** Identifier only (`partyId`, `employeeId`, `folioId`) — never embedded authoritative snapshots from foreign domains.

### 3.2 Allowed Dependencies

| Dependency | From | To | Pattern |
|------------|------|-----|---------|
| **Platform services** | Any domain | Platform (`lib/platform/`) | Direct import of published platform APIs |
| **Domain public facade** | Presentation · Application | Domain facade | Read and mutate **within owning domain context** |
| **IIL publish** | Domain | Platform IIL | Material lifecycle transitions |
| **IIL subscribe** | Domain | Platform IIL | Registered contracts only (ADR-014) |
| **ServiceContext** | All | Platform Identity | Shared kernel — org scope |
| **Workflow triggers** | Domain | Platform Workflow | Domain-defined bindings only |
| **Internal layering** | Within domain | Adjacent layer only | API → Facade → Service → Repository → Store |

### 3.3 Forbidden Dependencies

| Dependency | Rule | Rationale |
|------------|------|-----------|
| **Cross-domain repository import** | **Forbidden** | Violates bounded context · bypasses IIL |
| **Cross-domain store access** | **Forbidden** | No direct SQL/API to foreign domain persistence |
| **Cross-domain internal module import** | **Forbidden** | Must use public facade or IIL |
| **Cross-domain synchronous mutation** | **Forbidden** | Authoritative state change via IIL only |
| **Foreign business rules in domain** | **Forbidden** | Each domain owns its invariants |
| **API → Repository skip** | **Forbidden** | Layer inversion |
| **Domain → Presentation import** | **Forbidden** | Dependency direction violation |
| **Intelligence → Domain repository** | **Forbidden** | Intelligence consumes events · not stores |
| **Shared mutable cross-domain static data** | **Forbidden** | Per G-001 · handbook §3.3 |

### 3.4 Communication Patterns

| Pattern | Scope | Mechanism | Use Case |
|---------|-------|-----------|----------|
| **Intra-domain** | Same bounded context | Facade → Service → Repository | All domain operations |
| **Cross-domain authoritative** | Domain ↔ Domain | **IIL events only** (ADR-013 · ADR-014) | HCM cost → Finance GL · CRM won → Finance |
| **Cross-domain read (presentation)** | UI · Executive Shell | **Restricted** — multiple facade read calls | Dashboard composition · no cross-domain mutation |
| **Platform orchestration** | Platform → Domain | Workflow · IIL delivery · scheduled jobs | Approval flows · event routing |
| **Downstream intelligence** | Domain → Intelligence | IIL outbound events | KPI · Brief · alerts |
| **External integration** | External ↔ Domain | Integration Hub *(future ADR-018)* | ERP · bank feeds — not repository reads |

**Finance hub pattern:** Upstream domains (HCM · CRM · Hospitality · Operations) publish **business events**. Finance **Financial Event Processor** validates, transforms (anti-corruption), and posts. Finance publishes **financial · accounting · intelligence events** downstream. Upstream domains **do not** write Finance aggregates.

### 3.5 Public Services

**Public domain services** are the **only** cross-package entry points for external consumers:

| Domain | Public Service | Package Export |
|--------|----------------|----------------|
| **HCM** | `hcmFacade` | `@/lib/hcm` |
| **Finance** | `financeService` | `@/lib/finance` |
| **CRM** | `crmService` | `@/lib/crm` |
| **Hospitality** | `hospitalityService` | `@/lib/hospitality` |
| **Operations** | `operationsService` *(future)* | `@/lib/operations` |
| **Intelligence** | `intelligenceService` | `@/lib/intelligence` |
| **Platform IIL** | Event publish/subscribe APIs | `@/lib/platform/intelligence` |
| **Platform Identity** | `ServiceContext` resolution | `@/lib/decisions/server-context` |

**Public service rules:**

- Every method accepts organization-scoped `ServiceContext`
- Repositories · stores · wiring · rules engines are **not exported**
- Facade methods map to domain use cases — not persistence primitives
- Breaking facade changes require ADR per ES-097 · ADR-020

### 3.6 Internal Services

**Internal domain services** exist within `lib/<domain>/` and are **not** importable outside the bounded context:

| Internal Component | Visibility | May Be Imported By |
|--------------------|------------|-------------------|
| Business services | Domain-internal | Facade wiring · peer services (same domain) |
| Repository interfaces | Domain-internal | Services · facade wiring |
| Repository implementations | Domain-internal | Wiring only |
| Rules engines | Domain-internal | Services |
| In-memory / persistent stores | Domain-internal | Repository implementations |
| Domain event mappers | Domain-internal | IIL publishers · inbound processors |

### 3.7 Shared Platform Services

All domains **consume** shared platform services — **never reimplement**:

| Platform Service | Responsibility | Domain Usage |
|------------------|----------------|--------------|
| **PlatformStore** (ADR-007) | Authoritative persistence adapter | Domain persister modules |
| **IIL** (ADR-013) | Cross-domain event transport | Publish · subscribe |
| **Identity / ServiceContext** (ADR-008) | Tenant · actor context | Every operation |
| **RBAC** (ADR-009) | Permission enforcement | REST APIs · sensitive operations |
| **Workflow** (ADR-016) | Approval orchestration | Domain trigger bindings |
| **Observability** (ADR-011) | Health · logging · metrics | All services |
| **Configuration** (ADR-010) | Secrets · environment | Platform and domain bootstrap |

**Rule:** Domains register in **ServiceRegistry** (ADR-013) before IIL publish. Platform services do **not** contain domain business rules.

---

## 4. Domain Boundary Matrix

Legend:

| Symbol | Meaning |
|--------|---------|
| **●** | Direct allowed — platform service consumption or intra-domain |
| **⇄ IIL** | Cross-domain communication **must** use IIL (ADR-013 · ADR-014) |
| **⬤ ACL** | Anti-corruption layer — consumer validates/transforms inbound IIL |
| **△ Read** | Restricted read-only facade access (presentation layer only · no mutation) |
| **✗** | Forbidden — no direct communication |

### 4.1 Communication Matrix (Row → Column)

| From ↓ / To → | **Platform** | **HCM** | **Finance** | **CRM** | **Hospitality** | **Operations** | **Intelligence** |
|---------------|:------------:|:-------:|:-----------:|:-------:|:---------------:|:--------------:|:----------------:|
| **Platform** | ● | △ Read | △ Read | △ Read | △ Read | △ Read | ● |
| **HCM** | ● | ● | **⇄ IIL** | **✗** | **✗** | **✗** | **⇄ IIL** *(outbound)* |
| **Finance** | ● | **✗** | ● | **✗** | **✗** | **✗** | **⇄ IIL** *(outbound)* |
| **CRM** | ● | **✗** | **⇄ IIL** | ● | **✗** | **✗** | **⇄ IIL** *(outbound)* |
| **Hospitality** | ● | **✗** | **⇄ IIL** | **✗** | ● | **✗** | **⇄ IIL** *(outbound)* |
| **Operations** | ● | **✗** | **⇄ IIL** | **✗** | **✗** | ● | **⇄ IIL** *(outbound)* |
| **Intelligence** | ● | **△ Read** | **△ Read** | **△ Read** | **△ Read** | **△ Read** | ● |

### 4.2 Matrix Rules

| Rule ID | Rule |
|---------|------|
| **BM-001** | No cell marked **✗** may be bypassed by repository import, shared store, or synchronous mutation |
| **BM-002** | **⇄ IIL** cells require ADR-014 registered contract for the event type |
| **BM-003** | Finance inbound from HCM · CRM · Hospitality · Operations uses **⬤ ACL** (Financial Event Processor) |
| **BM-004** | **△ Read** permitted only for presentation/application aggregation — not for authoritative cross-domain writes |
| **BM-005** | HCM ↔ CRM ↔ Hospitality ↔ Operations have **no direct** business integration — converge through Finance or future platform orchestration |
| **BM-006** | Intelligence authoritative signals **must** originate from IIL — not from **△ Read** alone |
| **BM-007** | Platform **●** includes Identity · IIL · Workflow · PlatformStore · RBAC · Observability |

### 4.3 Priority v2.0 Integration Paths

| Path | Pattern | Contract Owner |
|------|---------|----------------|
| HCM → Finance | **⇄ IIL** · **⬤ ACL** | HCM publishes · Finance consumes |
| CRM → Finance | **⇄ IIL** · **⬤ ACL** | CRM publishes · Finance consumes |
| Hospitality → Finance | **⇄ IIL** · **⬤ ACL** | Hospitality publishes · Finance consumes |
| Finance → Intelligence | **⇄ IIL** | Finance publishes · Intelligence consumes |
| Operations → Finance *(future)* | **⇄ IIL** · **⬤ ACL** | Operations publishes · Finance consumes |

---

## 5. Dependency Rules

### 5.1 Allowed Dependencies

| ID | Rule |
|----|------|
| **DEP-A-001** | Domain may import published platform service APIs |
| **DEP-A-002** | Domain may import its own internal modules following layer rules |
| **DEP-A-003** | Domain may import `@/types/*` for shared platform types |
| **DEP-A-004** | Presentation may import domain public facades |
| **DEP-A-005** | Domain may publish/subscribe IIL via platform intelligence APIs |
| **DEP-A-006** | Finance Financial Event Processor may depend on ADR-014 inbound schemas only — not upstream repositories |

### 5.2 Restricted Dependencies

| ID | Rule | Condition |
|----|------|-----------|
| **DEP-R-001** | Presentation multi-facade reads | Read-only · same `organizationId` · no cross-domain transaction |
| **DEP-R-002** | Intelligence facade reads | UI workspace only · not for Brief authoritative signal sourcing |
| **DEP-R-003** | Platform scheduled jobs | Must invoke domain facade · not repository |
| **DEP-R-004** | Workflow callbacks | Platform workflow invokes domain facade methods registered in trigger catalogue |
| **DEP-R-005** | Shared types | Platform types only — no domain types in foreign domain packages |

### 5.3 Forbidden Dependencies

| ID | Rule |
|----|------|
| **DEP-F-001** | `lib/<domainA>/**` importing `lib/<domainB>/**/repositories/*` |
| **DEP-F-002** | `lib/<domainA>/**` importing `lib/<domainB>/data/*` |
| **DEP-F-003** | Cross-domain service-to-service calls that mutate foreign aggregates |
| **DEP-F-004** | Intelligence importing domain repositories or stores |
| **DEP-F-005** | Domain importing `app/*` presentation layers |
| **DEP-F-006** | Repository interfaces importing Next.js · React · HTTP |
| **DEP-F-007** | Shared mutable static files as cross-domain authority (G-001) |

### 5.4 Dependency Direction

```
Presentation (app/)
    ↓
Application (Executive Shell · workspace orchestration)
    ↓
Domain Facade (lib/<domain>/ — public)
    ↓
Domain Services (lib/<domain>/ — internal)
    ↓
Repository (lib/<domain>/ — internal)
    ↓
Store / PlatformStore (lib/<domain>/data · lib/platform/store)

Cross-domain (authoritative):  Domain A ──IIL──► Domain B
Platform (shared):             Domain ──► Platform Services
```

**Invariant:** Dependencies flow **downward** within a domain. Cross-domain authoritative flow is **horizontal via IIL only** — never downward into foreign repositories.

### 5.5 Layering

Standard domain call chain (HCM reference — mandatory for all authoritative domains):

```
REST API route  →  Domain Facade  →  Business Service  →  Repository Interface  →  Repository  →  Store
```

| Layer | May Call | Must Not Call |
|-------|----------|---------------|
| **API** | Facade · ServiceContext | Repository · Store · foreign facade (mutation) |
| **Facade** | Services · IIL publisher · wiring | Foreign domain internals |
| **Service** | Repositories · rules engines (same domain) | Foreign repositories · IIL direct (use facade/publisher) |
| **Repository** | Store | Services · Facade · foreign stores |
| **Store** | — | Any domain logic |

**No layer may skip adjacent layers downward.**

### 5.6 Anti-Corruption Layers

| Location | Role | Pattern |
|----------|------|---------|
| **Finance Financial Event Processor** | Inbound business events → accounting postings | Validates ADR-014 schema · maps to Finance aggregates · idempotent on `eventId` + `idempotencyKey` |
| **Domain IIL publishers** | Outbound domain facts → canonical contracts | Maps internal state to ADR-014 envelope + payload |
| **Integration Hub** *(future)* | External system → domain events | External schema → ADR-014 contract — never direct repository write from connector |
| **Intelligence projection handlers** | Finance outbound → Brief signals | Event → read model · no Finance repository access |

**Rule:** Anti-corruption layers sit at **bounded context boundaries** — not scattered in arbitrary services.

---

## 6. Service Classification

### 6.1 Domain Services

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Authoritative business capability within one bounded context |
| **Ownership** | Domain Lead |
| **Examples** | HCM Payroll Calculation · Finance Ledger Posting · CRM Pipeline Management · Hospitality Folio Management |
| **Persistence** | Own repositories · PlatformStore persister |
| **Integration** | Publish/subscribe IIL · consume platform services |
| **Public surface** | Domain facade only |

### 6.2 Application Services

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Orchestrate user-facing workflows across presentation and single-domain operations |
| **Ownership** | Product / workspace owner |
| **Examples** | Executive Shell routing · workspace context · cross-workspace read aggregation |
| **Persistence** | None authoritative — delegates to domain facades |
| **Integration** | May call multiple facades read-only · must not mutate cross-domain state synchronously |
| **Location** | `app/` · `lib/executive/` · workspace modules |

### 6.3 Platform Services

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Shared infrastructure consumed by all domains |
| **Ownership** | Platform Engineering Lead |
| **Examples** | IIL · Workflow · PlatformStore · RBAC · Identity · Observability |
| **Persistence** | Platform-owned stores (event log · workflow state · identity) |
| **Integration** | Published APIs · ServiceRegistry |
| **Rule** | Domain-agnostic — no Finance/HCM/CRM business rules |

### 6.4 Infrastructure Services

| Attribute | Definition |
|-----------|------------|
| **Purpose** | Deployment · runtime · connectivity |
| **Ownership** | Platform Engineering · DevOps |
| **Examples** | Health endpoints · logging adapters · deployment pipelines · database connections |
| **Persistence** | Connection management only |
| **Integration** | Consumed by platform and domain stores |
| **ADR basis** | ADR-007 · ADR-011 · ADR-012 |

### 6.5 Integration Services

| Attribute | Definition |
|-----------|------------|
| **Purpose** | External system boundary |
| **Ownership** | Integration Hub program (P-010.7) |
| **Examples** | ERP GL export · bank feed · external CRM sync *(future)* |
| **Persistence** | Connector state only — not domain authority |
| **Integration** | External ↔ ADR-014 events · never cross-domain repository |
| **ADR basis** | ADR-018 *(planned)* · ADR-014 contracts |

---

## 7. Service Catalogue

Architecture-level catalogue — **not** an API specification. Implementation deferred until Accepted.

### 7.1 Authoritative Domain Services

| Service ID | Domain | Bounded Context | Public Facade | System of Record |
|------------|--------|-----------------|---------------|------------------|
| **SVC-HCM-001** | HCM | Workforce · Time · Payroll · Talent | `hcmFacade` | Employee · payroll calculation · workforce cost |
| **SVC-FIN-001** | Finance | Ledger · Sub-Ledgers · Treasury · Planning | `financeService` | GL · journals · financial invoices · periods |
| **SVC-CRM-001** | CRM | Commercial · Pipeline · Revenue intent | `crmService` | Account · opportunity · commercial invoice intent |
| **SVC-HOS-001** | Hospitality | Folio · Reservation · Property ops | `hospitalityService` | Folio · reservation · hospitality payment |
| **SVC-OPS-001** | Operations | Procurement · Inventory *(future)* | `operationsService` | Purchase order · operational cost |
| **SVC-INT-001** | Intelligence | Brief · KPI · Alerts | `intelligenceService` | Executive signals · composed intelligence |

### 7.2 Platform Services

| Service ID | Service | Consumers | Boundary Role |
|------------|---------|-----------|-----------------|
| **SVC-PLT-001** | IIL Event Transport | All domains | Sole cross-domain bus |
| **SVC-PLT-002** | Identity / ServiceContext | All domains | Shared kernel |
| **SVC-PLT-003** | RBAC | All REST APIs | Authorization |
| **SVC-PLT-004** | Workflow Engine | HCM · Finance · CRM | Approval orchestration |
| **SVC-PLT-005** | PlatformStore | All authoritative domains | Persistence adapter |
| **SVC-PLT-006** | Observability | All services | Health · logging · metrics |
| **SVC-PLT-007** | Configuration | Platform bootstrap | Secrets · environment |

### 7.3 Internal Domain Components (Non-Public)

| Component Pattern | Domain | Visibility |
|-------------------|--------|------------|
| `{Domain}Facade` wiring | All | Internal to package |
| `{Aggregate}Service` | All | Internal |
| `{Aggregate}Repository` | All | Internal |
| `{Domain}EventPublisher` | All | Internal · called from facade/services |
| `FinancialEventProcessor` | Finance | Internal · IIL inbound ACL |
| `{Domain}RulesEngine` | All | Internal |

### 7.4 Replication Checklist (HCM Reference)

Every new authoritative domain **must** satisfy before Gate 5:

| # | Requirement | HCM Reference |
|---|-------------|---------------|
| 1 | Single public facade exported from `@/lib/<domain>` | `hcmFacade` |
| 2 | Layered API → Facade → Service → Repository → Store | ES-HCM-001 §4 |
| 3 | Organization scoping on every operation | ServiceContext |
| 4 | IIL event catalogue registered (ADR-014) | HCM Event Catalogue |
| 5 | RBAC permission matrix | HCM API routes |
| 6 | PlatformStore persister module (ADR-007) | HCM PostgreSQL path |
| 7 | No cross-domain repository imports | HCM Dependency Matrix |
| 8 | Engineering specification ES-{DOM}-00x | ES-HCM-001 |

---

## 8. Governance

### 8.1 Ownership

| Asset | Owner | Escalation |
|-------|-------|------------|
| Domain bounded context | Domain Lead | ARB |
| Domain public facade | Domain Lead | ARB for breaking changes |
| Platform services | Platform Engineering Lead | Chief Enterprise Architect |
| Cross-domain IIL contracts | Producer domain (ADR-014) | ARB |
| Boundary matrix (this ADR) | Chief Enterprise Architect | Founder (constitutional change) |
| Anti-corruption layers | Consumer domain at boundary | ARB |

### 8.2 Review Process

Per [ES-097](../../00_Governance/ES-097-ORION-Architecture-Governance-ADR-Policy.md):

| Trigger | Review |
|---------|--------|
| New authoritative domain | ARB · boundary matrix extension |
| New cross-domain IIL path | ARB · ADR-014 contract · matrix cell update |
| Public facade breaking change | ARB · ADR-020 |
| Presentation cross-facade read pattern | Domain Lead + Platform Lead |
| Platform service scope expansion | ARB |
| Forbidden dependency exception request | ARB **deny by default** |

### 8.3 Boundary Changes

| Change Type | Approval | Documentation |
|-------------|----------|---------------|
| Add domain to matrix | ARB | ADR amendment or successor |
| Change cell from ✗ to ⇄ IIL | ARB + ADR-014 contract | Matrix update |
| Change cell from ⇄ IIL to direct | **Prohibited** for authoritative integration | — |
| Expand △ Read scope | ARB + security review | Workspace spec |
| New platform shared service | ARB | Platform ES or ADR |

### 8.4 Compliance

| Standard | ADR-015 Requirement |
|----------|---------------------|
| **ES-094 CP-V2-ADR** | Domain Gate 5 requires Accepted ADR-015 |
| **ES-092 Gate 5 blockers** | Finance · CRM · Hospitality blocked until Accepted |
| **ES-FIN-002 EC-001 · EC-008** | No cross-domain repository · IIL-only integration |
| **G-001 Charter** | IIL for cross-domain · no shared mutable static authority |
| **Handbook §3.3** | Domain independence rules |
| **P-016.2 A1** | Replicate HCM reference pattern |

### 8.5 Certification

| Requirement | Gate | Evidence |
|-------------|------|----------|
| Domain package structure conforms | Gate 4 | ES-{DOM} spec review |
| Import law architecture tests | Gate 5 | CI dependency graph · forbidden import scan |
| No cross-domain repository imports | Gate 5 | Static analysis · code review |
| IIL-only cross-domain integration | Gate 5–6 | Integration chain tests |
| Facade single-entry enforcement | Gate 5 | Export audit |
| Matrix path certified | Gate 6 | HCM → Finance · CRM → Finance chain traces |
| Replication checklist complete | Gate 5 | Per-domain checklist sign-off |

---

## 9. Alternatives Considered

| Alternative | Summary | Verdict |
|-------------|---------|---------|
| **A — Constitutional domain boundaries (this ADR)** ✅ | Bounded contexts · IIL-only cross-domain · HCM replication | **Selected** |
| **B — Shared operational database** | Cross-domain views and joins | **Rejected** — violates handbook · audit · isolation |
| **C — Synchronous domain facade mesh** | Direct service calls between domains | **Rejected** — coupling · no durable trace · restart loss |
| **D — Per-domain integration adapters without matrix** | Ad-hoc point-to-point | **Rejected** — no certification · Finance hub unclear |
| **E — Microservices with separate deployments per domain** | Physical service split | **Deferred** — logical boundaries first; deployment ADR separate |
| **F — CRM pre-handbook pattern as standard** | Lighter layering | **Rejected** — fails replication commitment A1 |

---

## 10. Consequences

### 10.1 Positive

- Clear ownership and system-of-record matrix
- Finance hub pattern constitutionally enforced
- HCM reference replication law for all domains
- Certification can prove import isolation
- Closes ES-FIN-002 · P-016.3 ADR-015 program intent
- Resolves TD-DOMAIN-PERSIST-001 architectural layer

### 10.2 Negative

- CRM facade convergence effort before Gate 5
- Presentation aggregation limited to read-only multi-facade
- ARB review for every new cross-domain path
- Finance ACL adds processing layer complexity

### 10.3 Risks

| Risk | Mitigation |
|------|------------|
| Developers bypass facade via dynamic imports | CI forbidden-import architecture tests |
| Intelligence uses facade reads for authoritative Brief | BM-006 · DEP-R-002 · certification |
| CRM convergence delays Gate 5 | Prioritize facade audit in Gate 4 |
| Over-restrictive △ Read blocks legitimate UI | Documented presentation exceptions |

---

## 11. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| ADR-013 | **Requires** | IIL as sole cross-domain transport |
| ADR-014 | **Requires** | Event contracts at boundaries |
| ADR-007 | Extends | PlatformStore consumer pattern |
| ADR-009 | Extends | RBAC on domain REST APIs |
| ADR-016 | Enables | Workflow without domain engines |
| ADR-020 | Related | Facade versioning |
| ES-HCM-001 | Reference | Replication template |
| P-009.2 | Aligns | Finance context map |
| ES-097 | Governance | ADR lifecycle |

---

## 12. Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | Domain ownership and system-of-record defined | ✅ §3.1 |
| AC-2 | Allowed · restricted · forbidden dependencies defined | ✅ §3.2–3.3 · §5 |
| AC-3 | Communication patterns defined | ✅ §3.4 |
| AC-4 | Public · internal · platform services defined | ✅ §3.5–3.7 |
| AC-5 | Domain boundary matrix complete | ✅ §4 |
| AC-6 | Layering and anti-corruption rules defined | ✅ §5.5–5.6 |
| AC-7 | Service classification and catalogue defined | ✅ §6 · §7 |
| AC-8 | Governance and certification defined | ✅ §8 |
| AC-9 | ARB review scheduled | Pending |

---

## 13. Release Impact

| Milestone | Impact |
|-----------|--------|
| **Finance Gate 5** | **Hard blocker** — requires **Accepted** |
| **CRM Gate 5** | **Hard blocker** — facade convergence under boundary law |
| **Hospitality Gate 5** | **Hard blocker** — folio → Finance path in matrix |
| **v2.0 GA** | **Implemented** — all authoritative domains pass replication checklist |
| **HCM v1.x** | Already conforms — reference baseline |
| **Intelligence** | Must source authoritative signals from IIL |

---

## 14. Implementation Impact (Future — Not Authorized)

| Area | Planned Impact |
|------|----------------|
| Architecture tests | Forbidden cross-domain import scans |
| CRM refactor | Facade convergence to HCM pattern |
| Finance | Financial Event Processor as ACL |
| Domain ES specs | Boundary compliance sections |
| CI certification | Gate 5 boundary tests |

---

## 15. Related Documents

| Document | Location |
|----------|----------|
| ADR-013 | [ADR-013-Durable-Intelligent-Integration-Layer.md](./ADR-013-Durable-Intelligent-Integration-Layer.md) |
| ADR-014 | [ADR-014-Cross-Domain-Event-Contracts.md](./ADR-014-Cross-Domain-Event-Contracts.md) |
| P-016.2 Charter | [P-016.2-ORION-v2-Architecture-Charter.md](../../00_Governance/P-016.2-ORION-v2-Architecture-Charter.md) |
| P-016.3 ADR Program | [P-016.3-ORION-v2-ADR-Program.md](../../00_Governance/P-016.3-ORION-v2-ADR-Program.md) |
| ES-HCM-001 | [ES-HCM-001_Enterprise_HCM_Engineering_Specification.md](../../HCM/Engineering/ES-HCM-001_Enterprise_HCM_Engineering_Specification.md) |
| P-009.2 Finance Model | [P-009.2-Finance-Domain-Model.md](../../Finance/Architecture/P-009.2-Finance-Domain-Model.md) |
| ES-097 | [ES-097-ORION-Architecture-Governance-ADR-Policy.md](../../00_Governance/ES-097-ORION-Architecture-Governance-ADR-Policy.md) |

---

## 16. Superseded ADRs

| ADR | Relationship |
|-----|--------------|
| None | — |

**Note:** P-016.2 §2.2 listed "ADR-015 CRM Enterprise Facade Convergence" — superseded by this ADR's scope per [P-016.3 §ADR Renumbering](../../00_Governance/P-016.3-ORION-v2-ADR-Program.md).

---

## 17. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-02 | Chief Enterprise Architect | Initial proposal — ADR-015 mission |

---

## 18. Status

| Field | Value |
|-------|-------|
| **Current Status** | **PROPOSED** |
| **May Implement?** | **No** — requires Accepted status |
| **Next Step** | ARB review · domain lead sign-off · replication checklist ratification |
| **Boundary tests** | Deferred until Accepted |

---

## 19. Executive Recommendation

| Assessment | Verdict |
|------------|---------|
| ADR-015 mission complete (architecture) | **GO** |
| Domain boundary matrix adequate | **GO** |
| HCM reference replication law clear | **GO** |
| Finance hub · IIL-only integration aligned | **GO** |
| CRM convergence path defined | **GO** — Gate 4 facade audit required |
| Implementation authorized | **NO-GO** — pending Accepted |
| Finance Gate 5 unblocked on acceptance | **CONDITIONAL GO** |

**Conditions for Accepted:**

1. ARB approves boundary matrix and dependency rules
2. HCM · Finance · CRM Domain Leads acknowledge system-of-record matrix
3. Platform Engineering confirms platform service catalogue completeness
4. Security Architect approves △ Read restrictions for Intelligence
5. ADR-013 and ADR-014 Accepted or concurrently under review with no conflict

---

*ORION Architecture Decision Record · ADR-015 · docs/11_Governance/ADR/ · Architecture only · No implementation · No APIs · No service code*

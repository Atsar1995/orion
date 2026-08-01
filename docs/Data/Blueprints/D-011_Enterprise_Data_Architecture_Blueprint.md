# D-011 – Enterprise Data Architecture Blueprint

**Document ID:** D-011  
**Domain:** Enterprise Data (Cross-Cutting)  
**Version:** 1.0  
**Architecture Baseline:** v0.3  
**Status:** Draft — Pending Governance Approval  
**Classification:** Enterprise Architecture  
**Authority:** Chief Enterprise Architect  
**Owner:** Data Governance Lead (to be assigned)  

**Related Governance:** [ARCHITECTURE_BASELINE_v0.3.md](../../11_Governance/Architecture/ARCHITECTURE_BASELINE_v0.3.md) · [ARCHITECTURE_FREEZE_v0.3.md](../../11_Governance/Architecture/ARCHITECTURE_FREEZE_v0.3.md)

**Related Engineering:** [ES-056 — Data Governance & Information Architecture](../../02_Engineering/ES-056-ORION-Data-Governance-Information-Architecture.md) · [ES-036 — Database & Persistence Architecture](../../02_Engineering/ES-036-Database-Persistence-Architecture.md) · [ES-033 — Event & Messaging Architecture](../../02_Engineering/ES-033-Event-Messaging-Architecture.md) · [ES-050 — Enterprise Reference Architecture](../../02_Engineering/ES-050-ORION-Enterprise-Reference-Architecture.md)

**Related Domain Blueprints:** [D-007 — Finance Domain Blueprint](../../Finance/Blueprints/D-007_Finance_Domain_Blueprint.md) · [D-008 — Enterprise Financial Event Model](../../Finance/Blueprints/D-008_Enterprise_Financial_Event_Model.md) · [D-009 — Enterprise Ledger Principles](../../Finance/Blueprints/D-009_Enterprise_Ledger_Principles.md)

---

## 1. Enterprise Data Vision

ORION treats **data as a strategic enterprise asset**, not a by-product of application modules.

The enterprise data vision is to provide a **single, trustworthy, organization-scoped information foundation** that enables executives to make better decisions, domains to operate with clear ownership, and the platform to scale across companies, currencies, jurisdictions, and future business models without re-architecting data boundaries.

Every domain generates operational truth within its bounded context. The platform harmonizes that truth through **canonical models, event-driven synchronization, and governed metadata** — never through ad hoc duplication, shadow databases, or workspace-local copies of shared master entities.

Data in ORION serves three enterprise purposes:

| Purpose | Description |
|---------|-------------|
| **Operational truth** | Authoritative records for day-to-day business execution within each domain |
| **Executive intelligence** | Derived, read-only insight for decision support — never a second source of operational truth |
| **Compliance & audit** | Immutable history, classification, retention, and traceability for governance and regulators |

The data architecture exists to ensure that when an executive asks *"What happened, who owns it, and can I trust it?"* — ORION can answer with clarity, provenance, and organizational isolation.

---

## 2. Data Architecture Principles

The following principles govern all ORION data design, domain engineering, and platform extension. They are **non-negotiable** unless changed through formal architecture governance (ADR + baseline revision).

### 2.1 Single Source of Truth

Every business entity has **exactly one authoritative owner domain**. Other domains reference that entity; they do not replicate its authoritative state.

| Rule | Implication |
|------|-------------|
| One owner per entity type | Party identity is owned by Commercial; ledger balances by Finance; guest stay records by Hospitality |
| Reference, don't replicate | Cross-domain use carries foreign keys, identifiers, and cached display labels — not mutable copies |
| Derived data is labeled | Analytics, KPIs, and intelligence outputs are explicitly non-authoritative |

### 2.2 Canonical Data Models

ORION defines **canonical entity shapes** at the platform and domain level. Domain implementations may extend canonical models with domain-specific attributes, but must not redefine core identifiers, lifecycle states, or ownership boundaries.

Canonical models are expressed as:

- Platform types and contracts (`types/`)
- Domain blueprint entity definitions (D-00X series)
- Event payload schemas published through the Intelligence Integration Layer

### 2.3 Domain Ownership

Data ownership follows **bounded context** rules aligned with the Business Workspace Pattern. Each domain owns its entities, validation rules, lifecycle transitions, and authoritative repositories. Platform services own cross-cutting capabilities (identity context, audit, notification, integration) — not business entity truth.

### 2.4 Event-Driven Synchronization

Domains communicate data changes through **events**, not direct database access or cross-module repository calls. Operational state changes produce domain events; consuming domains react asynchronously and maintain only the projections they require.

Synchronous reads across domain boundaries occur through **public service APIs and approved query contracts** — never through shared tables or internal repository imports.

### 2.5 Organization Isolation

All enterprise data is **organization-scoped**. No query, event, cache entry, search index record, audit entry, or integration payload may cross organization boundaries without explicit super-admin governance controls and audit.

Multi-tenancy is a **security and data boundary**, not merely a filter parameter.

### 2.6 Immutable Business History

Financial postings, audit records, approved workflow outcomes, and compliance events form an **append-only business history**. Corrections occur through reversing entries, new versions, or superseding records — never silent overwrites of historical truth.

### 2.7 Metadata-First Design

Every significant entity carries **identifying metadata**: organization, owner domain, entity type, lifecycle state, correlation identifiers, and classification. Metadata enables search, audit, integration mapping, retention enforcement, and AI governance without re-parsing opaque payloads.

### 2.8 Configuration over Customization

Reference data, feature flags, workflow definitions, notification templates, integration mappings, and chart-of-accounts structures are **configuration** — versioned, organization-scoped, and governed. Custom code per tenant is the exception; configurable behavior is the default.

---

## 3. Canonical Data Model Philosophy

ORION adopts a **layered canonical model** strategy:

```
┌─────────────────────────────────────────────────────────────┐
│  Executive Intelligence Layer (derived, read-only)          │
├─────────────────────────────────────────────────────────────┤
│  Domain Operational Layer (authoritative per domain)        │
├─────────────────────────────────────────────────────────────┤
│  Platform Shared Layer (identity, org, audit, integration)  │
├─────────────────────────────────────────────────────────────┤
│  Canonical Reference Layer (codes, enums, taxonomies)       │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Platform Canonical Entities

Platform services define canonical shapes for cross-cutting entities:

| Entity Family | Platform Owner | Canonical Concern |
|---------------|----------------|-------------------|
| Organization | Organization Platform | Tenant root, hierarchy, settings |
| User / Identity | Identity Platform | Authentication context, role binding |
| Workflow Instance | Workflow Platform | Approval state, stage, correlation |
| Document | Document Platform | Metadata, version, retention class |
| Notification | Notification Platform | Delivery state, template reference |
| Audit Event | Compliance Platform | Immutable action record |
| Integration Job | Integration Platform | Connector execution, import/export state |
| Search Index Entry | Search Platform | Discovery metadata (projection) |

### 3.2 Domain Canonical Entities

Each business domain defines canonical entities in its domain blueprint. Examples:

| Domain | Canonical Entity Examples |
|--------|---------------------------|
| Commercial | Party, Lead, Opportunity, Contract |
| Hospitality | Property, Reservation, Guest, Folio |
| Finance | Account, Journal Entry, Fiscal Period, Invoice (financial view) |
| HR (future) | Employee, Position, Compensation Band |

Domain canonical models **must not** embed platform service logic. Platform canonical models **must not** embed domain business rules.

### 3.3 Projection vs. Authority

| Data Category | Authority | Mutability |
|---------------|-----------|------------|
| Operational entity | Owning domain | Governed lifecycle transitions |
| Event payload | Publishing domain at event time | Immutable after publish |
| Search index | Search Platform (projection) | Rebuilt from source events |
| Executive KPI | Intelligence layer (derived) | Recalculated; never posted to ledger |
| Audit record | Compliance Platform | Append-only |

---

## 4. Master Data Strategy

**Master Data** represents the long-lived core entities shared across the enterprise: organizations, users, parties, products, accounts, employees, and locations.

### 4.1 Master Data Domains

| Master Entity | Authoritative Domain | Consumers |
|---------------|---------------------|-----------|
| Organization | Platform — Organization | All domains |
| User | Platform — Identity / Organization | All domains |
| Party (Customer/Vendor) | Commercial | Finance, Hospitality, CRM |
| Product / Service Catalog | Commercial or domain-specific | Finance, Hospitality |
| Chart of Accounts | Finance | All financial postings |
| Employee | HR (future) / Organization (interim) | Workflow, Compliance |
| Property / Location | Hospitality | Finance, Operations |

### 4.2 Master Data Governance Rules

1. **Create once** — master entities are created in the owning domain and published via events.
2. **Golden record** — the owning domain resolves duplicates; consumers defer to the golden record identifier.
3. **No shadow masters** — workspaces shall not maintain parallel customer, account, or user registries.
4. **Stewardship** — each master entity family has a named data steward (see Section 9).

### 4.3 Master Data Lifecycle

```
Draft → Active → Inactive → Archived
```

Inactive master records remain referenceable for historical transactions. Archived records are retained per retention policy but excluded from operational UI defaults.

---

## 5. Transaction Data Strategy

**Transaction data** captures business events with temporal and financial consequence: reservations, invoices, journal entries, payments, workflow approvals, and integration jobs.

### 5.1 Characteristics

| Characteristic | Requirement |
|----------------|-------------|
| Temporal | Every transaction carries effective date, posting date, or event timestamp |
| Traceable | Correlation ID links transaction to source event, approval, and audit |
| Domain-owned | Transaction type authority resides in the originating domain |
| Period-aware | Financial transactions respect fiscal period state (Finance governance) |

### 5.2 Transaction Integrity

- Transactions are **atomic within domain boundaries**.
- Cross-domain transactions use **saga/event choreography** — not distributed two-phase commit across domain stores.
- Failed downstream consumption is retried, dead-lettered, and auditable through platform integration and compliance services.

### 5.3 Transaction History

Transaction history is retained according to domain retention policies. Financial and compliance transactions follow the longest retention classes.

---

## 6. Reference Data Strategy

**Reference data** provides stable, governed code lists: currencies, countries, tax codes, room types, status enumerations, role slugs, and notification types.

### 6.1 Reference Data Tiers

| Tier | Scope | Examples | Change Frequency |
|------|-------|----------|------------------|
| System | Platform-wide | Core enums, event types, role slugs | Rare; versioned |
| Organization | Tenant-configurable | Tax codes, departments, custom categories | Governed admin change |
| Domain | Domain-specific | Hospitality room types, Finance account types | Domain steward |

### 6.2 Reference Data Rules

- Reference data changes are **versioned** when they affect historical interpretation.
- Deprecated codes remain resolvable for historical records.
- Reference data is **never hard-coded in business logic** when organization-specific variation is required — use configuration.

---

## 7. Metadata Strategy

Metadata is the connective tissue of enterprise data architecture.

### 7.1 Required Metadata Dimensions

| Dimension | Applies To | Purpose |
|-----------|------------|---------|
| Organization ID | All entities | Tenant isolation |
| Domain Key | Domain entities | Ownership and routing |
| Entity Type / ID | All entities | Identity and search |
| Owner ID | Business entities | Accountability |
| Lifecycle Status | Operational entities | Workflow and UI filtering |
| Correlation ID | Events, transactions | Traceability |
| Security Classification | Sensitive entities | Access control |
| Retention Class | Documents, audit, finance | Lifecycle enforcement |
| Source Service | Events, audit | Provenance |
| Timestamps | All records | Ordering and retention |

### 7.2 Metadata Registry (Future)

ORION will maintain an enterprise metadata registry describing entity schemas, ownership, classification defaults, and retention classes. Until operational, TypeScript types and domain blueprints serve as the canonical metadata contract.

---

## 8. Data Ownership

### 8.1 Ownership Roles

| Role | Responsibility |
|------|----------------|
| **Business Owner** | Defines what data means, quality expectations, and access policy |
| **Domain Owner** | Accountable for authoritative domain data and blueprint alignment |
| **Data Steward** | Day-to-day quality, duplicate resolution, reference data curation |
| **Technical Owner** | Service contracts, event schemas, repository boundaries |
| **Platform Custodian** | Shared services, isolation enforcement, integration governance |

### 8.2 Ownership Matrix (Summary)

| Data Category | Business Owner | Domain / Platform Owner |
|---------------|----------------|-------------------------|
| Organization & Users | CEO / COO | Platform — Organization |
| Customer & Party | CRO | Commercial |
| Reservations & Guests | COO Hospitality | Hospitality |
| Financial Records | CFO | Finance |
| Audit & Compliance | CRO / CISO | Platform — Compliance |
| Integration Config | CTO | Platform — Integration |
| Executive Intelligence | CEO | Platform — Intelligence |

---

## 9. Domain Ownership

Each ORION business domain is the **System of Record** for its bounded context:

```
Commercial ──► Party, Lead, Opportunity, Contract
Hospitality ──► Property, Reservation, Guest, Folio
Finance ──► GL, Journal, Period, Invoice (financial), Tax
Platform ──► Identity, Org, Workflow, Notification, Document, Search, Audit, Integration
```

### 9.1 Cross-Domain Data Rules

| Scenario | Rule |
|----------|------|
| Commercial creates a customer | Finance receives `CustomerUpdated` event; creates AR reference if needed |
| Hospitality posts a folio charge | Finance receives financial event; posts journal through Finance pipeline |
| Platform approves a workflow | Compliance records audit; Notification sends outcome |
| Integration imports vendors | Commercial or Finance validates; owning domain persists |

Domains **must not** write directly to another domain's authoritative store.

---

## 10. Data Governance

Data governance ensures data remains trustworthy, secure, and compliant across its lifecycle.

### 10.1 Governance Bodies

| Body | Function |
|------|----------|
| Architecture Board | Approves blueprints, canonical models, cross-domain contracts |
| Data Governance Council | Stewardship, quality standards, classification policy |
| Domain Leads | Domain-specific data quality and entity lifecycle |
| Security & Compliance | Classification, access policy, retention, audit |

### 10.2 Governance Controls

- Blueprint-first: no new authoritative entity without domain or platform blueprint reference
- Event schema review for cross-domain publications
- Classification assignment for new entity families
- Retention policy assignment before production promotion
- ADR required for canonical model breaking changes

### 10.3 Relationship to ES-056

This blueprint defines **strategic data architecture intent**. [ES-056](../../02_Engineering/ES-056-ORION-Data-Governance-Information-Architecture.md) defines operational governance mechanics, current-state gaps, and implementation targets. D-011 is the architectural north star; ES-056 tracks maturity.

---

## 11. Data Lifecycle

```
Create → Validate → Active Use → Transform/Integrate → Retain → Archive → Dispose
         ↑              ↑              ↑                  ↑         ↑
      Quality       Access Control   Events          Retention   Legal/Governance
```

### 11.1 Lifecycle Stages

| Stage | Description | Platform Support |
|-------|-------------|------------------|
| **Create** | Entity born in owning domain | Domain service + validation |
| **Validate** | Schema, business rules, org scope | Rules engines per domain |
| **Active Use** | Operational read/write | Domain repositories |
| **Transform** | Import, export, mapping | Integration Platform |
| **Index** | Search projection | Search Platform |
| **Audit** | Immutable record | Compliance Platform |
| **Retain** | Policy-driven hold | Retention framework |
| **Archive** | Read-only, excluded from default UI | Archive framework (future) |
| **Dispose** | Governed deletion (logical) | Retention expiry + compliance |

---

## 12. Data Quality Principles

| Principle | Definition |
|-----------|------------|
| **Completeness** | Required fields populated before entity activation |
| **Accuracy** | Data reflects real-world state within domain authority |
| **Consistency** | Canonical identifiers align across domains and events |
| **Timeliness** | Events published within defined latency thresholds |
| **Uniqueness** | Duplicate detection at entity creation and import |
| **Validity** | Values conform to schema, reference data, and business rules |

Quality is enforced at **domain boundaries** (creation, import, transformation) — not only at reporting time.

---

## 13. Data Security Principles

| Principle | Requirement |
|-----------|-------------|
| **Least privilege** | Access granted by role, organization, and classification |
| **Organization isolation** | Mandatory filter on all data operations |
| **Classification-driven access** | Restricted/confidential data requires elevated authorization |
| **Credential abstraction** | Integration credentials referenced, never embedded in domain code |
| **Audit everything significant** | Create, update, delete, access, export, and permission changes |
| **No domain bypass** | External communication only through Integration Platform |

Aligned with [ES-059 — Platform Security & Zero Trust](../../02_Engineering/ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md) and [ES-037 — Authentication & Authorisation](../../02_Engineering/ES-037-Authentication-Authorisation-Architecture.md).

---

## 14. Data Classification

| Classification | Description | Examples | Default Handling |
|----------------|-------------|----------|------------------|
| **Public** | Safe for unrestricted display | Marketing descriptions | Standard access |
| **Internal** | Enterprise operational data | Reservations, pipeline stages | Organization-scoped RBAC |
| **Confidential** | Sensitive business data | Contracts, financial statements | Role-restricted + audit |
| **Restricted** | Highest sensitivity | Credentials, identity documents, payroll | Elevated access + enhanced audit |

Classification is assigned at entity family level in blueprints and enforced by platform authorization and compliance services.

---

## 15. Data Synchronization Philosophy

ORION synchronizes data through a **hub-and-spoke event architecture**:

```
Domain A (authoritative) ──publish──► Intelligence Integration Layer ──subscribe──► Domain B (projection)
                                              │
                                              ├──► Search Platform (index)
                                              ├──► Compliance Platform (audit)
                                              ├──► Notification Platform (alert)
                                              └──► Integration Platform (external)
```

### 15.1 Synchronization Rules

1. **Push on change** — authoritative domain publishes after successful commit.
2. **Idempotent consumption** — subscribers handle duplicate events safely.
3. **Eventual consistency** — cross-domain reads may lag; UI indicates freshness where material.
4. **Dead-letter recovery** — failed syncs are retried, logged, and escalated.
5. **No polling primary stores** — integrations and search rebuild from events or approved APIs.

---

## 16. Event-Driven Data Architecture

Events are the **primary cross-domain data transport**.

### 16.1 Event Categories

| Category | Examples | Consumers |
|----------|----------|-----------|
| **Entity lifecycle** | EntityCreated, EntityUpdated, EntityDeleted | Search, Compliance, Intelligence |
| **Domain business** | InvoiceIssued, ReservationCreated, JournalPosted | Finance, Executive Brief |
| **Platform lifecycle** | WorkflowCompleted, NotificationSent, DocumentArchived | Notification, Compliance |
| **Integration** | ImportCompleted, ExportCompleted | Compliance, domain subscribers |

### 16.2 Event Data Contract

Every event carries: event ID, type, source service, organization ID, entity type, entity ID, timestamp, actor, correlation ID, payload, and security classification. Events are **immutable** once published.

### 16.3 Alignment

- [ES-033 — Event & Messaging Architecture](../../02_Engineering/ES-033-Event-Messaging-Architecture.md)
- [P-006 — Intelligence Integration Layer](../../03_Architecture/P-006-Intelligence-Integration-Layer.md)

---

## 17. Multi-Tenant Data Isolation

| Layer | Isolation Mechanism |
|-------|---------------------|
| **API** | ServiceContext.organizationId on every request |
| **Service** | Organization validation in rules engines |
| **Repository** | Organization-scoped queries; no cross-tenant reads |
| **Events** | organizationId in every event envelope |
| **Search** | Organization-scoped indexes |
| **Audit** | Organization-scoped append-only stores |
| **Integration** | Connector and job scoping per organization |

Super-admin cross-organization access is **explicit, audited, and exceptional**.

---

## 18. Future Expansion

The data architecture is designed to support future capabilities without restructuring ownership boundaries:

| Capability | Architectural Preparation |
|------------|---------------------------|
| **Persistent database tier** | Repository pattern; organization-scoped schemas |
| **Master Data Management (MDM)** | Golden record strategy; steward roles defined |
| **Data warehouse / lake** | Event-driven extraction; derived layer separation |
| **Real-time streaming** | Integration type `streaming` reserved in framework |
| **AI training datasets** | Classification + governance; derived-only inputs |
| **Cross-company consolidation** | Organization hierarchy; elimination entries (Finance) |
| **Regulatory reporting packs** | Retention + immutable history + classification |
| **Geographic data residency** | Organization metadata; future shard routing |

---

## 19. Out of Scope

This blueprint explicitly excludes:

- Database schema design, ORM models, and migration scripts
- Persistence implementation and caching strategies
- Search engine or index storage technology
- Analytics warehouse implementation
- Specific third-party integration connectors
- Performance tuning and capacity planning

These belong in engineering specifications (ES-036, domain mission docs) after blueprint approval.

---

## 20. Canon Compliance

| Canon Chapter | Alignment |
|---------------|-----------|
| **C-001 Vision** | Data serves executive decision quality |
| **C-003 Architecture** | Platform layer model; domain isolation; shared services |
| **C-004 Intelligence** | Derived intelligence separated from operational truth |
| **C-006 Engineering** | Canonical types, repository boundaries, validation |
| **C-008 Integration** | Event-driven cross-domain communication |
| **C-010 Security** | Classification, isolation, audit, least privilege |

---

## 21. Architecture Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-011-01 | Single source of truth per entity family | Prevents conflicting masters and reconciliation debt |
| AD-011-02 | Event-driven cross-domain sync over shared tables | Preserves domain autonomy and bounded contexts |
| AD-011-03 | Organization ID mandatory on all data artifacts | Multi-tenant security is architectural, not optional |
| AD-011-04 | Immutable business history for finance and audit | Regulatory and executive trust requirements |
| AD-011-05 | Metadata-first entity design | Enables search, compliance, integration, and AI governance |
| AD-011-06 | Configuration over customization | Scales multi-tenant operations without code forks |
| AD-011-07 | Derived intelligence never writes operational stores | Protects authoritative domain data |
| AD-011-08 | Platform owns cross-cutting data services | Domains consume; do not duplicate |

---

## 22. Document Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Chief Enterprise Architect | — | — | Pending |
| Data Governance Lead | — | — | Pending |
| CTO | — | — | Pending |

---

*Blueprint only. No implementation authorized by this document.*

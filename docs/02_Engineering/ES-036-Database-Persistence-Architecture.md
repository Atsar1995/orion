# ES-036 — Database & Persistence Architecture

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** ES-010 (foundation delivered) · Construction Phase canonical spec

**Author:** Founder & Chief Architect

**Related delivery:** [ES-010 — Persistence Foundation](./ES-010-Persistence-Foundation.md) (Sprint 10 · v0.4.0 · RR-002) · [ES-056 — Data Governance & Information Architecture](./ES-056-ORION-Data-Governance-Information-Architecture.md) (Approved · domains · MDM · lifecycle)

---

# Purpose

The Database & Persistence Architecture defines how ORION stores, retrieves, protects, versions, audits, and manages business data throughout its lifecycle.

The objective is to ensure reliability, consistency, scalability, auditability, and long-term maintainability across every ORION workspace and intelligence engine.

**Current state:** ORION implements a **vendor-agnostic persistence foundation** (ES-010 · RR-002) with repository contracts, tenant-scoped services, in-memory adapters for User/Organization/Workspace, transaction/audit placeholders, and `RepositoryResult<T>` envelopes. Business workspace data (Finance, CRM, etc.) remains **placeholder static data** in `lib/*-data.ts` ([TD-001](../09_Standards/Technical_Debt_Register.md) · [TD-002](../09_Standards/Technical_Debt_Register.md)). No production database, migrations, soft delete, or backup infrastructure. Full ES-036 entity standards, domain persistence, and operational DR — **Construction Phase alignment pending**.

**Out of scope (this ES):** Specific database technology · cloud provider · infrastructure provisioning · HA topology — deployment specifications.

---

# Objectives

The architecture shall:

- Standardise persistence.
- Preserve data integrity.
- Support scalability.
- Ensure auditability.
- Optimise performance.
- Support historical analysis.
- Enable disaster recovery.
- Simplify future evolution.

---

# Architectural Principles

| Principle | Status |
|-----------|--------|
| Data is a business asset | Documented |
| Data ownership is explicit | PA-001 · ES-010 |
| Business entities are authoritative | Documented |
| Persistence is transparent | Repository pattern delivered |
| Historical records are preserved | Planned |
| Every mutation is auditable | Partial · audit hooks + platform AuditService |
| Sensitive data is protected | Planned (encryption at rest) |

---

# Persistence Model

**Supports:** Transactional Storage · Read Optimised Views · Audit Storage · Historical Storage · Configuration Storage · Reference Data · Temporary Cache

**Delivered (partial):**

| Store type | Implementation | Status |
|------------|----------------|--------|
| Transactional (identity) | In-memory User/Org/Workspace repos | Delivered |
| Transactional (business) | Static `lib/*-data.ts` | Placeholder |
| Audit | `AuditRepository` hook · `AuditStore` · platform audit service | Partial |
| Historical | — | Planned |
| Configuration | — | Planned |
| Cache | — | Planned |

---

# Data Ownership

Each business domain owns its own data: Hospitality · Commerce · Finance · Marketing · CRM · Recommendations · Alerts · Business Health · Trend Analysis

**Delivered (partial):** Identity entities via persistence layer. Workspace business data owned in `lib/` modules — not yet persisted through repositories. Align with [ES-034](./ES-034-Provider-Data-Contract-Standards.md) provider ownership.

---

# Entity Standards

Every persistent entity shall include: Unique Identifier · Created Timestamp · Updated Timestamp · Created By · Updated By · Version · Status · Metadata

**Delivered (partial):**

| Field | Identity entities (`User`, etc.) | `Entity` base | Status |
|-------|----------------------------------|---------------|--------|
| Unique Identifier | `id` | `id` | Delivered |
| Created/Updated Timestamp | `createdAt` / `updatedAt` on User | — | Partial |
| Created/Updated By | — | — | Planned |
| Version | — | — | Planned |
| Status | — | — | Planned |
| Metadata | — | — | Planned |

**Contract:** [types/persistence.ts](../../types/persistence.ts) · [types/auth.ts](../../types/auth.ts)

---

# Primary Keys

Use immutable identifiers · internal IDs never reused · external references remain independent

**Delivered:** UUID-style string ids in in-memory stores · `ensureEntityId()` helpers.

---

# Relationships

Support: One-to-One · One-to-Many · Many-to-Many · Composition · Reference · referential integrity preserved

**Delivered (partial):** User ↔ Organization ↔ Workspace tenant scoping in memory adapters. Full relational model — **planned**.

---

# Transactions

Transactions shall: be atomic · maintain consistency · support rollback · prevent partial updates · minimise duration

**Delivered (partial):** `TransactionManager` interface · `BasePersistenceService.executeWrite()` with begin/commit/rollback — **NoOp placeholder** in development. Real transactional store — **planned**.

---

# Concurrency

Optimistic concurrency by default · version numbers detect conflicts · pessimistic locking for exceptional cases

**Delivered (partial):** `PersistenceErrorCode.Concurrency` defined. Optimistic versioning enforcement — **planned**.

---

# Audit History

Every mutation shall record: Who · What · When · Why · Previous Value · New Value · Correlation ID

**Delivered (partial):**

| Layer | Implementation |
|-------|----------------|
| Persistence audit hook | `PersistenceAuditEntry` · `AuditRepository.record()` |
| Platform audit | [AuditService](../../lib/platform/audit/AuditService.ts) · event-driven capture |
| Full before/after values | Planned |

---

# Soft Delete

Business records shall normally use soft deletion · recoverable until retention permits permanent removal

**Delivered:** Hard delete in in-memory repositories. Soft delete pattern — **planned**.

---

# Data Retention · Archiving

Configurable retention for operational data · audit records · analytics · logs · archived records

**Delivered:** — **planned**

---

# Indexing · Search Optimisation

Indexes for PKs · FKs · search fields · filter/sort fields · business identifiers

Search: exact · partial · full text · composite · indexed

**Delivered (partial):** In-memory filter/pagination via `RepositoryOptions` (filters, sort, pagination). Database indexes — **planned**.

---

# Data Validation

Validate: schema · business rules · relationships · reference integrity · data types · required fields

**Delivered (partial):** Service-layer validation (`validateEmailFormat`, tenant guards) · `PersistenceErrorCode.Validation`. Schema validation framework — **planned**.

---

# Versioning · Migration Strategy

Entity version · schema version · migration version · repeatable · reversible · version controlled · tested · preserve historical data

**Delivered:** — **planned** (no migration tooling)

---

# Backup Strategy · Recovery Objectives

Automated backups · point-in-time recovery · incremental/full backups · DR snapshots · configurable RPO/RTO

**Delivered:** — **planned** (deployment/infrastructure)

---

# Platform Implementation

```
Business Modules / Providers
        ↓
Persistence Service (BasePersistenceService)
        ↓
Repository Interface (Read/Write/Tenant)
        ↓
Adapter (InMemory → future Database)
        ↓
Persistence Store (future)
```

| Module | Location |
|--------|----------|
| Core types | [types/persistence.ts](../../types/persistence.ts) |
| Repository contracts | [lib/persistence/repository.ts](../../lib/persistence/repository.ts) |
| Service layer | [lib/persistence/services/](../../lib/persistence/services/) |
| In-memory adapters | [lib/persistence/memory/](../../lib/persistence/memory/) |
| DI container | [PersistenceContainer.ts](../../lib/persistence/config/PersistenceContainer.ts) |
| Factory | [PersistenceFactory.ts](../../lib/persistence/config/PersistenceFactory.ts) |
| Result envelope | [lib/persistence/result.ts](../../lib/persistence/result.ts) |
| Tenant context | [lib/persistence/tenant-context.ts](../../lib/persistence/tenant-context.ts) |

**Business rule:** Modules consume persistence through services — never direct storage access (ES-010).

---

# Security

Sensitive fields: encrypted at rest · masking · access controls · no secrets exposed · secure deletion where legally required

**Delivered (partial):** Tenant isolation at repository boundary · ES-009 auth context. Encryption at rest — **planned**.

---

# Observability

Monitor: storage growth · query performance · index usage · transaction duration · deadlocks · migration status · backup/replication status

**Delivered:** — **planned**

---

# Performance Targets

| Operation | Target | Status |
|-----------|--------|--------|
| Primary Read | < 200 ms | In-memory (dev) · DB planned |
| Primary Write | < 500 ms | In-memory (dev) · DB planned |
| Search | < 300 ms | Planned |
| Bulk | Configurable | Planned |

---

# Integration with Platform Standards

| Standard | Relationship |
|----------|--------------|
| [ES-034](./ES-034-Provider-Data-Contract-Standards.md) | Domain providers persist via repository layer |
| [ES-035](./ES-035-API-Design-Standards.md) | HTTP APIs map to persistence services |
| [ES-033](./ES-033-Event-Messaging-Architecture.md) | Mutations publish domain events after commit |
| [ES-009](./ES-009-Identity-Authentication-Foundation.md) | TenantContext from identity layer |

---

# Business Rules

- Every entity has a unique identifier.
- Historical records are immutable.
- Audit history cannot be deleted through normal operations.
- Database changes require versioned migrations.
- Every mutation is attributable to an authenticated actor or system process.

**Delivered (partial):** Id uniqueness · audit hooks · tenant attribution via `TenantContext`. Full enforcement — **planned**.

---

# Acceptance Criteria

The architecture shall:

- [x] Support transactional consistency (pattern documented · NoOp TM delivered)
- [x] Maintain audit history (partial — hooks + platform audit)
- [ ] Support versioned migrations
- [ ] Protect sensitive data (encryption planned)
- [x] Enable efficient searching (partial — in-memory pagination/filters)
- [ ] Support backup and recovery
- [x] Meet defined performance targets (defined; production verification planned)

---

# Implementation Status

| Area | Release | Status |
|------|---------|--------|
| Persistence contracts (10A) | RR-002 | Delivered |
| In-memory repositories (10B) | RR-002 | Delivered · User · Organization · Workspace |
| Persistence services (10C) | RR-002 | Delivered |
| Platform container (10D) | RR-002 | Delivered |
| Business workspace persistence | — | Placeholder data (TD-001 · TD-002) |
| Database vendor integration | — | Planned |
| Migrations | — | Planned |
| ES-036 canonical spec | — | This document |

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Entity Created | Persisted with audit record |
| Entity Updated | Version checked · audit recorded |
| Concurrent Update Conflict | `CONCURRENCY` error |
| Rollback Successful | Transaction rolled back · no partial state |
| Soft Delete | Status marked deleted · recoverable |
| Archive Retrieval | Archived record searchable |
| Migration Applied | Schema updated · data preserved |
| Migration Rolled Back | Reversible migration |
| Backup Restored | RPO/RTO met |
| Provider Failure | Graceful degradation |

---

# Out of Scope

- Specific database technology
- Cloud provider selection
- Infrastructure provisioning
- High availability topology

These are defined in deployment specifications.

---

# Future Enhancements

- Distributed Persistence · Read Replicas · Event Sourcing · CQRS
- Vector Storage · Graph Database · Time-Series Optimisation · Multi-Region Replication

---

# Definition of Done

The Database & Persistence Architecture is complete when:

- Persistence standards are defined and enforced platform-wide
- Transaction strategy operates on production database
- Audit model captures full mutation history
- Migration strategy is operational with version control
- Backup and recovery requirements are met
- Business workspace data persists through repository layer
- ES-036 acceptance gaps closed
- Founder approval is received

**Status:** Persistence **foundation delivered** (ES-010 · RR-002). Full ES-036 database architecture — **Construction Phase alignment pending**.

---

# References

| Document | Location |
|----------|----------|
| ES-010 Persistence Foundation | [ES-010-Persistence-Foundation.md](./ES-010-Persistence-Foundation.md) |
| ES-033 Event & Messaging | [ES-033-Event-Messaging-Architecture.md](./ES-033-Event-Messaging-Architecture.md) |
| ES-034 Provider Standards | [ES-034-Provider-Data-Contract-Standards.md](./ES-034-Provider-Data-Contract-Standards.md) |
| ES-056 Data Governance & Information Architecture | [ES-056-ORION-Data-Governance-Information-Architecture.md](./ES-056-ORION-Data-Governance-Information-Architecture.md) |
| ES-035 API Design Standards | [ES-035-API-Design-Standards.md](./ES-035-API-Design-Standards.md) |
| ES-037 Authentication & Authorisation | [ES-037-Authentication-Authorisation-Architecture.md](./ES-037-Authentication-Authorisation-Architecture.md) |
| ES-038 Audit Logging & Observability | [ES-038-Audit-Logging-Observability-Architecture.md](./ES-038-Audit-Logging-Observability-Architecture.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| RR-002 Persistence Foundation | [RR-002-v0.4.0-Persistence-Foundation.md](../06_Releases/RR-002-v0.4.0-Persistence-Foundation.md) |
| TD-001 · TD-002 | [Technical_Debt_Register.md](../09_Standards/Technical_Debt_Register.md) |
| PA-001 Platform Architecture | [ORION_Platform_Architecture.md](../03_Architecture/ORION_Platform_Architecture.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |

---

# Closing Statement

The Database & Persistence Architecture establishes the long-term integrity of ORION's information assets.

Its purpose is to ensure that business data remains reliable, secure, traceable, and available throughout its lifecycle while providing a scalable foundation for future growth.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | RR-002 (foundation) · ES-036 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**

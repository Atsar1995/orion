# ADR-007 — Production Persistence Strategy

**Identifier:** ADR-007  
**Mission:** P-015.3 — Production Architecture Decision Records  
**Status:** Accepted  
**Date:** 2026-08-01  
**Authors:** Chief Enterprise Architect  
**Reviewers:** Architecture Review Board · Platform Engineering Lead · HCM Domain Lead  
**Version:** 1.0  
**Architecture Baseline:** v1.0 Candidate → v1.0 GA (pending implementation)

**Implements:** [ES-036 Database & Persistence Architecture](../../02_Engineering/ES-036-Database-Persistence-Architecture.md) · Remediates [TD-HCM-001](../../HCM/Engineering/HCM-Technical-Debt-Register.md)

---

## Problem Statement

ORION domains persist state exclusively through **in-memory stores** (`InMemoryHcmStore`, in-memory CRM/Finance/Data Platform repositories). Data does not survive process restart. This blocks Enterprise GA, violates ES-036 construction-phase requirements, and prevents credible multi-tenant production deployment.

Without a production persistence decision, Wave 1 implementation (P-015.4–P-015.5) cannot proceed.

---

## Context

- [P-015.1 Assessment](../../00_Governance/P-015.1-Enterprise-Production-Readiness-Assessment.md): persistence is **Critical** gap INF-001 · score 35/100 on platform infrastructure.
- [P-015.2 Plan](../../00_Governance/P-015.2-Production-Readiness-Implementation-Plan.md): Wave 1 requires ADR acceptance before Gate 5.
- [ES-036](../../02_Engineering/ES-036-Database-Persistence-Architecture.md): repository pattern delivered; transactional store **planned**.
- [Handbook](../../00_Governance/ORION_Enterprise_Architecture_Handbook_v1.0.md): API → Facade → Service → Repository → Store; organization isolation mandatory.
- HCM RC1 proves repository interfaces are swappable — `InMemoryHcmStore` is an adapter, not the contract.

---

## Decision

ORION adopts **PostgreSQL** as the **sole production transactional datastore** for Enterprise GA (v1.0.x).

1. **Platform persistence abstraction** — Introduce a vendor-neutral `PlatformStore` / repository adapter layer above the database driver; domains implement repository interfaces against adapters, never against SQL directly in services.
2. **First consumer** — Enterprise HCM (`lib/hcm/`) migrates from `InMemoryHcmStore` to PostgreSQL adapters in P-015.5.
3. **Development and CI** — **SQLite** is permitted **development and automated test environments only**; never production or staging.
4. **Schema ownership** — Each domain owns its schema namespace (e.g., `hcm_*` tables); platform identity/org tables in `platform_*` namespace.
5. **Migrations** — Versioned forward-only migrations with rollback scripts documented per release; no manual prod schema edits.
6. **Transactions** — Replace NoOp `TransactionManager` with real unit-of-work boundaries for multi-entity HCM mutations.
7. **Alignment with ES-036** — Entity standards (id, timestamps, org scope, soft delete pattern) enforced at adapter layer for GA scope.

**Explicitly not selected for GA:** SQL Server, MySQL as primary store. Multi-database polyglot persistence is rejected for GA scope.

---

## Alternatives Considered

| Alternative | Summary | Pros | Cons | Reason Not Selected |
|-------------|---------|------|------|---------------------|
| **PostgreSQL** ✅ | Open-source RDBMS · JSONB · strong ecosystem | Mature · cloud-neutral · ORM/tooling · ACID | Ops expertise required | **Selected** — best balance for SMB/mid-market SaaS |
| **SQL Server** | Microsoft enterprise RDBMS | Enterprise features · Azure integration | Licensing · less alignment with current stack · vendor lock-in | Deferred — customer-specific deployments only via future ADR if required |
| **MySQL / MariaDB** | Popular open-source RDBMS | Wide hosting support | Weaker JSON/constraint story vs PostgreSQL for event metadata | Not selected — PostgreSQL preferred for ORION data model |
| **SQLite (production)** | Embedded file DB | Simple ops | No concurrent multi-tenant production scale · not enterprise GA | **Dev/CI only** |
| **Status quo (in-memory)** | Current RC state | Zero infra | Data loss · GA blocker | Rejected — TD-HCM-001 P0 |

---

## Consequences

### Positive

- Durable HCM data enables GA and design partner production pilots.
- Repository abstraction preserved — CRM/Finance/Data Platform can adopt same pattern post-GA.
- PostgreSQL aligns with common cloud managed services (RDS, Cloud SQL, Azure Database for PostgreSQL).
- ES-036 construction phase can complete for transactional storage.

### Negative

- Infrastructure and migration engineering cost (Wave 1 XL effort).
- Connection pooling, migration tooling, and backup procedures become mandatory ops work.
- CI must run PostgreSQL or SQLite adapter tests — longer CI if not optimized.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Migration breaks HCM 79/79 tests | Medium | High | Parallel in-memory adapter until cutover gate; incremental repository migration |
| Schema drift between domains | Medium | Medium | Domain-owned migrations · ARB review · naming conventions |
| SQLite dev vs PostgreSQL prod divergence | Medium | Medium | CI job on PostgreSQL; shared SQL where possible |
| Performance regression | Low | Medium | Wave 3 benchmarks · indexes in migration design |
| Rollback failure | Low | High | Documented rollback scripts · feature flag for adapter selection during RC |

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| ES-036 | Engineering Spec | Updated implementation annex post-ADR |
| ADR-009 | Enables | Audit fields align with RBAC actor identity |
| ADR-010 | Requires | Connection strings via secrets pattern |
| ADR-012 | Enables | Staging/prod deploy includes migration step |
| P-015.4 | Mission | Platform Store abstraction |
| P-015.5 | Mission | HCM PostgreSQL adapters |

---

## Implementation Guidance

1. **Gate 4** — Publish ES-036 implementation annex before any Gate 5 code.
2. **Composition root** — Wire PostgreSQL adapters in `createHcmWiring.ts` (or platform DI root); retain in-memory factory for unit tests.
3. **Organization isolation** — Every query includes `organizationId` from `ServiceContext`; enforce in adapter base class.
4. **Migration order** — Platform identity tables (if persisted) → HCM foundation → time → talent/payroll stores.
5. **Cutover** — RC branch uses PostgreSQL in staging; in-memory removed from staging after W1-E2 pass.
6. **Rollback** — Environment variable `ORION_STORE_ADAPTER=memory|postgres` allowed **only** in development; production must reject `memory`.
7. **Data Platform** — Remains in-memory for v1.0.x GA unless explicitly scoped; document as known limitation.

---

## Operational Implications

| Area | Implication |
|------|-------------|
| **Backup** | PostgreSQL native backup + PITR — see ADR-010/ADR-012 Wave 2 runbooks |
| **DR** | RTO/RPO targets defined in Wave 2 ops docs; restore drill mandatory before GA |
| **Monitoring** | Connection pool metrics, query latency — ADR-011 |
| **Scaling** | Single-primary PostgreSQL for v1.0.x GA; read replicas deferred |
| **Hosting** | Technology-neutral — Docker, Kubernetes, or managed PostgreSQL |

---

## Migration Strategy

| Phase | Action |
|-------|--------|
| **1** | ADR-007 Accepted · ES-036 annex approved (Gate 4) |
| **2** | Implement `PlatformStore` interfaces (P-015.4) |
| **3** | HCM schema migrations v1 · seed/bootstrap scripts |
| **4** | Swap HCM repositories one bounded context at a time (foundation → time → talent) |
| **5** | Integration tests: restart survival · org isolation |
| **6** | Remove in-memory as default in staging/production configs |
| **7** | Close TD-HCM-001 · re-certify |

**Data migration:** Greenfield bootstrap for GA — no production customer data exists. Design partner RC may require export/import tooling — defer to v1.1 if needed.

---

## Rollback Considerations

- **Pre-GA:** Revert git tag; restore database snapshot; re-enable in-memory adapter in dev only.
- **Post-GA:** semver patch rollback + database migration down script required per Release Policy.
- **Breaking schema change:** Requires ADR supersession and semver major per ES-097.

---

## Future Review Criteria

Review this ADR when:

- Multi-region HA or read replicas required.
- Customer mandates SQL Server or alternate engine.
- Domain count exceeds single-database operational limits.
- Event sourcing or CQRS read models require separate store (Analytics Wave).

**Next review:** Annual ARB or Enterprise Platform v3 milestone.

---

## Related Documents

| Document | Location |
|----------|----------|
| P-015.1 Assessment | [P-015.1-Enterprise-Production-Readiness-Assessment.md](../../00_Governance/P-015.1-Enterprise-Production-Readiness-Assessment.md) |
| ES-036 | [ES-036-Database-Persistence-Architecture.md](../../02_Engineering/ES-036-Database-Persistence-Architecture.md) |
| HCM debt | [HCM-Technical-Debt-Register.md](../../HCM/Engineering/HCM-Technical-Debt-Register.md) |
| ES-097 | [ES-097-ORION-Architecture-Governance-ADR-Policy.md](../../00_Governance/ES-097-ORION-Architecture-Governance-ADR-Policy.md) |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-01 | Chief Enterprise Architect | Accepted by ARB — P-015.3 |

---

*ORION Architecture Decision Record · ADR-007 · docs/11_Governance/ADR/*

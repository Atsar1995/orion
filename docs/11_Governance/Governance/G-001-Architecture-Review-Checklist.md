# G-001 — Architecture Review Checklist

**Parent:** [G-001 Enterprise Architecture Governance Charter](./G-001-Enterprise-Architecture-Governance-Charter.md)  
**Version:** 1.0  
**Effective Date:** 31 July 2026  

Use this checklist at **Gate 4 approval**, **major pull requests**, and **platform/domain certification**.

---

## Review Metadata

| Field | Value |
|-------|-------|
| Initiative / Mission ID | |
| Domain / Platform | |
| Reviewer | |
| Date | |
| Gate | ☐ Gate 4  ☐ PR  ☐ Certification |

---

## 1. Domain & Scope

- [ ] Business Domain Blueprint (D-xxx) exists and is approved
- [ ] Domain Model (D-xxx) defines aggregates, entities, and relationships
- [ ] Governance rules documented (domain-specific D-xxx or annex)
- [ ] Engineering Specification (ES-xxx) approved before implementation
- [ ] Scope boundaries explicit (in-scope / out-of-scope tables present)
- [ ] No duplicate platform capability reimplementation planned

---

## 2. Architectural Principles

- [ ] **SOLID** — services have single responsibility; dependencies on abstractions
- [ ] **DDD** — bounded context identified; aggregate roots named
- [ ] **Clean Architecture** — domain logic independent of Next.js/API framework
- [ ] **Repository Pattern** — persistence behind interface; no route → store access
- [ ] **Facade Pattern** — single public `index.ts` entry point defined
- [ ] **Event-Driven** — material mutations publish IIL events with correlation ID
- [ ] **Dependency Injection** — repositories injected; no hidden singletons in services
- [ ] **Organization Isolation** — all operations accept `ServiceContext`
- [ ] **Metadata-Driven** — extensions via reference/metadata, not hard-coded forks
- [ ] **Backward Compatibility** — public API changes assessed for breaking impact

---

## 3. Public API Review

- [ ] Public facade exports **services and contracts only**
- [ ] No `InMemory*` implementations in public exports
- [ ] No repository implementations in public exports
- [ ] Internal modules not importable from other domains
- [ ] `@/lib/{domain}` is the sole external import path
- [ ] Breaking changes have ADR and migration plan
- [ ] API catalogue or ES documents public operations

---

## 4. Layer Boundaries

- [ ] Presentation layer does not contain business rules
- [ ] API routes delegate to facade/services only
- [ ] No cross-domain `lib/` imports (Finance ↔ CRM ↔ Hospitality)
- [ ] Platform consumed via public facade (`@/lib/platform/data`, etc.)
- [ ] Static `*-data.ts` not used as authoritative persistence
- [ ] Types live in `types/`; canonical models not duplicated

---

## 5. Domain Modeling

- [ ] Aggregate roots identified with consistency boundaries
- [ ] Cross-aggregate coordination via events or application services
- [ ] Immutable IDs used for cross-aggregate references
- [ ] Master data registration via Data Platform where applicable
- [ ] PII fields classified per data governance policy

---

## 6. Event Architecture

- [ ] Outbound events listed in Event Catalogue
- [ ] Inbound events and handlers documented
- [ ] Event payloads include minimum required fields
- [ ] Idempotency strategy defined for event handlers
- [ ] `sourceService` and `correlationId` present on published events

---

## 7. Security Review

- [ ] Organization isolation enforced at service layer
- [ ] Role-based authorization defined for sensitive operations
- [ ] Input validation at API boundaries
- [ ] No secrets in source code
- [ ] Audit events for sensitive mutations (via Compliance Platform)
- [ ] Trust Review Checklist passed ([Canon C-009](../../00_FOUNDATION/CANON_COMPLIANCE_CHECKLIST.md))

---

## 8. Performance & Scalability (where applicable)

- [ ] Expected volume / concurrency documented
- [ ] Pagination on list operations
- [ ] No unbounded in-memory scans in hot paths
- [ ] Caching strategy documented (if any)
- [ ] N+1 or god-repository anti-patterns avoided

---

## 9. Documentation

- [ ] Engineering spec complete and indexed
- [ ] Architecture index updated ([ARCHITECTURE_INDEX](../../03_Architecture/ARCHITECTURE_INDEX.md))
- [ ] Certification document planned or present
- [ ] Technical debt entries filed for known compromises
- [ ] ADR created for major architectural decisions

---

## 10. Review Outcome

| Decision | ☐ Approved  ☐ Approved with conditions  ☐ Rejected |
|----------|------------------------------------------------------|
| Conditions / Actions | |
| Sign-off (Chief Enterprise Architect) | |
| Sign-off (Domain Lead) | |

---

*G-001 · Architecture Review Checklist · ORION Enterprise Platform*

# ORION Enterprise Architecture Freeze

**Version:** v0.3  
**Date:** 30 July 2026  
**Authority:** Chief Enterprise Architect  
**Status:** ARCHITECTURE APPROVED · ARCHITECTURE FROZEN · FOR ENTERPRISE DEVELOPMENT  

---

## Purpose
---

## Enterprise Domain Map

The ORION Enterprise Domain Map defines all platform and business domains at Baseline v0.3, their certification status, and their relationship to the shared executive platform.

| Layer | Domain / Service | Status | Phase / Epic |
|-------|------------------|--------|--------------|
| Foundation | Canon (C-001 through C-010) | Approved · Frozen | Phase I |
| Platform | Executive Platform | Certified | Phase II |
| Platform | Identity | Approved · Frozen | Phase II |
| Platform | Organization | Approved · Frozen | Phase II |
| Platform | Executive Brief | Approved · Frozen | Phase II |
| Platform | Executive Memory | Approved · Frozen | Phase II |
| Platform | Decision Intelligence | Approved · Frozen | Phase II |
| Platform | Integration Layer (IIL) | Approved · Frozen | Phase II |
| Platform | Notifications | Approved · Frozen | Phase II |
| Platform | Search | Approved · Frozen | Phase II |
| Platform | Analytics | Approved · Frozen | Phase II |
| Platform | Audit | Approved · Frozen | Phase II |
| Business | Hospitality Domain | Certified (CONDITIONAL GO) | P-007 |
| Business | Commercial Domain | Certified (CONDITIONAL GO) | P-008 |
| Business | Finance Domain | Not Started · Next | Phase IV |
| Business | HR | Planned | Future |
| Business | Commerce | Planned | Future |
| Business | Marketing | Planned | Future |
| Business | Procurement | Planned | Future |
| Business | Assets | Planned | Future |
| Business | Supply Chain | Planned | Future |
| Business | Manufacturing | Planned | Future |
| Business | Healthcare | Planned | Future |
| Business | Education | Planned | Future |
| Business | Government | Planned | Future |

```
┌─────────────────────────────────────────────────────────────┐
│                    Executive Operating Layer                 │
│  Executive Brief · Decision Intelligence · Executive Memory  │
└─────────────────────────────┬───────────────────────────────┘
                              │ signals / events
┌─────────────────────────────┴───────────────────────────────┐
│     Shared Platform (Identity · Organization · IIL · …)    │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
    ┌──────┴──────┐                ┌──────┴──────┐
    │ Hospitality │                │  Commercial  │
    │  CERTIFIED  │                │  CERTIFIED  │
    └─────────────┘                └──────────────┘
           │                              │
           └────────── events ──────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Finance (NEXT)   │
                    └───────────────────┘
```

This document formally freezes the ORION Enterprise Architecture as **Baseline v0.3** immediately before Finance Domain engineering begins.

The freeze establishes the approved enterprise architecture and prevents uncontrolled architectural changes. All development from this point forward must conform to the approved boundaries, shared services, event contracts, and engineering standards documented herein and in companion governance artifacts.

---

## Approved Architecture

The following platform capabilities are **ARCHITECTURE APPROVED**, **ARCHITECTURE FROZEN**, and **FOR ENTERPRISE DEVELOPMENT**:

| Component | Status |
|-----------|--------|
| Canon C-001 through C-010 | Approved · Frozen |
| Executive Platform | Approved · Frozen |
| Identity | Approved · Frozen |
| Organization | Approved · Frozen |
| Executive Brief | Approved · Frozen |
| Executive Memory | Approved · Frozen |
| Decision Intelligence | Approved · Frozen |
| Integration Layer | Approved · Frozen |
| Notifications | Approved · Frozen |
| Search | Approved · Frozen |
| Analytics | Approved · Frozen |
| Audit | Approved · Frozen |
| Hospitality Domain | Approved · Frozen |
| Commercial Domain | Approved · Frozen |

No modification to approved architecture components is permitted without the change control process defined below.

---

## Approved Domains

### Hospitality Domain

- **Certification:** CONDITIONAL GO (Mission P-007.8)
- **Designation:** ORION Reference Workspace
- **Scope:** Property, inventory, reservations, guests, front office, housekeeping, billing, hospitality analytics
- **Boundary:** Owns hospitality operations; references Commercial for customer identity; publishes billing events upward

### Commercial Domain

- **Certification:** CONDITIONAL GO (Mission P-008.8)
- **Designation:** Enterprise Reference Implementation for customer, sales, and commercial capabilities
- **Scope:** Universal Party, leads, opportunities, proposals, contracts, agreements, commercial intelligence, customer analytics, executive dashboard
- **Boundary:** Owns customer relationship lifecycle and derived commercial intelligence; does not own general ledger accounting

---

## Approved Shared Services

All business domains consume the following shared platform services. Ownership and boundaries are frozen:

| Service | Owner | Domain Consumption Rule |
|---------|-------|------------------------|
| Identity | Platform | Domains resolve org-scoped context; no embedded auth |
| Organization | Platform | All data scoped by `organizationId` |
| Executive Brief | Platform | Domains publish brief signals upward |
| Executive Memory | Platform | Domains contribute via IIL events and approved contracts |
| Decision Intelligence | Platform | Domains recommend; executives decide |
| Integration Layer (IIL) | Platform | Sole cross-domain event bus |
| Notifications | Platform | Domains emit events; platform delivers |
| Search | Platform | Domain-scoped search within boundaries; platform federates |
| Analytics | Platform | Domain analytics internal; platform composes executive views |
| Audit | Platform | Domain events contribute; platform owns audit trail |

Shared services shall not be reimplemented within workspace or domain boundaries.

---

## Approved Domain Boundaries

The following ownership rules are frozen:

| Data / Capability | Authoritative Owner | Consumers |
|-------------------|---------------------|-----------|
| Customer / Party identity | Commercial (P-008.1) | Hospitality, Finance, all domains |
| Hospitality stays and reservations | Hospitality | Commercial intelligence (read), Finance (events) |
| Sales pipeline and opportunities | Commercial | Executive intelligence, Finance (events) |
| Proposals, contracts, agreements | Commercial | Intelligence, Executive dashboard |
| Derived commercial metrics (CLV, retention) | Commercial Intelligence | Executive Brief, Executive dashboard |
| General ledger and accounting | Finance (planned) | Executive Brief, Decision Intelligence |
| User identity and sessions | Platform Identity | All domains |
| Cross-domain events | Integration Layer | All publishers and subscribers |

Direct cross-domain database access is prohibited. Cross-domain interaction occurs only through approved APIs and IIL event contracts.

---

## Approved Event Architecture

- All cross-domain communication flows through the **Intelligence Integration Layer (IIL)**
- Domains publish immutable business events with typed payloads
- Event contracts shall remain **backward compatible** after this freeze
- Breaking event contract changes require an ADR and consumer notification
- Priority levels (normal, high) are assigned at publish time for executive-relevant events
- Domain event publishers are registered and authorized per workspace service ID

Approved event publishers at Baseline v0.3 include Hospitality domain publishers (reservations, guests, front office, housekeeping, billing, analytics) and Commercial domain publishers (party, commercial, agreements, commercial intelligence, customer intelligence, executive dashboard).

---

## Approved Engineering Standards

- **Validation gates:** `typecheck`, `lint`, `test`, `build` required for domain certification
- **Facade pattern:** Public domain API via facades exported from domain index modules
- **Repository chain:** Extending repository interfaces; single in-memory implementation at staging tier
- **Type separation:** Domain types in `types/`; view models in `lib/{domain}/models/`
- **API convention:** `{ success: true, data }` / `{ success: false, error }` with org-scoped context
- **Intelligence separation:** Operational transactional data distinct from derived executive metrics
- **No React in services:** Business logic remains framework-independent
- **Import boundary:** External consumers import from `@/lib/{domain}` public API only

---

## Approved Documentation Standards

- Domain architecture documents in `docs/03_Architecture/P-{epic}.x-*.md`
- Certification reports in `docs/11_Governance/Certification/`
- Governance artifacts in `docs/11_Governance/`
- Finance Domain documentation structure established under `docs/Finance/`
- ADRs for platform-wide decisions in `docs/11_Governance/ADR/`
- Canon compliance statement required at mission open and close
- Professional Markdown; consistent headings; no placeholder content

---

## Approved Naming Standards

| Artifact | Convention | Example |
|----------|------------|---------|
| Platform missions | P-{NNN}.{N} | P-008.6 |
| Domain blueprints | D-{NNN} | D-006 |
| Engineering specs | ES-{NNN} | ES-025 |
| Data contracts | DC-{NNN} or DC-FIN-{NNN} | DC-FIN-001 |
| Architecture decisions | ADR-{NNN} | ADR-005 |
| Domain types | `types/{domain}-*.ts` | `types/crm-party.ts` |
| Domain facades | `{Domain}Facade`, `{domain}Service` | `CrmPartyFacade` |
| API routes | `/api/{workspace}/{resource}` | `/api/crm/parties` |
| IIL service ID | `{workspace}-workspace` | `crm-workspace` |

---

## Approved Certification Process

1. **Mission implementation** — domain mission(s) built to specification
2. **Canon identification** — applicable C-001 through C-010 chapters declared at mission start
3. **Engineering validation** — typecheck, lint, test, build all pass
4. **Acceptance criteria** — all mission acceptance criteria verified
5. **Certification report** — GO / CONDITIONAL GO / NO-GO decision documented
6. **Domain certification** — end-to-end domain test and consolidated certification document
7. **Governance update** — PROJECT_STATUS, CHANGELOG, and ROADMAP updated at baseline milestones

Conditional GO permits staging, integration development, and reference designation. Full production GO requires resolution of documented conditions (e.g., database persistence tier).

---

## Architectural Principles

The following principles are confirmed and frozen at Baseline v0.3:

| Principle | Statement |
|-----------|-----------|
| **Domain Driven Design** | Each domain owns its entities, lifecycle, and business rules within explicit bounded contexts |
| **Event Driven Architecture** | Domains communicate through IIL events; no direct cross-domain state mutation |
| **Executive Operating System** | ORION is an executive OS; every capability must improve executive decision quality |
| **Shared Platform** | Identity, organization, intelligence, integration, audit, and search are platform concerns |
| **Executive Intelligence** | Brief, Decision Intelligence, and Memory compose upward from domain signals |
| **Immutable Business Events** | Published events are immutable records of business fact |
| **Separation of Concerns** | Operational data, derived intelligence, and presentation are distinct layers |
| **Single Source of Truth** | Each entity type has one authoritative domain owner |
| **Microservice Ready** | Domain boundaries and contracts permit future service extraction |
| **API First** | APIs and data contracts precede or accompany implementation |
| **Security First** | Org-scoped access, auth context on all routes, no secrets in source |
| **Documentation First** | Blueprints and contracts before code; certification before next domain |

---

## Certification

| Component | Status |
|-----------|--------|
| Hospitality Domain | **CERTIFIED** (CONDITIONAL GO) |
| Commercial Domain | **CERTIFIED** (CONDITIONAL GO) |
| Core Platform | **CERTIFIED** |
| Overall Architecture | **APPROVED** |
| Finance Domain | **NOT STARTED** |

---

## Change Control

After this freeze, the following rules apply:

- **Existing architecture shall not be modified** without an Architecture Decision Record (ADR) approved by the Chief Enterprise Architect
- **Domain boundaries shall remain stable** — changes require ADR and affected domain lead review
- **Shared services shall not change ownership** — platform retains Identity, Organization, IIL, Brief, Memory, Decision, Audit, Search, Notifications, Analytics
- **Event contracts shall remain backward compatible** — breaking changes require ADR, version increment, and consumer migration plan
- **Data ownership rules shall remain unchanged** — authoritative owners listed in Approved Domain Boundaries are frozen
- **Canon changes require Executive approval** — amendments follow Canon Amendment (CA) process and `CHANGELOG_CANON.md` update

Approved change path:

1. Identify need and draft ADR in `docs/11_Governance/ADR/` or `docs/Finance/Decisions/`
2. Assess Canon impact (C-001 through C-010)
3. Chief Enterprise Architect review and approval
4. Update `docs/11_Governance/CHANGELOG.md`
5. Communicate to affected domain leads

---

## Next Phase

**Architecture Freeze Complete.**

| Item | Value |
|------|-------|
| **Next Domain** | Finance |
| **Status** | Ready for Development |
| **Documentation Structure** | `docs/Finance/` (Blueprints, Engineering, API, DataContracts, Decisions) |
| **Prerequisite** | Finance Domain Blueprint approved before implementation |

Finance Domain engineering may begin. Finance must consume approved shared services and conform to all frozen architectural principles, boundaries, and standards defined in this document and [ARCHITECTURE_BASELINE_v0.3.md](./ARCHITECTURE_BASELINE_v0.3.md).

---

*ORION Enterprise Architecture Freeze · Baseline v0.3 · 30 July 2026 · Chief Enterprise Architect*

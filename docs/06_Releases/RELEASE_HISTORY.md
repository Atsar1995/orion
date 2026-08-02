# ORION Release History

**Authority:** [Release-Policy.md](./Release-Policy.md) · [G-001 Release Governance Guide](../11_Governance/Governance/G-001-Release-Governance-Guide.md)  
**Changelog:** [CHANGELOG.md](./CHANGELOG.md)  
**Architecture baselines:** [ORION-Architecture-Baselines.md](./ORION-Architecture-Baselines.md)

This document is the **canonical release timeline** for the ORION Enterprise Platform. Detailed mission records remain in `RR-xxx` release records and domain release notes — this history consolidates version-level facts only.

---

## Release Index

| Version | Date | Status | Architecture Baseline | Certification | Release Notes |
|---------|------|--------|----------------------|---------------|---------------|
| **v1.0.1-rc1** | Aug 2026 | RC · Internal | v1.0 Candidate | **CONDITIONAL GO** | [Notes](./v1.0.1-rc1-Release-Notes.md) · [Cert](./v1.0.1-rc1-Certification.md) |
| **v1.0.0-rc1** | Aug 2026 | RC · Superseded by v1.0.1-rc1 | v1.0 Candidate | CONDITIONAL GO | Same commit as v1.0.1-rc1 |
| **v0.4.1-alpha** | 31 Jul 2026 | Alpha · Internal | v0.3 | **CONDITIONAL GO** | [Notes](./v0.4.1-alpha-Release-Notes.md) |
| **v0.4.0-alpha** | 25 Jul 2026 | Alpha · Internal | v0.3 | Informal | [docs/releases/v0.4.0-alpha-Release-Notes.md](../releases/v0.4.0-alpha-Release-Notes.md) |
| **v0.4.0** | Jul 2026 | Internal | v0.3 | — | Persistence foundation |
| **v0.2.0** | 26 Jul 2026 | Internal | — | — | Business Health Engine |
| **v1.2.0** | 23 Jul 2026 | Released | Phase I | — | Business Platform (Finance + CRM) |
| **v1.1.0** | 23 Jul 2026 | Released | Phase I | — | Executive Experience |
| **v1.0.0** | Jul 2026 | Tagged | Phase I baseline | — | Phase I architecture freeze |
| **v0.7** | 22 Jul 2026 | Stable internal | Foundation | — | Foundation complete |
| **v0.3.0** | Jul 2026 | Released | — | — | Identity platform |

---

## v1.0.1-rc1 — Enterprise HCM · Governance Framework

| Field | Value |
|-------|-------|
| **Date** | August 2026 |
| **Status** | Release Candidate |
| **Git tag** | `v1.0.1-rc1` |
| **Branch** | `release/v1.0.1` |
| **Commit** | `03ec4b2` |

**Major achievements:**

- Enterprise HCM v1.0 — complete P-012 domain (organization through talent)
- 48 HCM REST APIs · 67+ IIL events · 13 workflow triggers
- Enterprise Architecture Handbook v1.0 (P-013.1)
- ES-090 · ES-091 · ES-096 · ES-097 governance standards
- Release management consolidation (P-013.11)

**Architecture baseline:** v1.0 Candidate — [ORION-Architecture-Baselines.md](./ORION-Architecture-Baselines.md#baseline-v10-candidate-august-2026)

**Certification:** **CONDITIONAL GO** — [v1.0.1-rc1-Certification.md](./v1.0.1-rc1-Certification.md)

**Known limitations:**

- In-memory HCM persistence (TD-HCM-001)
- No HCM permission matrix (TD-HCM-005)
- No payroll/talent REST routes (TD-HCM-002)
- 6 pre-existing full-suite test failures (CRM/Finance docs)

---

## v0.4.1-alpha — Enterprise Data Platform

| Field | Value |
|-------|-------|
| **Date** | 31 July 2026 |
| **Status** | Alpha · Internal |
| **Programme** | P-011 Phase I |

**Major achievements:**

- Master Data Registry (P-011.1) — 23 entity types
- Data Validation Framework (P-011.4)
- Synchronization Engine (P-011.5)
- Platform certificate P-011.8

**Architecture baseline:** v0.3 — [ARCHITECTURE_FREEZE_v0.3.md](../11_Governance/Architecture/ARCHITECTURE_FREEZE_v0.3.md)

**Certification:** **CONDITIONAL GO** — [ENTERPRISE DATA PLATFORM CERTIFICATE](../Data/Engineering/ENTERPRISE_DATA_PLATFORM_CERTIFICATE.md)

**Known limitations:**

- P-011.2–P-011.3, P-011.6–P-011.7 deferred
- In-memory persistence · 18 full-suite test failures at release
- D-012 master data model not authored

---

## v1.2.0 — Business Platform Foundation

| Field | Value |
|-------|-------|
| **Date** | 23 July 2026 |
| **Status** | Released |
| **Git tag** | `v1.2.0` |

**Major achievements:**

- Finance Workspace (Missions 15A–15C) — [RR-009](./RR-009-Mission15A-Finance-Workspace-Foundation.md) through [RR-011](./RR-011-Mission15C-Receivables-Payables-Management.md)
- CRM / Customer Intelligence (Missions 16A–16D) — [RR-012](./RR-012-Mission16A-Customer-Intelligence-Foundation.md) through [RR-015](./RR-015-Mission16D-Executive-Relationship-Intelligence-AI-Readiness.md)
- Executive Intelligence Platform (Missions 17A–17B) — [RR-016](./RR-016-Mission17A-Executive-Intelligence-Foundation.md) · [RR-017](./RR-017-Mission17B-Executive-Intelligence-Engines.md)
- ORION Constitution · Governance Framework · ES programme (043–065)

**Architecture baseline:** [ORION v1.0 Architecture Baseline](../03_Architecture/ORION_v1.0_Architecture_Baseline.md) (Phase I)

**Certification:** Mission-level release records; no platform RC certification

---

## v1.1.0 — Executive Experience

| Field | Value |
|-------|-------|
| **Date** | 23 July 2026 |
| **Status** | Released |
| **Git tag** | `v1.1.0` |

**Major achievements:**

- Executive Shell · Executive Brief default landing
- Global Command Palette · Universal Search (Missions 14A–14C)
- [RR-007](./RR-007-Mission14A-Experience-Foundation.md) · [RR-008](./RR-008-Mission14C-Command-Palette-Universal-Search.md)

---

## v0.7 — Foundation Complete

| Field | Value |
|-------|-------|
| **Date** | 22 July 2026 |
| **Status** | Stable internal |
| **Git tag** | `v0.7` |

**Major achievements:**

- Executive Command Center · Intelligence Workspace · Configuration Workspace
- Shared Design System · platform polish
- [RR-003](./RR-003-v0.7-Foundation-Complete.md)

---

## v0.4.0 — Persistence Foundation

| Field | Value |
|-------|-------|
| **Date** | July 2026 |
| **Status** | Released |

**Major achievements:**

- ES-010 Persistence Foundation
- Repository contracts · in-memory implementations · DI container
- [RR-002](./RR-002-v0.4.0-Persistence-Foundation.md)

---

## Domain Certification Cross-Reference

| Domain / Programme | Certification Report | Decision |
|--------------------|---------------------|----------|
| Enterprise HCM v1.0 | [v1.0.1-rc1-Certification.md](./v1.0.1-rc1-Certification.md) | CONDITIONAL GO |
| Enterprise Data Platform | [ENTERPRISE DATA PLATFORM CERTIFICATE](../Data/Engineering/ENTERPRISE_DATA_PLATFORM_CERTIFICATE.md) | CONDITIONAL GO |
| Commercial (CRM) P-008 | [P-008.8](../11_Governance/Certification/P-008.8-Commercial-Domain-Certification.md) | See report |
| Hospitality P-007 | [P-007.8](../11_Governance/Certification/P-007.8-Hospitality-Workspace-Certification.md) | See report |
| Platform Beta S1E | [S1E-v1.0-RC1](../11_Governance/Certification/S1E-v1.0-RC1-Beta-Certification-Report.md) | NO-GO |
| Canon P-001 | [P-001](../11_Governance/Certification/P-001-Canon-Compliance-Certification-Report.md) | See report |

---

## Release Record Archive

Mission-level release records (`RR-xxx`) in this folder:

| Range | Theme |
|-------|-------|
| RR-002 – RR-003 | Persistence · Foundation |
| RR-007 – RR-008 | Executive Experience |
| RR-009 – RR-011 | Finance Workspace |
| RR-012 – RR-015 | CRM / Customer Intelligence |
| RR-016 – RR-017 | Executive Intelligence |
| RR-018 – RR-019 | CRM v1 · Executive Productivity |

---

*ORION Enterprise Platform · Release History · Maintained by Release Management (P-013.11)*

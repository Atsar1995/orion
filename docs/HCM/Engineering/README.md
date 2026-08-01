# Human Capital Management (HCM) — Engineering

**Domain:** Human Capital Management (Workforce)  
**Epic:** P-012 — Enterprise HCM  
**Version:** Enterprise HCM v1.0  
**Architecture Baseline:** v0.5.0-beta  
**Owner:** HCM Domain Lead (to be assigned)

---

## Purpose

This folder contains the **mandatory engineering contract** for all P-012.x HCM implementation missions. Documents translate approved architecture blueprints (D-014) into package structure, public APIs, repository contracts, events, dependency rules, and testing standards.

---

## Contents

### Core Specifications

| Document | Description |
|----------|-------------|
| [ES-HCM-001 — Enterprise HCM Engineering Specification](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md) | Authoritative engineering reference |
| [HCM Architecture Guide](./HCM-Architecture-Guide.md) | Layering, facade, DI, IIL, workflow |
| [HCM Release Notes v1.0](./HCM-Release-Notes.md) | v1.0 delivery summary |

### Developer Experience

| Document | Description |
|----------|-------------|
| [HCM Developer Guide](./HCM-Developer-Guide.md) | Getting started, examples, conventions |
| [HCM Package Guide](./HCM-Package-Guide.md) | `lib/hcm/` layout and naming |
| [HCM Dependency Matrix](./HCM-Dependency-Matrix.md) | Allowed and forbidden imports |
| [HCM Testing Guide](./HCM-Testing-Guide.md) | Test types and certification gates |
| [HCM Extension Guide](./HCM-Extension-Guide.md) | Metadata and organization extension |

### Catalogues

| Document | Description |
|----------|-------------|
| [HCM API Catalogue](./HCM-API-Catalogue.md) | Facade operations and REST routes |
| [HCM Event Catalogue](./HCM-Event-Catalogue.md) | IIL outbound events and workflow triggers |

### Operations

| Document | Description |
|----------|-------------|
| [HCM Operational Guide](./HCM-Operational-Guide.md) | Runtime, seed data, troubleshooting |
| [HCM Technical Debt Register](./HCM-Technical-Debt-Register.md) | Known limitations |

### Module Guides (P-012.6)

| Document | Description |
|----------|-------------|
| [P-012.6 Attendance Guide](./P-012.6-Attendance-Guide.md) | Attendance recording |
| [P-012.6 Leave Management Guide](./P-012.6-Leave-Management-Guide.md) | Leave workflows |
| [P-012.6 Roster Guide](./P-012.6-Roster-Guide.md) | Roster planning |
| [P-012.6 Policy Configuration Guide](./P-012.6-Policy-Configuration-Guide.md) | Time policies |
| [P-012.6 API Catalogue](./P-012.6-API-Catalogue.md) | Legacy pointer → HCM-API-Catalogue |
| [P-012.6 Event Catalogue](./P-012.6-Event-Catalogue.md) | Legacy pointer → HCM-Event-Catalogue |

---

## Related Architecture

| Document | Location |
|----------|----------|
| D-014 — Enterprise HCM Architecture Blueprint | [../Blueprints/D-014_Enterprise_HCM_Architecture_Blueprint.md](../Blueprints/D-014_Enterprise_HCM_Architecture_Blueprint.md) |
| D-015 — Enterprise Workforce Domain Model | Planned |
| D-016 — Enterprise Workforce Governance | Planned |
| ES-DATA-001 — Data Platform Engineering Spec | [../../Data/Engineering/ES-DATA-001-Enterprise-Data-Platform-Engineering-Specification.md](../../Data/Engineering/ES-DATA-001-Enterprise-Data-Platform-Engineering-Specification.md) |

---

## Implementation Sequence

| Phase | Mission | Module | Status |
|-------|---------|--------|--------|
| 1 | P-012.1 | Organization Structure | ✓ |
| 2 | P-012.2 | Employee Master | ✓ |
| 3 | P-012.3 | Employment Lifecycle | ✓ |
| 4 | P-012.4 | Recruitment | ✓ |
| 5 | P-012.5 | Onboarding | ✓ |
| 6 | P-012.6 | Time (Attendance, Leave, Roster) | ✓ |
| 7 | P-012.7 | Payroll Foundation | ✓ |
| 8 | P-012.8 | Talent Management | ✓ |

Every mission **must** conform to ES-HCM-001 before certification.

---

## Validation Gates

All P-012.x missions require:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Documentation completeness verified by `HcmDocumentationCertification.test.ts`.

---

*Parent: [docs/HCM/](../) · Reference: [ES-FIN-001 — Finance Domain Engineering Spec](../../Finance/Engineering/ES-FIN-001_Finance_Domain_Engineering_Specification.md)*

# Human Capital Management (HCM)

**Domain:** Workforce / Human Capital Management  
**Status:** Implemented — Enterprise HCM v1.0  
**Route:** `/hcm` (workspace planned)  
**Public API:** `import { hcmFacade } from "@/lib/hcm"`

---

## Overview

Enterprise HCM provides workforce management across the complete employee lifecycle — organization structure, employee master, employment, recruitment, onboarding, time and attendance, leave, rostering, payroll foundation, performance, learning, and talent management.

The domain publishes workforce events to the Intelligence Integration Layer (IIL) for workflow orchestration, finance integration, and executive intelligence.

---

## Quick Start

```typescript
import { hcmFacade } from "@/lib/hcm";

const status = hcmFacade.getDomainStatus();
// All P-012.1–P-012.8 modules implemented
```

REST API base path: `/api/hcm/`

---

## Documentation

### Engineering (Mandatory)

| Document | Description |
|----------|-------------|
| [ES-HCM-001 — Engineering Specification](./Engineering/ES-HCM-001_Enterprise_HCM_Engineering_Specification.md) | Authoritative engineering reference |
| [Developer Guide](./Engineering/HCM-Developer-Guide.md) | Getting started and conventions |
| [API Catalogue](./Engineering/HCM-API-Catalogue.md) | Facade operations and REST routes |
| [Event Catalogue](./Engineering/HCM-Event-Catalogue.md) | IIL outbound events |
| [Architecture Guide](./Engineering/HCM-Architecture-Guide.md) | Layering, DI, integration patterns |
| [Package Guide](./Engineering/HCM-Package-Guide.md) | `lib/hcm/` structure |
| [Dependency Matrix](./Engineering/HCM-Dependency-Matrix.md) | Allowed and forbidden imports |
| [Testing Guide](./Engineering/HCM-Testing-Guide.md) | Test suites and certification gates |
| [Operational Guide](./Engineering/HCM-Operational-Guide.md) | Runtime, seed data, troubleshooting |
| [Technical Debt Register](./Engineering/HCM-Technical-Debt-Register.md) | Known limitations |
| [Release Notes v1.0](./Engineering/HCM-Release-Notes.md) | Delivery summary |

### Architecture

| Document | Description |
|----------|-------------|
| [D-014 — Architecture Blueprint](./Blueprints/D-014_Enterprise_HCM_Architecture_Blueprint.md) | Constitutional architecture |

### Module Guides (P-012.6)

| Document | Topic |
|----------|-------|
| [Attendance Guide](./Engineering/P-012.6-Attendance-Guide.md) | Attendance recording |
| [Leave Management Guide](./Engineering/P-012.6-Leave-Management-Guide.md) | Leave workflows |
| [Roster Guide](./Engineering/P-012.6-Roster-Guide.md) | Roster planning |
| [Policy Configuration Guide](./Engineering/P-012.6-Policy-Configuration-Guide.md) | Time policies |

Full index: [Engineering README](./Engineering/README.md)

---

## Missions

| Mission | Module | Status |
|---------|--------|--------|
| P-012.1 | Organization | ✓ |
| P-012.2 | Employee | ✓ |
| P-012.3 | Employment | ✓ |
| P-012.4 | Recruitment | ✓ |
| P-012.5 | Onboarding | ✓ |
| P-012.6 | Time | ✓ |
| P-012.7 | Payroll | ✓ |
| P-012.8 | Talent | ✓ |

---

## Validation

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

---

*ORION Enterprise Platform · Enterprise HCM v1.0 · Epic P-012*

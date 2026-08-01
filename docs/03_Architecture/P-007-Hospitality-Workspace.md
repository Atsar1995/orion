# P-007 — Hospitality Workspace Architecture

**Mission:** P-007 — Hospitality Workspace v1.0  
**Status:** Production-ready (in-memory persistence)  
**Applicable Canon:** C-001 through C-010  

---

## Purpose

The Hospitality Workspace is ORION's first production business workspace and the reference implementation for all future workspaces (CRM, Finance, Commerce, HR, etc.). It provides a complete operational environment for hotels, resorts, guest houses, homestays, serviced apartments, boutique properties, and villa operators.

The workspace consumes shared platform services — Identity, Organization, Decision Intelligence, Executive Memory, Intelligence Integration Layer, Notifications, Audit, Analytics, and Search — and publishes operational intelligence upward to the Executive Brief.

No standalone logic duplicates platform capabilities.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Executive Operating System                      │
│  Brief · Decisions · Memory · Intelligence Feed              │
└──────────────────────────┬──────────────────────────────────┘
                           │ hospitalityExecutiveProvider
                           │ getHospitalityBriefContribution()
┌──────────────────────────▼──────────────────────────────────┐
│              lib/hospitality/ (Mission P-007)                │
│  HospitalityService · HospitalityRepository                  │
│  mappers · hospitality-events · nav · constants              │
└──────────────────────────┬──────────────────────────────────┘
                           │ ServiceContext (orgId, userId, role)
┌──────────────────────────▼──────────────────────────────────┐
│              Shared Platform Services                        │
│  Organization · Identity · IIL · Memory · Decisions          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  InMemoryHospitalityRepository (seed: ORANIA Heritage Resort)│
└─────────────────────────────────────────────────────────────┘
```

---

## Core Functional Areas

| Area | Routes | Service Methods |
|------|--------|-----------------|
| Property Management | `/hospitality/rooms` | `getPropertyStructure`, `listRooms` |
| Reservations | `/hospitality/reservations` | `listReservations`, `getReservation`, `createReservation` |
| Guests | `/hospitality/guests` | `listGuests`, `getGuest` |
| Front Office | `/hospitality/front-office` | `checkIn`, `checkOut`, `assignRoom` |
| Housekeeping | `/hospitality/housekeeping` | `getHousekeepingBoard`, `listMaintenance` |
| Billing | `/hospitality/billing` | `listBilling` |
| Operations | `/hospitality/operations` | `getOperations`, `getDashboard` |
| Reports | `/hospitality/reports` | `getIntelligence`, `getOperations` |

---

## Platform Integration

### Executive Brief
`composeExecutiveBriefV1` includes `hospitalityHealth` from `hospitalityService.getBriefContribution()` — occupancy, revenue, VIP arrivals, and critical issues.

### Executive Provider (ADR-006)
`hospitalityExecutiveProvider` registered in `register-executive-providers.ts` supplies health, alerts, recommendations, metrics, and briefing line to the Intelligence Bus.

### Intelligence Integration Layer
`publishHospitalityEvent()` publishes `ReservationCreated` and lifecycle events via authorized publisher `hospitality-workspace`.

### Organization & Identity
All pages and APIs resolve `ServiceContext` via `getDecisionServiceContext()`. Data is scoped by `organizationId`.

---

## Module Structure

```
lib/hospitality/
├── constants.ts
├── nav.ts
├── index.ts
├── hospitality-events.ts
├── data/seed-hospitality.ts
├── models/dashboard.ts
├── mappers/dashboard.ts
├── mappers/intelligence.ts
├── providers/hospitality-executive-provider.ts
├── repositories/
│   ├── HospitalityRepository.ts
│   └── InMemoryHospitalityRepository.ts
└── services/HospitalityService.ts
```

---

## Persistence

In-memory repository with ORANIA Heritage Resort seed data. Acceptable for RC1 per P-006A Core Platform Readiness Review. Database persistence is a future mission.

---

## Reference Implementation Standard

Future workspaces must follow this pattern:
1. Public `index.ts` with service facade and brief contribution helper
2. Repository interface + in-memory seed implementation
3. Service layer with no React imports
4. Executive provider registered in `register-executive-providers.ts`
5. IIL event publisher for domain lifecycle events
6. Sub-nav with RBAC metadata
7. Server-rendered pages consuming service via `ServiceContext`
8. API routes with `{ success, data }` envelope
9. Release readiness + brief integration tests

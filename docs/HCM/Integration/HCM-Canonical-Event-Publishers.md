# HCM Canonical Event Publishers

**Document ID:** HCM-INT-001  
**Program:** P-009 — ORION Enterprise Finance Gate 5  
**Mission:** P-009.15 — HCM Native Canonical Event Publishers  
**Version:** 1.0  
**Status:** Implemented  
**Classification:** HCM Integration · Cross-Domain Events  
**Date:** 3 August 2026

**Baseline:** [ADR-013](../../11_Governance/ADR/ADR-013-Durable-Intelligent-Integration-Layer.md) · [ADR-014](../../11_Governance/ADR/ADR-014-Cross-Domain-Event-Contracts.md) · [ADR-015](../../11_Governance/ADR/ADR-015-Domain-Service-Boundaries.md) · [ES-FIN-002](../../Finance/Engineering/ES-FIN-002-Finance-Engineering-Specification.md) · [HCM → Finance Event Chain](../../Finance/Integration/HCM-Finance-Event-Chain.md)

---

## Purpose

Documents native ADR-014 canonical event publication from HCM services for Finance integration. This mission closes **FIN-R-003** by replacing legacy `payload.hcmEventType`-only publication with first-class canonical contracts on the production payroll and expense approval paths.

**Scope:** Cross-domain integration only. No Finance posting, GL, PlatformStore, or transport changes.

---

## Publisher Lifecycle

```
PayrollService.finalize()
  ├── publishHcmPayrollEvent("PayrollFinalized")     ← legacy workflow compat
  └── publishWorkforceCostRecorded() × N entries     ← canonical Finance path

ExpenseApprovalService.approve()
  └── publishExpenseApproved()                       ← canonical Finance path
        └── IIL publish (CustomEvent + canonicalEventType)
              └── FinanceEventConsumer (P-009.9)
```

| Stage | Component | Responsibility |
|-------|-----------|----------------|
| **Trigger** | `PayrollService`, `ExpenseApprovalService` | Domain state transition (finalize / approve) |
| **Publish** | `HcmCanonicalFinancePublisher` | Build ADR-014 envelope + ES-FIN-002 idempotency key |
| **Transport** | IIL (`hcm-workspace`) | Existing in-process event bus — unchanged |
| **Consume** | `FinanceEventConsumer` | Envelope validation → journal posting |

---

## Canonical Contracts

| Canonical Type | Publisher | Entity | Required Payload |
|----------------|-----------|--------|------------------|
| `hcm.workforce.cost.recorded` | `PayrollService.finalize()` | `employee` | `employeeId`, `costPeriodId`, `amount`, `idempotencyKey` |
| `hcm.expense.approved` | `ExpenseApprovalService.approve()` | `expense` | `expenseId`, `amount`, `idempotencyKey` |

### ADR-014 Envelope (preserved)

Every canonical publication includes:

- `eventId` — IIL-generated UUID
- `correlationId` — payroll run ID or expense ID
- `organizationId` — from `ServiceContext`
- `eventVersion` — `"1"` in payload (`HCM_CANONICAL_EVENT_VERSION`)
- `payload.canonicalEventType` — namespaced contract ID
- `payload.sourceDomain` — `"hcm"`
- `payload.idempotencyKey` — `{org}:{hcm-workspace}:{type}:{entity keys}`
- `auditMetadata.sourceDomain` — `"hcm"`

Idempotency keys align with `FinanceEventMapper.buildHcmFinanceIdempotencyKey()`:

- Workforce: `{org}:hcm-workspace:hcm.workforce.cost.recorded:{employeeId}:{costPeriodId}`
- Expense: `{org}:hcm-workspace:hcm.expense.approved:{expenseId}:1`

---

## Migration Strategy

### Phase 1 — Dual Publication (current)

| Path | Event | Consumer |
|------|-------|----------|
| Legacy | `PayrollFinalized` via `hcmEventType` | HCM workflow orchestrator |
| Canonical | `hcm.workforce.cost.recorded` via `canonicalEventType` | Finance posting chain |

Payroll finalize emits **both** event shapes. Finance ignores legacy `hcmEventType` events.

### Phase 2 — Canonical Primary (planned)

- Workflow orchestrator maps canonical types to templates
- Remove optional `hcmEventType` shim from canonical payload (`includeLegacyShim: false`)

### Phase 3 — Legacy Deprecation (planned)

- Retire `PayrollFinalized` as Finance trigger (workflow-only or removed)
- Full ADR-014 `eventType` namespace migration across HCM catalogue

---

## Compatibility Period

| Mechanism | Status | Removal Target |
|-----------|--------|----------------|
| `PayrollFinalized` legacy event | **Active** | Post workflow canonical migration |
| `hcmEventType` shim on canonical events | **Active** (`includeLegacyShim: true`) | Gate 5 Wave B |
| `canonicalEventType` in payload | **Required** | Permanent (ADR-014) |

Finance consumer remains unchanged — certified in P-009.9 with synthetic events; now validated against native HCM publishers in P-009.15.

---

## Implementation Map

| File | Role |
|------|------|
| `lib/hcm/events/HcmCanonicalFinancePublisher.ts` | Canonical publish helpers + idempotency builder |
| `lib/hcm/payroll/services/PayrollService.ts` | Workforce cost emission on finalize |
| `lib/hcm/expense/services/ExpenseApprovalService.ts` | Expense approval + canonical emission |
| `lib/hcm/createHcmWiring.ts` | Expense repository and service wiring |
| `lib/hcm/events/hcm-event-catalog.ts` | Canonical types registered in outbound catalogue |
| `tests/lib/hcm/HCMCanonicalPublisher.test.ts` | Native publication + Finance compatibility |

---

## Verification

Run:

```bash
npm run typecheck
npm run lint
npx vitest run tests/lib/hcm/HCMCanonicalPublisher.test.ts
npx vitest run tests/lib/finance/FinanceEventConsumer.test.ts
npm run build
```

---

## Risk Closure

| Risk ID | Description | Status |
|---------|-------------|--------|
| **FIN-R-003** | HCM does not publish canonical Finance contract events | **Closed** (P-009.15) |

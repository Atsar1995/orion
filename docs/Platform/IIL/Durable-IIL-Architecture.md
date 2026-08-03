# Durable IIL Architecture

**Document ID:** PLT-IIL-001  
**Program:** P-009.16 — Durable Intelligent Integration Layer  
**Version:** 1.0  
**Status:** Implemented  
**Baseline:** [ADR-013](../../11_Governance/ADR/ADR-013-Durable-Intelligent-Integration-Layer.md) · [ADR-014](../../11_Governance/ADR/ADR-014-Cross-Domain-Event-Contracts.md) · [ADR-015](../../11_Governance/ADR/ADR-015-Domain-Service-Boundaries.md)

---

## Purpose

Documents the production durable transport layer for the Intelligent Integration Layer (IIL). Closes **FIN-R-002** / **TD-PLATFORM-003** by replacing process-local queues with restart-safe, persist-before-ack delivery while preserving the existing `IntelligenceIntegrationService` publisher/consumer API.

---

## Architecture

```
Domain Publisher (*-events.ts)
        │
        ▼
IntelligenceIntegrationService.publish()
        ├── ServiceRegistry authorization
        ├── ADR-013 envelope enrichment
        └── DurableTransportAdapter.persistAndEnqueue()  ← persist before ack
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 InMemoryDurableTransport   PostgresDurableTransport
 (dev/unit tests)           (production · iil_entities)
        │
        └── Delivery loop → EventRouter → Subscribers
                    │
            acknowledge / nack → RetryPolicy → DLQ
```

| Component | Path | Role |
|-----------|------|------|
| `DurableTransportAdapter` | `lib/platform/iil/DurableTransportAdapter.ts` | Transport contract |
| `InMemoryDurableTransport` | `lib/platform/iil/InMemoryDurableTransport.ts` | Dev/test adapter with shared backing |
| `PostgresDurableTransport` | `lib/platform/iil/PostgresDurableTransport.ts` | Production adapter via `IILEntityPersister` |
| `IILFactory` | `lib/platform/iil/IILFactory.ts` | Composition-root factory (`ORION_IIL_TRANSPORT`) |
| `IntelligenceIntegrationService` | `lib/platform/intelligence/IntelligenceIntegrationService.ts` | Unchanged public API |

---

## Delivery Guarantees

| Guarantee | Implementation |
|-----------|----------------|
| **Persist-before-ack** | Event written to durable store before `publish()` returns |
| **At-least-once** | Pending deliveries recovered on restart |
| **Idempotent consumers** | `eventId` + `idempotencyKey` dedupe (24h window) |
| **Partition ordering** | `{orgId}:{entityType}:{entityId}` serial delivery |
| **Retry** | 5 attempts (Postgres) · exponential 1s–300s + jitter |
| **DLQ** | Durable dead-letter with operator replay API |

---

## Configuration

| Variable | Values | Default |
|----------|--------|---------|
| `ORION_IIL_TRANSPORT` | `memory` · `durable` | `memory` |

Production runtime rejects `memory` per ADR-013 (mirrors `ORION_STORE_ADAPTER` guard).

---

## PlatformStore Integration

`IILFactory.createFromEnvironment(platformStore)` acquires `DatabaseConnection` from initialized `PlatformStore` for `PostgresDurableTransport`. IIL schema uses platform-owned `iil_entities` JSONB collections:

- `iil_event`
- `iil_delivery`
- `iil_dead_letter`
- `iil_idempotency`

---

## Restart Flow

1. Process publishes event → persisted to durable store → delivery enqueued
2. Delivery loop routes via `EventRouter` to subscribers
3. Success → `acknowledge(deliveryId)`
4. Failure → `nack` → `RetryPolicy` → re-enqueue or DLQ
5. **Process crash** → pending deliveries remain in store
6. **Restart** → `recoverPendingDeliveries()` re-enqueues pending/in-flight records
7. Idempotent consumers dedupe on `eventId` / `idempotencyKey`

---

## Risk Closure

| Risk | Status |
|------|--------|
| **FIN-R-002** | **Closed** (P-009.16) |
| **TD-PLATFORM-003** | **Closed** (P-009.16) |

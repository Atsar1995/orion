# Dead Letter Queue

**Document ID:** PLT-IIL-003  
**Mission:** P-009.16  
**Component:** `lib/platform/iil/DeadLetterQueue.ts`

---

## Purpose

Captures intelligence events that exhaust retry attempts. Provides operator review and manual reprocessing via existing `/api/intelligence/dead-letter` routes.

---

## Record Schema

| Field | Description |
|-------|-------------|
| `id` | DLQ entry identifier |
| `event` | Original immutable envelope |
| `failureReason` | Summary reason |
| `attempts` | Delivery attempt count |
| `failedAt` | ISO timestamp |
| `lastError` | Sanitized error message |

---

## Durability

| Transport | Storage |
|-----------|---------|
| In-memory | `InMemoryDurableTransportBacking.deadLetterQueue` |
| PostgreSQL | `iil_entities` collection `iil_dead_letter` |

Retention target: 90 days (operational policy).

---

## Operator Replay

```typescript
await service.retryDeadLetter(dlqId, context);
// → transport.requeueFromDeadLetter()
// → new delivery attempt with attempts reset to 0
```

---

## Alerting

DLQ depth contributes to IIL health status:

- `degraded` — any DLQ entries or queue depth > 25
- `unhealthy` — DLQ depth > 10

---

## Related

- [Durable IIL Architecture](./Durable-IIL-Architecture.md)
- [Replay Service](./Replay-Service.md)

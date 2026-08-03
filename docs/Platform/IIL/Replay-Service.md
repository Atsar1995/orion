# Replay Service

**Document ID:** PLT-IIL-002  
**Mission:** P-009.16  
**Component:** `lib/platform/iil/ReplayService.ts`

---

## Purpose

Re-delivers persisted IIL events matching filter criteria without mutating original envelopes. Used for consumer bug recovery, subscriber backfill, and certification evidence.

---

## Filter Criteria

| Field | Description |
|-------|-------------|
| `organizationId` | Required tenant scope |
| `eventId` | Single event replay |
| `correlationId` | Chain replay |
| `eventType` | Canonical or intelligence type |
| `fromTimestamp` / `toTimestamp` | Time window |
| `limit` | Max events (default 100) |

---

## Behavior

1. Query durable event store via transport adapter
2. Filter by criteria
3. Create new delivery attempt per event (original `eventId` preserved)
4. Route through subscriber handlers
5. Idempotent consumers dedupe on original `eventId`

---

## API

```typescript
await transport.replay(
  { organizationId: "org-orania", correlationId: "corr-001" },
  async (delivery) => { /* route to handler */ },
);

await service.replay(context, fromEventId?);
```

---

## Authorization

Replay requires elevated platform permission in production (audited). Test harness uses direct transport replay.

---

## Related

- [Durable IIL Architecture](./Durable-IIL-Architecture.md)
- [Dead Letter Queue](./Dead-Letter-Queue.md)

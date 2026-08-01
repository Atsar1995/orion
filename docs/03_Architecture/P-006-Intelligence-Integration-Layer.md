# P-006 — Intelligence Integration Layer Architecture

**Mission:** P-006 — Intelligence Integration Layer  
**Status:** Production-ready (in-memory transport)  
**Applicable Canon:** C-002, C-003, C-004, C-006, C-007, C-008, C-009  

---

## Purpose

The Intelligence Integration Layer (IIL) is ORION's central nervous system. It captures significant business events once, routes them asynchronously to subscribed services, and makes intelligence available to the Executive Brief, Executive Memory, and Decision Intelligence without direct service-to-service coupling.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Workspaces · Webhooks · Platform Services                     │
└───────────────────────────┬──────────────────────────────────┘
                            │ publish()
┌───────────────────────────▼──────────────────────────────────┐
│           IntelligenceIntegrationService                        │
│  ServiceRegistry · EventReplayStore · HealthMonitor             │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    MessageQueue (async)                         │
│              RetryManager · DeadLetterQueue                     │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                      EventRouter                                │
│  SubscriptionManager · WebhookGateway · Platform EventBus       │
└───────┬─────────────────┬──────────────────┬───────────────────┘
        │                 │                  │
   Executive Brief   Executive Memory   Decision Intelligence
```

---

## Event Model

Every intelligence event includes:

| Field | Description |
|-------|-------------|
| eventId | Unique identifier |
| eventType | Standard type (DecisionCreated, MemoryCreated, …) |
| sourceService | Publishing service ID |
| sourceWorkspace | Originating workspace |
| organizationId | Tenant scope |
| entityType / entityId | Business entity reference |
| timestamp | ISO-8601 publish time |
| actorId | Verified identity |
| priority | low · normal · high · critical |
| correlationId | Trace related operations |
| payload | Event-specific data |
| version | Schema version |
| securityClassification | public · internal · confidential · restricted |
| auditMetadata | Actor role, workspace, publish audit |

---

## Services

| Service | Role |
|---------|------|
| IntelligenceIntegrationService | Orchestrates publish, replay, health |
| SubscriptionManager | Pub/sub handler registry |
| EventRouter | Routes to subscribers, platform bus, webhooks |
| MessageQueue | Asynchronous delivery |
| RetryManager | Exponential backoff (3 attempts) |
| DeadLetterQueue | Failed event retention |
| EventReplayStore | Deduplication and replay |
| WebhookGateway | Inbound signature verification, outbound delivery log |
| ServiceRegistry | Authorized publisher registry |
| HealthMonitor | Operational diagnostics |

---

## Integrations

| Consumer | Events |
|----------|--------|
| Executive Brief | Intelligence feed via `getBriefFeed()` |
| Executive Memory | Decision, memory, org, user events |
| Decision Intelligence | Customer, invoice, reservation, task events |
| Platform EventBus | Mapped to audit/activity-compatible types |

---

## UI & API

| Surface | Path |
|---------|------|
| Admin dashboard | `/intelligence/integration` |
| Publish/list events | `POST/GET /api/intelligence/events` |
| Replay | `POST /api/intelligence/events/replay` |
| Subscriptions | `GET/POST /api/intelligence/subscriptions` |
| Health | `GET /api/intelligence/health` |
| Dead letter | `GET/POST /api/intelligence/dead-letter` |
| Webhooks | `POST /api/webhooks/[providerId]` |

---

## Persistence

Current implementation uses in-memory queue, replay store, and dead-letter queue. Production deployment requires durable message transport per ES-033.

---

## Canon Compliance

| Canon | Compliance |
|-------|------------|
| C-002 Executive Mind | Continuous brief updates from event feed |
| C-003 Platform Architecture | Loosely coupled event-driven backbone |
| C-004 Executive Intelligence | Signals routed to decision support |
| C-006 Engineering Constitution | Typed services, tests, documentation |
| C-007 Workspace Framework | Workspaces publish upward, no cross-workspace deps |
| C-008 AI & Learning | Event streams enable pattern analysis |
| C-009 Security & Trust | Publisher authorization, webhook signatures, audit metadata |

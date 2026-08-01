# P-006 — Intelligence Integration Layer API

**Base path:** `/api/intelligence`  
**Authentication:** Session via `getDecisionServiceContext()`  

---

## Events

### `GET /api/intelligence/events`
List recent intelligence events for the organization.

**Query:** `limit` (default 50)

### `POST /api/intelligence/events`
Publish an intelligence event.

**Body:** `PublishIntelligenceEventInput`

**Errors:**
- `403 UNAUTHORIZED_PUBLISHER`
- `409 DUPLICATE_EVENT`
- `400 INVALID_PAYLOAD`

### `POST /api/intelligence/events/replay`
Replay stored events to subscribers.

**Body:** `{ "fromEventId"?: string }`

---

## Subscriptions

### `GET /api/intelligence/subscriptions`
List active event subscriptions.

### `POST /api/intelligence/subscriptions`
Register a subscription (observability in v1).

**Body:** `CreateIntelligenceSubscriptionInput`

---

## Health

### `GET /api/intelligence/health`
Returns `IntelligenceHealthSnapshot` and registered services.

---

## Dead Letter Queue

### `GET /api/intelligence/dead-letter`
List failed event deliveries.

### `POST /api/intelligence/dead-letter`
Retry a dead-letter record.

**Body:** `{ "id": string }`

---

## Webhooks

### `POST /api/webhooks/[providerId]`
Inbound webhook receiver with HMAC-SHA256 signature verification.

**Header:** `x-orion-signature: sha256=<hex>`

**Body:** `PublishIntelligenceEventInput`

---

## Event Types

`DecisionCreated` · `DecisionUpdated` · `MemoryCreated` · `MemoryUpdated` · `UserCreated` · `OrganizationUpdated` · `ReservationCreated` · `CustomerUpdated` · `InvoiceIssued` · `TaskCompleted` · `NotificationSent` · `CustomEvent`

---

## Types

All request/response types are defined in `types/intelligence-integration.ts`.

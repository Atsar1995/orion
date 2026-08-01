# P-007 — Hospitality Workspace API

**Base path:** `/api/hospitality`  
**Authentication:** Session via `getDecisionServiceContext()`  

---

## Reservations

### `GET /api/hospitality/reservations`
List reservations for the current organization.

**Response:** `{ success: true, data: { reservations: ReservationListItem[] } }`

### `POST /api/hospitality/reservations`
Create a new reservation and publish `ReservationCreated` to IIL.

**Body:**
```json
{
  "guestId": "guest-mehta",
  "roomTypeId": "rt-standard",
  "channel": "direct",
  "checkIn": "2026-08-01T14:00:00.000Z",
  "checkOut": "2026-08-03T11:00:00.000Z",
  "adults": 2,
  "children": 0,
  "rate": 4200,
  "isVip": false
}
```

### `GET /api/hospitality/reservations/[id]`
Reservation detail with guest, room, and room type.

### `PATCH /api/hospitality/reservations/[id]`
Front office actions.

**Body (one of):**
- `{ "action": "check_in" }`
- `{ "action": "check_out" }`
- `{ "roomId": "room-101" }`

---

## Guests

### `GET /api/hospitality/guests`
List guest profiles.

### `GET /api/hospitality/guests/[id]`
Guest profile with stay history.

---

## Rooms

### `GET /api/hospitality/rooms`
Room inventory and property structure (buildings, wings, floors, room types).

---

## Housekeeping

### `GET /api/hospitality/housekeeping`
Room status board and maintenance requests.

---

## Billing

### `GET /api/hospitality/billing`
Guest folios with charge counts and balances.

---

## Operations

### `GET /api/hospitality/operations`
Daily operations snapshot — occupancy, ADR, RevPAR, revenue, arrivals, departures.

---

## Intelligence

### `GET /api/hospitality/intelligence`
Hospitality intelligence result and Executive Brief contribution.

**Response:**
```json
{
  "success": true,
  "data": {
    "intelligence": { "operations": {}, "recommendations": [], "alerts": [], "patterns": [] },
    "briefContribution": { "workspaceId": "hospitality", "briefingLine": "...", "healthScore": 85 }
  }
}
```

---

## Error Envelope

```json
{ "success": false, "error": "Reservation not found" }
```

HTTP status codes: `404` for missing entities, `400` for invalid actions.

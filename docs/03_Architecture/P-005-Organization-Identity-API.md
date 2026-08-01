# P-005 — Organization & Identity Platform API

**Base path:** `/api`  
**Authentication:** Session via `getDecisionServiceContext()`  

---

## Organizations

### `GET /api/organizations`
List organizations visible to the current context.

**Response:**
```json
{
  "success": true,
  "data": { "organizations": [/* PlatformOrganization[] */] }
}
```

### `POST /api/organizations`
Create organization (super_admin only).

**Body:** `CreateOrganizationInput`  
**Errors:** `403 PERMISSION_DENIED`, `409 DUPLICATE_ORGANIZATION`

### `GET /api/organizations/[id]`
Organization detail with structure and hierarchy tree.

**Response:**
```json
{
  "success": true,
  "data": {
    "organization": {},
    "structure": { "businessUnits": [], "departments": [], "teams": [] },
    "hierarchy": { "id": "", "type": "organization", "label": "", "children": [] }
  }
}
```

### `GET /api/organizations/health`
Organization health snapshot for Brief and dashboards.

---

## Users

### `GET /api/users`
List organization users.

### `POST /api/users`
Invite user (organization_admin / super_admin).

**Body:** `InviteUserInput`  
**Errors:** `400 INVALID_EMAIL`, `403 PERMISSION_DENIED`, `409 DUPLICATE_USER`

### `GET /api/users/[id]`
User detail with executive profile.

### `POST /api/users/[id]/roles`
Assign role to user.

**Body:** `{ "role": "manager" }`  
**Errors:** `403 PERMISSION_DENIED`, `404` user not found

---

## Roles & Permissions

### `GET /api/roles`
List platform roles with labels.

### `GET /api/permissions/matrix`
Role × module permission matrix (read/write flags).

---

## Delegations

### `GET /api/delegations`
List active delegations for the organization.

### `POST /api/delegations`
Create delegation grant.

**Body:** `CreateDelegationInput`  
**Errors:** `404 DELEGATE_NOT_FOUND`

---

## Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

---

## Types

All request/response types are defined in `types/organization.ts`.

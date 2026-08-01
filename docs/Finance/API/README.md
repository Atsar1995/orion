# Finance Domain — API

**Domain:** Finance  
**Phase:** IV (Next)  
**Owner:** Chief Enterprise Architect / Finance API Lead  

---

## Purpose

This folder documents the REST API surface for the ORION Finance Domain. API documentation defines routes, request/response contracts, authentication requirements, and error conventions before and alongside implementation.

All Finance API routes must use organisation-scoped context via the platform identity layer.

---

## Contents

| Document Type | Description |
|---------------|-------------|
| API Overview | Finance API index and base path conventions |
| Route Specifications | Per-resource route documentation |
| Error Conventions | Standard error response format |
| Authentication | Context resolution and tenant scoping |

Expected base path: `/api/finance/` following the pattern established by `/api/hospitality/` and `/api/crm/`.

---

## Standards

- All routes return `{ success: true, data }` or `{ success: false, error }`
- All routes resolve context via platform identity (`getDecisionServiceContext()` or successor)
- Routes are organisation-scoped; no cross-tenant access
- OpenAPI or markdown route specs required before route ships
- No breaking changes without ADR and version increment
- RBAC metadata defined per route (enforcement per platform ES-009)

---

## Naming Convention

```
Finance-{Resource}-API.md          — resource group documentation
/api/finance/{resource}/route.ts — implementation path (when built)
```

API documentation files:

```
API-{Resource}.md
Finance-API-Overview.md
```

---

## Owner

**Finance API Lead** — route specification authorship (to be assigned)  
**Chief Enterprise Architect** — contract review  

---

*Parent: [docs/Finance/](../) · Reference: [docs/03_Architecture/P-007-Hospitality-API.md](../../03_Architecture/P-007-Hospitality-API.md)*

# P-005 — Organization & Identity Platform Architecture

**Mission:** P-005 — Organization & Identity Platform  
**Status:** Production-ready (in-memory persistence)  
**Applicable Canon:** C-002, C-003, C-006, C-007, C-009  

---

## Purpose

The Organization & Identity Platform is the single source of truth for organizational structure, verified identity, roles, permissions, and delegation across ORION. Every workspace consumes these shared services — no workspace implements duplicate identity or authorization logic.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Platform Workspaces                       │
│  Brief · Decisions · Memory · CRM · Finance · Hospitality   │
└──────────────────────────┬──────────────────────────────────┘
                           │ ServiceContext (orgId, userId, role)
┌──────────────────────────▼──────────────────────────────────┐
│              lib/platform/organization/                      │
│  OrganizationService · PlatformIdentityService               │
│  UserManagementService · RoleService · PermissionService     │
│  DelegationService · HierarchyService                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│     OrganizationPlatformRepository (interface)               │
│     InMemoryOrganizationPlatformRepository (seed: ORANIA)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  lib/identity/ — runtime auth (login, session, RBAC map)     │
│  lib/auth/audit — cross-platform audit events                │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Models

| Model | Location | Description |
|-------|----------|-------------|
| Organization | `types/organization.ts` | Top-level tenant |
| Business Unit | `types/organization.ts` | Major division |
| Department | `types/organization.ts` | Functional unit with optional head |
| Team | `types/organization.ts` | Working group within department |
| Platform User | `types/organization.ts` | Verified identity with role assignment |
| Executive Profile | `types/organization.ts` | Leadership metadata |
| Reporting Relationship | `types/organization.ts` | Manager hierarchy |
| Delegation Grant | `types/organization.ts` | Scoped authority transfer |
| Permission Matrix Entry | `types/organization.ts` | Role × module access |

---

## Services

### OrganizationService
CRUD for organizations, structure queries, audit integration.

### PlatformIdentityService
Resolves verified identities with permissions for attribution.

### UserManagementService
User listing, invitation, executive profiles, organization health snapshots.

### RoleService
Role catalog and assignment with audit trail.

### PermissionService
Permission evaluation and matrix generation (wraps `getPermissionsForRole`).

### DelegationService
Delegation creation, listing, and scope resolution.

### HierarchyService
Tree construction, direct reports, circular reporting detection.

---

## Integrations

| Platform | Integration |
|----------|-------------|
| Executive Brief | `organizationHealth` section via `composeExecutiveBriefV1` |
| Executive Memory | `syncOrganizationMemory` ingests leadership and delegation |
| Decision Intelligence | Decisions carry `organizationId`, `ownerId`, `delegatedToId` |
| Audit | Platform audit entries + `recordAuditEvent` on org creation |

---

## UI Surfaces

| Route | Purpose |
|-------|---------|
| `/organization` | Hierarchy, health, delegations |
| `/users` | User management and executive profiles |
| `/roles` | Role catalog and permission matrix |

---

## Persistence

Current implementation uses `InMemoryOrganizationPlatformRepository` with ORANIA seed data. Production deployment requires database-backed repository implementing `OrganizationPlatformRepository`.

---

## Canon Compliance

| Canon | Compliance |
|-------|------------|
| C-002 Executive Mind | Org health surfaced in Brief; leadership visible at a glance |
| C-003 Platform Architecture | Shared services; no workspace-specific identity logic |
| C-006 Engineering Constitution | Typed services, repository pattern, tests |
| C-007 Workspace Framework | Workspaces consume platform identity via ServiceContext |
| C-009 Security & Trust | RBAC, audit trail, verified identity attribution |

---

## Dependencies

P-001 Governance · P-002 Executive Brief · P-003 Decision Intelligence · P-004 Executive Memory

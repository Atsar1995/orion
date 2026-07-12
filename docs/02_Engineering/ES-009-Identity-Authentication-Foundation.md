# ORION PLATFORM

# ES-009

# ORION Identity & Authentication Foundation

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Status** | Approved for Development |
| **Sprint** | Sprint 9 |
| **Owner** | Mohammad Shafi Goroo — Founder & CEO |
| **Co-Owner** | ORION — Chief AI Architect & CTO |

---

## Related Documents

| Document | Location | Relationship |
|----------|----------|--------------|
| **PRD-001** | `docs/01_Product/PRD-001-Identity-Authentication.md` | Product requirements this ES implements |
| **PA-001** | `docs/03_Architecture/ORION_Platform_Architecture.md` | Platform architecture and tenant model |
| **ORION Constitution** | `docs/09_Standards/ORION_Constitution.md` | Governing engineering principles |
| **ORION Design System** | `docs/04_Design/ORION_Design_System.md` | Visual language and UI components |
| **ES-006** | `docs/02_Engineering/ES-006-Component-Architecture.md` | Platform shell and layout foundation |
| **ES-008** | `docs/02_Engineering/ES-008-Design-System.md` | Design System implementation |

---

## Purpose

Implement the foundation of the ORION Identity Platform.

Provide secure authentication, authorization, user identity, organizations, workspaces, and role-based access for every future ORION module.

This sprint establishes the **Infrastructure layer** identity services defined in PA-001. All platform routes, modules, and APIs built after Sprint 9 must consume this foundation.

---

## Architecture Alignment

This specification implements the Platform Services identity layer within PA-001.

### Platform Layer

```
Infrastructure (Auth, Session, RBAC)
        ↓
Mission Control + Business Modules
```

### Access Control Model

```
User
  ↓
Organization (Tenant)
  ↓
Workspace
  ↓
Role
  ↓
Module Permissions
```

### Route Groups

| Group | Path | Access |
|-------|------|--------|
| **Auth** | `app/(auth)/` | Public — unauthenticated users only |
| **Platform** | `app/(platform)/` | Protected — valid session required |

Unauthenticated requests to protected routes must redirect to `/login`. Authenticated requests to auth routes must redirect to Mission Control.

### Tenant Scoping

Every authenticated session must carry:

- `userId`
- `organizationId`
- `workspaceId`
- `role`
- `permissions`

All authorization checks must evaluate against the active workspace context. Cross-tenant data access is prohibited at every layer.

---

## Scope

### Included

- Login
- Logout
- Forgot Password
- Reset Password
- Session Management
- User Profile
- Organizations
- Workspaces (Foundation)
- Role-Based Access Control (RBAC)
- Protected Routes
- Authentication Layout
- Audit Logging (foundation only)

### Excluded

- Google Login
- Microsoft Login
- Apple Login
- Multi-factor Authentication
- Enterprise SSO
- API Keys
- Public API Authentication

Excluded items are documented in PRD-001 Future Enhancements and must not block this foundation.

---

## Deliverables

### Authentication Pages

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Email and password sign-in |
| **Forgot Password** | `/forgot-password` | Password recovery request |
| **Reset Password** | `/reset-password` | Set new password via recovery token |

All authentication pages must use the ORION Design System: navy background, gold accents, `components/ui/` primitives, and responsive layout per `docs/04_Design/ORION_Design_System.md`.

### Authentication Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **LoginForm** | `components/auth/LoginForm.tsx` | Credential submission, validation, error display |
| **PasswordField** | `components/auth/PasswordField.tsx` | Reusable password input with show/hide toggle |
| **SessionProvider** | `lib/auth/session-provider.tsx` | Client-side session context for authenticated UI |
| **Protected Route Wrapper** | `lib/auth/protected-route.tsx` | Server or client guard for authorized access |
| **ProfileMenu** | `components/auth/ProfileMenu.tsx` | Signed-in user menu: profile, settings, logout |
| **WorkspaceSwitcher** | `components/auth/WorkspaceSwitcher.tsx` | Foundation UI for switching active workspace |

### Identity Models

TypeScript types and service interfaces — not database schemas.

| Model | File | Key Fields |
|-------|------|------------|
| **User** | `types/auth.ts` | `id`, `email`, `name`, `status`, `createdAt` |
| **Organization** | `types/auth.ts` | `id`, `name`, `slug`, `status` |
| **Workspace** | `types/auth.ts` | `id`, `organizationId`, `name`, `slug`, `modules` |
| **Role** | `types/auth.ts` | `id`, `name`, `slug` — `founder`, `administrator`, `manager`, `staff`, `guest` |
| **Permission** | `types/auth.ts` | `module`, `action` — e.g. `finance:read`, `users:write` |

### Platform Services

| Service | Location | Responsibility |
|---------|----------|----------------|
| **Auth service** | `lib/auth/` | Login, logout, session read/write, password flows |
| **RBAC service** | `lib/rbac/` | Role resolution, permission checks, module access |
| **Audit service** | `lib/auth/audit.ts` | Record auth events: sign-in, sign-out, failed attempts |
| **Middleware** | `middleware.ts` | Route protection and session validation |

### Authentication Layout

Create `app/(auth)/layout.tsx` — a dedicated layout for authentication pages.

Requirements:

- Centered card layout on navy background
- ORION logo and platform name
- No sidebar or platform header
- Consistent with Mission Control visual quality
- Fully responsive and keyboard accessible

---

## Files to Create

Create only if they do not already exist.

### Routes

```
app/(auth)/layout.tsx
app/(auth)/login/page.tsx
app/(auth)/forgot-password/page.tsx
app/(auth)/reset-password/page.tsx
```

### Components

```
components/auth/LoginForm.tsx
components/auth/PasswordField.tsx
components/auth/ProfileMenu.tsx
components/auth/WorkspaceSwitcher.tsx
```

### Libraries

```
lib/auth/index.ts
lib/auth/session.ts
lib/auth/session-provider.tsx
lib/auth/protected-route.tsx
lib/auth/audit.ts
lib/auth/password.ts
lib/rbac/index.ts
lib/rbac/roles.ts
lib/rbac/permissions.ts
lib/rbac/check.ts
```

### Types

```
types/auth.ts
```

### Middleware

```
middleware.ts
```

---

## Files to Modify

Only when necessary.

| File | Modification |
|------|--------------|
| `app/layout.tsx` | Wrap application with `SessionProvider` where required |
| `middleware.ts` | Create or extend route protection for `(platform)` routes |
| `lib/navigation.ts` | Filter navigation items by user permissions |
| `components/layout/Header.tsx` | Integrate `ProfileMenu` and `WorkspaceSwitcher` |
| `lib/constants.ts` | Replace static `USER` constant with session-derived identity |

Do not modify Mission Control dashboard components unless required for session integration.

---

## Technical Approach

### Session Strategy

Sprint 9 implements a **foundation session layer** compatible with the PA-001 planned authentication provider (Auth.js or Clerk).

Initial implementation may use:

- Encrypted HTTP-only session cookies
- Server-side session validation in middleware
- Client-side session context for UI state

The session interface must be provider-agnostic so Auth.js or Clerk can replace the foundation implementation in a future sprint without redesigning consumers.

### RBAC Foundation

Implement a static role-to-permission map in `lib/rbac/permissions.ts` aligned with PRD-001 role definitions.

| Role | Default Module Access |
|------|----------------------|
| `founder` | All modules, all actions |
| `administrator` | All modules except billing; user management |
| `manager` | Assigned modules — read and write within scope |
| `staff` | Assigned modules — read and limited write; no Finance, Settings, or User Management |
| `guest` | Shared resources only |

Permission checks expose a single API:

```typescript
canAccess(user, permission: string): boolean
canAccessModule(user, module: string): boolean
```

### Organization & Workspace Foundation

Sprint 9 establishes the **data model and session context** for multi-tenant operation. Full workspace switching UI may be incremental.

Minimum workspace foundation:

- Session stores `organizationId` and `workspaceId`
- `WorkspaceSwitcher` displays available workspaces for the signed-in user
- Switching workspace updates session context and refreshes navigation permissions
- All mock or seed data is scoped to a default organization

### Audit Logging (Foundation)

Record the following events to an in-memory or file-based log for Sprint 9. Database persistence is a future sprint.

| Event | Data Captured |
|-------|---------------|
| `auth.login.success` | `userId`, `timestamp`, `ip` (if available) |
| `auth.login.failure` | `email` (hashed or partial), `timestamp`, `reason` |
| `auth.logout` | `userId`, `timestamp` |
| `auth.password.reset` | `userId`, `timestamp` |
| `auth.session.expired` | `userId`, `timestamp` |

### Design System Compliance

All authentication UI must consume existing Design System components:

| UI Need | Design System Component |
|---------|------------------------|
| Text inputs | `components/ui/Input.tsx` |
| Buttons | `components/ui/Button.tsx` |
| Cards | `components/ui/Card.tsx` |
| Section labels | `components/ui/SectionHeader.tsx` |
| Loading states | `components/ui/LoadingState.tsx` |
| Dividers | `components/ui/Divider.tsx` |

Do not introduce new color values, font sizes, or border radii outside `lib/design-tokens.ts` and `app/globals.css`.

---

## Engineering Principles

- Follow the ORION Constitution.
- Reuse Design System components.
- No duplicated authentication logic.
- Security by default.
- Least privilege.
- Organization-aware authentication.
- Workspace-ready architecture.

### Additional Constraints

| Constraint | Rule |
|------------|------|
| **No new UI packages** | Use Design System and Tailwind only unless auth provider requires otherwise |
| **Type safety** | All auth types in `types/auth.ts`; no `any` |
| **Server-first** | Auth pages default to Server Components; forms use Client Components only where interactive |
| **No secrets in code** | Session secrets via environment variables |
| **No cross-tenant leakage** | Every data access includes `organizationId` scope |
| **Provider-ready** | Abstract auth behind `lib/auth/` — consumers never call provider APIs directly |

---

## Acceptance Criteria

- Authentication pages render correctly.
- Protected routes function.
- User session persists.
- Organization model implemented.
- Workspace foundation implemented.
- RBAC foundation implemented.
- Build passes.
- Lint passes.
- No TypeScript errors.

### Detailed Criteria

| ID | Criterion |
|----|-----------|
| AC-001 | `/login` renders with email and password fields using Design System components |
| AC-002 | Valid credentials redirect to Mission Control (`/`) |
| AC-003 | Invalid credentials display a generic error without revealing which field failed |
| AC-004 | `/forgot-password` submits recovery request and displays confirmation |
| AC-005 | `/reset-password` accepts a token parameter and allows password reset |
| AC-006 | Unauthenticated access to `app/(platform)/` routes redirects to `/login` |
| AC-007 | Authenticated access to `app/(auth)/` routes redirects to `/` |
| AC-008 | Logout clears session and redirects to `/login` |
| AC-009 | Session persists across page refresh within configured duration |
| AC-010 | `ProfileMenu` displays signed-in user name and logout action |
| AC-011 | `WorkspaceSwitcher` displays available workspaces (foundation UI) |
| AC-012 | Navigation items are filtered by RBAC permissions |
| AC-013 | Staff role cannot access Finance module routes |
| AC-014 | Audit log records sign-in, sign-out, and failed login events |
| AC-015 | All authentication pages are responsive on desktop, tablet, and mobile |
| AC-016 | All form fields support keyboard navigation and visible focus states |

---

## Testing Requirements

- Login page loads.
- Logout works.
- Session persistence verified.
- Unauthorized routes redirect.
- Responsive layout verified.
- Accessibility basics verified.
- Build passes.
- Lint passes.

### Manual Test Checklist

| Test | Steps | Expected Result |
|------|-------|-----------------|
| **T-001 Login success** | Navigate to `/login`, enter valid credentials, submit | Redirect to `/` with session active |
| **T-002 Login failure** | Enter invalid credentials | Error message displayed; no session created |
| **T-003 Protected route** | Visit `/` without session | Redirect to `/login` |
| **T-004 Auth route guard** | Visit `/login` with active session | Redirect to `/` |
| **T-005 Logout** | Click logout in ProfileMenu | Session cleared; redirect to `/login` |
| **T-006 Session refresh** | Sign in, refresh browser | Session persists; user remains authenticated |
| **T-007 Forgot password** | Submit email on `/forgot-password` | Confirmation displayed |
| **T-008 RBAC — Staff** | Sign in as Staff, navigate to Finance | Access denied or route hidden |
| **T-009 RBAC — Founder** | Sign in as Founder | All navigation items visible |
| **T-010 Workspace switcher** | Sign in with multiple workspaces | Switcher displays options |
| **T-011 Responsive** | Test auth pages at 375px, 768px, 1280px | Layout adapts without overflow |
| **T-012 Accessibility** | Tab through login form | All fields reachable; focus visible |
| **T-013 Build** | Run `npm run build` | Zero errors |
| **T-014 Lint** | Run `npm run lint` | Zero errors |

---

## Definition of Done

Identity foundation is ready for future business modules including ORANIA, ATSAR, CRM, Finance, Marketing, and AI.

Authentication architecture supports multiple organizations and future enterprise expansion.

### Completion Checklist

- [ ] All files in **Files to Create** exist and are functional
- [ ] All **Files to Modify** updated only as necessary
- [ ] All **Acceptance Criteria** pass
- [ ] All **Testing Requirements** pass
- [ ] No regression to Mission Control or Design System
- [ ] ES-009 status updated to **Approved** after Founder and CTO review
- [ ] Git commit: `Sprint 9 - Identity & Authentication Foundation`

---

## Risks

Authentication is the foundation of every ORION module.

Incorrect implementation could affect:

- Platform security
- Data isolation
- Session integrity
- Authorization
- User trust

Security takes precedence over implementation speed.

Every authentication change must undergo code review before release.

---

# Engineering Approval

Status

Approved for Development

Approved By

Mohammad Shafi Goroo

Founder & CEO

Chief AI Architect

ORION Platform

Approval Date

12 July 2026

Engineering Status

Approved for Development

Implementation Status

Ready for Implementation

Notes

This Engineering Specification has completed architecture review and is approved for implementation.

Implementation shall comply with:

- PRD-001
- PA-001
- ORION Constitution
- ORION Design System

This document remains editable only during implementation.

Upon successful implementation, testing, verification, and Sprint 9 completion, this specification shall be updated to:

Status: Approved (Frozen)

---

## Approval

| Role | Name | Status |
|------|------|--------|
| Founder & CEO | Mohammad Shafi Goroo | Pending Review |
| Chief AI Architect & CTO | ORION | Pending Review |

---

> *This specification implements PRD-001. Product requirements are not repeated here — refer to the PRD for business context, user stories, and success metrics.*

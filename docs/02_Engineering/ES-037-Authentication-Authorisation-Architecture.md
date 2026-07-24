# ES-037 — Authentication & Authorisation Architecture

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** ES-009 (foundation delivered) · Construction Phase canonical spec

**Author:** Founder & Chief Architect

**Related delivery:** [ES-009 — Identity & Authentication Foundation](./ES-009-Identity-Authentication-Foundation.md) (Sprint 9 · v0.3.0) · [ES-059 — Platform Security & Zero Trust Architecture](./ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md) (Approved · enterprise security) · [PRD-001 — Identity & Authentication](../01_Product/PRD-001-Identity-Authentication.md)

---

# Purpose

The Authentication & Authorisation Architecture defines how ORION verifies identities, grants access, protects business resources, and enforces security policies across all applications, APIs, workspaces, and intelligence engines.

Its purpose is to ensure that every action within ORION is securely authenticated, appropriately authorised, and fully auditable.

**Current state:** ORION implements an **identity foundation** (ES-009) with typed auth contracts, RBAC helpers, placeholder session, route middleware, auth UI shells, and in-memory audit event types. **No real authentication** — credentials are not validated, sessions are not persisted, MFA/SSO/OAuth/API keys are not implemented, and security events are not durably stored. Full ES-037 enterprise security architecture — **Construction Phase alignment pending**.

**Out of scope (this ES):** Physical security · endpoint antivirus · corporate network security · cloud infrastructure hardening — operational security standards.

---

# Objectives

The architecture shall:

- Verify user identity.
- Protect business resources.
- Enforce least-privilege access.
- Support enterprise security.
- Enable secure integrations.
- Maintain complete auditability.
- Support future identity providers.
- Scale across multiple organisations.

---

# Security Principles

| Principle | Status |
|-----------|--------|
| Identity before access | Documented · partial (placeholder session) |
| Least privilege by default | Documented · partial (`permissions.ts`) |
| Deny by default | Documented · middleware redirects unauthenticated |
| Every action is attributable | Partial · audit types defined · not persisted |
| Authentication and authorisation are independent | Documented · `lib/auth/auth.ts` vs `permissions.ts` |
| Secrets are never exposed | Documented · no secrets in repo |
| Security is layered | Planned (MFA · API tokens · rate limits) |

---

# Identity Model

**Supported identities:** Founder · Executive · Employee · Administrator · Partner · Customer · Guest · Service Account · System Process · Future AI Agent

**Delivered (partial):**

| Identity | Implementation | Status |
|----------|----------------|--------|
| Founder | `SystemRole.Founder` · placeholder session | Partial |
| Administrator | `SystemRole.Administrator` | Partial |
| Manager | `SystemRole.Manager` | Partial |
| Staff | `SystemRole.Staff` | Partial |
| Guest | `SystemRole.Guest` | Partial |
| Service Account | `SystemRole.ServiceAccount` | Partial |
| Executive · Employee · Partner · Customer | — | Planned (custom roles) |
| System Process | — | Planned |
| Future AI Agent | — | Planned |

**Contract:** [types/auth.ts](../../types/auth.ts) · [lib/auth/roles.ts](../../lib/auth/roles.ts)

---

# Authentication Methods

**Supported:** Username & Password · Email & Password · Magic Link · OTP · MFA · OAuth 2.0 · OIDC · Enterprise SSO · API Keys · Future Passkeys (WebAuthn)

**Delivered (partial):**

| Method | Implementation | Status |
|--------|----------------|--------|
| Email & Password | `LoginCredentials` · `/login` UI · `authService.login()` | UI only · service NOT_IMPLEMENTED |
| Forgot / Reset Password | `/forgot-password` · `/reset-password` UI | UI only · NOT_IMPLEMENTED |
| Magic Link | — | Planned |
| OTP | — | Planned |
| MFA | — | Planned |
| OAuth 2.0 / OIDC | — | Planned |
| Enterprise SSO | — | Planned |
| API Keys | — | Planned |
| Passkeys (WebAuthn) | — | Future |

**Contract:** [lib/auth/auth.ts](../../lib/auth/auth.ts) · `AuthService` interface

---

# Multi-Factor Authentication

**Support:** Authenticator Applications · Email OTP · SMS OTP (optional) · Hardware Security Keys · Policy-driven enforcement based on role and risk

**Delivered:** — **planned**

---

# Session Management

Sessions shall: have configurable lifetimes · support idle timeout · support absolute timeout · support secure renewal · allow administrator revocation · invalidate on credential reset

**Delivered (partial):**

| Capability | Implementation | Status |
|------------|----------------|--------|
| Configurable lifetime | `DEFAULT_SESSION_DURATION_MS` · `createSession()` | Partial · in-memory only |
| Idle timeout | — | Planned |
| Absolute timeout | `expiresAt` on `Session` | Partial · not enforced server-side |
| Secure renewal | — | Planned |
| Administrator revocation | — | Planned |
| Invalidate on credential reset | — | Planned |
| Cookie / JWT storage | — | Planned |
| Placeholder session | `placeholder-session.ts` · `SessionProvider` | Delivered (dev only) |

**Contract:** [lib/auth/session.ts](../../lib/auth/session.ts) · [components/auth/SessionProvider.tsx](../../components/auth/SessionProvider.tsx)

---

# Token Standards

**Access Tokens:** Short-lived

**Refresh Tokens:** Long-lived

**API Tokens:** Scoped

**Service Tokens:** Machine-to-machine only

**Delivered:** — **planned**. Route protection uses placeholder session flag (`NEXT_PUBLIC_ORION_PLACEHOLDER_AUTH`) — not production tokens.

---

# Authorisation Model

**RBAC:** Primary model

**ABAC:** Supported for advanced policies

**Delivered (partial):**

| Model | Implementation | Status |
|-------|----------------|--------|
| RBAC | `SystemRole` enum · `hasRole()` · `hasAnyRole()` | Partial |
| Module permissions | `Permission` · `hasPermission()` · `canAccess()` | Partial |
| ABAC | — | Planned |
| UI guards | `usePermissions` · `ProtectedRoute` pattern | Partial |
| API authorisation | — | Planned ([ES-035](./ES-035-API-Design-Standards.md)) |

**Contract:** [lib/auth/permissions.ts](../../lib/auth/permissions.ts) · [hooks/usePermissions.ts](../../hooks/usePermissions.ts)

---

# Standard Roles

**Standard roles:** Founder · Platform Administrator · Organisation Administrator · Executive · Manager · Supervisor · Operator · Read Only · Guest · System · Custom Roles

**Delivered (partial):**

| ES-037 Role | ORION `SystemRole` | Status |
|-------------|-------------------|--------|
| Founder | `founder` | Delivered |
| Platform Administrator | `administrator` | Delivered |
| Manager | `manager` | Delivered |
| Operator / Staff | `staff` | Partial mapping |
| Guest | `guest` | Delivered |
| System / Service | `service_account` | Partial |
| Organisation Administrator | — | Planned |
| Executive · Supervisor · Read Only | — | Planned |
| Custom Roles | — | Planned |

---

# Permission Model

Permissions shall be granular.

**Examples:** View Reservations · Create Orders · Approve Payments · Manage Users · Export Reports · Configure System · View Financial Data · Manage Marketing

**Delivered (partial):** Module-scoped `{ module, action }` grants on `User.permissions`. Placeholder Founder session grants read/write across mission-control, intelligence, hotels, commerce, marketing, crm, finance, settings, users. Domain-specific permission catalog — **planned**.

---

# Resource Scoping

Permissions may be scoped by: Organisation · Business Unit · Workspace · Department · Region · Project · Individual Resource

**Delivered (partial):**

| Scope | Implementation | Status |
|-------|----------------|--------|
| Organisation | `user.organizationId` · `getSessionOrganizationId()` | Partial |
| Workspace | `activeWorkspace` on session · `getActiveWorkspaceId()` | Partial |
| Business Unit · Department · Region · Project | — | Planned |
| Individual Resource | — | Planned |

Align with tenant isolation in [ES-036](./ES-036-Database-Persistence-Architecture.md) · [PA-001](../03_Architecture/ORION_Platform_Architecture.md).

---

# Multi-Tenancy

The architecture shall: isolate tenant data · prevent cross-tenant access · support organisation-level configuration · support organisation administrators · maintain tenant audit history

**Delivered (partial):** Session carries `organizationId` and `activeWorkspace`. In-memory User/Org/Workspace persistence ([ES-010](./ES-010-Persistence-Foundation.md)). Cross-tenant enforcement at API and data layers — **planned**.

---

# API Security

All APIs shall: require authentication unless explicitly public · validate authorisation before execution · use HTTPS · support token validation · enforce rate limiting · audit all mutations

**Delivered (partial):**

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Page route authentication | [middleware.ts](../../middleware.ts) · `isAuthenticatedPlaceholder()` | Partial · placeholder only |
| REST API authentication | No `/api/v1/` layer | Planned ([ES-035](./ES-035-API-Design-Standards.md)) |
| HTTPS | Deployment responsibility | Operational |
| Token validation | — | Planned |
| Rate limiting | — | Planned |
| Mutation audit | Platform `AuditService` · auth `recordAuditEvent()` | Partial · in-memory |

---

# Password Policy

Passwords shall: meet configurable complexity requirements · be securely hashed · never be stored in plain text · support rotation policies · support secure reset

**Delivered:** `AuthErrorCode` includes `AccountLocked` · `ValidationFailed`. Password hashing, policy enforcement, and reset flows — **NOT_IMPLEMENTED** (`authService` placeholders).

---

# Account Security

**Support:** Account Lockout · Progressive Delays · Suspicious Login Detection · Session Revocation · Credential Expiry · Compromised Password Detection

**Delivered (partial):**

| Capability | Implementation | Status |
|------------|----------------|--------|
| Account lockout | `UserStatus.Locked` · `AuthErrorCode.AccountLocked` | Types only |
| Progressive delays | — | Planned |
| Suspicious login detection | — | Planned |
| Session revocation | `destroySession()` (in-memory) | Partial |
| Credential expiry | — | Planned |
| Compromised password detection | — | Planned |

---

# Audit Requirements

Every security event shall record: User · Action · Timestamp · Source IP · Device · Correlation ID · Outcome · Reason

**Delivered (partial):**

| Field | Auth audit (`lib/auth/audit.ts`) | Platform audit | Status |
|-------|----------------------------------|----------------|--------|
| User | `userId` · `email` | Actor on audit service | Partial |
| Action | `AuditEventType` | Event type | Partial |
| Timestamp | `timestamp` | Yes | Partial |
| Source IP | `ipAddress?` | — | Partial |
| Device | — | — | Planned |
| Correlation ID | — | `ServiceContext.correlationId` | Partial |
| Outcome · Reason | `reason?` · `metadata?` | — | Partial |
| Persistence | In-memory array only | In-memory store | Not production-ready |

**Security events (ES-037):** Login · Logout · Authentication Failure · Permission Denied · Role Changed · Password Reset · MFA Enabled · Token Revoked · Session Expired · API Key Created

**Delivered event types:** `LOGIN_SUCCESS` · `LOGIN_FAILURE` · `LOGOUT` · `PASSWORD_RESET` · `PASSWORD_CHANGED` · `SESSION_EXPIRED` · `ACCOUNT_LOCKED`. Permission denied · role changed · MFA · token revoked · API key — **planned**.

---

# Encryption

Sensitive data shall: be encrypted in transit · be encrypted at rest where required · support key rotation · never expose encryption keys

**Delivered:** HTTPS at deployment layer. Application-level encryption at rest for credentials and tokens — **planned** ([ES-036](./ES-036-Database-Persistence-Architecture.md)).

---

# Secrets Management

Secrets shall: never be committed to source control · be centrally managed · support rotation · support audit logging · be accessible only to authorised services

**Delivered:** No secrets in repository. Central secrets manager integration — **planned**.

---

# Business Rules

| Rule | Status |
|------|--------|
| Every request is authenticated | Partial · placeholder session on pages |
| Every action is authorised | Partial · UI permission helpers |
| Permissions are explicitly granted | Partial · placeholder grants |
| Access is denied by default | Documented · middleware enforces on routes |
| Privilege escalation requires administrative approval | Planned |
| Security events are immutable | Planned · durable audit store |

---

# Performance Targets

| Operation | Target | Current |
|-----------|--------|---------|
| Authentication | < 300 ms | N/A · not implemented |
| Authorisation | < 100 ms | In-process helpers · no benchmark |
| Token Validation | < 50 ms | N/A |
| Session Validation | < 100 ms | Synchronous placeholder check |

---

# Observability

**Monitor:** Authentication Success Rate · Authentication Failure Rate · Permission Failures · Session Count · Token Usage · MFA Adoption · Security Alerts

**Delivered:** — **planned**. Platform health checks exist for services; dedicated security observability — **planned**.

---

# Accessibility

Authentication flows shall: support keyboard navigation · meet WCAG 2.2 AA · provide accessible MFA options

**Delivered (partial):** Auth pages at `app/(auth)/` follow Design System. Full WCAG 2.2 AA verification and accessible MFA — **planned**.

---

# Acceptance Criteria

The architecture shall:

| Criterion | Status |
|-----------|--------|
| Authenticate users securely | Planned · placeholder only |
| Authorise access consistently | Partial · RBAC helpers |
| Support RBAC | Partial · foundation delivered |
| Support MFA | Planned |
| Support enterprise SSO | Planned |
| Protect APIs | Planned · no REST layer |
| Maintain security audit logs | Partial · in-memory types |
| Meet performance targets | Not measured |

---

# Implementation Status

| Component | Location | Status |
|-----------|----------|--------|
| Auth types | `types/auth.ts` | Delivered |
| Auth service contracts | `lib/auth/auth.ts` | Placeholder · NOT_IMPLEMENTED |
| Session helpers | `lib/auth/session.ts` | Partial · in-memory |
| Placeholder session | `lib/auth/placeholder-session.ts` | Delivered (dev) |
| RBAC roles | `lib/auth/roles.ts` | Delivered |
| Permission helpers | `lib/auth/permissions.ts` | Delivered |
| Route classification | `lib/auth/routes.ts` | Delivered |
| Auth audit types | `lib/auth/audit.ts` | Partial · in-memory |
| Route middleware | `middleware.ts` | Partial · placeholder |
| Session provider | `components/auth/SessionProvider.tsx` | Partial |
| Auth UI | `app/(auth)/` | UI shells delivered |
| Persistence (identity) | `lib/persistence/` | Partial · in-memory |
| Real login/logout | — | Planned |
| MFA · SSO · OAuth | — | Planned |
| API token validation | — | Planned |
| Durable security audit | — | Planned |
| ES-037 canonical spec | — | This document |

---

# Test Scenarios

| Scenario | Expected | Current |
|----------|----------|---------|
| Successful Login | Session created · audit logged | NOT_IMPLEMENTED |
| Invalid Password | Failure recorded · no session | NOT_IMPLEMENTED |
| MFA Challenge | Second factor required | Planned |
| Expired Session | Redirect to login | Partial · placeholder always active |
| Permission Denied | 403 or hidden route | Partial · UI guards |
| Role Change | Permissions updated · audit | Planned |
| Password Reset | Secure token flow · audit | NOT_IMPLEMENTED |
| Token Expired | Re-authenticate or refresh | Planned |
| Cross-Tenant Access Attempt | Denied at all layers | Planned |
| API Authentication Failure | 401 with standard error | Planned |

---

# Out of Scope

- Physical security
- Endpoint antivirus
- Corporate network security
- Cloud infrastructure hardening

These are covered by operational security standards.

---

# Future Enhancements

- Adaptive Authentication · Risk-Based Authentication · Behavioural Biometrics
- Passwordless Authentication · Continuous Identity Verification
- Zero Trust Policies · Delegated Administration · AI Risk Detection

---

# Definition of Done

The Authentication & Authorisation Architecture is complete when:

- Identity model is defined and enforced platform-wide
- Authentication methods operate with secure credential storage
- Authorisation model is standardised with full RBAC and scoped permissions
- MFA and enterprise SSO are operational
- APIs require and validate tokens ([ES-035](./ES-035-API-Design-Standards.md))
- Multi-tenancy isolation is enforced at every layer
- Security events are durably audited and immutable
- Performance targets are achieved
- ES-037 acceptance gaps closed
- Founder approval is received

**Status:** Identity **foundation delivered** (ES-009). Full ES-037 authentication and authorisation architecture — **Construction Phase alignment pending**.

---

# References

| Document | Location |
|----------|----------|
| ES-009 Identity & Authentication Foundation | [ES-009-Identity-Authentication-Foundation.md](./ES-009-Identity-Authentication-Foundation.md) |
| ES-033 Event & Messaging | [ES-033-Event-Messaging-Architecture.md](./ES-033-Event-Messaging-Architecture.md) |
| ES-034 Provider Standards | [ES-034-Provider-Data-Contract-Standards.md](./ES-034-Provider-Data-Contract-Standards.md) |
| ES-035 API Design Standards | [ES-035-API-Design-Standards.md](./ES-035-API-Design-Standards.md) |
| ES-036 Database & Persistence | [ES-036-Database-Persistence-Architecture.md](./ES-036-Database-Persistence-Architecture.md) |
| ES-038 Audit Logging & Observability | [ES-038-Audit-Logging-Observability-Architecture.md](./ES-038-Audit-Logging-Observability-Architecture.md) |
| ES-059 Platform Security & Zero Trust Architecture | [ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md](./ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| PRD-001 Identity & Authentication | [PRD-001-Identity-Authentication.md](../01_Product/PRD-001-Identity-Authentication.md) |
| PA-001 Platform Architecture | [ORION_Platform_Architecture.md](../03_Architecture/ORION_Platform_Architecture.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |

---

# Closing Statement

The Authentication & Authorisation Architecture provides the security foundation of ORION.

It ensures that every identity is verified, every action is authorised, every business resource is protected, and every security event is traceable, enabling ORION to operate as a secure, enterprise-grade Executive Operating System.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | ES-009 (foundation) · ES-037 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**

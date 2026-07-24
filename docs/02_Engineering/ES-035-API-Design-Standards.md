# ES-035 — API Design Standards

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Author:** Founder & Chief Architect

**Related delivery:** [ES-009 — Identity & Authentication Foundation](./ES-009-Identity-Authentication-Foundation.md) · [ES-034 — Provider & Data Contract Standards](./ES-034-Provider-Data-Contract-Standards.md)

---

# Purpose

The API Design Standards define the conventions, structure, security, versioning, documentation, and lifecycle for all ORION APIs.

Every public and internal API shall follow these standards to ensure consistency, predictability, interoperability, and long-term maintainability.

**Current state:** ORION delivers a **Next.js App Router** executive platform with page routes and in-process platform services — **no `/api/v1/` REST layer is implemented**. Internal contracts use `ServiceResult<T>` and `ServiceError` ([types/services.ts](../../types/services.ts)). Authentication middleware protects page routes ([middleware.ts](../../middleware.ts)). Full ES-035 REST API surface, OpenAPI documentation, rate limiting, and HTTP response envelopes — **Construction Phase alignment pending**.

**Out of scope (this ES):** Gateway infrastructure · load balancing · service mesh · cloud networking — infrastructure specifications.

---

# Objectives

The standards shall:

- Standardise API design.
- Promote consistency.
- Simplify client integration.
- Improve developer experience.
- Support versioning.
- Enable future extensibility.
- Ensure secure communication.

---

# API Principles

APIs shall be: Consistent · Predictable · Stateless · Secure · Versioned · Documented · Observable · Backward compatible where practical

**Delivered (partial):** Internal service layer follows stateless request patterns with tenant context. HTTP API principles — **planned enforcement**.

---

# API Architecture

| Style | Status |
|-------|--------|
| REST (primary) | Planned · `/api/v1/` |
| GraphQL | Future |
| Event APIs | Partial · [ES-033](./ES-033-Event-Messaging-Architecture.md) |
| Webhooks | Future |
| Streaming APIs | Future |

**Current transport:** Server Components and page routes — not REST endpoints.

---

# Base URL

**Target:** `/api/v1/` · future `/api/v2/` · `/api/v3/`

**Delivered:** No versioned API base path. Page routes at `/finance`, `/crm`, `/advisor`, etc.

---

# Resource Naming

Use nouns · plural resource names

**Examples:** `/reservations` · `/orders` · `/customers` · `/products` · `/invoices` · `/recommendations` · `/alerts` · `/business-health`

**Delivered:** — **planned (ES-035 alignment)** · align with [OS-001](../09_Standards/OS-001-Naming-Standards.md)

---

# HTTP Methods

GET · POST · PUT · PATCH · DELETE · OPTIONS · HEAD

**Delivered:** — **planned**

---

# Standard Response Structure

Every successful response shall contain: Success · Data · Metadata · Timestamp · Request ID · API Version

**Delivered (partial — internal services):**

```typescript
// types/services.ts — internal envelope (not HTTP)
type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError };
```

HTTP response wrapper mapping — **planned**.

---

# Standard Error Structure

Every error response shall contain: Success = false · Error Code · Message · Category · Severity · Correlation ID · Timestamp · Suggested Action · Validation Errors

**Delivered (partial):**

| Field | `ServiceError` | HTTP API |
|-------|----------------|----------|
| Error Code | `code` (`ServiceErrorCode`) | Planned |
| Message | `message` | Planned |
| Category | Via code enum | Planned |
| Correlation ID | `ServiceContext.correlationId` | Partial |
| Validation details | `details?` | Planned |

Align with [ES-034](./ES-034-Provider-Data-Contract-Standards.md) error model on implementation.

---

# HTTP Status Codes

200 · 201 · 202 · 204 · 400 · 401 · 403 · 404 · 409 · 422 · 429 · 500 · 503

**Delivered:** — **planned**

---

# Pagination

**Parameters:** `page` · `pageSize` · `sort` · `order` · `totalRecords` · `totalPages`

**Delivered:** — **planned**

---

# Filtering · Sorting · Searching

Filtering (status, country, date ranges, business unit, priority) · sorting (asc/desc, multi-field) · searching (keyword, field-specific, full text)

**Delivered:** Client-side Command Palette search only (Mission 14C). Server-side API filtering — **planned**.

---

# Versioning

Major versions: `/api/v1/` · `/api/v2/` — breaking changes require new major versions

**Delivered (partial):** Provider `version` · event `version` · `PLATFORM_VERSION` in intelligence layer. HTTP API versioning — **planned**.

---

# Authentication

**Supported:** OAuth 2.0 · JWT · API Keys (system integrations) · Future Enterprise SSO

**Delivered (partial):** [ES-009](./ES-009-Identity-Authentication-Foundation.md) · [ES-037](./ES-037-Authentication-Authorisation-Architecture.md) — placeholder session · route middleware · RBAC helpers · `lib/auth/`. Public REST authentication — **planned**.

---

# Authorisation

Role-based access control · workspace permissions · business unit permissions · resource ownership · administrative overrides

**Delivered (partial):** `placeholder-session.ts` role/module permissions · `protected-route` pattern. API-level authorisation middleware — **planned**.

---

# Idempotency

Required for POST (where duplicate submission possible) · PUT · PATCH · clients may provide `Idempotency-Key`

**Delivered:** Documented in [ES-011](./ES-011-Platform-Services-Foundation.md) service contracts. HTTP idempotency headers — **planned**.

---

# Rate Limiting

Per user · per organisation · per API key · per client application · rate limit headers returned

**Delivered:** — **planned**

---

# Validation

Validate: request schema · business rules · authentication · authorisation · data types · references

**Delivered (partial):** Platform service validation · provider registry validation · event bus validation. HTTP request schema validation — **planned**.

---

# Documentation

Every endpoint shall include: purpose · request/response schema · examples · authentication · errors · version history

**Delivered:** Engineering Specifications (ES-022–ES-035). **OpenAPI 3.x** — **planned**.

---

# Observability

Every request shall include: Request ID · Correlation ID · Latency · Status · Consumer · Version

**Delivered (partial):** `ServiceContext.requestId` · `correlationId` on events · pipeline `statistics.totalMs`. HTTP request tracing — **planned**.

---

# Security

APIs shall: use HTTPS only · never expose secrets · validate input · sanitise output · protect sensitive fields · support audit logging

**Delivered (partial):** Middleware route protection · audit via [AuditService](../../lib/platform/audit/AuditService.ts) · ES-009 security principles. HTTPS and API security headers — deployment/infrastructure.

---

# Performance Targets

| Operation | Target | Status |
|-----------|--------|--------|
| GET | < 200 ms | Planned |
| POST | < 500 ms | Planned |
| PATCH | < 500 ms | Planned |
| Search | < 300 ms | Planned |
| Bulk | Configurable | Planned |

Internal intelligence pipeline tracks engine timing — not HTTP latency.

---

# OpenAPI Standard

All APIs shall maintain: OpenAPI 3.x specification · interactive documentation · generated client SDK compatibility

**Delivered:** — **planned**

---

# Internal Contract Alignment

ES-035 HTTP APIs shall map to internal layers:

| HTTP Layer | Internal Layer | Spec |
|------------|----------------|------|
| REST resources | Domain Providers | [ES-034](./ES-034-Provider-Data-Contract-Standards.md) |
| Response envelope | `ServiceResult<T>` | ES-011 |
| Events | `PlatformEvent` | [ES-033](./ES-033-Event-Messaging-Architecture.md) |
| Auth context | `ServiceContext` | ES-009 |
| Intelligence | Intelligence Bus (not direct workspace HTTP) | ADR-006 |

**Rule:** External APIs shall not bypass Provider or Intelligence Bus architecture.

---

# Business Rules

- APIs are stateless.
- All endpoints are versioned.
- Every request is authenticated unless explicitly public.
- Every mutation is auditable.
- Responses are deterministic.

**Delivered (partial):** Audit and auth foundations. HTTP enforcement — **planned**.

---

# Acceptance Criteria

The API standards shall:

- [x] Standardise endpoint design (documented — this spec)
- [ ] Support authentication (HTTP — planned; ES-009 foundation delivered)
- [ ] Support authorisation (HTTP — planned; RBAC partial)
- [x] Support versioning (documented; HTTP — planned)
- [ ] Support pagination
- [x] Provide structured errors (internal — partial; HTTP — planned)
- [x] Meet performance targets (defined; HTTP — planned)
- [ ] Maintain OpenAPI documentation

---

# Implementation Status

| Area | Status | Notes |
|------|--------|-------|
| REST API routes (`/api/v1/`) | Not implemented | Construction Phase |
| OpenAPI specification | Not implemented | Construction Phase |
| HTTP response/error envelopes | Not implemented | Map from `ServiceResult<T>` |
| Authentication middleware (pages) | Partial | `middleware.ts` |
| Identity foundation | Partial | ES-009 |
| Internal service contracts | Partial | ES-011 · `types/services.ts` |
| ES-035 canonical spec | Approved | This document |

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Successful GET | 200 · standard response envelope |
| Successful POST | 201 · resource created |
| Validation Failure | 422 · structured validation errors |
| Authentication Failure | 401 |
| Permission Denied | 403 |
| Duplicate Submission | Idempotent handling · 409 if conflict |
| Rate Limit Exceeded | 429 · rate limit headers |
| Version Upgrade | `/api/v2/` backward compatibility policy |
| Malformed Request | 400 |
| Server Failure | 500 · no secret leakage |

---

# Out of Scope

- Gateway infrastructure
- Load balancing
- Service mesh
- Cloud networking

These are defined in infrastructure specifications.

---

# Future Enhancements

- GraphQL Gateway · Webhook Management · API Analytics
- Developer Portal · SDK Generation · Streaming APIs
- Partner API Marketplace · AI Agent APIs

---

# Definition of Done

The API Design Standards are complete when:

- Endpoint conventions are documented and implemented
- Security requirements are defined and enforced at HTTP layer
- Versioning rules are established with live `/api/v1/` routes
- Error handling is standardised in HTTP responses
- OpenAPI documentation is published and maintained
- Performance targets are verified
- ES-035 acceptance criteria met
- Founder approval is received

**Status:** Standards **approved** (this document). HTTP API implementation — **Construction Phase pending**.

---

# References

| Document | Location |
|----------|----------|
| ES-009 Identity & Authentication | [ES-009-Identity-Authentication-Foundation.md](./ES-009-Identity-Authentication-Foundation.md) |
| ES-011 Platform Services | [ES-011-Platform-Services-Foundation.md](./ES-011-Platform-Services-Foundation.md) |
| ES-033 Event & Messaging | [ES-033-Event-Messaging-Architecture.md](./ES-033-Event-Messaging-Architecture.md) |
| ES-034 Provider Standards | [ES-034-Provider-Data-Contract-Standards.md](./ES-034-Provider-Data-Contract-Standards.md) |
| ES-036 Database & Persistence | [ES-036-Database-Persistence-Architecture.md](./ES-036-Database-Persistence-Architecture.md) |
| ES-037 Authentication & Authorisation | [ES-037-Authentication-Authorisation-Architecture.md](./ES-037-Authentication-Authorisation-Architecture.md) |
| ES-038 Audit Logging & Observability | [ES-038-Audit-Logging-Observability-Architecture.md](./ES-038-Audit-Logging-Observability-Architecture.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| PRD-001 Identity | [PRD-001-Identity-Authentication.md](../01_Product/PRD-001-Identity-Authentication.md) |
| PA-001 Platform Architecture | [ORION_Platform_Architecture.md](../03_Architecture/ORION_Platform_Architecture.md) |
| OS-001 Naming Standards | [OS-001-Naming-Standards.md](../09_Standards/OS-001-Naming-Standards.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |

---

# Closing Statement

The API Design Standards establish a unified interface between ORION and every external consumer.

They ensure that applications, integrations, partners, and future AI agents communicate with ORION through a consistent, secure, and maintainable contract.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | ES-035 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**

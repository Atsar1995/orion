# ES-038 — Audit Logging & Observability Architecture

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** ES-011 (foundation delivered) · Construction Phase canonical spec

**Author:** Founder & Chief Architect

**Related delivery:** [ES-011 — Platform Services Foundation](./ES-011-Platform-Services-Foundation.md) (Sprint 11 · v0.5.0) · [ES-033 — Event & Messaging Architecture](./ES-033-Event-Messaging-Architecture.md) · [ES-058 — Enterprise Operations & Service Management](./ES-058-ORION-Enterprise-Operations-Service-Management-Framework.md) (Approved · monitoring · alerting)

---

# Purpose

The Audit Logging & Observability Architecture defines how ORION records business activities, monitors system health, traces requests, collects operational metrics, and supports production diagnostics.

The architecture provides complete visibility into business operations and platform behaviour while ensuring accountability, security, compliance, and operational excellence.

**Current state:** ORION implements a **platform services foundation** (ES-011) with in-memory `AuditService`, `ActivityService`, event-driven capture via [ES-033](./ES-033-Event-Messaging-Architecture.md), `HealthCheckService` contracts, `ServiceContext` correlation IDs, and intelligence-layer business metrics. **No structured application logging**, **no distributed tracing**, **no durable audit persistence**, **no operational dashboards or alerting**, and **no HTTP health/metrics endpoints**. Full ES-038 observability architecture — **Construction Phase alignment pending**.

**Out of scope (this ES):** Cloud monitoring platform selection · infrastructure deployment · Security Operations Centre · enterprise SIEM implementation — infrastructure and operations specifications.

---

# Objectives

The architecture shall:

- Record all auditable actions.
- Provide complete traceability.
- Monitor platform health.
- Measure operational performance.
- Detect abnormal behaviour.
- Support incident investigation.
- Improve reliability.
- Support compliance requirements.

---

# Architectural Principles

| Principle | Status |
|-----------|--------|
| Every important action is traceable | Partial · event + audit contracts |
| Every request is measurable | Partial · pipeline statistics only |
| Every failure is diagnosable | Planned · structured logging + tracing |
| Logs are structured | Planned · no application logger |
| Audit records are immutable | Partial · append-only in-memory store |
| Metrics are actionable | Partial · intelligence metrics only |
| Observability is built into every service | Partial · `HealthCheckService` contract |

---

# Architecture Components

| Component | Implementation | Status |
|-----------|----------------|--------|
| Audit Logging | `lib/platform/audit/` · `lib/auth/audit.ts` | Partial · in-memory |
| Application Logging | — | Planned |
| Structured Events | `PlatformEvent` · Event Bus ([ES-033](./ES-033-Event-Messaging-Architecture.md)) | Partial |
| Metrics Collection | `lib/intelligence/platform-metrics.ts` | Partial · business only |
| Distributed Tracing | `correlationId` · `requestId` on `ServiceContext` | Partial |
| Health Monitoring | `HealthCheckService` · `ServiceHealth` enum | Partial |
| Operational Dashboards | — | Planned |
| Alerting | Intelligence critical alerts | Partial · business only |
| Reporting | — | Planned |

**Contract:** [types/services.ts](../../types/services.ts) · [lib/platform/contracts.ts](../../lib/platform/contracts.ts)

---

# Audit Logging

Audit logs record business actions.

**Examples:** Reservation Created · Invoice Approved · Payment Recorded · User Role Changed · Recommendation Accepted · Business Health Calculated · Configuration Updated · System Login

**Delivered (partial):**

| Layer | Location | Status |
|-------|----------|--------|
| Platform audit service | `InMemoryAuditService` · `AuditStore` | Partial · in-memory |
| Auth audit helpers | `lib/auth/audit.ts` | Partial · separate in-memory log |
| Persistence audit hook | `PersistenceAuditEntry` · `NoOpAuditRepository` | Placeholder |
| Event-driven capture | Subscribes to auth, security, config, persistence events | Partial |
| Business workspace mutations | Static data · no audit emission | Planned |

**Eligible platform event types:** `auth.*` · `authorization.denied` · `security.alert` · `permission.changed` · `config.changed` · `persistence.failure` · `entity.tenant_violation` · `session.expired`

---

# Audit Record Structure

Every audit record contains: Audit ID · Timestamp · Actor · Action · Business Entity · Entity ID · Workspace · Previous Value · New Value · Correlation ID · Source · Result · Metadata

**Delivered (partial — `AuditRecord`):**

| ES-038 Field | ORION Field | Status |
|--------------|-------------|--------|
| Audit ID | `id` | Delivered |
| Timestamp | `timestamp` | Delivered |
| Actor | `actorUserId` | Delivered |
| Action | `action` | Delivered |
| Business Entity | `targetEntityType?` | Partial |
| Entity ID | `targetEntityId?` | Partial |
| Workspace | `workspaceId` · `organizationId` | Delivered |
| Previous Value | — | Planned |
| New Value | — | Planned |
| Correlation ID | `metadata.correlationId` | Partial |
| Source | `metadata.source` | Partial |
| Result | `outcome` (`success` \| `failure`) | Delivered |
| Metadata | `metadata` (severity, ipAddress, etc.) | Partial |

**Contract:** [types/services.ts](../../types/services.ts) · [lib/platform/audit/AuditService.ts](../../lib/platform/audit/AuditService.ts)

---

# Application Logging

Application logs capture: Information · Warnings · Errors · Critical Failures · Performance Events · Integration Events · Startup Events · Shutdown Events

**Delivered:** — **planned**. No structured application logger or log level framework in codebase.

---

# Log Levels

**TRACE · DEBUG · INFO · WARN · ERROR · FATAL**

**Delivered:** Audit severity levels (`info` · `warning` · `error` · `critical`) on platform audit records only. Application log levels — **planned**.

---

# Structured Logging

All logs shall use structured formats.

**Every log includes:** Timestamp · Level · Service · Workspace · Correlation ID · Request ID · User · Message · Metadata

**Delivered (partial):**

| Field | Platform events / audit | Application logs |
|-------|-------------------------|------------------|
| Timestamp | `PlatformEvent.timestamp` · `AuditRecord.timestamp` | Planned |
| Level | Audit severity in metadata | Planned |
| Service | `PlatformEvent.source` · `ServiceMetadata.serviceName` | Partial |
| Workspace | `tenantContext.workspaceId` | Partial |
| Correlation ID | `PlatformEvent.correlationId` · `ServiceContext.correlationId` | Partial |
| Request ID | `ServiceContext.requestId?` | Partial |
| User | `tenantContext.userId` | Partial |
| Message | Event type / audit action | Planned |
| Metadata | `payload` · `metadata` | Partial |

---

# Metrics

**Collect:** Request Count · Error Count · Latency · CPU Usage · Memory Usage · Database Performance · Queue Depth · Event Throughput · Cache Hit Rate · API Usage · Authentication Success Rate · Business Event Count

**Delivered (partial — intelligence layer only):**

| Metric | Source | Status |
|--------|--------|--------|
| Provider count / health | `collectPlatformMetrics()` | Delivered |
| Platform health score | `getPlatformHealth()` | Delivered |
| Engine execution time | `getEngineExecutionTimeMs()` | Delivered |
| Critical alert count | `getCriticalAlertCount()` | Delivered |
| Recommendation counts | `getPlatformStatistics()` | Delivered |
| Request/error/latency (HTTP) | — | Planned |
| Infrastructure metrics | — | Planned |
| Auth success rate | — | Planned |
| Event throughput | — | Planned |

**Contract:** [lib/intelligence/platform-metrics.ts](../../lib/intelligence/platform-metrics.ts)

---

# Distributed Tracing

Every request shall support: Trace ID · Span ID · Correlation ID · Parent Span · Service Path · Execution Duration · Failure Point

**Delivered (partial):**

| Capability | Implementation | Status |
|------------|----------------|--------|
| Correlation ID | `ServiceContext.correlationId` · `PlatformEvent.correlationId` | Partial |
| Causation ID | `PlatformEvent.causationId?` | Partial |
| Request ID | `ServiceContext.requestId?` | Partial |
| Trace ID / Span ID | — | Planned |
| Parent Span · Service Path | — | Planned |
| Execution Duration | Pipeline `statistics.totalMs` | Partial · intelligence only |
| Failure Point | — | Planned |

Align with [ES-035](./ES-035-API-Design-Standards.md) HTTP request tracing on REST implementation.

---

# Health Monitoring

Each component exposes: Health Status · Version · Uptime · Dependencies · Last Successful Check · Degraded State · Maintenance Mode

**Delivered (partial):**

| Capability | Implementation | Status |
|------------|----------------|--------|
| Health contract | `HealthCheckService.checkHealth()` | Delivered |
| Health states | `ServiceHealth` enum (`healthy` · `degraded` · `unhealthy` · `unknown`) | Delivered |
| Version | `ServiceMetadata.version` on services | Partial |
| Uptime · Dependencies · Last check | — | Planned |
| Maintenance mode | — | Planned |
| HTTP health endpoints | — | Planned |

**Implementations:** `InMemoryAuditService` · `InMemoryActivityService` · `InMemoryEventSubscriber` — all return `Healthy` from `checkHealth()`.

**Note:** ES-038 also defines `Degraded` · `Unavailable` · `Maintenance` · `Unknown` health states — mapped partially to `ServiceHealth` enum.

---

# Health States

**Healthy · Degraded · Unavailable · Maintenance · Unknown**

**Delivered (partial):** `ServiceHealth.Healthy` · `Degraded` · `Unhealthy` · `Unknown`. Maintenance state — **planned**.

---

# Operational Dashboards

Dashboards display: System Health · Workspace Health · API Performance · Event Processing · Queue Status · Business Activity · Security Events · Infrastructure Health

**Delivered (partial):** Executive Brief and workspace dashboards show **business** health and alerts — not operational platform telemetry. Dedicated operations dashboards — **planned**.

---

# Alerting

Generate alerts for: Critical Errors · Service Unavailability · High Error Rate · Slow Responses · Authentication Failures · Database Issues · Queue Backlog · Failed Integrations · Unexpected Restarts

**Delivered (partial):** Intelligence-layer critical alerts via Recommendation Engine ([ES-030](./ES-030-Alert-Engine.md)). Operational alerting infrastructure — **planned**.

---

# Retention

Support configurable retention for: Application Logs · Audit Records · Security Logs · Performance Metrics · Trace Data · Historical Reports

**Delivered:** In-memory stores with `clear()` for development only. Configurable retention policies and durable storage — **planned** ([ES-036](./ES-036-Database-Persistence-Architecture.md)).

---

# Security

Logs shall: never contain passwords · never expose secrets · mask sensitive information · support encryption · support controlled access

**Delivered:** Documented in [ES-010](./ES-010-Persistence-Foundation.md) data classification. Application-level log sanitisation and encryption — **planned**.

---

# Compliance

**Support:** Immutable audit records · Retention policies · Export capabilities · Regulatory reporting · Evidence preservation

**Delivered (partial):** Append-only `AuditStore` (in-memory). Immutable durable audit, export, and regulatory reporting — **planned**.

---

# Performance Targets

| Operation | Target | Current |
|-----------|--------|---------|
| Log Write | < 20 ms | In-memory · not benchmarked |
| Metric Collection | Near real time | Synchronous pipeline on demand |
| Health Check | < 100 ms | Synchronous · no benchmark |
| Trace Generation | Automatic | Partial · correlation ID only |

---

# Business Rules

| Rule | Status |
|------|--------|
| Audit records cannot be modified | Partial · append-only store design |
| Every mutation generates an audit event | Planned · persistence uses NoOpAuditRepository |
| Security events permanently retained per policy | Planned |
| Correlation IDs are mandatory | Partial · required on `PlatformEvent` |
| Operational metrics continuously collected | Planned |

---

# Observability Requirements

Every service shall expose: Health endpoint · Metrics endpoint · Version information · Dependency status · Readiness status · Liveness status

**Delivered (partial):** In-process `checkHealth()` and `ServiceMetadata` on platform services. HTTP `/health` · `/metrics` · readiness/liveness probes — **planned** ([ES-035](./ES-035-API-Design-Standards.md)).

---

# Acceptance Criteria

The architecture shall:

| Criterion | Status |
|-----------|--------|
| Record audit history | Partial · in-memory |
| Support structured logging | Planned |
| Collect metrics | Partial · intelligence metrics |
| Support distributed tracing | Partial · correlation ID |
| Monitor health | Partial · service contracts |
| Generate operational alerts | Planned |
| Support compliance | Planned |
| Meet performance targets | Not measured |

---

# Implementation Status

| Component | Location | Status |
|-----------|----------|--------|
| Platform audit service | `lib/platform/audit/AuditService.ts` | Partial · in-memory |
| Audit store | `lib/platform/audit/AuditStore.ts` | Partial · append-only in-memory |
| Activity service | `lib/platform/activity/ActivityService.ts` | Partial · in-memory |
| Auth audit helpers | `lib/auth/audit.ts` | Partial · separate in-memory |
| Persistence audit hook | `lib/persistence/services/shared.ts` | Placeholder · NoOp |
| Event bus integration | `lib/platform/events/` | Partial · [ES-033](./ES-033-Event-Messaging-Architecture.md) |
| Service contracts | `lib/platform/contracts.ts` | Delivered |
| Health checks | `HealthCheckService` implementations | Partial |
| Intelligence metrics | `lib/intelligence/platform-metrics.ts` | Partial · business |
| Structured application logging | — | Planned |
| Distributed tracing | — | Planned |
| Durable audit persistence | — | Planned |
| Operational dashboards | — | Planned |
| Alerting infrastructure | — | Planned |
| ES-038 canonical spec | — | This document |

---

# Test Scenarios

| Scenario | Expected | Current |
|----------|----------|---------|
| Successful Login | Auth audit recorded | Types/helpers only · not wired to login |
| Failed Login | Failure audit with correlation ID | Partial · event types defined |
| Reservation Created | Business audit emitted | Planned |
| Invoice Updated | Before/after values captured | Planned |
| Provider Failure | Error logged · health degraded | Partial · intelligence health |
| Slow Database Query | Performance event logged | Planned |
| Queue Backlog | Alert generated | Planned |
| Service Restart | Startup/shutdown logged | Planned |
| Trace Across Multiple Services | Trace ID propagated | Partial · correlation ID only |
| Critical Error Generated | FATAL log · alert fired | Planned |

---

# Out of Scope

- Cloud monitoring platform selection
- Infrastructure deployment
- Security Operations Centre
- Enterprise SIEM implementation

These are addressed by infrastructure and operations specifications.

---

# Future Enhancements

- AI Log Analysis · Predictive Incident Detection · Automated Root Cause Analysis
- Business Activity Replay · Executive Operations Dashboard
- Self-Healing Services · Operational Intelligence

---

# Definition of Done

The Audit Logging & Observability Architecture is complete when:

- Audit logging standards are defined and enforced platform-wide
- Structured logging operates across all services
- Metrics collection is standardised for business and operational telemetry
- Distributed tracing propagates trace context end-to-end
- Health monitoring exposes HTTP endpoints with dependency checks
- Operational dashboards and alerting are operational
- Audit records persist immutably with retention policies
- Performance targets are achieved
- ES-038 acceptance gaps closed
- Founder approval is received

**Status:** Platform observability **foundation delivered** (ES-011). Full ES-038 audit logging and observability architecture — **Construction Phase alignment pending**.

---

# References

| Document | Location |
|----------|----------|
| ES-011 Platform Services Foundation | [ES-011-Platform-Services-Foundation.md](./ES-011-Platform-Services-Foundation.md) |
| ES-033 Event & Messaging | [ES-033-Event-Messaging-Architecture.md](./ES-033-Event-Messaging-Architecture.md) |
| ES-034 Provider Standards | [ES-034-Provider-Data-Contract-Standards.md](./ES-034-Provider-Data-Contract-Standards.md) |
| ES-035 API Design Standards | [ES-035-API-Design-Standards.md](./ES-035-API-Design-Standards.md) |
| ES-036 Database & Persistence | [ES-036-Database-Persistence-Architecture.md](./ES-036-Database-Persistence-Architecture.md) |
| ES-037 Authentication & Authorisation | [ES-037-Authentication-Authorisation-Architecture.md](./ES-037-Authentication-Authorisation-Architecture.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| ES-058 Enterprise Operations & Service Management | [ES-058-ORION-Enterprise-Operations-Service-Management-Framework.md](./ES-058-ORION-Enterprise-Operations-Service-Management-Framework.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| PA-001 Platform Architecture | [ORION_Platform_Architecture.md](../03_Architecture/ORION_Platform_Architecture.md) |

---

# Closing Statement

The Audit Logging & Observability Architecture ensures that ORION remains transparent, measurable, diagnosable, and accountable throughout its operational lifecycle.

It provides the operational intelligence required to build and maintain a resilient, enterprise-grade Executive Operating System.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | ES-011 (foundation) · ES-038 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**

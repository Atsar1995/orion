# ADR-011 — Observability Architecture

**Identifier:** ADR-011  
**Mission:** P-015.3 — Production Architecture Decision Records  
**Status:** Accepted  
**Date:** 2026-08-01  
**Authors:** Chief Enterprise Architect  
**Reviewers:** Architecture Review Board · Platform Engineering Lead  
**Version:** 1.0

**Builds on:** Mission S1D · [lib/observability/](../../../lib/observability/) · [app/api/health/](../../../app/api/health/)

---

## Problem Statement

ORION has **partial observability**: health endpoints, web vitals collection, IIL health monitor, and a static readiness assessment service. Production GA requires a **coherent observability architecture** covering logging, metrics, tracing, health checks, and alerting — with Wave 2 operational runbooks.

---

## Context

- Delivered: `HealthStatusService` · `/api/health` · `/api/health/readiness` · `/api/health/metrics` · `PerformanceMonitor` · `ReadinessAssessmentService`.
- [P-015.1](../../00_Governance/P-015.1-Enterprise-Production-Readiness-Assessment.md): INF-007–INF-015 gaps · ops score 42/100.
- Readiness service uses static debt list and assumed test pass — must wire to CI (P-015.9).

---

## Decision

ORION adopts a **three-pillar observability model** aligned with cloud-native practice, implemented incrementally across Wave 1–2.

### Logging

| Decision | Detail |
|----------|--------|
| Format | **Structured JSON** in production (`{ level, message, timestamp, correlationId, organizationId?, missionId? }`) |
| Correlation ID | `X-Correlation-Id` header propagated through API → facade → repository |
| Levels | error · warn · info · debug — configurable via `ORION_LOG_LEVEL` |
| Sink | stdout (container-friendly) · forward to aggregation in Wave 2 (ADR runbook) |
| PII | No passwords · tokens · full HR payloads in logs |

### Monitoring & Metrics

| Metric class | Source | GA scope |
|--------------|--------|----------|
| **Platform health** | `HealthStatusService` | Required |
| **IIL events** | `HealthMonitor` publish/delivery counters | Required |
| **HTTP** | Request count/latency middleware hook | Wave 2 |
| **Database** | Pool size · query latency | Wave 2 post-ADR-007 |
| **Business** | Domain KPIs via Analytics — post-GA | Deferred |

Expose metrics at `/api/health/metrics` (existing) · Prometheus format optional in Wave 2.

### Tracing

| Phase | Decision |
|-------|----------|
| **GA** | Correlation ID only — no distributed tracing SDK |
| **v1.1+** | OpenTelemetry adapter behind `TracingProvider` interface |

### Health Checks

| Endpoint | Purpose | Consumer |
|----------|---------|----------|
| `GET /api/health` | Liveness — process up | Load balancer |
| `GET /api/health/readiness` | Readiness — deps OK | Orchestrator |
| `GET /api/health/metrics` | Metrics snapshot | Monitoring |

**Readiness checks (GA):** env validation · store connectivity (PostgreSQL ping post-ADR-007) · IIL status degraded acceptable with warning.

### Alerting

| GA | Wave 2 runbook defines alert rules |
|----|-------------------------------------|
| Critical | Health unhealthy · DB unreachable · error rate spike |
| Warning | IIL delivery failures · disk/memory thresholds |
| Tooling | Technology-neutral — PagerDuty/Opsgenie/cloud native in runbook |

---

## Alternatives Considered

| Alternative | Pros | Cons | Reason Not Selected |
|-------------|------|------|---------------------|
| **Phased model (selected)** | Matches GA timeline | Full OTel deferred | Pragmatic |
| **Full OpenTelemetry GA** | Best trace story | Effort · vendor setup | Wave 2+ |
| **Vendor-specific (Datadog only)** | Rich dashboards | Lock-in | Adapter pattern preferred |
| **No structured logging** | Fast | Ops blindness | Rejected |

---

## Consequences

### Positive

- Builds on existing S1D investment.
- Load balancers can use health endpoints today.
- Clear upgrade path to OTel and Prometheus.

### Negative

- Limited distributed tracing until v1.1.
- Alerting requires Wave 2 ops tooling investment.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Log volume cost | Medium | Medium | Log level controls · sampling policy |
| Health false positives | Low | Medium | Separate liveness vs readiness |
| Missing correlation on IIL | Medium | Low | Mandate correlation in event payload |

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| ADR-007 | Enables | DB readiness check |
| ADR-010 | Requires | LOG_LEVEL config |
| P-015.8 | Mission | Runbooks · aggregation |
| P-015.9 | Mission | Wire ReadinessAssessmentService to CI |

---

## Implementation Guidance

1. Add correlation ID middleware for all `/api/*` routes.
2. Replace unstructured `console.log` in platform paths with logger utility.
3. Extend readiness check with PostgreSQL ping after ADR-007 implementation.
4. Document alert thresholds in Wave 2 ops runbook (P-015.8).
5. IIL HealthMonitor metrics exposed via health metrics endpoint.

---

## Future Review Criteria

- Production incident without root cause due to missing traces → prioritize OTel.
- SLA commitments require sub-minute alerting.
- Multi-region deployment.

**Next review:** Wave 2 exit · post-GA 90 days.

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-01 | Chief Enterprise Architect | Accepted — P-015.3 |

---

*ORION Architecture Decision Record · ADR-011 · docs/11_Governance/ADR/*

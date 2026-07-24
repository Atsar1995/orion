# ES-033 — Event & Messaging Architecture

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** ES-011 (platform foundation partial) · Construction Phase canonical spec

**Author:** Founder & Chief Architect

**Related delivery:** [ES-011 — Platform Services Foundation](./ES-011-Platform-Services-Foundation.md) (Section 9 · Event-Driven Architecture)

---

# Purpose

The Event & Messaging Architecture defines how all ORION components communicate.

Rather than directly invoking one another whenever possible, workspaces, engines, providers, and services publish and consume business events through a unified event-driven architecture.

This approach promotes loose coupling, scalability, resilience, observability, and future extensibility.

**Current state:** In-memory **platform event foundation** is **implemented** in `lib/platform/events/` with `PlatformEvent` contract, publish/subscribe, correlation IDs, and Audit Service integration. Executive Intelligence engines currently use **synchronous pipeline invocation** (`runIntelligencePipeline`) — not event-driven messaging. Full ES-033 async delivery, dead-letter queues, schema registry, observability, and workspace/engine event integration — **Construction Phase alignment pending**.

**Out of scope (this ES):** Message broker implementation · cloud infrastructure · deployment topology · disaster recovery — addressed in infrastructure specifications.

---

# Objectives

The architecture shall:

- Decouple components.
- Enable asynchronous processing.
- Provide reliable event delivery.
- Support real-time intelligence.
- Preserve complete audit history.
- Enable future integrations.
- Simplify scaling.

---

# Architectural Principles

| Principle | Status |
|-----------|--------|
| Events represent facts | Documented · partial in code |
| Events are immutable | Documented · `PlatformEvent` append-only contract |
| Events are timestamped | Delivered · `timestamp` required |
| Events have a single source | Delivered · `source` required |
| Events may have many consumers | Delivered · pub/sub registry |
| Consumers shall not modify events | Documented |
| Events may trigger additional events | Planned |

---

# Event Sources

Hospitality · Commerce · Finance · Marketing · CRM workspaces · Authentication Service · Notification Service · System Scheduler · External Integrations · AI Services

**Delivered (partial):** Platform services may publish via `InMemoryEventPublisher`. Workspace and intelligence engines do **not** yet publish domain events.

---

# Event Consumers

Executive Dashboard · Executive Brief Engine · Recommendation Engine · Alert Engine · Trend Engine · Business Health Engine · Audit Service · Notification Service · Analytics Engine · Logging Service · External APIs

**Delivered (partial):**

| Consumer | Status |
|----------|--------|
| Audit Service | Delivered — subscribes via `InMemoryAuditService.initialize()` |
| Intelligence engines | **Not event-driven** — synchronous pipeline |
| Notification Service | Planned |
| Other consumers | Planned |

---

# Event Categories

Business · System · User · Security · Integration · Notification · AI · Operational

**Delivered (partial):** [ES-011](./ES-011-Platform-Services-Foundation.md) categories: Identity · Persistence · Platform · Module. Full ES-033 taxonomy — **planned alignment**.

---

# Standard Event Structure

Each event shall contain:

| Field | ES-033 | `PlatformEvent` | Status |
|-------|--------|-----------------|--------|
| Event ID | Required | `eventId` | Delivered |
| Event Name / Type | Required | `type` | Delivered |
| Event Type (category) | Required | — | Planned |
| Source | Required | `source` | Delivered |
| Version | Required | `version` | Delivered |
| Timestamp (UTC) | Required | `timestamp` | Delivered |
| Correlation ID | Required | `correlationId` | Delivered |
| Causation ID | Required | `causationId?` | Delivered (optional) |
| Business Entity | Required | Via `payload` / `metadata` | Partial |
| Entity ID | Required | Via `payload` / `metadata` | Partial |
| Payload | Required | `payload` | Delivered |
| Metadata | Required | `metadata?` | Delivered |
| Schema Version | Required | `version` (partial) | Partial |
| Tenant context | Required | `tenantContext` | Delivered |

**Contract location:** [types/services.ts](../../types/services.ts) · [PlatformEventFactory.ts](../../lib/platform/events/PlatformEventFactory.ts)

---

# Event Naming Convention

**Format:** `Domain.Entity.Action`

**Examples:** `Hospitality.Reservation.Created` · `Commerce.Order.Created` · `Finance.Invoice.Paid` · `Recommendation.Generated` · `Alert.Created` · `BusinessHealth.Calculated`

**Delivered (partial):** ES-011 uses dot-separated names (e.g. `user.created`). Formal `Domain.Entity.Action` registry — **planned**.

---

# Event Lifecycle

Generated · Published · Validated · Delivered · Processed · Acknowledged · Archived

**Delivered (partial):** Publish → validate → dispatch synchronously. Full lifecycle tracking — **planned**.

---

# Delivery Model

**Primary:** Publish / Subscribe  
**Secondary:** Point-to-Point (when required)

**Delivered (partial):** In-memory pub/sub via [EventBus.ts](../../lib/platform/events/EventBus.ts). Async transport — **planned**.

---

# Event Ordering

Ordering shall be guaranteed only within the same aggregate or entity stream. Global ordering is not required.

**Delivered:** — **planned (transport layer)**

---

# Delivery Guarantees

At-least-once delivery · consumers shall be idempotent · duplicate processing shall not create inconsistent state

**Delivered (partial):** Documented in ES-011. In-memory dispatch is effectively at-most-once synchronous. Idempotent consumer pattern — **planned enforcement**.

---

# Retry Policy

**Transient failures:** automatic retry · exponential backoff · configurable max attempts  
**Permanent failures:** dead letter queue · manual review

**Delivered:** — **planned**

---

# Dead Letter Queue

Failed events shall be stored with: failure reason · retry count · timestamp · stack trace · original payload

**Delivered:** — **planned**

---

# Event Versioning

Every event shall include schema version · deprecated versions supported for compatibility period · breaking changes require new versions

**Delivered (partial):** `version` field on `PlatformEvent`. Schema registry — **planned**.

---

# Correlation

Every business workflow shall include **Correlation ID**. Every derived event shall include **Causation ID**.

**Delivered:** `createCorrelationId()` · `correlationId` required on publish · `causationId` optional on factory input.

---

# Security

Events shall: exclude secrets · exclude passwords · exclude tokens · encrypt sensitive payloads where required · support digital integrity verification

**Delivered (partial):** Validation at publish boundary. Encryption and integrity — **planned**.

---

# Observability

Every event shall generate: processing metrics · latency · success/failure status · consumer statistics · retry statistics

**Delivered:** — **planned**

---

# Platform Implementation

| Module | Location | Purpose |
|--------|----------|---------|
| Event Bus | [EventBus.ts](../../lib/platform/events/EventBus.ts) | Publish · subscribe · validate |
| Event Dispatcher | [EventDispatcher.ts](../../lib/platform/events/EventDispatcher.ts) | Synchronous handler invocation |
| Event Registry | [EventRegistry.ts](../../lib/platform/events/EventRegistry.ts) | Subscription registry |
| Event Factory | [PlatformEventFactory.ts](../../lib/platform/events/PlatformEventFactory.ts) | Event construction |
| In-memory Publisher | [InMemoryEventPublisher.ts](../../lib/platform/events/InMemoryEventPublisher.ts) | Publisher adapter |
| In-memory Subscriber | [InMemoryEventSubscriber.ts](../../lib/platform/events/InMemoryEventSubscriber.ts) | Subscriber adapter |
| Audit integration | [AuditService.ts](../../lib/platform/audit/AuditService.ts) | Event → audit record |

**Factory:** `createInMemoryEventServices()` in [events/index.ts](../../lib/platform/events/index.ts)

**Intelligence layer note:** [pipeline.ts](../../lib/intelligence/pipeline.ts) orchestrates engines synchronously. Migration to event-driven intelligence is a Construction Phase alignment item.

---

# Provider Dependencies

| Dependency | Status |
|------------|--------|
| Event Bus | Delivered (in-memory) |
| Schema Registry | Planned |
| Authentication Provider | Partial (ES-009) |
| Audit Provider | Delivered (in-memory) |
| Logging Provider | Planned |
| Notification Provider | Planned |
| Observability Provider | Planned |

---

# Business Rules

- Events are immutable.
- Events are append-only.
- Consumers never modify published events.
- Every event has exactly one publisher.
- Events remain traceable throughout their lifecycle.

**Delivered (partial):** Validation and immutable `PlatformEvent` contract. Full lifecycle traceability — **planned**.

---

# Performance

| Target | Requirement | Status |
|--------|-------------|--------|
| Publish | < 100 ms | Delivered (in-memory sync) |
| Delivery | < 500 ms | Delivered (sync dispatch) |
| Critical Event Delivery | < 1 second | Planned (async transport) |

---

# Accessibility

Not applicable — backend architecture specification.

---

# Acceptance Criteria

The architecture shall:

- [x] Support asynchronous communication (partial — sync in-memory foundation; async transport planned)
- [x] Support event traceability (correlation · causation — partial)
- [ ] Support retries
- [ ] Support dead-letter handling
- [x] Support versioning (field present — registry planned)
- [x] Support correlation
- [ ] Support observability
- [x] Meet defined performance targets (in-memory layer)

---

# Implementation Status

| Area | Status | Notes |
|------|--------|-------|
| Platform event contract | Delivered | ES-011 · `types/services.ts` |
| In-memory Event Bus | Delivered | `lib/platform/events/` |
| Audit event consumer | Delivered | `InMemoryAuditService` |
| Workspace domain events | Not implemented | Construction Phase |
| Intelligence engine events | Not implemented | Pipeline is synchronous |
| Async message transport | Not implemented | Out of scope (infra) |
| Dead letter queue | Not implemented | Construction Phase |
| Schema registry | Not implemented | Construction Phase |
| ES-033 canonical spec | Approved | This document |

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Reservation Created | `Hospitality.Reservation.Created` published and consumed |
| Order Completed | Commerce event triggers downstream consumers |
| Invoice Paid | Finance event updates intelligence |
| Low Stock Event | Alert consumer receives event |
| Business Health Updated | Health engine consumer processes event |
| Recommendation Generated | Brief engine consumer updates |
| Alert Triggered | Notification consumer delivers |
| Consumer Failure | Retry then DLQ |
| Duplicate Event | Idempotent consumer — no inconsistent state |
| Schema Version Upgrade | Backward-compatible consumption |
| Dead Letter Recovery | Manual replay from DLQ |

---

# Out of Scope

- Message broker implementation
- Cloud infrastructure selection
- Deployment topology
- Disaster recovery architecture

These are addressed in infrastructure specifications.

---

# Future Enhancements

- Event Replay · Event Sourcing · CQRS · Streaming Analytics
- Cross-Organisation Events · External Partner Events
- AI Event Processing · Distributed Workflow Orchestration

---

# Definition of Done

The Event & Messaging Architecture is complete when:

- Event standards are defined and implemented platform-wide
- Naming conventions are approved and enforced via registry
- Lifecycle is documented and observable
- Delivery guarantees are specified and met by transport layer
- Retry and DLQ handling operate correctly
- Security requirements are enforced
- Observability requirements are met
- Workspace and intelligence components publish/consume via events
- ES-033 acceptance gaps closed
- Founder approval is received

**Status:** Platform event **foundation delivered** (in-memory). Full ES-033 event-driven architecture — **Construction Phase alignment pending**.

---

# References

| Document | Location |
|----------|----------|
| ES-011 Platform Services | [ES-011-Platform-Services-Foundation.md](./ES-011-Platform-Services-Foundation.md) |
| ES-010 Persistence Foundation | [ES-010-Persistence-Foundation.md](./ES-010-Persistence-Foundation.md) |
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-028 Executive Brief Engine | [ES-028-Executive-Brief-Engine.md](./ES-028-Executive-Brief-Engine.md) |
| ES-029 Recommendation Engine | [ES-029-Recommendation-Engine.md](./ES-029-Recommendation-Engine.md) |
| ES-030 Alert Engine | [ES-030-Alert-Engine.md](./ES-030-Alert-Engine.md) |
| ES-031 Trend Engine | [ES-031-Trend-Engine.md](./ES-031-Trend-Engine.md) |
| ES-032 Business Health Engine | [ES-032-Business-Health-Engine.md](./ES-032-Business-Health-Engine.md) |
| Architecture Baseline | [ORION_v1.0_Architecture_Baseline.md](../03_Architecture/ORION_v1.0_Architecture_Baseline.md) |
| ES-034 Provider & Data Contract Standards | [ES-034-Provider-Data-Contract-Standards.md](./ES-034-Provider-Data-Contract-Standards.md) |
| ES-036 Database & Persistence Architecture | [ES-036-Database-Persistence-Architecture.md](./ES-036-Database-Persistence-Architecture.md) |
| ES-037 Authentication & Authorisation Architecture | [ES-037-Authentication-Authorisation-Architecture.md](./ES-037-Authentication-Authorisation-Architecture.md) |
| ES-038 Audit Logging & Observability Architecture | [ES-038-Audit-Logging-Observability-Architecture.md](./ES-038-Audit-Logging-Observability-Architecture.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Platform exports | [lib/platform/index.ts](../../lib/platform/index.ts) |

---

# Closing Statement

The Event & Messaging Architecture forms the communication backbone of ORION.

It enables independent services to collaborate through reliable, traceable, and scalable business events, providing the foundation for a resilient Executive Operating System.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | ES-011 foundation · ES-033 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**

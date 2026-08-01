# ORION Architecture Baseline v0.3

**Version:** Baseline v0.3  
**Effective Date:** 30 July 2026  
**Status:** Frozen — pre-Finance Domain  
**Authority:** Chief Enterprise Architect  

---

## Purpose

This document defines the ORION platform architecture as frozen immediately before Finance Domain engineering begins. It establishes what exists, how domains relate to shared services, and the principles that govern all future domain work.

This is an **architecture document only**. It does not prescribe implementation details, technology choices, or code structure.

---

## Architecture Freeze Statement

At Baseline v0.3, the following are considered **stable**:

- Canon C-001 through C-010
- Shared platform service boundaries
- Certified domain boundaries (Hospitality, Commercial)
- Executive intelligence integration model
- Event-driven integration via the Intelligence Integration Layer

Finance Domain and all subsequent domains **must consume** shared platform services. They **must not** duplicate identity, organization, decision, memory, or integration capabilities within workspace boundaries.

---

## Completed Domains

### Hospitality Domain

**Certification:** CONDITIONAL GO (P-007.8)  
**Designation:** ORION Reference Workspace  

The Hospitality Domain owns operational hospitality entities: properties, inventory, reservations, guests, front office, housekeeping, billing, and hospitality analytics. It publishes operational and revenue events upward through the Integration Layer. It does not own customer identity (references Commercial/Party) or general ledger accounting (reserved for Finance).

### Commercial Domain

**Certification:** CONDITIONAL GO (P-008.8)  
**Designation:** Enterprise Reference Implementation for customer, sales, and commercial capabilities  

The Commercial Domain owns the customer relationship lifecycle: universal party identity, leads, opportunities, proposals, contracts, commercial agreements, commercial intelligence, customer analytics, and the commercial executive dashboard. It separates operational transactional data from derived executive intelligence metrics.

---

## Shared Platform Services

All business domains consume the following shared platform capabilities. These services are **not** owned by any single workspace.

### Executive Intelligence

The executive intelligence layer transforms operational signals into decision-ready insight:

- **Executive Brief** — daily executive summary across workspaces
- **Decision Intelligence** — recommendations, rationale, and decision support
- **Executive Memory** — organisational learning, milestones, and historical context

Domains publish signals upward; they do not embed cross-cutting intelligence logic.

### Identity

Authentication, session management, and user context. All API and service operations resolve through organisation-scoped identity context.

### Organization

Multi-tenant organisation model. All domain data is scoped by organisation. Cross-organisation data access is prohibited by architecture.

### Decision Intelligence

Structured decision records, transitions, comments, lessons learned, and decision analytics. Domains recommend actions; executives retain authority over decisions.

### Executive Memory

Long-term retention of executive-relevant events, snapshots, and outcomes. Domains contribute via Integration Layer events and approved memory contracts.

### Integration Layer

The Intelligence Integration Layer (IIL) is the canonical event bus for cross-domain communication. Domains publish domain events; other domains and platform services subscribe. No direct cross-domain database access is permitted.

### Analytics

Platform-level analytics aggregation. Domain-specific analytics remain within domain boundaries; platform analytics compose cross-domain executive views.

### Notifications

Platform notification service for executive alerts and operational signals. Domains emit events; notification delivery is a platform concern.

### Audit

Audit trail for sensitive operations. Domain events contribute to audit; formal audit log integration is a shared platform responsibility.

### Search

Cross-workspace and domain-scoped search. Each domain exposes search within its boundary; platform search may federate approved indexes.

---

## Architecture Principles

### Domain Driven Design

Each business domain owns its entities, lifecycle, and business rules. Domains have explicit bounded contexts. Shared concepts (e.g., customer identity) have a single authoritative owner.

### Event Driven Architecture

Domains communicate through events published to the Integration Layer. Synchronous API calls are permitted for query and command within defined contracts. Cross-domain state mutation via direct data access is prohibited.

### Shared Platform

Identity, organization, executive intelligence, integration, audit, and search are platform concerns. Workspaces consume platform services; they do not reimplement them.

### Executive Operating System

ORION is designed as an executive operating system, not a collection of disconnected applications. Every domain must answer: *Will this help an executive make a better decision tomorrow morning?*

### Microservice Ready

Domain boundaries, event contracts, and repository abstractions are structured to permit future service extraction. In-memory persistence at Baseline v0.3 is a staging-tier implementation choice, not an architectural constraint.

---

## Domain Integration Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Executive Operating Layer                 │
│  Executive Brief · Decision Intelligence · Executive Memory  │
└─────────────────────────────┬───────────────────────────────┘
                              │ signals / events
┌─────────────────────────────┴───────────────────────────────┐
│              Shared Platform (Identity · Org · IIL)          │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
    ┌──────┴──────┐                ┌──────┴──────┐
    │ Hospitality │                │  Commercial  │
    │   Domain    │                │    Domain    │
    └─────────────┘                └──────────────┘
           │                              │
           └────────── events ──────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Finance Domain   │  ← next
                    └───────────────────┘
```

---

## Conditions on Certified Domains

Both certified domains hold **CONDITIONAL GO** status. Full production GO is conditional on:

- Database persistence tier (shared platform concern)
- Completion of deferred domain missions (e.g., Commercial P-008.4 Activities)
- RBAC enforcement when platform identity hardening ships

These conditions do not alter domain boundaries or integration contracts at Baseline v0.3.

---

## Governance

Changes to this baseline require:

1. Architecture Decision Record (ADR) in `docs/11_Governance/ADR/`
2. Chief Enterprise Architect approval
3. Canon compliance review where platform-wide impact exists
4. CHANGELOG entry in `docs/11_Governance/CHANGELOG.md`

---

*Baseline v0.3 · Frozen before Finance Domain · ORION Enterprise Platform*

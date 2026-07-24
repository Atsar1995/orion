# ES-018 – Relationship & Opportunity Management

## Executive Summary

**Status:** Approved

**Priority:** High

**Product Version:** v1.2.0 – Business Platform

**Document Version:** 1.0

**Mission:** 16C

**Outcome:** Customer Intelligence evolves from executive reporting into executive relationship management with customer profiles, opportunity prioritisation, relationship actions, portfolio classification, and enhanced Executive Brief integration.

---

## Founder Promise

The Founder should immediately know which customer deserves attention today, which opportunity to close first, which relationship is becoming at risk, and which executive action creates the greatest business impact.

---

## Success Criteria

- Customer Profile Dashboard with health, relationship status, and executive notes
- Relationship Timeline with chronological placeholder activity
- Opportunity Management with stage, probability, and next actions
- Opportunity Prioritisation calculated from value, probability, health, and executive rules
- Relationship Actions generated from business logic
- Customer Portfolio with strategic segmentation
- Executive Recommendations from intelligence layer
- Executive Brief enhanced with priority relationship, opportunity, weekly health, and portfolio summary

---

## Architecture

### Business Logic Layer

| Module | Responsibility |
|--------|----------------|
| `lib/crm-relationships-opportunities.ts` | Profiles, opportunities, timeline, actions, portfolio, scoring, recommendations |
| `lib/crm-insights.ts` | Executive Brief snapshot aggregation (`ADVISOR_CRM_SNAPSHOT`) |

### Scoring Functions (Business Logic Only)

| Function | Purpose |
|----------|---------|
| `calculateOpportunityPriorityScore()` | Value, probability, health, stage, relationship status, executive priority |
| `classifyOpportunityPriority()` | High / medium / low tier classification |
| `calculateCustomerRankScore()` | Customer relationship ranking |

### Presentation Components

| Component | Purpose |
|-----------|---------|
| `CustomerProfileCard.tsx` | Customer profile dashboard |
| `RelationshipTimeline.tsx` | Chronological activity feed |
| `OpportunityManagement.tsx` | Full opportunity list |
| `OpportunityPriority.tsx` | Tier-classified opportunities |
| `RelationshipActions.tsx` | Recommended relationship actions |
| `CustomerPortfolio.tsx` | Portfolio segmentation |
| `ExecutiveRecommendations.tsx` | Prioritised executive guidance |

### Management Sections

| Component | Page |
|-----------|------|
| `CrmCustomersManagement` | `/crm/customers` |
| `CrmOpportunitiesManagement` | `/crm/opportunities` |
| `CrmRelationshipsManagement` | `/crm/relationships` |

---

## Executive Brief Enhancement

`CustomerInsightsCard` extended with:

- Highest Priority Relationship (links to `/crm/relationships`)
- Highest Priority Opportunity (links to `/crm/opportunities`)
- Weekly Relationship Health
- Customer Portfolio Summary
- Recommended Executive Action

---

## Future Extension Points

- CRM Service Layer
- Executive Intelligence Engine
- Notification Engine
- Workflow Engine
- Calendar and Email Integration
- AI Recommendation Service

---

## Out of Scope

Email, calendar, WhatsApp, CRM API, authentication, RBAC, workflow automation, AI conversations, contact synchronisation, multi-user collaboration.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | ORION CTO |
| **Date** | 24 July 2026 |
| **Release Record** | RR-014 |

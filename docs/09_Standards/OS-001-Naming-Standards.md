# OS-001 — Naming Standards

**Version:** 1.0

**Status:** Active

**Classification:** Engineering Standard

**Owner:** Chief Architect

---

# Purpose

This standard defines the naming conventions used throughout ORION.

Consistent naming improves readability, discoverability, and long-term maintainability.

---

# Principles

Names should be:

- Clear
- Descriptive
- Predictable
- Consistent
- Domain-oriented

Avoid abbreviations unless universally understood.

---

# File Names

## React Components — PascalCase

Examples:

- `ExecutiveDashboard.tsx`
- `HospitalityWorkspace.tsx`
- `RecommendationCard.tsx`

## Utility and Platform Modules — kebab-case

Examples:

- `health-engine.ts`
- `recommendation-engine.ts`
- `trend-engine.ts`
- `date-utils.ts`
- `currency-utils.ts`

## Platform Intelligence Layer

All modules under `lib/intelligence/` use kebab-case file names.

---

# Variables

Use **camelCase**.

**Good:** `currentRevenue` · `occupancyRate` · `guestCount`

**Bad:** `cr` · `temp` · `value1`

---

# Functions

Function names should describe actions.

Examples:

- `calculateBusinessHealth()`
- `generateExecutiveBrief()`
- `createRecommendation()`
- `validateReservation()`

---

# Booleans

Begin with:

- `is`
- `has`
- `can`
- `should`

Examples:

- `isOccupied`
- `hasOutstandingBalance`
- `canUpgradeGuest`
- `shouldNotifyFounder`

---

# Interfaces and Types

Prefix with `I` only if required by project policy.

Otherwise use meaningful nouns.

Examples:

- `ExecutiveBrief`
- `BusinessHealth`
- `Recommendation`
- `GuestReservation`

ORION platform types in `lib/intelligence/models.ts` follow this convention.

---

# Enums

Use singular nouns.

Examples:

- `AlertLevel`
- `BusinessStatus`
- `RecommendationPriority`

---

# Constants

Use **UPPER_SNAKE_CASE**.

Examples:

- `MAX_ALERTS`
- `DEFAULT_TIMEOUT`
- `HEALTH_THRESHOLD`

Platform constants live in `lib/intelligence/constants.ts`.

---

# Components

Always describe purpose.

**Good:** `ExecutiveSummaryCard` · `BusinessHealthGauge` · `RecommendationPanel`

**Bad:** `Card2` · `Widget` · `Panel`

---

# Documentation

Document names should describe their content.

**Good:**

- `Executive_Dashboard_Specification.md`
- `Hospitality_Workspace_Architecture.md`

**Bad:** `dashboard.md` · `notes.md` · `new.md`

## ORION Document Identifiers

Governance and mission documents use approved prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| ES | Engineering Specification | `ES-021-Executive-Intelligence-Engines.md` |
| RR | Release Record | `RR-017-Mission17B-Executive-Intelligence-Engines.md` |
| FA | Founder Assignment | `FA-001-Project-Sunrise.md` |
| DL | Decision Log entry | `DL-2026-001-Executive-Brief-Default-Landing.md` |
| ADR | Architecture Decision Record | `ADR-006-Executive-Intelligence-Provider-Framework.md` |
| OS | ORION Standard | `OS-001-Naming-Standards.md` · `OS-002-Work-Item-Lifecycle.md` |
| PA | Platform Architecture | `ORION_Platform_Architecture.md` (PA-001) |
| CTO | CTO Retrospective | `CTO-001-Phase-I-Retrospective.md` |

Mission and governance files use **kebab-case** or **PascalCase-with-hyphens** after the identifier prefix.

---

# Review Checklist

Before approving names ask:

- Is it descriptive?
- Is it consistent?
- Will a new engineer understand it?
- Does it reflect the business domain?

---

# Related Standards

| Document | Scope |
|----------|-------|
| [ORION Product Bible](../00_BLUEPRINT/ORION_Product_Bible.md) | Master blueprint |
| [Engineering Standards](./Engineering_Standards.md) | Operational rules and verification |
| [OS-002 Work Item Lifecycle](./OS-002-Work-Item-Lifecycle.md) | Idea through closed lifecycle |
| [Engineering Manifesto](./ORION_Engineering_Manifesto.md) | Readable Code · Single Responsibility |

---

# Closing Statement

Clear naming is an investment.

Every well-chosen name reduces future confusion.

ORION values clarity over brevity.

---

## Approved

**Founder**

**Chief Architect**

# ORION Decision Framework

> **Master reference:** [ORION Product Bible](../00_BLUEPRINT/ORION_Product_Bible.md) takes precedence where conflicts exist.

**Version:** 1.0

**Status:** Foundational

**Classification:** Intelligence Blueprint

**Author:** Founder & Chief Architect

---

# Purpose

This document defines the standard decision-making framework used throughout ORION.

Every recommendation, alert, executive brief, and future AI capability shall follow this framework.

The objective is consistency, transparency, and executive trust.

---

# Philosophy

Good decisions are rarely based on a single metric.

They result from understanding context, evaluating evidence, assessing risk, considering alternatives, and selecting the most appropriate course of action.

ORION shall follow the same disciplined process.

---

# Decision Lifecycle

```
Observe

↓

Understand

↓

Evaluate

↓

Recommend

↓

Explain

↓

Execute

↓

Review

↓

Learn
```

Platform mapping: **Providers (Observe) → Engines (Understand/Evaluate/Recommend) → Brief (Explain) → Executive (Execute/Review/Learn)**

---

# Step 1 — Observe

Collect relevant business information.

Examples:

- Revenue
- Bookings
- Inventory
- Occupancy
- Guest Feedback
- Marketing Performance
- Cash Flow
- Staff Availability
- Supplier Status

The objective is to understand what is happening.

**Platform:** Executive Providers publish health, alerts, metrics, and summaries.

---

# Step 2 — Understand

Determine why the current situation exists.

Identify:

- Patterns
- Trends
- Exceptions
- Relationships
- Business Context

The objective is to transform data into understanding.

**Platform:** Health Engine aggregates workspace health; workspace providers supply business context.

---

# Step 3 — Evaluate

Assess the situation.

Questions include:

- Is this normal?
- Is intervention required?
- What is the business impact?
- How urgent is this?
- What are the risks?

**Platform:** Recommendation Engine sorts by severity, priority, confidence, and business impact.

---

# Step 4 — Recommend

Generate one or more recommended actions.

Each recommendation should include:

- Priority
- Expected Benefit
- Potential Risk
- Estimated Effort
- Confidence Level

**Platform:** `ExecutiveRecommendation` model · Recommendation Engine aggregation.

---

# Step 5 — Explain

Every recommendation must explain:

- Why it exists
- What evidence supports it
- What outcome is expected
- Why it is important

**Platform:** Brief Engine · Executive Brief · [Intelligence Constitution](./ORION_Intelligence_Constitution.md) Principle 4.

---

# Step 6 — Execute

Record:

- Accepted
- Rejected
- Deferred
- Delegated
- Completed

**Platform:** Future capability — executive action tracking (Phase II+).

---

# Step 7 — Review

Evaluate the outcome.

- Did the recommendation improve the situation?
- Were assumptions correct?
- What lessons were learned?

**Platform:** Future capability — outcome feedback loop (Phase III+).

---

# Step 8 — Learn

Identify recurring patterns.

Improve future recommendations.

Strengthen business rules.

Refine intelligence models.

**Platform:** Future AI Gateway — advisory only; deterministic rules remain authoritative.

---

# Recommendation Template

Every platform recommendation should contain:

| Field | Description |
|-------|-------------|
| Situation | Current business state |
| Evidence | Observable facts supporting the recommendation |
| Business Impact | Expected effect on the business |
| Priority | Urgency and rank |
| Recommended Action | What the executive should do |
| Alternative Actions | Other valid options |
| Confidence | High · Medium · Low |
| Expected Result | Outcome if action is taken |

---

# Decision Quality

Every recommendation should be:

- Relevant
- Timely
- Explainable
- Actionable
- Evidence-Based
- Consistent

---

# Executive Principles

- Never overwhelm.
- Never exaggerate.
- Never hide uncertainty.
- Never recommend without evidence.
- Always respect executive judgement.

---

# Related Governance

| Document | Scope |
|----------|-------|
| [ORION Intelligence Constitution](./ORION_Intelligence_Constitution.md) | Intelligence principles — observe, explain, executive control |
| [ORION Product Constitution](../01_Product/ORION_Product_Constitution.md) | Every recommendation must answer what/why/action/consequence |
| [FA-002 — Project Compass](../01_Product/FA-002-Project-Compass.md) | Founder decision mapping — behavioural input for this framework |
| [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) | Provider Framework implementation |
| [ES-021](../02_Engineering/ES-021-Executive-Intelligence-Engines.md) | Intelligence Engines (Mission 17B) |
| [Intelligence Platform README](../../lib/intelligence/README.md) | Code — engines, registry, pipeline |

---

# Closing Statement

The quality of ORION will not be measured by the number of recommendations it generates.

It will be measured by the quality of the decisions those recommendations help executives make.

---

## Approved

**Founder**

**Chief Architect**

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**

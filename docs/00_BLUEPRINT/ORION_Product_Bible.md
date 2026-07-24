# ORION Product Bible

**Version:** 1.0

**Status:** Living Document

**Classification:** Master Blueprint

**Owner:** Founder

**Maintained By:** Chief Architect

---

# Purpose

The ORION Product Bible is the definitive guide for the design, architecture, engineering, intelligence, and evolution of ORION.

Every engineer, designer, product manager, AI agent, and contributor shall treat this document as the primary reference before making product decisions.

Where conflicts exist between documents, the Product Bible takes precedence.

---

# Vision

Build the world's most trusted Executive Operating System.

Not the biggest.

Not the most complex.

The most trusted.

---

# Mission

Help executives understand their business, make better decisions, and lead with confidence.

---

# The Four Pillars

## Product

- Executive First
- Questions Before Features
- Recommendations Before Reports
- Calm Software
- Trust Above Everything

**Detailed reference:** [ORION Product Constitution](../01_Product/ORION_Product_Constitution.md)

---

## Engineering

- Architecture First
- Readable Code
- Quality Before Speed
- Deterministic Systems
- Continuous Improvement

**Detailed reference:** [ORION Engineering Manifesto](../09_Standards/ORION_Engineering_Manifesto.md)

---

## Intelligence

- Observe
- Understand
- Evaluate
- Recommend
- Explain
- Learn

**Detailed reference:** [ORION Intelligence Constitution](../05_AI/ORION_Intelligence_Constitution.md) · [ORION Decision Framework](../05_AI/ORION_Decision_Framework.md)

---

## Experience

- Fast
- Simple
- Elegant
- Calm
- Predictable
- Helpful

**Detailed reference:** [ORION Design System](../04_Design/ORION_Design_System.md) · [ES-008 Design System](../02_Engineering/ES-008-Design-System.md)

---

# The ORION Philosophy

ORION is not designed to manage businesses.

ORION is designed to help people lead businesses.

**Founder's voice:** [Founder's Letter](../00_Strategy/ORION_Founders_Letter.md)

---

# Every Feature Must Answer

- What executive problem does this solve?
- Who benefits?
- What decision becomes easier?
- How much time is saved?
- Why does this deserve space on the screen?

**Behavioural input:** [FA-001 Project Sunrise](../01_Product/FA-001-Project-Sunrise.md) · [FA-002 Project Compass](../01_Product/FA-002-Project-Compass.md) · [FA-003 Project Pulse](../01_Product/FA-003-Project-Pulse.md)

---

# Every Screen Must Answer

- What is happening?
- Why is it happening?
- What requires attention?
- What action should be taken?

---

# Every Recommendation Must Explain

- Situation
- Evidence
- Reason
- Impact
- Recommendation
- Confidence
- Expected Result

---

# Every Metric Must Be

- Accurate
- Relevant
- Current
- Actionable
- Explainable

---

# Every Notification Must

Matter.

If it does not matter, it should not exist.

---

# Every Workspace Must

- Have a clear purpose.
- Answer executive questions.
- Integrate naturally with the Executive Dashboard.
- Share a common design language.
- Avoid duplication.

**Pattern reference:** [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md) · [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md)

---

# Every AI Capability Must

- Support human judgement.
- Explain itself.
- Respect business rules.
- Protect executive trust.
- Never invent facts.

---

# Product Quality Standards

- Simple
- Reliable
- Fast
- Secure
- Maintainable
- Accessible
- Scalable
- Explainable

---

# Product Review Questions

Before approving any feature ask:

- Would the Founder use this daily?
- Does it reduce executive effort?
- Does it improve executive understanding?
- Can it be explained in one sentence?
- Does it deserve to exist?

---

# Document Hierarchy

When guidance conflicts, resolve in this order:

| Priority | Document | Scope |
|----------|----------|-------|
| 1 | **ORION Product Bible** (this document) | Master blueprint — all product decisions |
| — | [ORION Project Charter](./ORION_Project_Charter.md) | Construction Phase authorization |
| — | [ORION Non-Negotiables](./ORION_Non_Negotiables.md) | Foundational commitments — never compromised |
| — | [ORION Governance Framework](../09_Standards/ORION_Governance_Framework.md) | Documentation, approval, and traceability |
| 2 | [ORION Constitution](../09_Standards/ORION_Constitution.md) | Architectural law |
| 3 | [ORION Product Constitution](../01_Product/ORION_Product_Constitution.md) | Product principles |
| 4 | [ORION Engineering Manifesto](../09_Standards/ORION_Engineering_Manifesto.md) | Engineering philosophy |
| 5 | [ORION Intelligence Constitution](../05_AI/ORION_Intelligence_Constitution.md) | Intelligence principles |
| 6 | [ORION Decision Framework](../05_AI/ORION_Decision_Framework.md) | Decision lifecycle |
| 7 | [Architecture Baseline v1.0](../03_Architecture/ORION_v1.0_Architecture_Baseline.md) | Frozen Phase I architecture |
| 8 | Engineering Specifications & Release Records | Mission-level proof |
| — | [OS-001 Naming Standards](../09_Standards/OS-001-Naming-Standards.md) | Code and documentation naming |
| — | [OS-002 Work Item Lifecycle](../09_Standards/OS-002-Work-Item-Lifecycle.md) | Idea through closed lifecycle |
| — | [ORION Decision Log](../10_Decisions/ORION_Decision_Log.md) | Institutional memory — DL records |

---

# Platform Reference

| Layer | Entry Point |
|-------|-------------|
| Executive Experience | [Executive Shell](../03_Architecture/SYSTEM_CONTEXT.md) · `/advisor` |
| Executive Intelligence | [lib/intelligence/README.md](../../lib/intelligence/README.md) · [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) |
| Business Workspaces | Finance · Customer Intelligence — see [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md) |
| Governance | [Documentation Baseline](../DOCUMENTATION_BASELINE.md) · [Architecture Index](../03_Architecture/ARCHITECTURE_INDEX.md) |

---

# Long-Term Goal

ORION should become the first application executives open every morning because it gives them clarity.

Not because they are forced to use it.

---

# Motto

Engineering clarity for better executive decisions.

Let's build something remarkable.

---

## Approved

**Founder**

**Chief Architect**

---

*Living Document — updated as ORION evolves. All contributors must align with this Bible before shipping.*

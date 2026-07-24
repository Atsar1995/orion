# OS-002 — Work Item Lifecycle

**Version:** 1.0

**Status:** Active

**Classification:** Engineering Standard

**Owner:** Chief Architect

---

# Purpose

This standard defines the lifecycle of every work item within ORION.

A work item may be a feature, bug, enhancement, technical improvement, research task, documentation update, or architectural change.

Every work item shall follow the same lifecycle to ensure consistency, traceability, and quality.

---

# Guiding Principle

No work begins without purpose.

No work ends without verification.

---

# Lifecycle

```
Idea

↓

Discovery

↓

Architecture

↓

Specification

↓

Approval

↓

Implementation

↓

Review

↓

Verification

↓

Documentation

↓

Release

↓

Retrospective

↓

Closed
```

**ORION mapping:** Missions follow this lifecycle via Founder Assignments → ES → Implementation → Verification Hierarchy → RR → CTO Retrospective.

---

# Stage Definitions

## 1. Idea

A problem, opportunity, or improvement is identified.

**Deliverable:** Brief description · Business value

---

## 2. Discovery

Understand the problem.

Questions include:

- Who benefits?
- Why is it important?
- What executive question does it answer?
- What business value is created?

**Deliverable:** Problem Statement

**Reference:** [ORION Product Bible](../00_BLUEPRINT/ORION_Product_Bible.md) · [FA-001 Project Sunrise](../01_Product/FA-001-Project-Sunrise.md)

---

## 3. Architecture

Determine how the solution fits within ORION.

Questions include:

- Which workspace owns it?
- Which services are affected?
- Are existing components reusable?
- Does it align with the Product Constitution?

**Deliverable:** Architecture Notes · ADR (if architectural change)

**Reference:** [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) · [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md)

---

## 4. Specification

Create the Engineering Specification.

Include:

- Objectives
- Scope
- Out of Scope
- Acceptance Criteria
- Risks
- Dependencies

**Deliverable:** Engineering Specification (ES)

**Template:** [Engineering Specification Template](./Engineering_Specification_Template.md)

---

## 5. Approval

Before implementation, confirm:

- Architecture approved
- Product approved
- Engineering approved

**Deliverable:** Approved Specification

---

## 6. Implementation

Write code according to approved specifications.

Requirements:

- Follow [Engineering Standards](./Engineering_Standards.md)
- Follow [OS-001 Naming Standards](./OS-001-Naming-Standards.md)
- Keep commits focused
- Document significant decisions

---

## 7. Review

Every implementation must be reviewed.

Checklist:

- Correctness
- Readability
- Simplicity
- Performance
- Security
- Maintainability

**Deliverable:** Approved Review

**Reference:** [Architecture Review Checklist](./Architecture_Review_Checklist.md) · [Engineering Manifesto — Review Checklist](./ORION_Engineering_Manifesto.md#review-checklist)

---

## 8. Verification

Confirm:

- Requirements satisfied
- Tests passed
- Documentation updated
- No regressions introduced

**Deliverable:** Verification Record (VR)

**Reference:** [Engineering Standards — Verification Hierarchy](./Engineering_Standards.md#verification-hierarchy)

| Gate | Method |
|------|--------|
| Build | `npm run build` |
| Lint | `npm run lint` |
| Type Safety | TypeScript strict |
| Accessibility | Manual review |
| Responsive | Manual at 375px, 768px, 1280px |
| Regression | Smoke test existing routes |
| Manual Verification | QA against ES acceptance criteria |
| Release Documentation | RR, CHANGELOG, debt register |

---

## 9. Documentation

Update all affected documentation.

Examples:

- Architecture
- Specifications
- API
- Standards
- User Documentation

**Reference:** [Documentation Baseline](../DOCUMENTATION_BASELINE.md) · [Architecture Index](../03_Architecture/ARCHITECTURE_INDEX.md)

---

## 10. Release

Prepare for deployment.

Checklist:

- CHANGELOG updated
- Release notes prepared
- Version assigned
- Migration steps documented (if applicable)

**Deliverable:** Release Record (RR)

**Template:** [Release Record Template](./Release_Record_Template.md)

---

## 11. Retrospective

Ask:

- What went well?
- What could improve?
- What should become a standard?
- What technical debt remains?

**Deliverable:** Retrospective notes · Technical Debt Register updates

**Reference:** [CTO Retrospective Template](./CTO_Retrospective_Template.md) · [Technical Debt Register](./Technical_Debt_Register.md)

---

## 12. Closed

A work item is considered complete only when:

- Product accepted
- Documentation complete
- Verification complete
- Lessons captured

---

# Workflow Rules

- **No implementation before approval.**
- **No release without verification.**
- **No closure without documentation.**

---

# Artefacts

Each work item may produce:

| Artefact | Stage | ORION Format |
|----------|-------|--------------|
| Problem Statement | Discovery | Mission brief · FA assignment |
| Architecture Notes | Architecture | ADR · Architecture Index update |
| Engineering Specification | Specification | ES-{n} |
| Code | Implementation | `app/` · `lib/` · `components/` |
| Tests | Implementation | Test suite (when applicable) |
| Review Record | Review | Architecture Review Checklist |
| Verification Record | Verification | Verification Hierarchy in RR |
| Release Record | Release | RR-{n} |
| Decision Log entry | Architecture / Product / Process | DL-{year}-{n} |
| Documentation Updates | Documentation | CHANGELOG · Baseline · README |

---

# Mission Lifecycle (ORION Standard)

Every ORION mission maps to this lifecycle:

```
Mission Brief (Idea + Discovery)
    → ES (Architecture + Specification + Approval)
    → Implementation + Review
    → Verification Hierarchy (VR)
    → RR + CHANGELOG (Release + Documentation)
    → CTO Retrospective (phase-level)
    → Closed
```

---

# Success Criteria

A completed work item should be:

- Understandable
- Traceable
- Maintainable
- Verified
- Documented
- Reproducible

---

# Related Standards

| Document | Scope |
|----------|-------|
| [ORION Product Bible](../00_BLUEPRINT/ORION_Product_Bible.md) | Master blueprint |
| [Engineering Standards](./Engineering_Standards.md) | Verification Hierarchy · Business Workspace Compliance |
| [OS-001 Naming Standards](./OS-001-Naming-Standards.md) | Implementation naming |
| [Release Record Template](./Release_Record_Template.md) | Release stage deliverable |

---

# Closing Statement

Every completed work item should leave ORION better than it was before.

Quality is achieved through disciplined execution, not heroic effort.

---

## Approved

**Founder**

**Chief Architect**

# DL-2026-001 — Executive Brief as Default Landing

## Decision ID

DL-2026-001

## Date

2026-07-23

## Category

Product

## Title

Executive Brief (Advisor) becomes the primary landing page.

## Problem

Executives need to understand the health of the business immediately upon opening ORION. A generic dashboard or workspace list does not surface cross-business intelligence fast enough.

## Options Considered

### Option A — Executive Brief as default landing (`/advisor`)

**Advantages:** Surfaces executive intelligence within sixty seconds; aligns with Product Constitution executive-first principle; consolidates workspace contributions.

**Disadvantages:** Requires every workspace to contribute to the Executive Brief; intelligence aggregation must be reliable.

### Option B — Command Center or workspace list as default

**Advantages:** Familiar navigation pattern; easier initial implementation.

**Disadvantages:** Executives must navigate before gaining insight; duplicates intelligence already available in brief format.

### Option C — Role-based landing (executive vs operator)

**Advantages:** Flexible for multiple user types.

**Disadvantages:** Adds complexity before identity roles are fully implemented; splits experience prematurely.

## Decision

The Executive Brief (Advisor) at `/advisor` is the default landing experience for the Executive Shell. Root route redirects to Advisor.

## Rationale

Executives should understand business health within sixty seconds (Product Constitution · Product Bible). The Executive Brief aggregates workspace intelligence through the Intelligence Bus — the correct platform entry point per ADR-006.

## Consequences

### Positive

- Single executive entry point for cross-workspace intelligence
- Every workspace mission must include Executive Brief contribution
- Reinforces Executive Operating System positioning

### Negative

- Workspace-specific landing deferred; executives enter via brief first

### Risks

- Brief quality depends on provider coverage; incomplete workspaces show gaps

### Trade-offs

- Simplicity and executive clarity chosen over flexible multi-landing navigation

## Related Documents

- [ADR-002 — Advisor Default Landing](../../11_Governance/ADR/ADR-002-Advisor-Default-Landing.md) (Pending)
- [ADR-006 — Executive Intelligence Provider Framework](../../11_Governance/ADR/ADR-006-Executive-Intelligence-Provider-Framework.md)
- [RR-007 — Mission 14A Experience Foundation](../../06_Releases/RR-007-Mission14A-Experience-Foundation.md)
- [ORION Product Constitution](../../01_Product/ORION_Product_Constitution.md)

## Status

Implemented

## Approved By

Founder · Chief Architect

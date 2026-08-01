# ADR-002 — Advisor Default Landing

## Status

Accepted

## Date

2026-07-23

## Architecture Reference

[PA-001](../../03_Architecture/ORION_Platform_Architecture.md) · [DL-2026-001](../../10_Decisions/decisions/DL-2026-001-Executive-Brief-Default-Landing.md)

---

## Context

Executives need to understand the health of the business immediately upon opening ORION. A generic dashboard or workspace list does not surface cross-business intelligence fast enough.

ORION must answer the North Star question: *"What do I need to know before I start my day?"*

---

## Decision

The **Executive Brief (Advisor)** at `/advisor` is the default landing experience for the Executive Shell.

The root route (`/`) redirects to Advisor.

This aligns with the ORION Product Constitution executive-first principle and the Morning Executive Brief capability (EC-001).

---

## Consequences

### Positive

- Surfaces executive intelligence within sixty seconds of login
- Consolidates workspace contributions into one opening ritual
- Reinforces ORION as an Executive Operating System, not a dashboard collection

### Negative

- Requires reliable intelligence aggregation across workspaces
- Every workspace should eventually contribute to the Executive Brief

---

## Related Documents

| Document | Link |
|----------|------|
| DL-2026-001 | [DL-2026-001-Executive-Brief-Default-Landing.md](../../10_Decisions/decisions/DL-2026-001-Executive-Brief-Default-Landing.md) |
| EC-001 Morning Executive Brief | [EC-001_Morning_Executive_Brief.md](../../05_Product/EC-001_Morning_Executive_Brief.md) |
| ORION North Star | [ORION_North_Star.md](../../00_BLUEPRINT/ORION_North_Star.md) |

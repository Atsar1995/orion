# Canon Compliance Checklist

**Purpose:** Per-mission and per-release gate against ORION Canon v1.0.  
**Authority:** [`ORION_CANON_v1.md`](ORION_CANON_v1.md) (Ratified · Frozen)  
**Matrix:** [`CANON_COMPLIANCE_MATRIX.md`](CANON_COMPLIANCE_MATRIX.md)

Every Phase II mission shall **begin** by identifying applicable Canon chapter(s) and **conclude** with a Canon Compliance statement.

---

## Mission Start

- [ ] Applicable Canon chapter(s) identified (C-001 through C-010)
- [ ] Golden Question evaluated: *Will this help an executive make a better decision tomorrow morning?*
- [ ] Golden Rule evaluated: improves decision quality, confidence, clarity, speed, or organizational memory
- [ ] No workspace duplication of platform services planned

---

## Engineering (C-006)

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes (no new errors)
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] Engineering Review Checklist satisfied
- [ ] Technical debt recorded if introduced (TD-XXX)

---

## Design (C-005)

- [ ] Five-Second Rule: what, why, next action
- [ ] Information hierarchy respected
- [ ] Design System tokens and patterns reused
- [ ] Accessibility requirements met
- [ ] Design Review Checklist passed

---

## Architecture (C-003)

- [ ] Platform layer model respected
- [ ] Shared services consumed — not duplicated
- [ ] ADR created if major architectural change

---

## Intelligence & AI (C-004, C-008)

- [ ] Recommendations explainable (evidence, confidence, impact)
- [ ] Decisions recorded via Decision Service where applicable
- [ ] AI Review Checklist passed (if AI involved)
- [ ] Executive authority preserved

---

## Workspace (C-007)

- [ ] Consumes platform Identity, Intelligence, Decision services
- [ ] Publishes domain signals upward
- [ ] No embedded cross-cutting logic

---

## Security & Trust (C-009)

- [ ] Trust Review Checklist passed
- [ ] Input validation at boundaries
- [ ] No secrets in source
- [ ] Audit events for sensitive actions

---

## Mission Close

- [ ] Canon Compliance statement written in mission return
- [ ] Compliance Matrix updated if platform-wide impact
- [ ] `CHANGELOG_CANON.md` updated if Canon Amendment (CA)

---

## Release Gate (Major Releases)

- [ ] Full Compliance Matrix review
- [ ] S1E-style certification dimensions scored
- [ ] Security governance review complete
- [ ] Workspace certification current
- [ ] GO / NO-GO documented

---

*Use with [`CANON_COMPLIANCE_MATRIX.md`](CANON_COMPLIANCE_MATRIX.md) for scoring guidance.*

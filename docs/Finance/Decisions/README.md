# Finance Domain — Decisions

**Domain:** Finance  
**Phase:** IV (Next)  
**Owner:** Chief Enterprise Architect  

---

## Purpose

This folder records Architecture Decision Records (ADRs) and domain-specific decisions for the ORION Finance Domain. Decisions document the *why* behind architectural choices, rejected alternatives, and consequences.

Platform-wide ADRs remain in `docs/10_Decisions/`. Finance-specific decisions that affect only the Finance Domain are recorded here. Decisions with cross-domain or platform impact are recorded in `docs/10_Decisions/` with a reference link from this folder.

---

## Contents

| Document Type | Description |
|---------------|-------------|
| Architecture Decision Records | Significant finance domain architecture choices |
| Domain Decision Log | Chronological index of finance decisions |
| Rejected Alternatives | Documented options not taken, with rationale |

No decisions have been recorded yet. Finance Domain planning will produce the first entries.

---

## Standards

- Use ADR format: Status, Context, Decision, Consequences
- Reference Canon chapters affected (C-001 through C-010)
- Link to related blueprints and data contracts
- Decisions are immutable once accepted; supersede with a new ADR
- Cross-domain decisions require Chief Enterprise Architect approval

---

## Naming Convention

```
ADR-FIN-{NNN}-{Short-Title}.md
FIN-Decision-Log.md              — index (when created)
```

| Prefix | Meaning |
|--------|---------|
| ADR-FIN-001+ | Finance domain architecture decisions |

Platform ADRs (cross-domain):

```
docs/10_Decisions/ADR-{NNN}-{Title}.md
```

---

## Owner

**Chief Enterprise Architect** — decision authority  
**Finance Domain Lead** — decision authorship (to be assigned)  

---

*Parent: [docs/Finance/](../) · Platform ADRs: [docs/10_Decisions/](../../10_Decisions/)*

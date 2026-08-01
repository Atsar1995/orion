# Data Domain — Governance

**Domain:** Enterprise Data Governance (Cross-Cutting)  
**Phase:** IV (Next)  
**Owner:** Chief Enterprise Architect / Data Governance Lead  

---

## Purpose

This folder contains enterprise data governance frameworks for ORION. Documents define ownership, stewardship, quality standards, lifecycle policies, privacy controls, and compliance boundaries.

Governance documents are **architectural only**. They do not prescribe database rules, ORM models, API implementations, or infrastructure.

---

## Contents

| Document | Description |
|----------|-------------|
| [D-013 — Enterprise Data Governance](./D-013_Enterprise_Data_Governance.md) | Master governance framework: ownership, stewardship, quality, lifecycle, privacy, compliance |

---

## Relationship to Other Documents

| Document | Role |
|----------|------|
| [D-011 — Enterprise Data Architecture Blueprint](../Blueprints/D-011_Enterprise_Data_Architecture_Blueprint.md) | Data vision, principles, canonical strategy |
| [D-012 — Enterprise Master Data Model](../Blueprints/D-012_Enterprise_Master_Data_Model.md) | Canonical master entities and relationships *(planned)* |
| [ES-056 — Data Governance & Information Architecture](../../02_Engineering/ES-056-ORION-Data-Governance-Information-Architecture.md) | Engineering maturity tracking and implementation targets |

**Hierarchy:** D-011 (architecture) → D-012 (master data) → D-013 (governance) → ES-DATA-001 (engineering) → ES-056 (maturity tracking)

---

## Standards

- Align with [ARCHITECTURE_BASELINE_v0.3.md](../../11_Governance/Architecture/ARCHITECTURE_BASELINE_v0.3.md)
- Reference [CANON_COMPLIANCE_CHECKLIST.md](../../00_FOUNDATION/CANON_COMPLIANCE_CHECKLIST.md) for mission gates
- No implementation details

---

## Naming Convention

```
D-{NNN}-{Title}.md
```

Governance documents use the `D-0XX` prefix when they are enterprise data architecture programme deliverables stored under `docs/Data/Governance/`.

---

*Parent: [docs/Data/](../)*

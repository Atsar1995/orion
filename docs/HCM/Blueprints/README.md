# HCM Domain — Blueprints

**Domain:** Human Capital Management (HCM)  
**Phase:** V — Implemented (Enterprise HCM v1.0)  
**Owner:** Chief Enterprise Architect / HCM Domain Lead (to be assigned)

---

## Purpose

This folder contains enterprise architecture blueprints for the ORION Human Capital Management domain. Blueprints define workforce vision, domain boundaries, aggregate models, service catalogues, event contracts, and integration strategy.

Blueprints are **architectural only**. They do not prescribe database schemas, ORM models, or implementation code.

---

## Contents

| Document | Description |
|----------|-------------|
| [D-014 — Enterprise HCM Architecture Blueprint](./D-014_Enterprise_HCM_Architecture_Blueprint.md) | Workforce domain vision, modules, aggregates, services, events, integrations |

---

## Document Hierarchy

```
D-014 (HCM Architecture Blueprint)
  └── D-015 (Enterprise Workforce Domain Model) — planned
        └── ES-HCM-001 (HCM Engineering Specification) — implemented
              └── P-012.1–P-012.8 mission implementations (S-002.3–S-002.8)
```

---

## Related Documentation

- [D-007 — Finance Domain Blueprint](../../Finance/Blueprints/D-007_Finance_Domain_Blueprint.md) — Finance consumes HCM payroll events
- [D-011 — Enterprise Data Architecture](../../Data/Blueprints/D-011_Enterprise_Data_Architecture_Blueprint.md) — Master data and reference data consumption
- [D-013 — Enterprise Data Governance](../../Data/Governance/D-013_Enterprise_Data_Governance.md) — PII classification and retention
- [ES-033 — Event & Messaging Architecture](../../02_Engineering/ES-033-Event-Messaging-Architecture.md)
- [BUSINESS_WORKSPACE_PATTERN.md](../../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md)

---

## Standards

- Align with [ARCHITECTURE_BASELINE_v0.3.md](../../11_Governance/Architecture/ARCHITECTURE_BASELINE_v0.3.md)
- Consume Enterprise Platform (P-010) and Data Platform (P-011) — do not reimplement
- Match bounded context and event-driven patterns established in Finance (D-007) and Hospitality

---

*Parent: [docs/HCM/](../)*

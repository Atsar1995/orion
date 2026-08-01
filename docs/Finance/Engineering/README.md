# Finance Domain — Engineering

**Domain:** Finance  
**Phase:** IV (Next)  
**Owner:** Chief Enterprise Architect / Finance Engineering Lead  

---

## Purpose

This folder contains engineering specifications, architecture documents, and mission definitions for the ORION Finance Domain. Engineering documents translate approved blueprints into buildable missions with acceptance criteria, dependencies, and Canon compliance requirements.

---

## Contents

| Document Type | Description |
|---------------|-------------|
| Platform Architecture | Finance domain architecture (facades, services, repository chain) |
| Domain Engineering Spec | [ES-FIN-001](./ES-FIN-001_Finance_Domain_Engineering_Specification.md) |
| Mission Specifications | [P-009.1](./P-009.1-Finance-Workspace-Foundation.md) · [P-009.2 Chart of Accounts](./P-009.2-Enterprise-Chart-of-Accounts.md) · [P-009.3 General Ledger](./P-009.3-Enterprise-General-Ledger.md) · [P-009.5 Fiscal Period Management](./P-009.5-Enterprise-Fiscal-Period-Management.md) · [P-009.6 Financial Event Pipeline](./P-009.6-Enterprise-Financial-Event-Pipeline.md) |
| Certification Documents | Domain and mission certification reports |
| Integration Specifications | IIL event publishers, subscribers, and brief mappers |

Documents will follow the pattern established by Hospitality (P-007.x) and Commercial (P-008.x).

---

## Standards

- Follow the Reference Workspace / Reference Domain pattern from certified domains
- Structure: `types/` → `lib/` facades → `repositories/` → `app/api/` → tests → docs
- Every mission includes: typecheck, lint, test, build validation gates
- Separate operational transactional data from derived finance intelligence metrics
- Publish domain events via IIL; do not embed cross-domain logic
- CTO rule: Finance owns accounting; Commercial owns relationships; Hospitality owns stays

---

## Naming Convention

```
P-009.{N}-{Title}-Platform.md
P-009.{N}-{Title}-Certification.md
ES-{NNN}-Finance-{Topic}.md
```

| Prefix | Meaning |
|--------|---------|
| P-009.x | Finance epic missions |
| ES-0xx | Engineering specifications |

---

## Owner

**Finance Engineering Lead** — specification authorship (to be assigned)  
**Chief Enterprise Architect** — architecture review and approval  

---

*Parent: [docs/Finance/](../) · Reference: [docs/03_Architecture/P-008-CRM-Platform.md](../../03_Architecture/P-008-CRM-Platform.md)*

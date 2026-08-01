# Finance Domain — Data Contracts

**Domain:** Finance  
**Phase:** IV (Next)  
**Owner:** Chief Enterprise Architect / Finance Domain Lead  

---

## Purpose

This folder defines frozen data contracts for the ORION Finance Domain. Data contracts specify entity types, field definitions, relationships, and ownership rules. They are the authoritative source for TypeScript domain types and repository interfaces.

Finance data contracts must reference Commercial `partyId` for customer-facing records and consume Hospitality billing events — Finance does not own customer identity or stay records.

---

## Contents

| Document Type | Description |
|---------------|-------------|
| Domain Type Specifications | Core entity definitions (accounts, journals, invoices, payments) |
| View Model Specifications | UI and API view models separated from domain types |
| Event Payload Contracts | IIL event payload schemas for finance publishers and subscribers |
| Cross-Domain References | How Finance references Party, Contract, Folio, and Invoice entities |

Implementation types will live in `types/finance-*.ts` when engineering begins. This folder holds the governance documentation that precedes and governs those types.

---

## Standards

- Domain types are immutable records (`readonly` fields) where possible
- View models live separately from domain types (`lib/finance/models/`)
- Every entity includes `organizationId` for tenant scoping
- Cross-domain references use IDs only — no embedded foreign domain objects
- Contract changes require ADR when breaking; version increment in CHANGELOG
- Align with Canon C-003 (Platform Architecture) and C-009 (Security & Trust)

---

## Naming Convention

```
DC-FIN-{NNN}-{Entity}.md       — data contract documentation
types/finance-{domain}.ts      — implementation types (when built)
```

| Prefix | Meaning |
|--------|---------|
| DC-FIN-001 | Master Finance entity catalog |
| DC-FIN-00x | Individual entity contracts |

---

## Owner

**Finance Domain Lead** — contract authorship (to be assigned)  
**Chief Enterprise Architect** — contract approval and cross-domain review  

---

*Parent: [docs/Finance/](../) · Reference: Commercial types in `types/crm-*.ts`*

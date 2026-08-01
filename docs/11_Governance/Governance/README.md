# ORION Architecture Governance (G-001)

**Mission:** G-001 — Enterprise Architecture Governance Charter  
**Version:** 1.0  
**Effective Date:** 31 July 2026  
**Status:** Ratified  

---

## Overview

This folder contains the **constitutional engineering governance framework** for ORION. G-001 governs architecture review, approval, release, certification, and technical debt for all domains and platform services.

---

## Documents

| Document | Purpose |
|----------|---------|
| [G-001 Enterprise Architecture Governance Charter](./G-001-Enterprise-Architecture-Governance-Charter.md) | **Primary constitutional document** |
| [G-001 Architecture Review Checklist](./G-001-Architecture-Review-Checklist.md) | Gate 4, PR, and certification architecture review |
| [G-001 Approval Workflow](./G-001-Approval-Workflow.md) | Gate sign-off and escalation |
| [G-001 Release Governance Guide](./G-001-Release-Governance-Guide.md) | Alpha → Beta → RC → GA → LTS |
| [G-001 Architecture Decision Process](./G-001-Architecture-Decision-Process.md) | ADR lifecycle |
| [G-001 Certification Process](./G-001-Certification-Process.md) | Gate 6 GO / CONDITIONAL GO / NO-GO |

---

## Relationship to Existing Governance

| Document | Relationship |
|----------|--------------|
| [ORION Governance Framework](../../09_Standards/ORION_Governance_Framework.md) | Layer hierarchy; G-001 operationalizes Layer 2–5 for architecture |
| [Governance Index](../../09_Standards/Governance_Index.md) | Document hierarchy; G-001 sits below Constitution |
| [Canon Compliance Checklist](../../00_FOUNDATION/CANON_COMPLIANCE_CHECKLIST.md) | Per-mission Canon gate |
| [QUALITY_GATE](../../08_Standards/QUALITY_GATE.md) | Automated CI enforcement |
| [ES-052 ADR Framework](../../02_Engineering/ES-052-Architecture-Decision-Record-Framework.md) | ADR detail template |

---

## Quick Reference — Mandatory Gates

1. Business Domain Blueprint  
2. Domain Model  
3. Governance Rules  
4. Engineering Specification  
5. Implementation  
6. Certification  
7. Release Approval  

**No code before Gate 4 approval.**

---

*Parent: [docs/11_Governance/](../)*

# ORION Platform Roadmap

**Version:** Baseline v0.3  
**Last Updated:** 30 July 2026  
**Authority:** Chief Enterprise Architect  

---

## Overview

This roadmap describes ORION platform phases from foundation through future domain expansion. It reflects certified completion status as of Architecture Baseline v0.3.

---

## Completed

### Phase I — Canon

| Milestone | Status |
|-----------|--------|
| ORION Canon v1.0 (C-001 through C-010) | Complete |
| Canon Compliance Matrix and Checklist | Complete |
| Golden Question and Golden Rule governance | Complete |

### Phase II — Core Platform

| Milestone | Status |
|-----------|--------|
| Identity and Organization | Complete |
| Executive Brief Engine | Complete |
| Decision Intelligence | Complete |
| Executive Memory | Complete |
| Intelligence Integration Layer | Complete |
| Command Center and Advisor | Complete |
| Shared Analytics, Search, Notifications foundations | Complete |

### Phase III — Business Domains

#### Hospitality

| Mission | Status |
|---------|--------|
| P-007.1 Property & Inventory | Complete |
| P-007.2 Reservations | Complete |
| P-007.3 Guest Intelligence | Complete |
| P-007.4 Front Office | Complete |
| P-007.5 Housekeeping & Maintenance | Complete |
| P-007.6 Billing & Revenue | Complete |
| P-007.7 Analytics | Complete |
| P-007.8 Certification | Complete (CONDITIONAL GO) |

#### Commercial

| Mission | Status |
|---------|--------|
| P-008.1 Universal Party | Complete |
| P-008.2 Lead & Opportunity | Complete |
| P-008.3 Proposals, Contracts & Agreements | Complete |
| P-008.4 Activities & Communications | Planned |
| P-008.5 Commercial Intelligence | Complete |
| P-008.6 Customer Analytics | Complete |
| P-008.7 Executive Dashboard | Complete |
| P-008.8 Certification | Complete (CONDITIONAL GO) |

---

## Next

### Phase IV — Finance

Finance is the active next domain. Engineering begins after domain blueprints, data contracts, and API specifications are established under `docs/Finance/`.

| Planned Capability | Description |
|--------------------|-------------|
| General Ledger | Chart of accounts, journal entries |
| Accounts Receivable | Customer invoicing, collections |
| Accounts Payable | Vendor payments, obligations |
| Cash Management | Cash flow, treasury |
| Financial Reporting | P&L, balance sheet, executive financial brief |
| Finance Intelligence | KPIs, forecasts, variance analysis |

Finance will consume Commercial party identity and Hospitality billing events via the Integration Layer. Finance will not duplicate customer or stay records.

---

## Future

### Business Domains

| Domain | Phase | Notes |
|--------|-------|-------|
| HR | Phase V+ | Workforce, payroll, org structure extensions |
| Commerce | Phase V+ | Orders, catalog, channels |
| Marketing | Phase V+ | Campaigns, attribution |
| Procurement | Phase V+ | Sourcing, vendors |
| Assets | Phase V+ | Fixed asset lifecycle |
| Supply Chain | Phase V+ | Logistics, fulfilment |
| Manufacturing | Phase V+ | Production, BOM |
| Healthcare | Phase V+ | Sector extensions |
| Education | Phase V+ | Programs, credentials |
| Government | Phase V+ | Public sector compliance |

### Platform Capabilities

| Capability | Description |
|------------|-------------|
| Knowledge | Enterprise knowledge management and retrieval |
| AI | Advanced AI agents, learning loops, responsible intelligence |
| Automation | Workflow automation, Cursor integrations, operational bots |
| Executive OS | Mature executive operating system — unified decision surface across all domains |

---

## Roadmap Principles

1. **Certify before expand** — Each domain completes certification (analogous to P-007.8 / P-008.8) before the next domain begins.
2. **Reference pattern** — Hospitality and Commercial establish the mandatory domain architecture pattern.
3. **Platform first** — Shared services are extended, not duplicated, as domains are added.
4. **Executive value** — Every domain mission must improve executive decision quality, confidence, clarity, speed, or organisational memory.

---

*See also: [PROJECT_STATUS.md](./PROJECT_STATUS.md) · [ARCHITECTURE_BASELINE_v0.3.md](./Architecture/ARCHITECTURE_BASELINE_v0.3.md)*

# D-009 – Enterprise Ledger Principles

**Document ID:** D-009  
**Domain:** Finance  
**Version:** 1.0  
**Architecture Baseline:** v0.3  
**Status:** Draft — Pending Governance Approval  
**Classification:** Enterprise Accounting Architecture  
**Authority:** Chief Enterprise Architect  
**Owner:** Finance Domain Lead (to be assigned)  

**Parent Blueprints:** [D-007 – Finance Domain Blueprint](./D-007_Finance_Domain_Blueprint.md) · [D-008 – Enterprise Financial Event Model](./D-008_Enterprise_Financial_Event_Model.md)  
**Related Governance:** [ARCHITECTURE_FREEZE_v0.3.md](../../11_Governance/Architecture/ARCHITECTURE_FREEZE_v0.3.md)

---

## 1. Purpose

The **Enterprise Ledger** is the authoritative financial record of ORION. It is the single place where debits and credits are permanently recorded, balanced, audited, and reported. Every other financial view — receivables aging, cash position, budget variance, financial statements, and executive KPIs — derives from ledger truth.

When a journal is **posted**, it becomes part of the **permanent financial history** of the organization. Posted entries are not edited, deleted, or overwritten. The ledger preserves what the enterprise financially was at every point in time, subject to governed correction through reversing entries and compensating events.

This document defines the constitutional accounting principles governing how every accounting transaction shall be **created, validated, balanced, posted, audited, corrected, reported, and preserved**. It establishes the rules that all Finance engineering specifications, transformation logic, and certification must satisfy.

This is an **enterprise accounting architecture** document. It does not prescribe implementation, database design, APIs, or user interfaces.

---

## 2. Ledger Philosophy

The ORION Enterprise Ledger is founded on six philosophical commitments that distinguish it from operational data stores and shadow spreadsheets.

### Single Financial Truth

One general ledger exists per organization scope. Operational domains maintain operational records; Finance maintains financial records. No workspace, department, or domain may maintain a parallel ledger that competes with Enterprise Ledger truth for reporting or executive decisions.

### Double Entry Accounting

Every accounting transaction maintains equilibrium: total debits equal total credits. The ledger is always in balance. Single-sided entries are prohibited except where governed statistical or memo accounts are explicitly defined in future specifications.

### Immutable Ledger

Posted journals are permanent. Errors are corrected through **reversing entries** and **replacement entries**, never through mutation of historical records. The audit trail shows both the original posting and its correction.

### Event Driven Accounting

Every posted transaction traces to one or more **approved enterprise events** as defined in [D-008](./D-008_Enterprise_Financial_Event_Model.md). Business events initiate financial transformation; accounting events record ledger outcomes. Manual journals are permitted only through governed Finance workflows and themselves publish auditable accounting events.

### Audit First

Auditability is not a reporting afterthought. Every journal line carries lineage to source events, actors, periods, and authorization context. Auditors and executives can answer: *who posted what, when, why, and from which business fact*.

### Executive Intelligence Ready

The ledger is structured to feed executive intelligence — not merely compliance reporting. Dimensional balances, period snapshots, and materiality-aware signals enable the Executive Brief, Decision Intelligence, Executive Memory, and financial analytics without re-querying operational domains.

---

## 3. Accounting Principles

The following principles are **non-negotiable** for the ORION Enterprise Ledger.

| Principle | Rule |
|-----------|------|
| **Every journal balances** | Sum of debits equals sum of credits for every journal entry |
| **Debit equals Credit** | No journal may post with imbalance; validation rejects before ledger update |
| **No partial postings** | A journal posts in full or not at all; no half-posted state in authoritative ledger |
| **No orphan transactions** | Every journal references at least one source: business event, financial event, or governed manual entry |
| **Event reference required** | Every posting references one or more enterprise business or financial events via correlation and source entity identifiers |
| **Audit trail required** | Every posting records actor, timestamp, authorization context, and idempotency key |
| **Organization scope required** | Every posting belongs to exactly one organization |
| **Period assignment required** | Every posting belongs to exactly one accounting period |
| **Reversibility required** | Every posted journal may be reversed through a governed reversing entry |
| **Corrections via reversal** | Errors are corrected by reversing the original entry and posting a corrected replacement — never by editing history |
| **No historical edits** | Posted journal lines, amounts, accounts, and dates shall not be modified in place |

These principles apply at all tiers — staging, certification, and production — and shall be verified during Finance Domain certification.

---

## 4. Journal Lifecycle

Every accounting transaction follows a governed lifecycle from enterprise event to reporting artifact.

| Stage | Description |
|-------|-------------|
| **Business Event** | Operational domain publishes immutable fact to IIL |
| **Financial Event** | Finance validates and emits financial interpretation (invoice, payment, recognition, accrual) |
| **Validation** | Posting rules applied: balance, period, account, currency, organization, idempotency, authorization |
| **Journal Creation** | Balanced journal entry composed with lines, dimensions, and event references |
| **Posting** | Authoritative ledger update; accounting event published (`JournalPosted`) |
| **Ledger Update** | General ledger and relevant sub-ledgers reflect new balances |
| **Executive Intelligence** | Material postings trigger KPI updates, alerts, and brief signals |
| **Reporting** | Financial statements and management reports consume posted ledger truth |

### Journal Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ENTERPRISE JOURNAL LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │   BUSINESS   │  ContractSigned · FolioSettled · PurchaseReceived
  │    EVENT     │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  FINANCIAL   │  InvoiceIssued · RevenueRecognized · ExpenseRecorded
  │    EVENT     │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  VALIDATION  │  Balance · Period · Account · Currency · Org · Idempotency · Auth
  └──────┬───────┘
         │ pass
         ▼
  ┌──────────────┐
  │   JOURNAL    │  Compose lines · dimensions · event references · audit metadata
  │  CREATION    │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │   POSTING    │  JournalPosted · immutable · sub-ledger + GL update
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │    LEDGER    │  Trial balance · AR · AP · Cash · Tax · dimensional balances
  │    UPDATE    │
  └──────┬───────┘
         │
         ├─────────────────────────────┐
         ▼                             ▼
  ┌──────────────┐              ┌──────────────┐
  │  EXECUTIVE   │              │  REPORTING   │
  │ INTELLIGENCE │              │              │
  └──────────────┘              └──────────────┘
  KPIs · Alerts · Brief         Statements · Compliance · Management packs
```

Rejected validations produce no ledger update. Rejection is itself auditable.

---

## 5. Ledger Structure

The Enterprise Ledger is organized conceptually into a **general ledger** and **sub-ledgers**, with planning and intelligence layers that consume ledger truth without replacing it.

### General Ledger

The authoritative chart of accounts and journal repository. All sub-ledgers roll up to the general ledger. The trial balance is derived exclusively from general ledger postings.

| Concept | Role |
|---------|------|
| **Chart of Accounts** | Hierarchical account structure: assets, liabilities, equity, revenue, expense |
| **Journal Entry** | Balanced set of lines posted to one or more accounts in one period |
| **Journal Line** | Single debit or credit to one account with optional dimensions |
| **Trial Balance** | Period snapshot proving debit-credit equilibrium |

### Sub-Ledgers

Sub-ledgers maintain detail that rolls up to general ledger control accounts. Sub-ledger totals must reconcile to control account balances at all times.

| Sub-Ledger | Purpose | Typical GL Control Account |
|------------|---------|----------------------------|
| **Accounts Receivable** | Customer invoices, receipts, credits, aging | Accounts Receivable |
| **Accounts Payable** | Vendor bills, payments, credits, aging | Accounts Payable |
| **Cash** | Bank accounts, receipts, disbursements, reconciliation | Cash and Cash Equivalents |
| **Tax** | Tax lines, payable, recoverable, remittance | Tax Payable / Recoverable |
| **Assets** | Fixed asset register, depreciation, disposal (future) | Fixed Assets · Accumulated Depreciation |

### Planning and Intelligence Layers

These layers consume ledger data but are not substitutes for the general ledger.

| Layer | Purpose | Ledger Relationship |
|-------|---------|---------------------|
| **Budget** | Approved plan by period and dimension | Compares actuals from ledger to budget baseline |
| **Forecast** | Forward projection | Grounded in ledger history and subscribed events |
| **Executive Financial Intelligence** | KPIs, alerts, brief signals | Derived from posted balances and period trends |

No database tables, indexes, or storage technologies are defined in this document.

---

## 6. Posting Rules

All journal postings must pass the following validations before the ledger is updated.

### Balanced Entries

| Rule | Requirement |
|------|-------------|
| Minimum lines | At least two lines (one debit, one credit) unless governed memo account exception |
| Balance check | Sum of debit amounts equals sum of credit amounts in transaction currency |
| Line integrity | Each line is exclusively debit or credit, not both |

### Period Validation

| Rule | Requirement |
|------|-------------|
| Period exists | Target accounting period is defined for the organization |
| Period state | Posting permitted only when period is Open or Soft Close (per adjustment rules) |
| Hard close block | No posting to hard-closed periods except governed reopen workflow |
| Period-date alignment | Transaction date falls within assigned period boundaries |

### Account Validation

| Rule | Requirement |
|------|-------------|
| Account exists | All referenced accounts exist in chart of accounts |
| Account active | Inactive or archived accounts reject posting |
| Account type | Posting direction consistent with account nature (e.g., no credit to asset increase without governed convention) |
| Control account | Sub-ledger postings must use designated control accounts where applicable |

### Currency Validation

| Rule | Requirement |
|------|-------------|
| Currency declared | Transaction currency specified on every line |
| Functional conversion | Amounts converted to functional currency per governing rate policy |
| Rate reference | Exchange rate source and effective date recorded for foreign currency postings |

### Organization Validation

| Rule | Requirement |
|------|-------------|
| Organization scope | All lines share the same organization identifier |
| Entity dimension | Multi-company postings include entity dimension where applicable |
| Isolation | No cross-organization lines in a single journal |

### Duplicate Prevention

| Rule | Requirement |
|------|-------------|
| Idempotency key | Every posting carries idempotency key from source event or manual workflow |
| Duplicate reject | Second posting with same idempotency key is rejected without ledger effect |

### Idempotent Posting

Retried event delivery, network failures, or orchestration replays must not duplicate financial impact. Idempotent posting guarantees **at-most-once ledger effect** per unique business or financial event.

### Posting Authorization

| Rule | Requirement |
|------|-------------|
| Authorized actor | Posting actor authenticated and authorized for journal type |
| Approval threshold | Manual journals above materiality threshold require approval reference |
| Segregation of duties intent | Creator and approver distinct where policy requires |
| Service identity | System-generated postings identify registered Finance service identity |

---

## 7. Reversal Rules

Corrections preserve history. Reversal is the primary correction mechanism.

### Journal Reversal

| Rule | Description |
|------|-------------|
| **Full reversal** | Reversing entry exactly negates original debits and credits |
| **Linked lineage** | Reversal references original journal ID and correlation chain |
| **Accounting event** | `JournalReversed` published with audit metadata |
| **Same period preference** | Reversal posted in same period as original when period still open |
| **Cross-period reversal** | When original period closed, reversal posts in current open period with disclosure flag |

### Accrual Reversal

Accruals posted for period completeness are reversed when actual invoice or settlement arrives. Accrual reversal follows journal reversal rules and links to both the original accrual and the replacing actual entry.

### Correction Entries

The governed correction pattern is:

1. **Reverse** the erroneous posted journal
2. **Post** a corrected replacement journal with proper event references
3. **Publish** both accounting events with shared correlation ID

Direct amendment of posted lines is prohibited.

### Period Restrictions

| Period State | Reversal Permitted |
|--------------|-------------------|
| Open | Yes — standard reversal |
| Soft Close | Yes — adjustment and reversal roles only |
| Hard Close | No — except governed period reopen |
| Reopened (exception) | Yes — under audit-approved reopen workflow |

### Audit Preservation

Original and reversing entries both remain permanently visible. Net financial effect is computable; history is never erased.

---

## 8. Period Management

Accounting periods control when postings may occur and when reporting is finalized.

### Period States

| State | Description | Posting Allowed |
|-------|-------------|-----------------|
| **Open** | Normal operations | All authorized posting types |
| **Soft Close** | Close in progress; routine posting restricted | Adjustments, accruals, reversals, close entries only |
| **Hard Close** | Period finalized | None (except governed reopen) |
| **Year Close** | Fiscal year finalized after all periods hard closed | None; equity roll-forward complete |

### Open

Default state for active fiscal periods. Business events transform to postings throughout the period. Sub-ledger and general ledger accumulate transactions.

### Soft Close

Finance initiates soft close when preliminary reporting begins. Operational domains may continue publishing business events; Finance queues or posts only close-category entries. Soft close signals `PeriodSoftClosed` to executive intelligence.

### Hard Close

Finance completes close checklist: accruals, reconciliations, revaluations, trial balance verification, and sub-ledger tie-out. `PeriodClosed` publishes. No further posting until reopen.

### Year Close

After the final period of the fiscal year is hard closed, P&L accounts roll into retained earnings via governed closing entries. Balance sheet accounts carry forward opening balances to the new year.

### Reopen Rules

Period reopen is an **exception** requiring:

- Documented justification and approval
- `PeriodReopened` accounting and audit event
- Executive Memory milestone
- Restricted duration and role access
- Mandatory re-close after corrections complete

Routine reopen is prohibited.

---

## 9. Multi-Company

The Enterprise Ledger supports multiple legal entities within an organization while preserving isolation and consolidation readiness.

### Organization Isolation

| Principle | Rule |
|-----------|------|
| Primary scope | Every journal belongs to one organization |
| Data isolation | Ledgers are not commingled across organizations |
| Reporting | Consolidated views compose from entity ledgers; no shared mutable ledger |

### Inter-Company

Future inter-company transactions require paired entries in each entity's ledger with linked correlation identifiers. Inter-company balances must reconcile to zero at consolidation elimination stage.

| Concept | Description |
|---------|-------------|
| **Inter-company due to/from** | Asset and liability accounts tracking cross-entity balances |
| **Linked journals** | Paired postings with shared correlation ID |
| **Elimination** | Consolidation removes inter-company balances without altering entity ledgers |

### Consolidation Readiness

Ledger design accommodates:

- Entity dimension on every journal line
- Functional and reporting currency per entity
- Minority interest and ownership percentage (future)
- Group reporting currency translation (future)

Consolidation is a **future expansion**; entity-level ledger integrity is required at launch.

---

## 10. Multi-Currency

The Enterprise Ledger supports transaction, functional, and reporting currencies.

### Functional Currency

Each legal entity designates one **functional currency** — the currency of the primary economic environment in which it operates. General ledger balances are maintained in functional currency.

### Transaction Currency

The currency in which a business event or commercial agreement is denominated. Journal lines record transaction currency amounts alongside functional equivalents.

### Exchange Rates

| Rate Type | Use |
|-----------|-----|
| **Spot rate** | Translation at transaction date for initial recording |
| **Period-end rate** | Monetary balance revaluation at period close |
| **Average rate** | Optional for income statement translation (future consolidation) |

Exchange rate source, effective date, and rate value are recorded on every foreign currency posting.

### Revaluation

Monetary assets and liabilities denominated in foreign currency are revalued at period end. Unrealized gains and losses post through governed FX accounts.

### Foreign Exchange Gains and Losses

| Type | Recognition |
|------|-------------|
| **Realized FX** | On settlement when transaction currency differs from settlement amount |
| **Unrealized FX** | On period-end revaluation of open monetary balances |
| **Posting** | `ForeignExchangeAdjusted` accounting event with full lineage |

FX postings follow the same immutability and reversal rules as all other journals.

---

## 11. Audit Principles

### Complete Audit Trail

Every ledger mutation — post, reverse, reject, period close, reopen — produces an audit record. Audit records are append-only.

### Traceability

From any journal line, the following shall be retrievable:

- Source business and financial event identifiers
- Correlation ID chain
- Posting actor and authorization reference
- Period, organization, and entity context
- Idempotency key and posting timestamp

### Event Lineage

Event lineage flows: **Business Event → Financial Event → Journal Posted → Ledger Balance → Executive Signal → Report Line**. Lineage is preserved for the retention period and supports replay for disaster recovery and audit reconstruction.

### Posting History

Posted journals, reversals, and replacements form a **directed acyclic history**. The net effect at any date is computable from the sum of all posted entries without rewriting prior state.

### Compliance

Ledger design supports:

- Tax authority examination
- External audit sampling
- Internal control testing
- Regulatory retention requirements

Specific retention durations are defined in governance and compliance specifications, not in this blueprint.

### Retention

Posted ledger records and audit trail are retained for the organization's defined retention policy. Retention expiry, if applicable, is governed by compliance policy — not by casual deletion. Legal hold overrides routine retention.

---

## 12. Executive Intelligence

The Enterprise Ledger is the **quantitative foundation** for executive financial intelligence.

| Platform Capability | Ledger Support |
|---------------------|----------------|
| **Executive Brief** | Period-to-date revenue, expense, cash, and variance from posted balances; material posting alerts |
| **Decision Intelligence** | AR aging, AP due dates, budget overrun, and liquidity thresholds derived from ledger and sub-ledgers |
| **Executive Memory** | Period close milestones, dividend declarations, material corrections, and year-end roll-forward |
| **Financial Analytics** | Trend analysis on GL and dimensional balances; drill-down from KPI to journal lineage |
| **Forecasting** | Historical actuals from closed periods ground forward projections |
| **Scenario Planning** | What-if models overlay ledger actuals with hypothetical entries (planning layer; not posted until approved) |
| **AI (future)** | Structured journal history, dimensional tags, and event lineage enable anomaly detection, predictive cash modeling, and explainable financial narratives |

Executive intelligence consumes **derived** ledger metrics. It does not expose raw operational data from other domains. When an executive asks *why* a KPI changed, the answer chain terminates at event lineage and journal reference — not at a Hospitality folio database.

---

## 13. Architectural Principles

| Principle | Statement |
|-----------|-------------|
| **Immutable Ledger** | Posted entries are permanent; corrections via reversal |
| **Double Entry** | Every journal balances; trial balance always nets to zero |
| **Single Financial Truth** | One authoritative general ledger per organization scope |
| **Replay Capability** | Event and journal history supports reconstruction and recovery |
| **Event Lineage** | Every posting traces to approved enterprise events |
| **Audit First** | Traceability and append-only audit trail by design |
| **API First** | Ledger access for other domains through approved read contracts only |
| **Organization Scoped** | All postings bound to organization context |
| **Multi Company Ready** | Entity dimension and inter-company linkage supported |
| **Multi Currency Ready** | Transaction, functional, and reporting currency discipline |
| **Tax Ready** | Tax dimensions travel with journal lines |
| **AI Ready** | Structured, lineage-rich history supports machine learning |
| **Executive Intelligence Ready** | Ledger designed to feed Brief, Decision, Memory, and Analytics |

These principles align with [D-007](./D-007_Finance_Domain_Blueprint.md) and [D-008](./D-008_Enterprise_Financial_Event_Model.md) and shall not be weakened in engineering specifications without ADR approval.

---

## 14. Canon Compliance

| Canon | Applicability to Enterprise Ledger Principles |
|-------|-----------------------------------------------|
| **C-001 Product Constitution** | Ledger enables trusted executive financial decisions |
| **C-002 Executive Mind** | Posted balances feed brief, recommendations, and memory |
| **C-003 Platform Architecture** | Finance owns ledger; domains consume via approved contracts |
| **C-004 Executive Intelligence** | Derived KPIs separated from operational analytics |
| **C-005 Design Language** | Applies to future Finance workspace presentation of ledger views |
| **C-006 Engineering Constitution** | Posting rules validated through standard engineering gates |
| **C-007 Workspace Framework** | Finance workspace surfaces ledger intelligence under RBAC |
| **C-008 AI & Learning** | Lineage-rich ledger history supports explainable AI |
| **C-009 Security & Trust** | Authorization, org isolation, audit trail, tamper resistance |
| **C-010 Integration & Events** | All postings originate from or reference approved IIL events |

Canon compliance evidence shall be documented at Finance Domain certification.

---

## 15. Future Expansion

The following capabilities are **reserved** for subsequent blueprint and engineering missions:

| Expansion Area | Description |
|----------------|-------------|
| **Real-Time Ledger** | Sub-second posting visibility and intra-day trial balance |
| **Distributed Ledger** | Horizontally scaled journal processing with strong consistency guarantees |
| **Blockchain Verification** | External notarization of period close hashes for third-party verification |
| **Continuous Close** | Automated micro-close tasks throughout the period |
| **AI Journal Suggestions** | Machine-assisted journal proposal with human approval gate |
| **Predictive Accounting** | Predicted accruals and provisions from pattern analysis |
| **ESG Accounting** | Environmental, social, and governance metric linkage to ledger dimensions |
| **Carbon Accounting** | Emissions cost allocation and carbon liability postings |
| **Digital Assets** | Cryptocurrency and token accounting under governed asset categories |

Each expansion requires capability blueprint, ADR where platform impact exists, and ledger integrity certification before production use.

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Finance Domain Lead | *To be assigned* | — | Pending |
| Chief Enterprise Architect | — | — | Pending |
| CTO | — | — | Pending |

---

## Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 31 July 2026 | Chief Enterprise Architect | Initial Enterprise Ledger Principles |

---

*D-009 · Enterprise Ledger Principles · ORION Enterprise Platform · Architecture Baseline v0.3 · Ready for Engineering Specification*

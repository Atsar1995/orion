# ADR-004 – Technical Debt Governance

## Status

Accepted

## Date

2026-07-23

## Context

As ORION grows, temporary engineering compromises will occasionally be necessary.

Without a formal process, technical debt becomes invisible and difficult to manage.

## Decision

ORION will maintain:

- A [Technical Debt Register](../09_Standards/Technical_Debt_Register.md)
- Technical Debt section in every [Release Record](../09_Standards/Release_Record_Template.md)
- Inline `TD-XXX` references in code
- Owner and Target Release for every debt item

CTO approval is blocked if any Technical Debt item lacks an owner or target release.

## Consequences

### Positive

- Visible engineering debt
- Better release planning
- Increased accountability

### Negative

- Slightly more release documentation

## Related Documents

| Document | Location |
|----------|----------|
| Engineering Standards — Technical Debt | `docs/09_Standards/Engineering_Standards.md` |
| Technical Debt Register | `docs/09_Standards/Technical_Debt_Register.md` |
| ES-053 Risk Management & Technical Debt Framework | [ES-053-ORION-Risk-Management-Technical-Debt-Framework.md](../02_Engineering/ES-053-ORION-Risk-Management-Technical-Debt-Framework.md) |
| Release Record Template | `docs/09_Standards/Release_Record_Template.md` |

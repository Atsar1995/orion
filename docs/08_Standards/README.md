# ORION Quality Gate Standards

Mandatory quality governance for all ORION engineering work effective v0.4.0-alpha onward.

| ID | Document | Purpose |
|----|----------|---------|
| OS-003 | [QUALITY_GATE.md](./QUALITY_GATE.md) | Automated + manual gate definition |
| OS-004 | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) | Feature completion criteria |
| OS-005 | [CODE_REVIEW_CHECKLIST.md](./CODE_REVIEW_CHECKLIST.md) | Pull request review checklist |
| OS-006 | [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) | Version release process |

## Automation

| Asset | Location |
|-------|----------|
| CI workflow | [`.github/workflows/quality-gate.yml`](../../.github/workflows/quality-gate.yml) |
| Pull request template | [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md) |
| Issue templates | [`.github/ISSUE_TEMPLATE/`](../../.github/ISSUE_TEMPLATE/) |

## Related standards

- [09_Standards — Engineering Standards](../09_Standards/Engineering_Standards.md)
- [ES-054 — QA Framework](../02_Engineering/ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md)
- [ES-055 — DevSecOps](../02_Engineering/ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md)

**Note:** This folder (`08_Standards`) holds operational quality gate artefacts. Foundational governance standards remain in `09_Standards/`.

# ORION Quality Gate

| Field | Value |
|-------|-------|
| **Document ID** | OS-003 |
| **Title** | ORION Quality Gate |
| **Version** | 1.1.0 |
| **Status** | Active |
| **Effective Date** | 25 July 2026 |
| **Owner** | Engineering · QA |
| **Related** | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) · [CODE_REVIEW_CHECKLIST.md](./CODE_REVIEW_CHECKLIST.md) · [ES-054](../02_Engineering/ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) · [ES-055](../02_Engineering/ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md) |

---

## Purpose

The ORION Quality Gate is a **mandatory, non-bypassable verification barrier** that every feature branch and pull request must pass before merge to `main` and before any release tag.

No exceptions without **Founder or CTO written approval** recorded in the PR or release record.

---

## Scope

Applies to:

- All feature work (product, platform, intelligence, workspace)
- Bug fixes and refactors touching application code
- Documentation-only changes (subset of gates — see §Documentation-only changes)
- Release candidates and tagged versions

Does **not** replace:

- [Release Checklist](./RELEASE_CHECKLIST.md) for version cuts
- [v0.4.0-alpha Release Checklist](../releases/v0.4.0-alpha-Release-Checklist.md) for version-specific items
- Founder acceptance for major milestones (M9, RR-018)

---

## Gate model

```mermaid
flowchart LR
  A[Change submitted] --> B{Automated Quality Gate}
  B -->|Pass| C[Code Review]
  B -->|Fail| D[Fix and re-run]
  C -->|Approve| E[Merge / Release]
  C -->|Changes requested| D
  D --> B
```

| Layer | Mechanism | Blocking |
|-------|-----------|----------|
| **L1 — Automated** | GitHub Actions `quality-gate.yml` | Yes |
| **L2 — Definition of Done** | Author attestation in PR | Yes |
| **L3 — Code Review** | [CODE_REVIEW_CHECKLIST.md](./CODE_REVIEW_CHECKLIST.md) | Yes |
| **L4 — Release** | [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) | Yes (releases only) |

---

## Automated checks

Executed by [`.github/workflows/quality-gate.yml`](../../.github/workflows/quality-gate.yml) on **push** and **pull_request** to `main`.

| # | Check | Command | Blocking | Notes |
|---|-------|---------|----------|-------|
| G1 | Install | `npm ci` | Yes | Lockfile must be committed |
| G2 | Type check | `npx tsc --noEmit` | Yes | TypeScript strict mode |
| G3 | Lint | `npm run lint` | Yes | ESLint · zero errors |
| G4 | Build | `npm run build` | Yes | Next.js production build |
| G5 | Unit tests | `npm run test` | Yes | Vitest |
| G6 | Coverage | `npm run test:coverage` | Yes | Thresholds in `vitest.config.ts` |
| G7 | Production dependency audit | `npm run audit:production` | Yes | Production runtime only · see §Dependency audit policy |
| G8 | Unused exports | Manual / future automation | No* | See §Outstanding automation |
| G9 | Formatting | Manual / future automation | No* | Prettier not yet configured |

\* G8 and G9 are **required by Definition of Done** but not yet fully automated. Reviewers must verify manually until tooling is wired.

### Coverage thresholds (Sprint 4 scope)

Defined in `vitest.config.ts`:

| Metric | Minimum |
|--------|---------|
| Lines | 80% |
| Statements | 80% |
| Functions | 80% |
| Branches | 75% |

Changes that expand scope must update `vitest.config.ts` coverage `include` and maintain thresholds for affected modules.

---

## Dependency audit policy (G7)

### Scope

The Quality Gate audits **production runtime dependencies only**.

```bash
npm audit --omit=dev
```

DevDependencies (ESLint, Vitest, testing libraries, TypeScript tooling) are **excluded** from CI blocking audit. They remain visible via local `npm audit` for engineering awareness but do not block merge while upstream toolchain advisories lack non-breaking fixes.

### Security Exception Policy

Security exceptions are permitted **only** when **all** of the following are true:

- The vulnerability is **transitive**.
- The dependency is owned by an **upstream framework**.
- **No stable patch** exists.
- The advisory is **documented** in the allowlist.
- A **review date** is assigned (`reviewBy`).
- **Critical** vulnerabilities are **never** exempt.
- Exceptions require approval from the **ORION CTO** (or designated maintainer), recorded as `owner`.

Full policy: [`.github/security/SECURITY_EXCEPTION_POLICY.md`](../../.github/security/SECURITY_EXCEPTION_POLICY.md)

### Blocking rules

The production audit **fails** when any of the following are true:

| Condition | Action |
|-----------|--------|
| **Critical** severity in production tree | Always fail — never allowlisted |
| **High** severity in production tree | Fail unless documented in allowlist |
| **Direct dependency** (`dependencies` in `package.json`) with unallowlisted advisory | Fail |
| **New** production advisory not in allowlist | Fail |
| **Expired** allowlist entry (`reviewBy` date passed) | Fail — forces re-review |

### Allowlist (upstream framework exceptions)

Entries are permitted only under the [Security Exception Policy](../../.github/security/SECURITY_EXCEPTION_POLICY.md).

**Allowlist file:** [`.github/security/npm-audit-allowlist.json`](../../.github/security/npm-audit-allowlist.json)

**Audit runner:** [`scripts/audit-production.mjs`](../../scripts/audit-production.mjs)

Current acknowledged upstream exceptions (review every 90 days):

| Advisory | Package | Introduced by | Owner | Review by |
|----------|---------|---------------|-------|-----------|
| GHSA-qx2v-qp2m-jg93 | postcss | next@16.2.11 | ORION CTO | 2026-10-26 |
| GHSA-6g55-p6wh-862q | postcss | next@16.2.11 | ORION CTO | 2026-10-26 |
| GHSA-r28c-9q8g-f849 | postcss | next@16.2.11 | ORION CTO | 2026-10-26 |
| GHSA-f88m-g3jw-g9cj | sharp | next@16.2.11 | ORION CTO | 2026-10-26 |

Each entry in [`.github/security/npm-audit-allowlist.json`](../../.github/security/npm-audit-allowlist.json) uses:

```json
{
  "advisory": "GHSA-qx2v-qp2m-jg93",
  "package": "postcss",
  "introducedBy": "next@16.2.11",
  "reason": "Bundled by Next.js",
  "reviewBy": "2026-10-26",
  "owner": "ORION CTO"
}
```

### Prohibited bypasses

The following are **not permitted**:

- `npm audit fix --force` in CI
- `continue-on-error` on audit steps
- Lowering `--audit-level` below `high` for production audit
- Silencing audit without documented allowlist entry

### Local verification

```bash
npm run audit:production
```

Optional — inspect full tree including devDependencies (informational):

```bash
npm audit --audit-level=high
```

---

## Manual checks (Definition of Done)

Every PR author must confirm in the pull request template:

| Check | Verification |
|-------|--------------|
| No console errors | Manual smoke in affected routes |
| No dead code introduced | Reviewer + optional static analysis |
| Documentation updated | Paths listed in PR |
| CHANGELOG updated | Unreleased section for user-facing changes |
| Architecture unaffected or documented | ADR / Architecture Index / ES update |
| Accessibility maintained | Keyboard · labels · contrast spot-check |
| Responsive layout verified | Mobile + desktop for UI changes |
| Security review completed | Auth · input · secrets · dependencies |
| Performance reviewed | Pipeline · bundle · rerenders for hot paths |
| Code reviewed | At least one approving reviewer |

See [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) for the full checklist.

---

## Documentation-only changes

Minimum automated gate:

- G1 Install (if workflow files changed)
- G2 Type check (if TS-adjacent)
- G3 Lint (if markdown lint added in future)

Author must still confirm documentation accuracy and cross-links. CHANGELOG update required only when documenting shipped behaviour.

---

## Failure policy

| Outcome | Action |
|---------|--------|
| Any blocking gate fails | PR cannot merge |
| Flaky test | Fix or quarantine with issue + owner; no silent skip |
| Audit failure | Upgrade dependency, add allowlist entry with CTO approval, or document accepted risk in Decision Log |
| Emergency hotfix | Post-merge gate run within 24 hours; retro in Decision Log |

---

## Local verification (before push)

Run the full gate locally:

```bash
npm ci
npx tsc --noEmit
npm run lint
npm run build
npm run test
npm run test:coverage
npm run audit:production
```

Optional informational check (includes devDependencies):

```bash
npm audit --audit-level=high
```

---

## Enforcement

| Control | Status |
|---------|--------|
| GitHub Actions workflow | `.github/workflows/quality-gate.yml` |
| Branch protection (require status checks) | **TODO** — enable in repository settings |
| Required reviewers | **TODO** — enable in repository settings |
| Pre-commit hooks | **TODO** — optional local acceleration |

### Required status check name (GitHub)

After first workflow run, enable branch protection for `main`:

- **Required check:** `Quality Gate`

---

## References

| Document | Purpose |
|----------|---------|
| [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) | Feature completion criteria |
| [CODE_REVIEW_CHECKLIST.md](./CODE_REVIEW_CHECKLIST.md) | Reviewer checklist |
| [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) | Version release process |
| [Engineering Standards](../09_Standards/Engineering_Standards.md) | Coding standards |
| [ES-054](../02_Engineering/ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) | QA framework |
| [ES-055](../02_Engineering/ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md) | CI/CD architecture |

---

*Mandatory for all ORION engineering work effective v0.4.0-alpha onward.*

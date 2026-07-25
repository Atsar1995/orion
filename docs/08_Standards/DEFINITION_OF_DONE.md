# ORION Definition of Done

| Field | Value |
|-------|-------|
| **Document ID** | OS-004 |
| **Title** | ORION Definition of Done |
| **Version** | 1.0.0 |
| **Status** | Active |
| **Effective Date** | 25 July 2026 |
| **Owner** | Engineering · Product |
| **Related** | [QUALITY_GATE.md](./QUALITY_GATE.md) · [OS-002 Work Item Lifecycle](../09_Standards/OS-002-Work-Item-Lifecycle.md) · [ES-043](../02_Engineering/ES-043-Engineering-Governance-Delivery-Standards.md) |

---

## Purpose

A work item (user story, task, bug fix, or engineering spike delivering code) is **Done** only when every criterion below is satisfied. Partial completion is **not Done**.

---

## Definition of Done — Checklist

Copy into pull requests and mark each item before requesting review.

### Automated quality (Quality Gate)

| # | Criterion | How verified | Required |
|---|-----------|--------------|----------|
| 1 | **TypeScript passes** | `npx tsc --noEmit` · CI green | Yes |
| 2 | **ESLint passes** | `npm run lint` · zero errors | Yes |
| 3 | **Build succeeds** | `npm run build` | Yes |
| 4 | **Tests pass** | `npm run test` | Yes |
| 5 | **Coverage threshold met** | `npm run test:coverage` · see `vitest.config.ts` | Yes |

### Runtime & code health

| # | Criterion | How verified | Required |
|---|-----------|--------------|----------|
| 6 | **No console errors** | Manual smoke on affected routes · DevTools clean | Yes |
| 7 | **No dead code introduced** | No orphan exports · no unreachable paths · reviewer confirms | Yes |

### Documentation & traceability

| # | Criterion | How verified | Required |
|---|-----------|--------------|----------|
| 8 | **Documentation updated** | ES / README / Architecture Index / inline docs as applicable | Yes |
| 9 | **CHANGELOG updated** | `docs/06_Releases/CHANGELOG.md` unreleased section for user-facing changes | Yes* |

\* Exempt for internal-only refactors with no observable behaviour change — note exemption in PR.

### Architecture & design

| # | Criterion | How verified | Required |
|---|-----------|--------------|----------|
| 10 | **Architecture unaffected or documented** | No undeclared layering violations · ADR/DL if structure changes | Yes |

### User experience

| # | Criterion | How verified | Required |
|---|-----------|--------------|----------|
| 11 | **Accessibility maintained** | Semantic HTML · ARIA · keyboard · focus · contrast (WCAG 2.1 AA intent) | Yes for UI |
| 12 | **Responsive layout verified** | Mobile (375px) + desktop (1280px+) for layout changes | Yes for UI |

### Security & performance

| # | Criterion | How verified | Required |
|---|-----------|--------------|----------|
| 13 | **Security review completed** | No secrets · auth boundaries respected · input validated · deps audited | Yes |
| 14 | **Performance reviewed** | No redundant fetches · no unnecessary client boundaries · list bounds | Yes for hot paths |

### Process

| # | Criterion | How verified | Required |
|---|-----------|--------------|----------|
| 15 | **Code reviewed** | ≥1 approval using [CODE_REVIEW_CHECKLIST.md](./CODE_REVIEW_CHECKLIST.md) | Yes |

---

## Summary (quick reference)

A feature is considered complete only if:

- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Coverage threshold met
- [ ] No console errors
- [ ] No dead code introduced
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Architecture unaffected or documented
- [ ] Accessibility maintained
- [ ] Responsive layout verified
- [ ] Security review completed
- [ ] Performance reviewed
- [ ] Code reviewed

---

## Work item type variations

| Type | Adjustments |
|------|-------------|
| **Bug fix** | Add regression test when feasible |
| **Refactor** | No behaviour change · tests prove equivalence |
| **Docs only** | Items 1–5 optional · 8 required · 15 required |
| **Spike / POC** | Explicitly labelled · may skip 4–5 if no production merge |
| **Release** | Also satisfy [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) |

---

## Sprint acceptance (M9)

Sprint-level Done additionally requires:

- Sprint QA sign-off per ES-063 / ES-064
- Release record when shipping a version (RR-018+)
- Product Owner acceptance for scope delivered

---

## References

- [QUALITY_GATE.md](./QUALITY_GATE.md)
- [CODE_REVIEW_CHECKLIST.md](./CODE_REVIEW_CHECKLIST.md)
- [Engineering Standards](../09_Standards/Engineering_Standards.md)
- [ES-054 — QA Framework](../02_Engineering/ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md)

---

*Done means shippable — not merely coded.*

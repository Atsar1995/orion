# ORION Release Checklist

| Field | Value |
|-------|-------|
| **Document ID** | OS-006 |
| **Title** | ORION Release Checklist |
| **Version** | 1.0.0 |
| **Status** | Active |
| **Effective Date** | 25 July 2026 |
| **Owner** | Engineering · Release Manager |
| **Related** | [QUALITY_GATE.md](./QUALITY_GATE.md) · [Release Record Template](../09_Standards/Release_Record_Template.md) · [CHANGELOG](../06_Releases/CHANGELOG.md) |

---

## Purpose

Generic release checklist for **all ORION version cuts** (alpha, beta, RC, GA). Version-specific supplements live in `docs/releases/` (e.g. [v0.4.0-alpha](../releases/v0.4.0-alpha-Release-Checklist.md)).

Every release must pass the [Quality Gate](./QUALITY_GATE.md) on the release commit **before** tagging.

---

## Instructions

Mark `[x]` complete · `[~]` partial · `[ ]` open. Block release if any **Blocking** item is open.

---

## 1. Pre-release — Quality Gate

| # | Check | Blocking | Command / reference |
|---|-------|----------|---------------------|
| 1.1 | Quality Gate CI green on release commit | Yes | `.github/workflows/quality-gate.yml` |
| 1.2 | TypeScript passes | Yes | `npx tsc --noEmit` |
| 1.3 | ESLint passes | Yes | `npm run lint` |
| 1.4 | Build succeeds | Yes | `npm run build` |
| 1.5 | All tests pass | Yes | `npm run test` |
| 1.6 | Coverage thresholds met | Yes | `npm run test:coverage` |
| 1.7 | Dependency audit clean (high+) | Yes | `npm audit --audit-level=high` |
| 1.8 | No secrets in release tree | Yes | Manual review |
| 1.9 | Manual smoke tests complete | Yes | See §6 |

---

## 2. Version & metadata

| # | Check | Blocking | Notes |
|---|-------|----------|-------|
| 2.1 | **Version updated** | Yes | `package.json` · docs headers · RR record |
| 2.2 | CHANGELOG version section finalized | Yes | Move unreleased → version section |
| 2.3 | Release Record (RR-NNN) created | Yes* | *Required beta+ · recommended alpha |
| 2.4 | Git baseline commit SHA recorded | Yes | In release notes |
| 2.5 | Semver tag name confirmed | Yes | e.g. `v0.4.0-beta` |

---

## 3. Release notes & communication

| # | Check | Blocking | Notes |
|---|-------|----------|-------|
| 3.1 | **Release notes** written | Yes | `docs/releases/` or RR document |
| 3.2 | Executive summary included | Yes | Audience · scope · grade |
| 3.3 | Major features listed | Yes | |
| 3.4 | Known limitations documented | Yes | |
| 3.5 | **Migration notes** included | When applicable | Breaking changes · upgrade steps |
| 3.6 | **Known issues** listed | Yes | Open bugs · debt items |
| 3.7 | Readiness assessment completed | Yes | Alpha / beta / GA verdict |
| 3.8 | DOCUMENTATION_BASELINE updated | Yes | Major releases |

---

## 4. Architecture & quality artifacts

| # | Check | Blocking | Notes |
|---|-------|----------|-------|
| 4.1 | Architecture Index current | Yes | Structural changes |
| 4.2 | Decision Log updated | When applicable | ADRs / DL entries |
| 4.3 | Technical debt acknowledged | Yes | TD register or release notes |
| 4.4 | Engineering / Performance audit updated | When applicable | Major intelligence releases |
| 4.5 | Testing summary published | When applicable | QA-003 style doc |

---

## 5. Tag & publish

| # | Check | Blocking | Notes |
|---|-------|----------|-------|
| 5.1 | Release commit merged to `main` | Yes | |
| 5.2 | **`Tag created`** | Yes | Annotated tag recommended |
| 5.3 | Tag pushed to origin | Yes | `git push origin <tag>` |
| 5.4 | `main` pushed to origin | Yes | |
| 5.5 | GitHub Release draft published | Recommended | Attach notes |

---

## 6. Deployment verification

| # | Check | Blocking | Notes |
|---|-------|----------|-------|
| 6.1 | **`Deployment verification`** | Yes | Staging or internal demo env |
| 6.2 | Build artifact from tagged commit verified | Yes | `npm run build && npm start` |
| 6.3 | Critical routes smoke tested | Yes | See route matrix below |
| 6.4 | Intelligence pipeline produces snapshot | For dashboard releases | `/dashboard` |
| 6.5 | Regression routes verified | Yes | `/advisor` · `/crm` · `/finance` |
| 6.6 | No console errors on critical paths | Yes | |

### Smoke route matrix

| Route | Verify |
|-------|--------|
| `/dashboard` | Snapshot renders · no 500 |
| `/advisor` | Legacy intelligence loads |
| `/command-center` | Layout · navigation |
| `/crm` | Overview loads |
| `/finance` | Overview loads |
| `/login` | Auth placeholder loads |

---

## 7. Rollback plan

| # | Check | Blocking | Notes |
|---|-------|----------|-------|
| 7.1 | **`Rollback plan`** documented | Yes | See template below |
| 7.2 | Previous stable tag identified | Yes | e.g. `v0.4.0-alpha` |
| 7.3 | Rollback owner assigned | Yes | On-call / release manager |
| 7.4 | Rollback procedure tested (staging) | Recommended | Before production |

### Rollback plan template

```markdown
## Rollback — vX.Y.Z

**Previous stable:** vX.Y.(Z-1) @ `<sha>`

**Trigger conditions:**
- Build failure in deployment
- Critical regression on /dashboard or /advisor
- Security incident

**Steps:**
1. Revert deployment to previous tag `<previous-tag>`
2. Verify smoke routes (§6)
3. Notify Founder / engineering channel
4. Open incident DL entry
5. Root-cause fix on hotfix branch → new patch release

**Owner:** <name>
**Estimated rollback time:** <minutes>
```

---

## 8. Sign-off

| Role | Approved | Date | Notes |
|------|----------|------|-------|
| Engineering Lead | [ ] | | Quality Gate + build |
| QA | [ ] | | Smoke + tests |
| Chief Architect | [ ] | | Architecture + debt |
| Founder | [ ] | | GA / major beta only |

---

## Release type requirements

| Gate | Alpha | Beta | GA |
|------|-------|------|-----|
| Quality Gate green | Yes | Yes | Yes |
| Release notes | Yes | Yes | Yes |
| Tag | Optional | Yes | Yes |
| RR record | Recommended | Yes | Yes |
| Founder sign-off | Recommended | Yes | Yes |
| Production deploy | No | Staging | Yes |

---

## References

- [QUALITY_GATE.md](./QUALITY_GATE.md)
- [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md)
- [Release Record Template](../09_Standards/Release_Record_Template.md)
- [CHANGELOG](../06_Releases/CHANGELOG.md)
- [docs/releases/](../releases/)

---

*No release ships without a green Quality Gate and documented rollback path.*

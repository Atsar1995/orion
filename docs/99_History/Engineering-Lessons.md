# ORION Engineering Lessons Learned

**Document ID:** HIST-LESSONS-001  
**Program:** P-016.3 — ORION Historical Archive  
**Classification:** Permanent Engineering Record · Historical  
**Source:** P-013.12 Retrospective · P-015 Program · GA-001/002 · Technical Debt Register  
**Authority:** Chief Enterprise Architect · Platform Engineering  

---

## 1. Purpose

This document captures durable engineering lessons from ORION v1.0 for future teams, domains, and programs. It is not a blame record. It is an institutional memory of what worked, what failed, and what v2.0 must inherit.

---

## 2. Architecture

### What Worked

| Lesson | Evidence | Recommendation |
|--------|----------|----------------|
| **One reference domain first** | P-012 HCM became handbook template | Never start Gate 5 on a second domain before first is production-certified |
| **Facade boundaries** | AI and human engineers respect `@/lib/hcm` imports | Maintain single public export per domain |
| **Events over coupling** | IIL prevented CRM→Finance repository reads | Cross-domain integration via IIL only |
| **Platform abstractions before domain scale** | PlatformStore enabled PostgreSQL without HCM rewrite | Build platform capability once, consume many times |
| **ADR before irreversible choice** | ADR-007–012 guided P-015 | No production persistence without accepted ADR |

### What Failed

| Lesson | Evidence | Recommendation |
|--------|----------|----------------|
| **In-memory as silent default** | TD-HCM-001 blocked GA for months | Every store default must declare production target release |
| **Fail-open API context** | SEC-002 critical debt | Fail-closed from first authenticated API |
| **Lazy require with path aliases** | GA-WF-001 CI failure | No runtime `require("@/...")` — static imports or documented resolution |
| **Dual intelligence paths** | TD-003 consolidation debt | One intelligence pipeline per platform generation |

---

## 3. Documentation

### What Worked

| Lesson | Evidence |
|--------|----------|
| **Documentation certification tests** | HCM doc tests fail when paths drift |
| **Mission IDs on deliverables** | S-002.x · P-015.x traceability in commits and docs |
| **Architecture Handbook as law** | P-013.1 ended pattern debates |
| **Single release folder** | P-013.11 consolidated audit trail |

### What Failed

| Lesson | Evidence |
|--------|----------|
| **Scattered release records** | Pre-P-013.11: `docs/releases/` vs `06_Releases/` |
| **Stale central debt register** | REG-001 critical governance debt |
| **Doc paths not in CI early** | CRM/Finance certification test failures |

### Recommendations

1. Treat documentation moves as breaking changes — update certification tests in same commit
2. Sync TECHNICAL_DEBT.md at every wave exit (mandatory gate)
3. Historical archive (P-016.3) updated at major version boundaries only

---

## 4. Testing

### What Worked

| Lesson | Evidence |
|--------|----------|
| **Four validation gates** | typecheck · lint · test · build on every mission |
| **Full suite as authority** | 930/930 — not domain-only green claims |
| **Contract tests for platform** | PlatformStore · RBAC · persistence contracts |
| **GA operational test suite** | Live PostgreSQL tests in CI |

### What Failed

| Lesson | Evidence |
|--------|----------|
| **Reporting domain green while suite red** | 794/800 at RC with 6 failures |
| **Release branch not in CI until GA-002** | DEP-002 delayed release validation |
| **Job-level env breaking suite** | GA-WF-002 — postgres env scoped to cert step only |

### Recommendations

1. Full `npm test` required on release branch from first RC
2. Scope environment variables to test steps, not CI jobs, when stores are env-selected
3. Certification tests for every governance doc path referenced in CI

---

## 5. Governance

### What Worked

| Lesson | Evidence |
|--------|----------|
| **G-001 seven gates** | Prevented ungoverned Gate 5 starts |
| **CONDITIONAL GO culture** | Honest staging with numbered remediation |
| **ES-097 ADR policy** | Clear hierarchy: Canon → G-001 → Handbook → ADR |
| **P-015 as single hardening program** | +29 readiness points vs ad-hoc fixes |

### What Failed

| Lesson | Evidence |
|--------|----------|
| **ES-092–095 deferred** | TD-PLATFORM-004 still open at v1.0 exit |
| **ADR-001–003 pending** | Shell governance debt from early phase |
| **Gate 7 not pre-planned** | Founder approval record created late in GA-001 |

### Recommendations

1. Ratify Level 2 standards (ES-092–095) in v2.0 Wave 1, not deferred again
2. Close ADR backlog before new domain charters
3. Prepare Gate 7 record at Gate 6 start, not Gate 6 completion

---

## 6. Certification

### What Worked

| Lesson | Evidence |
|--------|----------|
| **Independent certification missions** | P-015.8–P-015.11 separate from implementation |
| **Score-based readiness** | P-015.1 methodology enabled measurable progress |
| **Operational certification in CI** | PostgreSQL service proves persistence works |
| **Wave exit reports** | P-015.7 documented partial vs complete honestly |

### What Failed

| Lesson | Evidence |
|--------|----------|
| **Claiming GA at 81/100** | Below 85 threshold — correctly blocked |
| **Simulated-only DR drill** | Live host restore still pending |
| **Tag before Gate 7** | Legacy v1.0.0 tag on non-GA commit |

### Recommendations

1. Gate 6 and Gate 7 are separate decisions — document both explicitly
2. Distinguish CI certification from persistent staging certification in reports
3. Semantic version tags require release record + Gate 7 entry same day

---

## 7. Technical Debt

### What Worked

| Lesson | Evidence |
|--------|----------|
| **TD-xxx identifiers** | Traceable from register to code |
| **P0 closure before GA narrative** | TD-HCM-001 · TD-HCM-005 · REG-001 resolved |
| **Accepted debt with owners** | ENG-LINT-001 explicitly accepted |

### What Failed

| Lesson | Evidence |
|--------|----------|
| **"Temporary" without target** | In-memory persisted years in practice |
| **Register drift** | REG-001 — central register lied about debt state |
| **Deferred High items without program** | TD-PLATFORM-003 · TD-PLATFORM-004 |

### Recommendations

1. Every debt item requires: owner, target release, and promotion path to central register
2. Deferred High debt requires linked program ID (e.g., ADR-013 for TD-PLATFORM-003)
3. Close REG-class governance debt within same wave it is discovered

---

## 8. Release Engineering

### What Worked

| Lesson | Evidence |
|--------|----------|
| **Release branch discipline** | `release/v1.0.1` stabilization |
| **Quality gate workflow** | typecheck · lint · test · build · audit |
| **GA staging workflow** | PostgreSQL cert · full suite · build |
| **Semantic release records** | RR-xxx mission history preserved |

### What Failed

| Lesson | Evidence |
|--------|----------|
| **Early v1.0.0 tag** | Tag on advisor feature, not GA baseline |
| **Push without tag move plan** | `git push origin v1.0.0` up-to-date but wrong commit |
| **develop branch created late** | v2.0 planning started without branch until P-016.1 |

### Recommendations

1. Tag only after Gate 7 with annotated message referencing certification record
2. Never reuse a semantic version tag — delete and force-push only with executive approval
3. Create `develop/vX.Y` at prior version GA candidate, not after planning docs

---

## 9. Recommendations for Future Teams

### For Platform Engineers

- Read the Architecture Handbook before writing platform code
- Extend PlatformStore — do not create parallel persistence stacks
- Fix CI before claiming certification complete
- Static imports beat dynamic require for Node runtime paths

### For Domain Engineers

- Copy HCM layering — do not invent new patterns without ADR
- Add permission catalog before REST routes, not after
- Publish IIL events from facade wrapper — not from routes
- Write documentation certification tests with first ES deliverable

### For Program Directors

- One hardening program (P-015 model) beats scattered production fixes
- Wave exit reports are mandatory — partial credit must be explicit
- Gate 7 is not a formality — schedule Founder review at Gate 6 start

### For QA / Certification

- Report full test counts always — never domain-scoped silence
- CI green ≠ staging host green — document both
- CONDITIONAL GO must list numbered conditions with owners

---

## 10. Top Ten Lessons (Summary)

| # | Lesson |
|---|--------|
| 1 | Architecture before domain scale |
| 2 | Platform persistence before domain GA |
| 3 | Fail-closed security from first API |
| 4 | Full test suite is the only green that counts |
| 5 | Documentation drift must fail tests |
| 6 | Central debt register must stay truthful |
| 7 | CONDITIONAL GO is strength, not weakness |
| 8 | Certification requires automation evidence |
| 9 | Tags are executive decisions, not engineering convenience |
| 10 | Reference domain first — replicate second |

---

*Permanent historical record · P-016.3 · Engineering lessons for ORION v1.0 and v2.0*

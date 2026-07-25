# ORION Code Review Checklist

| Field | Value |
|-------|-------|
| **Document ID** | OS-005 |
| **Title** | ORION Code Review Checklist |
| **Version** | 1.0.0 |
| **Status** | Active |
| **Effective Date** | 25 July 2026 |
| **Owner** | Engineering |
| **Related** | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) · [Engineering Standards](../09_Standards/Engineering_Standards.md) · [ES-065](../02_Engineering/ES-065-Executive-Intelligence-Architecture.md) |

---

## Purpose

Every pull request requires **at least one approving review** completed against this checklist. Reviewers comment on failures; authors resolve before merge.

---

## How to use

1. Confirm automated [Quality Gate](./QUALITY_GATE.md) is green.
2. Walk each section below for the diff scope.
3. Record blocking issues inline on the PR.
4. Approve only when all **Required** items pass.

---

## 1. Architecture

| # | Check | Required |
|---|-------|----------|
| A1 | Changes respect layer boundaries (`app/` → `components/` → `lib/` → `types/`) | Yes |
| A2 | UI components do not import provider/orchestrator internals directly | Yes |
| A3 | Dashboard/intelligence data flows through `ExecutiveIntelligenceService` or documented legacy path | Yes |
| A4 | No new circular module dependencies | Yes |
| A5 | Dual-stack changes (legacy bus vs orchestrator) are intentional and documented | Yes |
| A6 | New modules placed in correct domain folder | Yes |
| A7 | ADR / Decision Log entry for significant structural decisions | When applicable |

---

## 2. SOLID & design

| # | Check | Required |
|---|-------|----------|
| S1 | Single Responsibility — files/functions have one clear purpose | Yes |
| S2 | Open/Closed — extension via config/rules, not copy-paste | Yes |
| S3 | Dependency direction points inward (UI → service → engines → providers) | Yes |
| S4 | Interfaces/types used at boundaries; no `any` without justification | Yes |
| S5 | No god classes (>400 LOC services · >300 LOC components without split plan) | Yes |
| S6 | Shared logic extracted — no duplicated aggregation/business rules | Yes |

---

## 3. Naming

| # | Check | Required |
|---|-------|----------|
| N1 | Names follow [OS-001 Naming Standards](../09_Standards/OS-001-Naming-Standards.md) | Yes |
| N2 | Files match export (`PascalCase` components · `camelCase` utilities) | Yes |
| N3 | Types are precise — no duplicate domain names across modules | Yes |
| N4 | Constants and enums are self-describing | Yes |

---

## 4. Performance

| # | Check | Required |
|---|-------|----------|
| P1 | No redundant provider fetches in pipeline/engine paths | Yes |
| P2 | Server Components preferred; `"use client"` only when necessary | Yes for UI |
| P3 | Lists bounded server-side (dashboard caps respected) | Yes |
| P4 | No N+1 patterns in new data access | Yes |
| P5 | Heavy client modules lazy-loaded where appropriate | When applicable |
| P6 | Pipeline/orchestrator changes include timing awareness | For intelligence work |

---

## 5. Security

| # | Check | Required |
|---|-------|----------|
| SEC1 | No secrets, tokens, or credentials in code | Yes |
| SEC2 | No `.env` or credential files committed | Yes |
| SEC3 | Auth boundaries respected — no placeholder auth assumed production-safe | Yes |
| SEC4 | User input sanitized/validated at boundaries | Yes |
| SEC5 | Dependencies reviewed — `npm audit` clean for high/critical | Yes |
| SEC6 | No sensitive data logged to console or execution logger | Yes |

---

## 6. Accessibility

| # | Check | Required |
|---|-------|----------|
| AX1 | Semantic HTML (`button`, `nav`, `main`, headings in order) | Yes for UI |
| AX2 | Interactive elements keyboard reachable | Yes for UI |
| AX3 | Form inputs have associated labels or `aria-label` | Yes for UI |
| AX4 | Color not sole indicator of state | Yes for UI |
| AX5 | Focus visible on interactive elements | Yes for UI |
| AX6 | `aria-live` / roles used appropriately for dynamic content | When applicable |

---

## 7. Documentation

| # | Check | Required |
|---|-------|----------|
| D1 | Public APIs have JSDoc for non-obvious behaviour | When applicable |
| D2 | ES / Architecture Index updated for structural changes | When applicable |
| D3 | CHANGELOG unreleased entry for user-facing changes | Yes |
| D4 | README or module README updated for new commands/paths | When applicable |
| D5 | Known limitations documented if shipping partial work | When applicable |

---

## 8. Testing

| # | Check | Required |
|---|-------|----------|
| T1 | New behaviour covered by unit/integration tests | Yes |
| T2 | Bug fixes include regression test when feasible | Yes |
| T3 | Tests are deterministic — no flaky timers/network | Yes |
| T4 | Coverage thresholds maintained (`vitest.config.ts`) | Yes |
| T5 | Test names describe behaviour, not implementation | Yes |
| T6 | Mocks isolate unit under test | Yes |

---

## 9. Maintainability

| # | Check | Required |
|---|-------|----------|
| M1 | Code reads clearly without excessive comments | Yes |
| M2 | Comments explain *why*, not *what* | When comments exist |
| M3 | No commented-out dead code | Yes |
| M4 | No debug `console.log` left in production paths | Yes |
| M5 | Error handling is explicit — no silent swallow | Yes |
| M6 | Technical debt introduced is logged in TD register or PR | When applicable |

---

## Review verdict

| Verdict | Criteria |
|---------|----------|
| **Approve** | All required checks pass |
| **Request changes** | Any required check fails |
| **Comment** | Questions only — no blocking issues |

---

## Reviewer attestation (PR comment template)

```markdown
## Code Review — OS-005

- [ ] Architecture
- [ ] SOLID
- [ ] Naming
- [ ] Performance
- [ ] Security
- [ ] Accessibility
- [ ] Documentation
- [ ] Testing
- [ ] Maintainability

**Verdict:** Approve / Request changes
**Notes:**
```

---

*Reviewers are gatekeepers of ORION engineering quality — approve only what you would ship.*

# ORION Executive Workflow Optimization

**Document ID:** EWO-001

**Mission:** 18B — Executive Workflow Optimization

**Version:** 1.0

**Status:** Ready for CTO Review

**Classification:** Product Workflow Analysis — Friction Reduction

**Author:** ORION Product Audit (Mission 18B)

**Date:** 28 July 2026

**Scope:** Complete executive journey (login → logout); six core workflows; documentation only — no code changes

**Audience:** Founder · CEO · CTO · Product · Design · Engineering

**Related documents:**

| Document | Purpose |
|----------|---------|
| [ORION_Product_Audit_v1.md](./ORION_Product_Audit_v1.md) | AUD-001 platform audit (Mission 18A) |
| [ORION_Product_Backlog_v1.md](./ORION_Product_Backlog_v1.md) | PB-001 workflow improvement backlog items |
| [DL-2026-001 — Executive Brief Default Landing](../10_Decisions/decisions/DL-2026-001-Executive-Brief-Default-Landing.md) | Landing IA decision |
| [RR-008 — Command Palette](../06_Releases/RR-008-Mission14C-Command-Palette-Universal-Search.md) | Search infrastructure |

---

# Executive Summary

ORION's **Morning Executive Brief** (`/brief`) delivers a strong decision-first morning workflow — sticky section nav, capped alerts, featured recommendation, and end-of-brief closure. However, the **complete executive journey from login to logout** contains significant friction that undermines the 60-second orientation promise and breaks the decide → act loop.

The highest-impact friction sources are:

1. **Information architecture conflict** — Sidebar, command palette, and DL-2026-001 disagree on the executive entry point (`/brief` vs `/advisor` vs `/`).
2. **Dead-end navigation** — Six or more sidebar and palette targets return 404 (Tasks, Calendar, Messages, Commerce, Knowledge, Settings).
3. **Duplicate intelligence surfaces** — Brief, Command Center, and legacy Advisor show overlapping health, recommendations, and priorities from different data paths.
4. **Non-functional decision actions** — Act, Delegate, Snooze, Approve, and Dismiss buttons do not persist or navigate; executives hit dead ends at the moment of action.
5. **No session bookends** — Login does not authenticate; logout does not exist in the UI; there is no end-of-day closure ritual.

**Workflow optimization thesis:** Executives should follow one canonical path per intent — **orient on Brief, operate in workspaces, decide with persistence, return via Command Center only when monitoring** — with command palette as the universal accelerator. Estimated friction reduction: **40–60% fewer clicks** and **2–4 minutes saved per daily review cycle** once the fifteen improvements below are implemented.

**CTO Recommendation:** Adopt the optimized workflows in this document as the Phase 1 executive UX specification. Prioritize Quick Wins (#1–5) before private beta; treat intelligence unification and action persistence as workflow blockers, not feature additions.

---

# Current Workflow Assessment

## End-to-End Journey Map

```
Login → [Auth bypass] → Platform Home (/) OR deep link
     → Sidebar / Palette / Brief Quick Nav
     → Executive Surfaces (Brief · Command Center · Advisor)
     → Workspace Modules (CRM · Finance · …)
     → Sub-nav drill-down → Detail pages
     → [No logout] → Session ends implicitly
```

### Stage 1 — Login & First Impression

| Step | Current behaviour | Friction |
|------|-------------------|----------|
| Navigate to ORION | Placeholder auth auto-authenticates; login page skipped | User may not know they are in demo mode |
| Submit login (if reached) | Fake validation error after 1.5s; no redirect | **Dead end** — login appears broken |
| Land after auth | Root `/` shows "Executive Platform" hub with 3 cards | **Extra click** — not Brief-first despite DL-2026-001 |
| First visual | Dark executive shell, 17+ sidebar items, gold accent | Strong aesthetic; high item count raises cognitive load |

**First impression score:** 6/10 — polished visually; confusing entry and auth undermines trust.

**Time to first insight (current):** 45–90 seconds if user finds Brief; 90–150 seconds if they explore hub or wrong surface (`/advisor`).

---

### Stage 2 — Navigation Flow

| Surface | Entry points | Issues |
|---------|--------------|--------|
| Morning Brief | Sidebar "Morning Brief" → `/brief` | Correct primary path |
| Advisor (legacy) | Command palette "Advisor" → `/advisor` | **Duplicate** of Brief; not in sidebar |
| Command Center | Sidebar, Brief end summary | Valid secondary path |
| Platform Home | Root `/`, Mission Control | **Unnecessary hub** for daily executives |
| CRM | Sidebar, Brief deep links, palette | Good — 5 sub-routes |
| Finance | Sidebar, palette, overnight changes | Good — 9 sub-routes (overwhelming for quick review) |
| Dead routes | Sidebar: Tasks, Calendar, Messages, Commerce, Knowledge, Settings | **404 dead ends** |

**Navigation flow score:** 5/10 — strong Brief/CRM paths; IA split and dead links fracture trust.

**Average unnecessary clicks per session:** 3–6 (hub detour, wrong brief route, 404 recovery, CC duplication).

---

### Stage 3 — Information Architecture

| Layer | Intended IA | Actual IA | Gap |
|-------|-------------|-----------|-----|
| L1 — Orient | Morning Brief | Brief + Advisor + CC Brief Panel | Triple definition |
| L2 — Monitor | Command Center | CC + Dashboard + Mission Control | Overlapping |
| L3 — Operate | Workspaces (CRM, Finance) | Correct pattern | Finance lacks Brief-depth links on sub-pages |
| L4 — Configure | Settings, Configuration | `/settings` 404; `/configuration` exists | Naming collision |

**Critical IA conflicts:**

- DL-2026-001 mandates `/advisor` as default landing; sidebar and Sprint 17 work canonicalise `/brief`.
- Command palette indexes `/advisor` (3 entries) but not `/brief` (0 entries).
- "Customer Intelligence" in palette vs "CRM" in sidebar — label inconsistency.

---

### Stage 4 — Decision Flow

| Step | Surface | Current | Friction |
|------|---------|---------|----------|
| See recommendation | Brief "Do This First" | Strong — evidence, confidence, impact | — |
| Understand why | Explain drawer | Works on Brief cards | CC Decision Center lacks parity |
| Act | ExecutiveActionBar | Act/Delegate/Snooze — **no persistence** | **Dead end** |
| Deep link | Recommendation `href` | Links to `/crm/*` when present | Good |
| Confirm decision | — | Does not exist | No closure loop |
| Track completion | — | Does not exist | Priorities never clear |

**Decision flow score:** 6/10 on Brief read path; 2/10 on action completion.

**Time to action (current):** Infinite for in-app actions (buttons non-functional); 2–4 clicks to reach workspace context via href links.

---

### Stage 5 — Context Switching

| Transition | Clicks (current) | Interruption |
|------------|------------------|--------------|
| Brief → CRM customer | 1 (priority link) | Low |
| Brief → Command Center | 1 (end summary) | Medium — re-reads overlapping data |
| Command Center → Brief | 1 (Decision Center link) | Medium — duplicate content |
| CRM Overview → Opportunity detail | 2 (sub-nav + click) | Low |
| Finance Overview → Cash | 1 (sub-nav) | Low |
| Any → Tasks | 1 → **404** | **High — trust break** |
| Brief → Advisor (via palette) | 1 | **High — parallel universe** |

**Context switches per morning review (typical):** 4–8  
**Unproductive switches (duplicate/dead):** 2–4

---

### Stage 6 — Interruptions & Visual Distractions

| Source | Severity | Notes |
|--------|----------|-------|
| Notification bell (header) | Medium | Placeholder with gold dot — implies unread items |
| Command Center density | High | 7 panels on one page compete with Brief |
| Sidebar (17+ items) | Medium | Always visible; no collapse |
| Brief AI Summary (long) | Low | Collapses on mobile; expanded on desktop |
| Quick Actions "Refresh" buttons | Medium | Four buttons all call `router.refresh()` — misleading labels |
| Duplicate finance palette entries | Low | "Finance" and "Finance Dashboard" → same href |

---

### Stage 7 — Logout & Session Closure

| Capability | Status |
|------------|--------|
| Profile menu | Avatar only — no dropdown |
| Sign out | **Not implemented in UI** |
| Session end audit | `recordLogout` exists in lib — unused |
| End-of-day summary | Brief end summary is morning-oriented only |

**Logout score:** 0/10 — journey has no intentional closure.

---

## Workflow Metrics Summary (Current State)

| Metric | Current estimate | Target (optimized) |
|--------|------------------|-------------------|
| Time to first insight | 45–150 sec | ≤ 60 sec |
| Clicks: login → oriented | 2–4 | 0–1 |
| Clicks: morning review complete | 8–15 scroll + 2–4 nav | 0 scroll (single page) + 0–1 nav |
| Clicks: CRM follow-up from Brief | 1–3 | 1 |
| Clicks: financial review (overview + cash) | 3–5 | 2 |
| Clicks: opportunity review | 3–4 | 2 |
| Dead ends per session | 0–2 (if sidebar explored) | 0 |
| Functional decision actions | 0% | 100% (persist or navigate) |

---

## Duplicate Information Inventory

| Data element | Surfaces showing it | Data source |
|--------------|---------------------|-------------|
| Business health score | Brief, Command Center, Advisor, Dashboard | Bus vs Orchestrator vs static |
| Top recommendation | Brief featured, CC Decision Center, CRM Insights | Bus vs Orchestrator vs CrmEngine |
| Today's priorities | Brief, CC Brief Panel, Advisor cards | Bus vs Orchestrator vs static |
| Critical alerts | Brief (capped 3), CC Alert Panel | Bus vs Orchestrator |
| CRM intelligence | Brief, CRM Overview, CRM Insights, Advisor | Bus vs crmService (consistent) |
| Finance snapshot | Brief, Finance Overview, Advisor Finance card | Bus vs static lib |

---

## Dead-End Inventory

| Trigger | Destination | Type |
|---------|-------------|------|
| Sidebar → Tasks | `/tasks` | 404 |
| Sidebar → Calendar | `/calendar` | 404 |
| Sidebar → Messages | `/messages` | 404 |
| Sidebar → Commerce | `/commerce` | 404 |
| Sidebar → Knowledge Vault | `/knowledge` | 404 |
| Sidebar → Settings | `/settings` | 404 |
| Palette → Create Task | `/tasks` | 404 |
| Palette → Open Calendar | `/calendar` | 404 |
| Palette → Profile | `/settings` | 404 |
| Login submit | Same page + validation error | UX dead end |
| Act / Delegate / Snooze | No op | Action dead end |
| CC Approve / Delegate / Dismiss | No op | Action dead end |
| CC Generate Brief / Sync Providers | `router.refresh()` only | Expectation dead end |

---

# Optimized Executive Workflows

Design principles for all optimized workflows:

1. **Brief-first** — every day starts at `/brief`; no hub detour.
2. **One truth** — Command Center monitors; Brief orients; never both for the same question.
3. **Action completes** — every button either navigates to context or persists state.
4. **Palette accelerates** — any destination reachable in ≤ 2 keystrokes after `⌘K`.
5. **Zero dead ends** — unimplemented routes hidden or stubbed with honest "Coming soon."
6. **Closure rituals** — morning "You're Oriented"; evening "Day Complete."

---

## 1. Daily Morning Review

**Intent:** Understand what happened, what needs attention, and what to do first — in ≤ 60 seconds.

### Optimized Path

```
[Auto-login or 1-click demo entry]
    → /brief (default landing — redirect from /)
    → Scan: Greeting headline (5 sec)
    → Scan: Overnight Changes strip (10 sec) — click only if delta needs drill-down
    → Scan: Business Health + Critical Alerts (15 sec) — expand "Why this score?" only if needed
    → Read: "Do This First" recommendation (15 sec)
    → Optional: Today's Priorities (10 sec)
    → End: "You're Oriented" summary → choose next surface
```

### Optimized Flow Diagram

```
Login ──redirect──► /brief
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    Snapshot      Attention      Context
    (scroll or    (Do This       (optional
     #jump)        First)         expand)
         │            │            │
         └────────────┴────────────┘
                      │
                      ▼
              You're Oriented
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
   Act on rec    Command Center   CRM
   (1 click)     (monitoring)    (follow-up)
```

| Metric | Current | Optimized |
|--------|---------|-----------|
| Clicks to oriented | 2–4 | 0 (single-page scroll) |
| Time to insight | 45–150 sec | ≤ 60 sec |
| Time to first action | N/A (buttons dead) | ≤ 90 sec (Act → workspace) |
| Context switches | 1–3 | 0–1 |

**Keyboard shortcuts (proposed):**

| Shortcut | Action |
|----------|--------|
| `⌘K` → "brief" → Enter | Jump to Morning Brief from anywhere |
| `1` `2` `3` `4` | Jump to Brief sections (when on `/brief`) |
| `A` | Act on featured recommendation |
| `E` | Explain featured recommendation |

**Command palette commands (proposed):**

- "Review Morning Brief" → `/brief` (replace `/advisor` entries)
- "Mark Brief Read" → persist lifecycle state
- "Go to Do This First" → `/brief#brief-attention`

**Personalization:**

- Remember last Brief section viewed; restore scroll on return.
- Role-based Brief section order (CEO: health first; Sales: CRM priorities first).

---

## 2. Business Health Review

**Intent:** Understand overall and domain-level business health; drill into at-risk domains.

### Optimized Path

```
/brief → Business Health card (attention domains shown first)
    → "Why this score?" (inline — no navigation)
    → Click at-risk domain → workspace overview (Finance / CRM / Hospitality)
    → Sub-section only if domain KPI requires detail
    → Return via breadcrumb or ⌘K → "brief"
```

| Metric | Current | Optimized |
|--------|---------|-----------|
| Clicks to health insight | 1–2 | 0 (on Brief) |
| Clicks to domain drill-down | 2–4 | 1–2 |
| Duplicate reads | Often re-reads on CC | Single source on Brief |

**Optimization rules:**

- Remove business health from Command Center **or** make CC panel a read-only summary with "View on Brief" as sole expand path.
- Domain rows link directly to workspace overview filtered to that domain (e.g. Finance Overview with cash highlight).
- Do not require Command Center visit for health review.

**Palette:** "Business Health" → `/brief#brief-snapshot` · "Finance Health" → `/finance` · "CRM Health" → `/crm`

---

## 3. Customer Follow-up

**Intent:** Act on a CRM-related Brief priority or recommendation; review customer context; log or plan next touch.

### Optimized Path

```
/brief → Priority or recommendation with CRM href
    → /crm/customers/[id] OR /crm/activities (1 click)
    → Review: health, timeline, open opportunities (single page)
    → Action: schedule follow-up (future: log activity inline)
    → ⌘K → "brief" to re-orient OR stay in CRM for batch follow-ups
```

**Batch variant (multiple customers):**

```
/brief → /crm/insights (executive recommendations)
    → Sort by urgency → click customer → detail
    → Next customer via breadcrumb → /crm/customers (list preserved)
```

| Metric | Current | Optimized |
|--------|---------|-----------|
| Brief → customer context | 1 click (when href present) | 1 click |
| Brief → customer (no href) | 3–4 (CRM → Customers → search → click) | 2 (palette → customer name) |
| Actions after review | Dead end | Navigate to Activities or persist task |

**Palette enhancements:**

- Index customer names as searchable entities (future: live CRM search).
- "CRM Insights" → `/crm/insights` · "Customer Follow-ups" → `/crm/activities?filter=follow-up`

**Avoid:** Routing through legacy `/crm/relationships` or `/advisor` CustomerInsightsCard.

---

## 4. Financial Review

**Intent:** Quick cash and revenue confidence check — not full accounting review.

### Optimized Path (Executive — 2-minute review)

```
/brief → Overnight Changes (finance deltas) OR Business Health finance domain
    → /finance (overview only)
    → Scan: cash position, runway, receivables alert
    → Drill to /finance/cash ONLY if cash domain flagged
    → Return to Brief or proceed to decision
```

### Optimized Path (CFO — 10-minute review)

```
⌘K → "finance" → select sub-route directly
    → Overview → Cash → Receivables (sequential sub-nav — 3 clicks max)
    → No return to Command Center required
```

| Metric | Current | Optimized |
|--------|---------|-----------|
| Executive quick review | 3–5 clicks, 9 sub-routes visible | 1–2 clicks |
| CFO deep review | 4–8 clicks | 3–4 clicks |
| Cognitive load | 9-tab sub-nav always visible | Progressive: overview first, expand on alert |

**Optimization rules:**

- Brief finance overnight changes link directly to relevant sub-route (cash, receivables).
- Collapse Finance sub-nav to **Overview · Cash · More** for executive role; expand for CFO role.
- Label static data: "Demo · Last synced — not live" to prevent false confidence.

**Palette:** "Cash Position" → `/finance/cash` · "Receivables" → `/finance/receivables` · deduplicate "Finance Dashboard" entry.

---

## 5. Opportunity Review

**Intent:** Review pipeline health; inspect at-risk or high-value deals; decide next sales action.

### Optimized Path

```
/brief → CRM recommendation ("Advance [Deal]") OR priority with /crm/opportunities href
    → /crm/opportunities/[id] (1 click)
    → Review: stage, value, health, activity history
    → Action: stage recommendation from Insights (read-only today → future: stage change)
    → Optional: /crm/opportunities pipeline board for portfolio view
```

**Portfolio variant:**

```
⌘K → "pipeline" → /crm/opportunities
    → Board view → filter at-risk → click deal → detail
```

| Metric | Current | Optimized |
|--------|---------|-----------|
| Brief → deal detail | 1 click (when href set) | 1 click |
| Brief → pipeline overview | 2–3 | 1 (palette) |
| Deal → related customer | 1 (detail page link) | 1 |
| Post-review decision | Dead end | Persist or return to Brief with updated priority |

**Avoid:** `/crm/relationships` (legacy) · Advisor opportunity cards (static).

**Palette:** "Sales Pipeline" → `/crm/opportunities` · "At-Risk Deals" → `/crm/opportunities?health=at-risk` (future filter).

---

## 6. End-of-Day Summary

**Intent:** Close the executive loop — confirm what was addressed, what carries forward, and end session deliberately.

### Optimized Path (proposed — not yet implemented)

```
⌘K → "End of Day" OR sidebar ritual link
    → /brief?mode=eod (or dedicated /brief/eod)
    → Summary: priorities completed vs open (from persisted actions)
    → Carry-forward: tomorrow's top 3 (auto-generated)
    → "Day Complete" closure card
    → Optional: Sign out
```

### Interim Optimized Path (current platform)

```
/command-center → Activity Timeline (scan day's signals)
    → /crm/activities (review logged touchpoints — read-only)
    → /brief → End summary re-read ("You're Oriented" — morning framing only)
    → Close browser (no sign out)
```

| Metric | Current | Optimized |
|--------|---------|-----------|
| End-of-day ritual | None | ≤ 2 clicks |
| Session closure | None | Sign out in profile menu |
| Carry-forward list | Manual | Auto from snoozed/deferred items |

**Morning ↔ Evening pairing:**

| Morning (exists) | Evening (proposed) |
|------------------|-------------------|
| "You're Oriented" | "Day Complete" |
| First action stated | First action for tomorrow |
| Enter Command Center | Sign out or snooze reminders |

---

# Top 15 Workflow Improvements

Ranked by friction reduction × executive frequency. No new business features — routing, IA, persistence, and UX honesty only.

| Rank | Improvement | Category | Current pain | Expected impact | Effort |
|------|-------------|----------|--------------|-----------------|--------|
| **1** | **Canonicalise `/brief` as sole entry** — redirect `/` and retire `/advisor` from palette/sidebar | IA | 3 entry points for same intent | −1–2 clicks; −30–60 sec orientation | Quick Win |
| **2** | **Remove or stub dead sidebar/palette routes** — Tasks, Calendar, Messages, Commerce, Knowledge, Settings | Navigation | 404 trust breaks | Zero dead ends | Quick Win |
| **3** | **Wire Act / href on featured recommendation** — Act button navigates to `recommendation.href` when present | Decision flow | Action dead end on highest-value card | Time to action: ∞ → 1 click | Quick Win |
| **4** | **Unify palette index on `/brief`** — replace all `/advisor` search entries; add "Morning Brief" as favourite | Discoverability | Palette sends to wrong surface | −1 context switch | Quick Win |
| **5** | **Login → Brief redirect** — working auth or demo entry lands on `/brief`, not hub | First impression | Extra hub click | −1 click; −30 sec | Quick Win |
| **6** | **Command Center as monitor-only** — Brief panel becomes summary + link; remove duplicate health/decision data | Duplication | Re-read same intelligence | −2–3 min; −4 clicks | Medium Effort |
| **7** | **Persist recommendation actions** (Act/Delegate/Snooze) to local or task store — even without full workflow service | Decision flow | 100% action dead ends | Closes decide → act loop | Medium Effort |
| **8** | **Brief section keyboard shortcuts** (`1–4` jump nav; `A` act; `E` explain) | Keyboard | Scroll-only navigation | Power-user −20 sec | Quick Win |
| **9** | **Profile menu with Sign out** — wire to `logout()` and `/login` | Session | No journey closure | Complete login → logout arc | Medium Effort |
| **10** | **Finance sub-nav progressive disclosure** — Overview + Cash default; expand for CFO | Cognitive load | 9 tabs always visible | −3 unnecessary clicks | Medium Effort |
| **11** | **End-of-day Brief mode** — carry-forward priorities + "Day Complete" closure | Ritual | No evening workflow | Executive habit loop | Medium Effort |
| **12** | **Palette entity search** — customers, opportunities by name (CRM-backed) | Command palette | 3–4 clicks to find customer | −2 clicks on follow-up | Medium Effort |
| **13** | **Role-based landing sections** — Brief section order by role (CEO/CFO/Sales) | Personalization | One-size layout | −15 sec scan time | Medium Effort |
| **14** | **Mobile palette trigger** — visible search on `< md`; collapsible sidebar | Mobile | Palette hidden; sidebar fixed | Tablet workflow viable | Medium Effort |
| **15** | **Honest Quick Actions labels** — rename refresh-only buttons or wire real actions | Trust | Misleading "Generate Brief" | Reduced distraction | Quick Win |

### Effort Summary

| Effort | Items |
|--------|-------|
| **Quick Win** | #1, #2, #3, #4, #5, #8, #15 |
| **Medium Effort** | #6, #7, #9, #10, #11, #12, #13, #14 |

### PB-001 Cross-Reference

| EWO Item | Backlog ID |
|----------|------------|
| #1, #4, #5 | PB-002 (nav integrity) · DL-2026-001 amendment |
| #2 | PB-002 |
| #6 | PB-020 (intelligence unification) |
| #7 | PB-015 (recommendation action persistence) |
| #9 | PB-001 (production auth) |
| #14 | PB-012 (mobile executive shell) |

---

# Workflow Comparison Matrix

| Workflow | Current clicks | Optimized clicks | Current time | Optimized time | Primary fix |
|----------|---------------:|-----------------:|-------------:|---------------:|-------------|
| Daily Morning Review | 2–4 + scroll | 0–1 | 45–150 sec | ≤ 60 sec | Brief-first landing (#1, #5) |
| Business Health Review | 2–6 | 0–2 | 2–5 min | 1–2 min | Single source on Brief (#6) |
| Customer Follow-up | 1–4 | 1–2 | 3–8 min | 2–5 min | href + palette search (#3, #12) |
| Financial Review | 3–8 | 1–4 | 2–10 min | 1–5 min | Progressive sub-nav (#10) |
| Opportunity Review | 2–4 | 1–2 | 3–6 min | 2–4 min | Brief href + pipeline palette (#3) |
| End-of-Day Summary | N/A | 1–2 | N/A | 2–3 min | EOD Brief mode (#11, #9) |

---

# Command Palette & Keyboard Opportunity Map

## Current State

| Capability | Status |
|------------|--------|
| Global `⌘K` / `Ctrl+K` | Implemented |
| Navigation indexing | 30+ items; includes dead links |
| CRM sub-routes | 5 indexed |
| Finance sub-routes | 10 indexed (1 duplicate) |
| Brief route | **Not indexed** (`/advisor` instead) |
| Entity search | Not implemented |
| Action commands | Create Task, Open Calendar → 404 |
| Recent / Favourites | Static IDs; favours `/advisor` |

## Optimized Command Vocabulary (proposed)

| Category | Commands |
|----------|----------|
| **Orient** | Morning Brief · Business Health · Critical Alerts · Do This First |
| **Operate** | CRM · Pipeline · Customer {name} · Finance · Cash Position |
| **Monitor** | Command Center · Activity Timeline |
| **Act** | Act on Recommendation · Snooze · Delegate · Mark Complete |
| **Session** | End of Day · Sign Out |
| **Removed until built** | Create Task · Open Calendar · Commerce · Knowledge |

## Keyboard Shortcut Registry (proposed)

| Context | Shortcut | Action |
|---------|----------|--------|
| Global | `⌘K` | Open palette |
| Global | `⌘⇧B` | Morning Brief |
| Global | `⌘⇧C` | Command Center |
| `/brief` | `1` `2` `3` `4` | Section jump |
| `/brief` | `A` | Act on featured |
| `/brief` | `E` | Explain featured |
| `/crm/*` | `/` | Focus search |
| Palette open | `↑` `↓` | Navigate results |
| Palette open | `Enter` | Select |

---

# Personalization Opportunities

| Opportunity | Mechanism | Workflow benefit |
|-------------|-----------|------------------|
| Role-based Brief section order | User role from session | CEO sees health first; Sales sees CRM priorities |
| Workspace favourites in palette | User-pinned routes | −1 click on repeated destinations |
| Recent customers/opportunities | CRM-backed recents in palette | Faster follow-up (#12) |
| Brief read state | Persist lifecycle + last viewed timestamp | Skip unchanged sections |
| Snoozed recommendations | Local store until EOD | Reduces morning noise |
| Collapsed sections preference | Remember disclosure state | Return visitors scan faster |
| Time-of-day routing | Before noon → Brief; after 5pm → EOD mode | Contextual entry |

---

# Files Created

| File | Document ID | Purpose |
|------|-------------|---------|
| `docs/00_PROJECT/ORION_Executive_Workflow_Optimization_v1.md` | EWO-001 | Mission 18B executive workflow analysis and optimized paths |

---

# Ready for CTO Review

| Section | Status |
|---------|--------|
| Executive Summary | Complete |
| Current Workflow Assessment (login → logout) | Complete |
| Optimized Workflows (6 scenarios) | Complete |
| Top 15 Workflow Improvements | Complete |
| Workflow Comparison Matrix | Complete |
| Command Palette & Keyboard Map | Complete |
| Personalization Opportunities | Complete |
| Code changes | None (documentation only) |

**Recommended adoption sequence:**

1. **Sprint 18A (Quick Wins):** #1, #2, #4, #5, #15 — IA and honesty fixes; zero feature scope creep.
2. **Sprint 18B (Decision loop):** #3, #7 — action navigation and persistence.
3. **Sprint 18C (Monitor layer):** #6 — Command Center deduplication after PB-020 bus unification.
4. **Phase 2:** #9–#14 — session closure, EOD ritual, mobile, personalization.

**Success metrics (post-implementation):**

| Metric | Baseline | Target |
|--------|----------|--------|
| Time to first insight | 45–150 sec | ≤ 60 sec |
| Dead ends per session | 0–2 | 0 |
| Functional action buttons | 0% | 100% navigate or persist |
| Morning review clicks | 2–4 to start | 0–1 |
| Executive NPS (internal) | Not measured | ≥ 8/10 |

---

*End of EWO-001 · Mission 18B · ORION Executive Workflow Optimization v1.0*

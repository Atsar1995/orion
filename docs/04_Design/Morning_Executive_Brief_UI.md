# Morning Executive Brief — UI Specification

**Design ID:** UI-EC-003  
**Executive Capability:** EC-003 — Morning Executive Brief  
**Route:** `/brief`  
**Version:** 1.0.0  
**Status:** Approved for Design Review  
**Author:** ORION CTO  
**Audience:** Design · Engineering · Product  

**Related:**

- [BP-003 — Morning Executive Brief](../00_BLUEPRINT/BP-003-Morning-Executive-Brief.md)
- [ES-011 — Morning Executive Brief](../01_Engineering/ES-011-Morning-Executive-Brief.md)
- [EC-001 — Morning Executive Brief (Product)](../05_Product/EC-001_Morning_Executive_Brief.md)
- [ORION Design System](./ORION_Design_System.md)

---

# Purpose

This document defines the presentation layer for the Morning Executive Brief — layout, component hierarchy, interaction patterns, accessibility requirements, and responsive behaviour.

The UI renders a **`BriefView`** DTO only. It does not compute scores, confidence, or recommendations.

---

# Design principles

| Principle | Application |
|-----------|---------------|
| **Decision urgency ordering** | Sections ordered by what requires judgment first |
| **Progressive disclosure** | Healthy domains compact; anomalies expand |
| **Trust through transparency** | Confidence badge + "Why this score?" always available |
| **Deterministic first** | Shell renders before AI summary loads |
| **No dashboard density** | One narrative page with a defined end |
| **Executive legibility** | Bloomberg-inspired clarity; intentional whitespace |

---

# Information architecture

## Section order (fixed V1)

| # | Section | Component | Max visual weight |
|---|---------|-----------|-------------------|
| 1 | Page chrome | `BriefLayout` header | 5% |
| 2 | Greeting | `ExecutiveGreeting` | 5% |
| 3 | Lifecycle banner | `BriefStatusBanner` | 5% |
| 4 | Business Health + Alerts | 2-column grid | 30% |
| 5 | Overnight changes | `OvernightChangesStrip` | 10% |
| 6 | Top Recommendation | `ExecutiveRecommendationCard` (featured) | 15% |
| 7 | Additional recommendations | `ExecutiveRecommendationCard` list | 10% |
| 8 | Today's priorities | `TodaysPrioritiesSection` | 10% |
| 9 | AI Executive Summary | `AiExecutiveSummaryCard` | 8% |
| 10 | End-of-Brief Summary | `BriefEndSummary` | 5% |

## Above the fold (desktop 1440px)

Must be visible without scroll:

- Greeting headline  
- Business Health score + status + confidence badge  
- Critical Alerts (count + first alert)  
- Top Recommendation title (if present)  

---

# Layout

## Desktop (≥ 1280px)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ORION · Morning Brief · {date}              Last synced {time}    [Sync]  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Good morning, {name}.                                                        │
│ {headline from EC-002B narrative summary}                                    │
│                                                                              │
│ ┌─ BriefStatusBanner (lifecycle / delta) ──────────────────────────────────┐ │
│                                                                              │
│ ┌─────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│ │ BUSINESS HEALTH        {score}│  │ CRITICAL ALERTS                  ({n}) │ │
│ │ ████████████░░  {status}  {↑}│  │ ● {alert message}                       │ │
│ │ Confidence: {level} {pct}%   │  │ ● {alert message}                       │ │
│ │ [Why this score?]            │  │ [View all →]                            │ │
│ └─────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                              │
│ OVERNIGHT CHANGES · {n} material deltas                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                         │
│ │ {label} {val}│ │ {label} {val}│ │ {label} {val}│                         │
│ └──────────────┘ └──────────────┘ └──────────────┘                         │
│                                                                              │
│ ┌─ TOP RECOMMENDATION (premium card) ──────────────────────────────────────┐ │
│ │ {title}                                              Priority {n} · {sev}│ │
│ │ Evidence: {sources}                                                       │ │
│ │ [Act Now] [Delegate] [Snooze] [Why am I seeing this?]                    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ TODAY'S PRIORITIES                                                           │
│ 1. {priority}   2. {priority}   3. {priority}                               │
│                                                                              │
│ ┌─ AI EXECUTIVE SUMMARY (async) ─────────────────────────────────────────┐ │
│ │ {narrative · 4-6 sentences max}                                         │ │
│ │ Sources: {list} · Confidence: {pct}% · Generated {time}                │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ── BRIEF COMPLETE ── Condition: {x} · Priority: {y} · First: {z}            │
│ [Start your day → Command Center]                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Tablet (768–1279px)

- Single column stack  
- Business Health full width, then Alerts  
- Recommendations 1-column  
- Sticky sync bar optional  

## Mobile (< 768px)

- Card stack with sticky Business Health mini-bar  
- Top Recommendation pinned after health until dismissed  
- AI Summary collapsed by default with expand affordance  
- End summary always visible at scroll end  
- No horizontal scroll  

---

# Components

## ExecutiveGreeting

| Element | Source | Notes |
|---------|--------|-------|
| Period salutation | Template + time of day | "Good morning" / "Good afternoon" |
| Executive name | Session context | Required |
| Headline | EC-002B `executiveNarrative.summary` | ≤ 20 words |
| Subheadline | Template fallback | When narrative unavailable |
| Date label | Locale-formatted | |

## BriefStatusBanner

| Lifecycle | Visual |
|-----------|--------|
| `fresh` | Hidden or subtle "Brief ready" |
| `updated` | Amber banner: "{n} changes since you last viewed" |
| `stale` | Grey banner + sync CTA |
| `incomplete` | Amber: "{provider} data unavailable" |
| `offline` | Grey: "Showing cached brief from {time}" |

Uses `role="status"` and `aria-live="polite"`.

## BusinessHealthCard

| Element | Binding |
|---------|---------|
| Score (large) | `businessHealth.score` |
| Status label | `businessHealth.status` |
| Trend arrow | `businessHealth.trend` |
| Confidence badge | `businessHealth.confidence.level` + score |
| Domain chips (V1.1) | Category breakdown |
| CTA | "Why this score?" → opens explain drawer |

### Confidence badge rules

| Level | Badge |
|-------|-------|
| `high` | Green · "High confidence" |
| `moderate` | Default · "Moderate confidence" |
| `low` | Amber · "Low confidence" |
| `insufficient` | Red · "Limited data" — score shown with caveat |

## BusinessHealthExplainDrawer

Opened from Business Health card. Content from EC-002B:

| Section | Data |
|---------|------|
| Summary | `executiveNarrative.summary` |
| Strengths | `executiveNarrative.strengths[]` |
| Concerns | `executiveNarrative.concerns[]` |
| Interpretation | `executiveNarrative.interpretation` |
| Contributors | `explanationItems[]` with contribution bars |
| Confidence factors | `confidence.factors[]` |

Drawer: focus trap, Esc to close, return focus to trigger.

## CriticalAlertsSection

- Max 3 visible; "View all" links to Command Center alerts  
- Severity: `critical` (red border + icon) · `attention` (amber)  
- Each alert: message, category, optional age label  

## OvernightChangesStrip

- Horizontal chip list  
- Direction icons: up (green), down (red), neutral (grey) — always paired with text  
- Empty state: hidden (not "No changes")  

## ExecutiveRecommendationCard

| Variant | Use |
|---------|-----|
| `featured` | Top recommendation — gold accent border |
| `default` | Additional recommendations grid |

Required fields: title, priority, severity, evidence sources, action buttons.

## TodaysPrioritiesSection

- Numbered list, max 5 items  
- Rank badge + title only (no long descriptions)  

## AiExecutiveSummaryCard

| State | UI |
|-------|-----|
| Loading | Skeleton 3 lines after deterministic sections render |
| Ready | Narrative + sources + confidence |
| Fallback | Template summary badge: "Deterministic summary" |
| Suppressed | Hidden when confidence insufficient (config) |

## BriefEndSummary

Three-line closing:

```
Condition: {endSummary.condition}
Priority: {endSummary.priority}
First action: {endSummary.firstAction}
```

Optional CTA: "Start your day → Command Center"

---

# Interaction patterns

| Action | Behaviour |
|--------|-----------|
| Sync | Refetch brief; show loading on banner only |
| Why this score? | Open explain drawer |
| Act / Delegate / Snooze | Capture intent; toast confirmation |
| Why am I seeing this? | Expand evidence panel inline |
| Start your day | Navigate to `/command-center` |

No infinite scroll. Brief has a defined end at `BriefEndSummary`.

---

# Loading states

| Phase | Duration | UI |
|-------|----------|-----|
| Shell | 0–200ms | Layout + greeting skeleton |
| Deterministic | 200ms–2s | Progressive reveal: Health → Alerts → Recommendation |
| AI async | 2s–5s | Summary skeleton then content |
| Slow | > 2s | Show cached brief + "Refreshing…" |
| Error | — | Last good brief + section-level error badges |

---

# Accessibility

**Target:** WCAG 2.2 AA

| Requirement | Implementation |
|-------------|----------------|
| Landmarks | `<main>`, `<section aria-label>` per block |
| Headings | Single `h1` (greeting); section `h2`s |
| Colour | Severity uses icon + text + border |
| Focus | Visible focus rings; logical tab order |
| Keyboard | All actions reachable; drawer focus trap |
| Motion | Respect `prefers-reduced-motion` |
| Touch | 44×44px minimum targets on mobile |
| Screen reader | Alert count announced; lifecycle banner live region |
| Skip link | "Skip to top recommendation" hidden until focused |

### axe-core acceptance

Zero critical or serious violations on `/brief` with mock and live data fixtures.

---

# Responsive breakpoints

| Breakpoint | Layout |
|------------|--------|
| `< 768px` | Mobile stack |
| `768–1279px` | Tablet single column |
| `≥ 1280px` | Desktop 2-column health/alerts grid |

Uses existing ORION workspace tokens: `WORKSPACE_PAGE_CLASS`, `WORKSPACE_GRID_2_COL`.

---

# Visual tokens

| Element | Token |
|---------|-------|
| Premium card border | Gold accent (`border-amber-400/30`) |
| Critical alert | `border-l-red-500` |
| Attention alert | `border-l-amber-500` |
| Health healthy | Green status from design system |
| Health critical | Red status from design system |
| Surface | `bg-white/[0.03]` hierarchy (dark mode default) |
| Confidence insufficient overlay | Muted score + badge |

Refer to [ORION Design System](./ORION_Design_System.md) for typography scale and spacing.

---

# Performance (UI)

| Metric | Target |
|--------|--------|
| First Contentful Paint | ≤ 1.0s |
| Largest Contentful Paint | ≤ 1.5s |
| Cumulative Layout Shift | ≤ 0.1 |
| Time to Interactive | ≤ 2.5s |
| AI summary must not block | Deterministic shell interactive first |

Use React Server Components for initial `BriefView` fetch. Client components only for drawer, actions, and async AI lane.

---

# Testing (UI)

| Test | Tool |
|------|------|
| Visual regression | Playwright screenshots (desktop + mobile) |
| Accessibility | axe-core in Playwright |
| Keyboard navigation | Playwright |
| Responsive layout | Viewport matrix |
| Loading states | Storybook or Playwright intercept |

---

# Extension points

| Extension | UI hook |
|-----------|---------|
| Domain signal chips | Below AI summary (V1.1) |
| Meetings / tasks strip | Section slot after priorities |
| Density mode toggle | Header menu (V2) |
| Plugin panel | Architecture Handbook extension slot |

---

# As-built reference

Current implementation (pre-EC-003 wiring):

| Component | Path | Status |
|-----------|------|--------|
| Page | `app/(platform)/brief/page.tsx` | Vertical slice |
| Content | `components/executive/BriefPageContent.tsx` | Composed |
| Mock data | `lib/executive/brief/MockBriefRepository.ts` | To be replaced |

EC-003 implementation shall align this document and remove static health data paths.

---

# Version history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 26 July 2026 | ORION CTO | Initial UI specification · EC-003 |

---

**Status:** Approved for Design Review — await Founder approval before implementation.

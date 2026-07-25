# EC-001 — ORION Morning Executive Brief

**Executive Capability ID:** EC-001  
**Classification:** Product Specification  
**Author:** ORION Chief Product Engineer  
**Audience:** Founder · Chief Architect · Product · Design · Engineering  
**Related:** [ES-028](../02_Engineering/ES-028-Executive-Brief-Engine.md) · [ES-032](../02_Engineering/ES-032-Business-Health-Engine.md) · [ES-029](../02_Engineering/ES-029-Recommendation-Engine.md) · [DL-2026-001](../10_Decisions/decisions/DL-2026-001-Executive-Brief-Default-Landing.md) · [ORION Constitution](../00_PROJECT/ORION_CONSTITUTION.md)

---

> **North Star Question**
>
> *"What do I need to know before I start my day?"*

---

# 1. Executive Vision

## Purpose

The ORION Morning Executive Brief is the executive operating system's daily opening ritual. It is not a dashboard, not a report, and not a data explorer. It is a **decision-ready narrative** that compresses the entire business into what matters **now** — before the first meeting, the first email, and the first interruption.

Where dashboards answer *"What is happening?"*, the Morning Brief answers *"What requires my judgment today?"*

The Brief exists to protect executive attention. Every element earns its place by reducing uncertainty, surfacing risk, or accelerating a decision. Anything that does not change what the executive does next does not belong on this screen.

## Business Value

| Stakeholder | Value |
|-------------|-------|
| **Executive** | Starts the day with clarity, not cognitive overload; reduces time spent hunting for problems across systems |
| **Organisation** | Faster response to revenue, operational, and customer risks; alignment between daily action and strategic priorities |
| **ORION Platform** | Becomes the non-negotiable daily habit that justifies every integration, workspace, and intelligence engine investment |

Quantifiable value hypothesis: an executive currently spends 45–90 minutes each morning synthesising information across email, spreadsheets, PMS, CRM, ads platforms, and team messages. The Morning Brief targets **under five minutes** to reach the same or better decision confidence.

## Executive Outcome

After consuming the Morning Brief, the executive can articulate:

1. **Overall business condition** — healthy, stable, or under pressure  
2. **The one thing that cannot wait** — today's highest-priority decision or action  
3. **What changed** — material deltas since yesterday close and overnight  
4. **Where to focus** — which workspace, team, or metric deserves attention first  
5. **What can wait** — deliberately deprioritised items, reducing anxiety and distraction  

The executive closes the Brief feeling **oriented**, not **informed-but-overwhelmed**.

## Success Metrics

| Metric | Definition | Target (V1) |
|--------|------------|-------------|
| **Time-to-Orientation** | Seconds from open to executive self-reporting "I know my priority" | ≤ 90 seconds |
| **Brief Completion Rate** | % of executive sessions reaching End-of-Brief Summary | ≥ 80% |
| **Action Conversion** | % of recommended actions marked done, delegated, or snoozed with intent | ≥ 60% |
| **Return Habit** | Executive opens Brief before any other ORION surface | ≥ 5 days / week |
| **Confidence Score** | Post-brief micro-prompt: "Do you know what to do first?" (1–5) | ≥ 4.2 avg |
| **False Urgency Rate** | Actions dismissed as not actually urgent | ≤ 10% |
| **Evidence Coverage** | Recommendations with traceable source data | 100% |

## Expected User Behaviour

**Morning (primary):** Executive opens ORION within 30 minutes of starting work. Brief loads as default landing. They scan Business Health → Critical Alerts → Today's Priorities → AI Summary. They act on one Quick Action or delegate one task. Total session: 3–7 minutes.

**Mid-morning check-in (secondary):** Executive returns after meetings. Brief shows "Since you last viewed" delta strip. Session: 60–90 seconds.

**Evening preview (tertiary, V2):** Brief surfaces tomorrow's calendar density and overnight risk watchlist. Session: optional.

**Anti-patterns we design against:**

- Scrolling through charts without deciding  
- Opening Brief then immediately navigating to five workspaces  
- Treating Brief as email replacement  
- Using Brief as team status report (that is Mission Control, not EC-001)

---

# 2. Executive Questions

The Morning Brief must implicitly or explicitly answer every question below. These questions were synthesised from executive operating patterns (Founder Assignment FA-001), hospitality/finance/CRM domain research, and benchmark analysis of CEO dashboards, Bloomberg Terminal morning workflows, and executive coaching frameworks.

## Orientation & Context

1. What happened yesterday across the business?  
2. What changed overnight while I was away?  
3. Is the business healthier or weaker than yesterday?  
4. What is the single most important thing I need to know right now?  
5. Did anything happen that I should have been woken up for?  
6. What is different from what I expected yesterday?  
7. Are we on track for the week?  
8. Are we on track for the month?  
9. What is today's narrative in one sentence?  
10. What can I safely ignore today?

## Risk & Attention

11. What needs my attention today?  
12. What is today's biggest risk?  
13. What could become a crisis by end of day if ignored?  
14. What critical alerts are unresolved?  
15. Which alert is actually urgent vs. noisy?  
16. What compliance, legal, or regulatory item is due?  
17. What supplier, partner, or vendor issue is escalating?  
18. What operational failure happened overnight?  
19. What security or fraud signal appeared?  
20. What reputation or review risk emerged?

## Revenue & Finance

21. How much revenue did we make yesterday?  
22. How does yesterday compare to plan?  
23. What is cash position today?  
24. What payments are overdue?  
25. What payables are due today?  
26. Did any large invoice fail to collect?  
27. Is margin improving or compressing?  
28. What is the revenue forecast implication of yesterday's performance?  
29. Which cost line item spiked unexpectedly?  
30. What financial decision cannot wait until tomorrow?

## Sales, Marketing & Growth

31. How did marketing perform yesterday?  
32. Which campaign is underperforming?  
33. Where is traffic coming from and is it converting?  
34. What is ROAS / CAC trend?  
35. What sales pipeline movement happened overnight?  
36. Which deal is at risk of stalling?  
37. What new lead or opportunity is highest value?  
38. What channel deserves more budget today?  
39. What channel should be paused?  
40. What growth opportunity appeared yesterday?

## Operations & Hospitality

41. What is occupancy today and this week?  
42. Are we above or below forecast occupancy?  
43. What guest issue is unresolved?  
44. Which room, property, or location is underperforming?  
45. What staffing gap exists today?  
46. What inventory or supply constraint affects today?  
47. What maintenance or facility issue is open?  
48. What booking pattern changed unexpectedly?  
49. What operational KPI breached threshold?  
50. What check-in / check-out peak requires attention?

## People & Customers

51. Which customer complaint requires executive involvement?  
52. Which VIP or high-value guest arrives today?  
53. Which team member issue affects delivery today?  
54. What hiring or attrition signal matters now?  
55. What employee escalation landed overnight?  
56. What NPS or satisfaction trend changed?  
57. Which customer is at churn risk?  
58. Who do I need to call personally today?  
59. What relationship is cooling?  
60. What praise or win should I acknowledge today?

## Calendar, Tasks & Execution

61. What meetings matter today and why?  
62. Which meeting should I skip or delegate?  
63. What preparation do I need before my first meeting?  
64. What tasks are overdue?  
65. What is the one task that unlocks the most value today?  
66. What did my team commit to delivering today?  
67. What follow-up from yesterday is still open?  
68. What decision was deferred and is now blocking progress?  
69. What approval is waiting on me?  
70. What should I do in the first 30 minutes?

## Strategic & AI-Assisted

71. What trend is emerging that I have not noticed?  
72. What recommendation does ORION have for me today?  
73. Why does ORION believe that recommendation?  
74. What evidence supports the top priority?  
75. What would happen if I do nothing today?  
76. What is the expected impact of acting on the top recommendation?  
77. What question should I ask my leadership team today?  
78. What competitor or market signal matters?  
79. What does the AI summary say in plain English?  
80. Am I missing anything material that the data shows but I have not seen?

---

# 3. Information Architecture

The Morning Brief is a **single continuous narrative** with anchored sections. Sections are ordered by **decision urgency**, not alphabetically or by org chart.

## Section Hierarchy

| Order | Section | Role | Max Visual Weight |
|-------|---------|------|-------------------|
| 1 | **Greeting** | Humanise; orient by time, name, business context | 5% |
| 2 | **Business Health** | Instant overall condition + trend arrow | 15% |
| 3 | **Yesterday Summary** | What happened in the last business day | 10% |
| 4 | **Overnight Changes** | Delta since last brief view / since market close | 10% |
| 5 | **Critical Alerts** | Must-see items requiring judgment today | 15% |
| 6 | **Recommendations** | ORION-prioritised actions with evidence | 15% |
| 7 | **Today's Priorities** | Ranked executive priorities (max 5) | 10% |
| 8 | **Meetings** | Calendar intelligence, not raw schedule | 5% |
| 9 | **Tasks** | Overdue + high-value tasks | 5% |
| 10 | **Revenue** | Yesterday revenue vs plan | 3% |
| 11 | **Marketing** | Campaign / traffic signal | 3% |
| 12 | **Sales** | Pipeline movement signal | 3% |
| 13 | **Operations** | Occupancy / delivery signal | 3% |
| 14 | **Finance** | Cash / receivables signal | 3% |
| 15 | **People** | Team / HR signal | 2% |
| 16 | **Customer Experience** | Guest / customer signal | 2% |
| 17 | **AI Summary** | Plain-language synthesis with citations | 8% |
| 18 | **Quick Actions** | One-tap decisions: approve, delegate, snooze, drill | 5% |
| 19 | **End-of-Brief Summary** | Three lines: condition · priority · first action | 5% |

## Progressive Disclosure Rules

- **Above the fold (desktop):** Greeting, Business Health, Critical Alerts, Top Recommendation, AI Summary opening line  
- **Expand on demand:** Domain strips (Revenue, Marketing, etc.) collapse to signal chips unless anomaly detected  
- **Never above the fold:** Raw tables, full calendar, historical charts, configuration links  

## Anomaly-Driven Expansion

When a domain metric breaches threshold, its section **auto-expands** with explanation. Healthy domains remain compact signal chips — e.g. `Marketing · Stable · ROAS 4.2×`.

## Brief Lifecycle States

| State | User Sees |
|-------|-----------|
| **Fresh** | Full brief; "Good morning" greeting |
| **Updated** | "3 changes since you last viewed" delta banner |
| **Stale** | "Brief refreshed 4h ago · Sync now" with timestamp |
| **Incomplete** | "Finance data unavailable" with graceful degradation badge |
| **Offline** | Cached brief with staleness indicator |

---

# 4. Screen Wireframe

## Desktop (1440px — Primary)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  ORION          Morning Brief · Thu 25 Jul          Last synced 6:42 AM    [Sync] [···]  │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Good morning, Mohammad.                                                                 │
│  Your business opens today in a stable position. One item needs your judgment.           │
│                                                                                          │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────────────────────┐ │
│  │  BUSINESS HEALTH               82   │  │  CRITICAL ALERTS                    (2)  │ │
│  │  ████████████████░░░░  Healthy  ↑   │  │  ● Guest complaint · Room 305 · 9h open  │ │
│  │  Finance · CRM · Ops · Marketing    │  │  ● Supplier payment overdue · ₹1.2L    │ │
│  │  [Why this score?]                  │  │  [View all alerts →]                     │ │
│  └─────────────────────────────────────┘  └──────────────────────────────────────────┘ │
│                                                                                          │
│  OVERNIGHT CHANGES · 3 material deltas                                                   │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐                        │
│  │ Occupancy +6 pts │ │ Sessions -8% GA4 │ │ Pipeline +₹2.1L  │                        │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘                        │
│                                                                                          │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  TOP RECOMMENDATION                                           Priority 1 · High     │  │
│  │  Resolve guest complaint before VIP check-in at 2 PM                                │  │
│  │  Evidence: CRM · Guest sentiment · VIP arrival calendar                             │  │
│  │  Impact: Protect review score and repeat booking                                    │  │
│  │  [Act Now]  [Delegate]  [Snooze]  [Why am I seeing this?]                         │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  TODAY'S PRIORITIES                                                                      │
│  1. Resolve Room 305 complaint          2. Approve supplier payment    3. Weekend pricing│
│                                                                                          │
│  ┌──────────── AI EXECUTIVE SUMMARY ────────────────────────────────────────────────┐  │
│  │  "Revenue is ahead of plan (+8.2%). Hospitality occupancy is strong ahead of the   │  │
│  │   weekend. Marketing sessions dipped 8% — campaign review recommended. Finance     │  │
│  │   has one overdue payable requiring approval today."                               │  │
│  │  Sources: Finance · Hospitality · GA4 · CRM · Calendar          Confidence: 91%    │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  DOMAIN SIGNALS                                                                          │
│  [Revenue ↑8%] [Marketing ↓] [Sales ●] [Ops ↑] [Finance ●] [People —] [CX ●]          │
│                                                                                          │
│  MEETINGS TODAY · 3 require prep     TASKS · 2 overdue     QUICK ACTIONS [Approve][Call]│
│                                                                                          │
│  ─────────────────────────────────────────────────────────────────────────────────────   │
│  BRIEF COMPLETE · Condition: Stable · Priority: Guest complaint · First: Call ops lead  │
│  [Start your day → Command Center]                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## Tablet (768px)

```
┌────────────────────────────────────────────┐
│  ORION    Morning Brief        Sync  6:42  │
├────────────────────────────────────────────┤
│  Good morning, Mohammad.                   │
│  Stable position · 1 item needs judgment │
│                                            │
│  ┌──────────────────────────────────────┐│
│  │ BUSINESS HEALTH  82  Healthy  ↑      ││
│  │ [Why this score?]                    ││
│  └──────────────────────────────────────┘│
│                                            │
│  CRITICAL ALERTS (2)                       │
│  ● Guest complaint · Room 305              │
│  ● Supplier payment overdue                │
│                                            │
│  OVERNIGHT · Occupancy +6 · Sessions -8%   │
│                                            │
│  ┌ TOP RECOMMENDATION ──────────────────┐ │
│  │ Resolve guest complaint before VIP   │ │
│  │ [Act] [Delegate] [Snooze]            │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  AI SUMMARY                                │
│  Revenue ahead of plan. Occupancy strong.  │
│  Marketing dip. One payable due.           │
│  Confidence 91% · 5 sources              │
│                                            │
│  [Revenue] [Marketing] [Ops] [Finance]   │
│  MEETINGS 3 · TASKS 2 overdue            │
│                                            │
│  Brief complete · Priority: Guest issue    │
└────────────────────────────────────────────┘
```

## Mobile (390px)

```
┌─────────────────────────┐
│ ≡  Morning Brief    Sync│
├─────────────────────────┤
│ Good morning, Mohammad. │
│ Stable · 1 needs you    │
│                         │
│ ┌─────────────────────┐ │
│ │ HEALTH  82  ↑       │ │
│ └─────────────────────┘ │
│                         │
│ ALERTS (2)              │
│ ● Guest · Room 305      │
│ ● Payment overdue       │
│                         │
│ TOP ACTION              │
│ Resolve guest complaint │
│ before VIP 2 PM         │
│ [Act Now]               │
│                         │
│ AI SUMMARY              │
│ Revenue +8%. Occupancy  │
│ strong. Marketing -8%.  │
│                         │
│ [See full brief ↓]      │
│                         │
│ ─── Brief complete ───  │
│ Priority: Guest issue   │
└─────────────────────────┘
```

Mobile uses **card stack** with sticky Business Health and Top Recommendation. Remaining sections load on intentional scroll — never infinite feed.

---

# 5. Business Health Engine

## Design Philosophy

Business Health is a **composite judgment**, not an average of metrics. It represents *organisational resilience today* — the executive's confidence that the business can absorb shock and deliver on commitments.

The score must be **explainable in one sentence** and **defensible in a board meeting**.

## Inputs

| Domain | Source Provider | Example Signals | V1 Weight |
|--------|-----------------|-----------------|-----------|
| **Finance** | Finance Provider | Revenue vs plan, cash, overdue AR/AP | 25% |
| **Commercial** | CRM + Commerce | Pipeline velocity, conversion, basket | 20% |
| **Operations** | Hospitality + Inventory | Occupancy, SLA breaches, stockouts | 20% |
| **Marketing** | GA4 + Ads | Traffic trend, ROAS, CAC | 15% |
| **Customer** | CRM + Reviews | Complaints, NPS, VIP risk | 10% |
| **People** | HR Provider | Absence, attrition signal, escalations | 5% |
| **Strategic** | Trend Engine | Cross-domain deterioration patterns | 5% |

Weights are **configurable per organisation** in V2. V1 uses hospitality-weighted defaults aligned with ORION's founding vertical.

## Calculation Model

```
Domain Score (0–100)
  = weighted sum of normalised KPI z-scores against 30-day baseline
  capped and smoothed with 3-day EMA

Business Health Score
  = Σ (domain_score × domain_weight)
  adjusted by critical alert penalty (−5 to −15 per unresolved critical alert)
  adjusted by confidence discount (see below)

Status Bands
  85–100  Healthy      (green)
  65–84   Attention    (amber)
  0–64    Critical     (red)
```

## Confidence Score

Confidence (0–100%) reflects **data completeness and freshness**, not business performance.

| Factor | Impact on Confidence |
|--------|---------------------|
| Provider connected and synced within SLA | +base |
| Missing domain provider | −15% per missing domain (max −45%) |
| Stale data (>4h) | −10% |
| Mock / demo data active | Cap at 60% · display "Demo data" badge |
| Conflicting signals across providers | −5% |

**Rule:** Never display a Health Score above confidence cap without explicit "low confidence" warning.

## Explainability

Every Health Score exposes a **"Why this score?"** drawer:

- Top 3 positive drivers ("Occupancy +6 pts vs forecast")  
- Top 3 negative drivers ("Marketing sessions −8% WoW")  
- Domain breakdown mini-bars  
- Timestamp of each input  
- Link to source workspace (drill, not navigate blindly)

No black-box scoring. Executives must trust the number or ignore it — trust requires transparency.

---

# 6. Recommendation Engine

## Generation Pipeline

```
Provider Contributions
        │
        ▼
Signal Detection (threshold · trend · anomaly · calendar conflict)
        │
        ▼
Candidate Recommendations (workspace engines + cross-domain rules)
        │
        ▼
Scoring & Deduplication
        │
        ▼
Morning Brief Top 3 (expandable to 7)
```

## Priority Logic

Recommendations are ranked by:

```
Priority Score =
  (Severity × 0.35)
+ (Financial Impact × 0.25)
+ (Time Sensitivity × 0.20)
+ (Executive Leverage × 0.10)
+ (Confidence × 0.10)
```

| Severity | Definition | Example |
|----------|------------|---------|
| **Critical** | Revenue, legal, safety, or reputation at immediate risk | Unresolved guest complaint before VIP arrival |
| **High** | Material business impact within 24h | Overdue supplier blocking operations |
| **Medium** | Optimisation or growth opportunity | Campaign CTR decline |
| **Low** | Informational or scheduled | Review weekly report |

## Recommendation Card Structure

Every recommendation displayed in the Brief includes:

| Field | Requirement |
|-------|-------------|
| **Title** | Action-oriented, ≤ 12 words |
| **Description** | Context in one sentence |
| **Priority** | 1–5 (1 = highest) |
| **Severity** | Critical · High · Medium · Low |
| **Confidence** | 0–100% with data quality indicator |
| **Evidence** | Linked sources (provider id, metric, timestamp) |
| **Suggested Action** | Specific next step |
| **Expected Impact** | Quantified where possible ("Protect 4.8★ review score") |
| **Actions** | Act Now · Delegate · Snooze · Dismiss with reason |

## Anti-Noise Rules

- Maximum **3 recommendations above the fold**  
- Duplicate signals from multiple providers merge into one recommendation  
- Dismissed recommendations suppress similar signals for 72h (executive feedback loop)  
- Recommendations without evidence **never surface** in Morning Brief (log internally only)

---

# 7. AI Executive Summary

## Purpose

The AI Summary is the **plain-language distillation** of the entire brief. It is written for a CEO reading on a phone in an elevator — not for an analyst.

## Internal Prompt Architecture (Conceptual)

The AI layer receives a **structured evidence packet**, never raw database access:

```
Evidence Packet:
  - business_health: { score, status, drivers[] }
  - alerts[]: { severity, message, source, timestamp }
  - recommendations[]: { title, priority, evidence[] }
  - domain_signals[]: { domain, trend, metric, delta }
  - calendar_conflicts[]: optional
  - data_quality: { confidence, missing_providers[] }
```

**System instruction principles:**

1. Write in second person ("Your business…")  
2. Maximum 4 sentences for mobile, 6 for desktop  
3. Lead with condition, then risk, then opportunity  
4. Every claim must map to an evidence packet entry  
5. If confidence < 70%, state uncertainty explicitly  
6. Never invent metrics, names, amounts, or events  
7. Never prescribe legal, medical, or HR disciplinary actions  
8. Use INR formatting and organisation locale from config  

## Example Output (Valid)

> Your business opens today in a stable position with health at 82. Revenue is 8.2% ahead of plan and weekend occupancy is trending above target. Marketing sessions declined 8% week-over-week — a campaign review is recommended. One supplier payment is overdue and requires your approval today.

**Citations rendered:** Finance Provider · Hospitality Provider · Google Analytics 4 · CRM · Calendar

## Hallucination Prevention

| Control | Mechanism |
|---------|-----------|
| **Grounded generation** | LLM receives JSON evidence only; no tool use at V1 |
| **Citation enforcement** | Post-processor validates every sentence against evidence IDs |
| **Fallback** | If validation fails, show template-based summary from structured data |
| **Human-readable audit** | "Why am I seeing this?" links evidence chain |
| **Confidence gate** | Summary hidden if confidence < 40%; show "Brief incomplete" instead |

## Reasoning Transparency

Optional expandable **"How ORION reasoned"** panel:

- Signals considered  
- Signals suppressed (and why)  
- Priority ranking explanation  
- Missing data disclaimer  

This builds executive trust and supports AI governance requirements in the ORION Constitution.

---

# 8. Data Sources

Every integrated provider contributes to the Morning Brief through the ORION Provider Framework and Intelligence Orchestrator.

## V1 — Connected / Planned

| Provider | Domain | Brief Sections Fed | Status |
|----------|--------|-------------------|--------|
| **Finance Provider** | Finance | Revenue, Finance strip, Health, Alerts | Mock · V1 |
| **CRM Provider** | Sales / CX | Pipeline, Customer Experience, Recommendations | Mock · V1 |
| **Marketing Provider** | Marketing | Marketing strip, Recommendations | Mock · V1 |
| **Google Analytics 4** | Analytics / Marketing | Sessions, conversions, traffic anomalies | Live when configured |
| **Hospitality Provider** | Operations | Occupancy, Operations strip, Alerts | Mock · V1 |
| **Commerce Provider** | Commerce | Revenue supplement, catalogue health | Mock · V1 |
| **Calendar Provider** | Meetings | Today's meetings, prep conflicts | Mock · V1 |
| **Email Provider** | Communication | Priority emails, follow-ups | Mock · V1 |

## V2 — Expansion Providers

| Provider | Domain | Brief Sections Fed |
|----------|--------|-------------------|
| **Google Ads** | Marketing | Campaign performance, spend anomalies |
| **Meta Ads** | Marketing | ROAS, creative fatigue signals |
| **Stripe / Razorpay** | Finance | Real-time revenue, failed payments |
| **QuickBooks / Zoho Books** | Finance | GL sync, P&L flash |
| **Booking.com / PMS** | Hospitality | Reservations, channel mix |
| **Opera PMS / Cloudbeds** | Hospitality | In-house guests, housekeeping |
| **Shopify / WooCommerce** | Commerce | Orders, cart abandonment |
| **HubSpot / Salesforce** | CRM | Pipeline, deal stage changes |
| **Slack / Teams** | Communication | Executive mentions, escalations |
| **Gmail / Outlook** | Communication | Priority thread detection |
| **Asana / Linear / Jira** | Tasks | Blocked work, overdue deliverables |
| **Notion** | People / Ops | Decision log, OKR progress |

## V3 — Enterprise Providers

| Provider | Domain | Brief Sections Fed |
|----------|--------|-------------------|
| **SAP / Oracle ERP** | Finance / Ops / Inventory | Enterprise resource signals |
| **Workday / BambooHR** | People | Headcount, absence, payroll risk |
| **Snowflake / BigQuery** | Analytics | Custom executive metrics |
| **Power BI / Looker** | Analytics | Curated KPI embeds |
| **Twilio / WhatsApp Business** | CX | Service level, response time |
| **Review platforms (TripAdvisor, Google)** | CX | Rating deltas, review sentiment |
| **Weather / Events API** | Operations | Demand forecast context |
| **Custom Webhooks** | Any | Partner-defined signals |

## Plugin Framework Extensions

Plugins registering against `provider-integration`, `ai-skill`, or `executive-panel` extension points may inject additional Brief sections with declared permissions reviewed in Integration Center.

---

# 9. User Experience

## Scrolling Behaviour

- **Desktop:** Single page, smooth scroll, sticky section nav rail (right edge)  
- **Mobile:** Card stack; top 3 sections pinned until dismissed  
- **No infinite scroll** — Brief has a defined end (End-of-Brief Summary)  
- **Scroll progress indicator** subtle bar: "Brief 60% complete"  

## Cards

- **Premium card** (gold accent): Business Health, Top Recommendation  
- **Alert card** (severity-coloured left border): Critical Alerts  
- **Signal chip** (compact): Healthy domain strips  
- **Evidence card** (muted): Expandable source detail  

Card density follows **Bloomberg legibility** — data-rich but never cluttered. White space is intentional.

## Density Modes (V2)

| Mode | Audience |
|------|----------|
| **Executive** (default) | 3–7 minute brief |
| **Operator** | More domain detail |
| **Board** | Summary-only, export-ready |

## Accessibility

- WCAG 2.2 AA compliance  
- Severity never conveyed by colour alone (icon + text)  
- Screen reader: section landmarks, live region for sync updates  
- Keyboard: full action parity (Act, Delegate, Snooze)  
- Reduced motion respects `prefers-reduced-motion`  
- Minimum touch target 44×44px on mobile  

## Loading

| Phase | Experience |
|-------|------------|
| **0–200ms** | Skeleton with Greeting + Health placeholder |
| **200ms–2s** | Progressive section reveal (Health → Alerts → Summary) |
| **>2s** | Show cached brief + "Refreshing…" non-blocking |
| **Failure** | Last good brief + provider-level error badges |

Target: **First meaningful paint ≤ 1.5s** on executive dashboard route.

## Offline Mode

- Cache last successful brief (encrypted local storage / service worker)  
- Display staleness timestamp prominently  
- Quick Actions queue for sync on reconnect  
- AI Summary shows cached version with "Generated at" label  

## Dark Mode

- Default ORION navy palette (existing design system)  
- Health and severity colours calibrated for dark backgrounds  
- No pure white blocks — use `bg-white/[0.03]` surface hierarchy  

## Performance

- Brief data fetched via single orchestrator snapshot (`getDashboardSnapshot()` evolution)  
- Server-rendered shell with streaming AI Summary section  
- Edge cache for static greeting and layout  
- AI Summary generated asynchronously after deterministic sections render  

---

# 10. Technical Architecture

## Data Flow

```
External Systems (GA4, CRM, PMS, Finance, Calendar, Email…)
        │
        ▼
Provider Framework (connect · sync · health · capabilities)
        │
        ▼
Intelligence Orchestrator (PipelineRunner · 10 stages)
        │
        ├── Business Health Engine
        ├── Recommendation Engine
        ├── Alert Engine
        ├── Trend Engine
        └── Executive Brief Engine
        │
        ▼
Morning Brief Composer (EC-001 presentation layer)
        │
        ├── Deterministic sections (Health, Alerts, Priorities…)
        └── AI Summary Service (evidence-grounded)
        │
        ▼
/brief (default executive landing) · Mobile · Email digest · Voice (V3)
```

## Backend Services

| Service | Responsibility |
|---------|----------------|
| **Brief Snapshot Service** | Aggregates orchestrator output into EC-001 section model |
| **Delta Service** | Computes overnight / since-last-view changes |
| **AI Summary Service** | Evidence packet → validated narrative |
| **Brief History Service** | Stores daily brief snapshots for audit and trend |
| **Notification Service** | Push / email when critical overnight alert |

## Caching

| Layer | TTL | Invalidation |
|-------|-----|--------------|
| Provider contribution cache | 5 min (configurable) | Provider sync event |
| Orchestrator snapshot | React cache · per request | Pipeline completion |
| AI Summary | 15 min | Underlying evidence change |
| Client offline cache | 24h | Successful sync |

## AI Orchestration

1. Deterministic engines produce evidence packet  
2. AI Summary Service validates packet completeness  
3. LLM generates narrative with citation map  
4. Post-processor validates claims vs evidence  
5. Fallback template if validation fails  
6. Audit log stores evidence packet + output + model version  

## Update Frequency

| Section | Refresh |
|---------|---------|
| Critical Alerts | Real-time (webhook) or ≤ 5 min polling |
| Business Health | Every 15 min · on-demand sync |
| Domain strips | Every 30 min |
| AI Summary | On brief open if evidence changed |
| Calendar / Tasks | Every 10 min |

## Real-Time Strategy

- V1: Polling via orchestrator on brief open + manual sync  
- V2: WebSocket push for critical alerts overlay  
- V3: Event bus (ES-033) with selective section invalidation  

## Security

- Executive role required (RBAC)  
- Brief data scoped to organisation tenant  
- Provider credentials never exposed to client  
- AI evidence packet redacts PII not required for summary  
- Audit log for every brief view and action  

## Privacy

- Executive actions (dismiss, snooze) stored for recommendation learning  
- No training on client data without explicit opt-in  
- GDPR / DPDP-aligned data retention policies on brief history  
- Guest PII in hospitality alerts masked to room + severity unless drill-down authorised  

---

# 11. KPIs

## Product KPIs

| KPI | Measurement | V1 Target | V2 Target |
|-----|-------------|-----------|-----------|
| **Time Saved** | Self-report + session duration vs baseline | 30 min / day | 45 min / day |
| **Decisions Improved** | Actions taken / recommendations shown | 40% | 60% |
| **Actions Completed** | Quick Actions completed same day | 50% | 70% |
| **Executive Engagement** | DAU / WAU on Brief route | 80% WAU | 95% WAU |
| **Brief Trust Score** | In-app confidence prompt | 4.0 / 5 | 4.5 / 5 |
| **Alert Precision** | Alerts acted on / alerts shown | 50% | 75% |
| **Data Freshness SLA** | Briefs with all providers synced < 1h | 90% | 99% |

## Business KPIs

| KPI | Link |
|-----|------|
| Revenue protected from escalated issues | Hospitality + Finance alert conversion |
| Guest satisfaction correlation | CX alerts resolved before checkout |
| Cash collection acceleration | Finance recommendation action rate |
| Marketing waste reduction | Campaign recommendations acted on |

## Anti-Metrics (What We Do Not Optimise)

- Time spent in Brief (longer ≠ better)  
- Number of alerts shown (more ≠ better)  
- Chart count (this is not a dashboard)  

---

# 12. Future Roadmap

## Version 1 — Morning Brief Foundation (Current Chapter)

**Objective:** Establish the daily executive habit with deterministic intelligence.

- Default landing route: Morning Brief (`/brief` evolution from `/advisor`)  
- Business Health, Critical Alerts, Top Recommendations, AI Summary  
- Provider Framework integration (mock + GA4 live)  
- Quick Actions: Act · Delegate · Snooze  
- End-of-Brief Summary  
- Desktop + mobile responsive  
- Manual sync · 15-min cache  

**Exit criteria:** Executive completes brief in ≤ 5 min with ≥ 4.0 trust score in founder testing.

## Version 2 — Intelligent Morning (Q+1)

- Real-time critical alert push  
- Since-last-view delta engine  
- Google Ads + PMS live providers  
- Brief history and day-over-day comparison  
- Executive density modes  
- Scheduled email brief (6:30 AM local)  
- Recommendation feedback loop  
- Calendar prep intelligence ("Prepare for 2 PM board review")  

## Version 3 — Predictive Executive OS

- **Voice Briefing:** "ORION, brief me" — spoken summary with follow-up questions  
- **Predictive Intelligence:** "Occupancy likely to miss target Friday" with confidence  
- **Board Mode:** One-page export for leadership meetings  
- **Multi-property / multi-entity** roll-up for portfolio executives  
- **Executive Copilot:** Conversational drill-down from any Brief section  
- **Cross-organisation benchmarking** (anonymised vertical benchmarks)  

## AI Enhancements (Cross-Version)

| Enhancement | Version |
|-------------|---------|
| Evidence-grounded summary | V1 |
| Reasoning transparency drawer | V1.1 |
| Executive feedback learning | V2 |
| Predictive risk narrative | V3 |
| Voice synthesis + dialogue | V3 |
| Personalised priority weighting | V3 |

---

# Appendix A — Relationship to Existing ORION Surfaces

| Surface | Relationship to EC-001 |
|---------|------------------------|
| **Advisor (`/advisor`)** | Precursor · partial Brief implementation |
| **Command Center (`/command-center`)** | Drill-down destination after Brief orientation |
| **Dashboard (`/dashboard`)** | Analytic depth · not morning entry point |
| **Mission Control** | Team operations · not executive morning ritual |
| **Integration Center** | Provider health that determines Brief data quality |

**Strategic direction:** EC-001 Morning Brief becomes the **default executive landing**, superseding DL-2026-001 Advisor-first routing when V1 ships.

---

# Appendix B — Document Governance

| Field | Value |
|-------|-------|
| **Document ID** | EC-001 |
| **Title** | ORION Morning Executive Brief |
| **Owner** | Chief Product Engineer |
| **Reviewers** | Founder · Chief Architect · Design Lead |
| **Next Review** | Architecture Review Board |
| **Implementation Specs** | ES-028 · ES-029 · ES-032 · ES-065 (pending EC-001 alignment) |

---

**Status:**  
READY FOR ARCHITECTURE REVIEW

**Version:**  
1.0

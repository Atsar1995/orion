# EC-003 — Executive Recommendation Engine

**Executive Capability ID:** EC-003  
**Classification:** Product & Decision Intelligence Architecture Specification  
**Author:** Chief AI Architect · Executive Decision Systems Designer  
**Audience:** Founder · Chief Architect · Product · Design · Engineering · Data Science  
**Related:** [ES-029](../02_Engineering/ES-029-Recommendation-Engine.md) · [EC-001](./EC-001_Morning_Executive_Brief.md) · [EC-002](./EC-002_Business_Health_Engine.md) · [ES-030](../02_Engineering/ES-030-Alert-Engine.md) · [ES-028](../02_Engineering/ES-028-Executive-Brief-Engine.md) · [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) · [ORION Constitution](../00_PROJECT/ORION_CONSTITUTION.md)

---

> **North Star Principle**
>
> *The engine prepares decisions — it never replaces judgment.*

---

# 1. Vision

## Purpose

The Executive Recommendation Engine is ORION's **decision preparation system**. It transforms signals from every connected provider, health evaluation, trend analysis, and risk detection layer into prioritised, evidence-backed recommendations that help executives decide **what to do next** — and **why**.

It is not a notification engine. Notifications demand attention without context.

It is not an alert engine. Alerts report problems without prescribing resolution paths.

It is an **Executive Decision Support System** — the bridge between organisational intelligence and executive action.

Its fundamental question:

> *"Given everything ORION knows, what action would most improve this business — and why should I trust that advice?"*

## Business Value

| Stakeholder | Value |
|-------------|-------|
| **Executive** | Curated decision queue instead of self-assembling priorities from dashboards, email, and team escalations |
| **Leadership Team** | Shared recommendation language aligned to evidence — reduces ambiguous "we should look into this" meetings |
| **Organisation** | Faster conversion from signal → decision → outcome; institutional memory of what worked |
| **ORION Platform** | Closes the loop between intelligence engines and executive behaviour — proves platform ROI |

Quantifiable hypothesis: executives spend 30–60 minutes daily deciding what deserves attention. The Recommendation Engine targets **≤ 3 minutes** to identify today's highest-value action with **≥ 85% evidence coverage** on every surfaced recommendation.

## Executive Outcome

After engaging with recommendations, the executive can:

1. **Identify the highest-value action** — ranked by impact, urgency, and confidence  
2. **Understand why it matters** — evidence, root cause, and business context in plain language  
3. **Estimate effort and return** — expected benefit, time, and risk before committing  
4. **Act, delegate, defer, or dismiss** — with explicit intent captured for learning  
5. **Trust the system** — or reject it with reason, improving future recommendations  

The executive leaves each interaction feeling **prepared to decide**, not **instructed what to do**.

## Recommendation Philosophy

| Belief | Implication |
|--------|-------------|
| **Executives decide; ORION prepares** | Every recommendation is a proposal, never a command |
| **Evidence precedes advice** | No recommendation ships without traceable supporting data |
| **Less is more** | Three excellent recommendations beat twenty mediocre ones |
| **Timing matters** | The right action at the wrong time is the wrong recommendation |
| **Context is personal** | "Why me?" must be answerable for every surfaced item |
| **Outcomes teach** | Accepted recommendations without measured outcomes cannot improve the system |
| **Dismissal is data** | Rejected recommendations are learning signals, not failures |

## Decision Support Principles

1. **Explainability is non-negotiable** — if it cannot be explained, it cannot be recommended  
2. **Confidence must be visible** — uncertainty displayed, never hidden  
3. **Prioritisation is transparent** — scoring formula auditable by executives and architects  
4. **Actions are specific** — "Review marketing" is not a recommendation; "Pause Meta Campaign X and reallocate ₹40K to Google brand search" is  
5. **Impact is quantified where possible** — revenue protected, cost saved, risk reduced  
6. **Conflicts are resolved explicitly** — contradictory recommendations merged or ranked with reasoning  
7. **Human override is always available** — executives can modify, defer, or reject without penalty  
8. **Learning is continuous** — feedback loops improve ranking, not just volume  

## Distinction from Adjacent Engines

| Engine | Question Answered | Relationship to EC-003 |
|--------|-------------------|------------------------|
| **Alert Engine (ES-030)** | "What is wrong?" | Alerts feed recommendation candidates; alerts alone are not recommendations |
| **Health Engine (EC-002)** | "How are we doing?" | Health degradation triggers recommendation generation |
| **Trend Engine (ES-031)** | "What direction are we moving?" | Trends provide temporal evidence for recommendations |
| **Morning Brief (EC-001)** | "What do I need to know today?" | Brief surfaces top 1–3 recommendations; EC-003 is the full decision queue |
| **Notification system** | "Something happened" | Never generates recommendations without analysis layer |

---

# 2. Recommendation Lifecycle

Every recommendation moves through a **closed-loop lifecycle** designed for executive accountability and system learning.

```
┌──────────┐
│  DETECT  │  Signal observed: threshold breach, trend inflection, opportunity,
└────┬─────┘  health degradation, calendar conflict, cross-domain pattern
     │
┌────▼─────┐
│ ANALYSE  │  Root cause inference · evidence assembly · impact estimation
└────┬─────┘  · duplicate detection · category classification
     │
┌────▼─────┐
│ VALIDATE │  Evidence completeness check · confidence floor · business rule
└────┬─────┘  filter · conflict check · hallucination guard (AI layer)
     │
┌────▼──────┐
│ PRIORITISE│  Composite scoring · executive preference weighting · freshness
└────┬──────┘  adjustment · deduplication · cap enforcement (max surfaced)
     │
┌────▼──────┐
│ RECOMMEND │  Published to Brief · Command Center · workspace · notification
└────┬──────┘  (opt-in) · with full explainability bundle
     │
┌────▼──────────────┐
│ EXECUTIVE REVIEWS │  Accept · Reject · Defer · Modify · Delegate · Ignore
└────┬──────────────┘  (explicit or implicit signals captured)
     │
┌────▼──────────┐
│ EXECUTIVE ACTS│  Action taken in ORION or externally · linked to recommendation id
└────┬──────────┘
     │
┌────▼──────────────┐
│ MEASURE OUTCOME   │  KPI delta · health change · alert resolution · time-to-close
└────┬──────────────┘  · executive self-assessment (optional)
     │
┌────▼──────┐
│   LEARN   │  Update ranking weights · suppress noise patterns · reinforce success
└───────────┘  patterns · retrain category models (V2+)
```

## Lifecycle States

| State | Description | Visible to Executive |
|-------|-------------|---------------------|
| **Detected** | Signal captured, not yet analysed | No |
| **Candidate** | Analysed, pending validation | No |
| **Validated** | Passed evidence and rule checks | No |
| **Recommended** | Published to executive surfaces | Yes |
| **Reviewed** | Executive interacted (any action) | Yes |
| **Accepted** | Executive committed to act | Yes |
| **In Progress** | Action underway | Yes |
| **Completed** | Action done · outcome measuring | Yes |
| **Deferred** | Snoozed until date or condition | Yes (hidden until due) |
| **Rejected** | Dismissed with optional reason | No (archived) |
| **Expired** | Time-sensitive window passed | No |
| **Archived** | Historical record | Via history only |

## Lifecycle SLAs

| Transition | Target |
|------------|--------|
| Detect → Analyse | ≤ 30 seconds |
| Analyse → Validate | ≤ 60 seconds |
| Validate → Recommend | ≤ 30 seconds (batch with pipeline) |
| Recommend → Review | Executive-dependent |
| Act → Measure | 7–30 days depending on category |
| Measure → Learn | Daily batch + event-driven |

---

# 3. Recommendation Categories

Categories organise recommendations for filtering, weighting, routing, and learning. Each maps to ORION workspace and provider domains.

| Category | Primary Signals | Example Recommendation |
|----------|-----------------|------------------------|
| **Revenue** | Revenue vs plan, booking value, ADR | "Increase weekend room rates 8% — demand exceeds forecast" |
| **Marketing** | ROAS, CTR, sessions, CAC | "Refresh Meta creative — CTR declined 12% WoW" |
| **Sales** | Pipeline velocity, win rate, deal aging | "Escalate stalled ₹12L enterprise deal — no activity 11 days" |
| **Operations** | Occupancy, SLA, fulfilment, capacity | "Add housekeeping shift Saturday — occupancy 92%" |
| **Finance** | Cash, AR/AP, margin, runway | "Approve overdue supplier payment — ops continuity risk" |
| **Customer Experience** | NPS, complaints, resolution time | "Call guest in Room 305 before VIP arrival at 2 PM" |
| **Hospitality** | Guest sentiment, check-in/out, reviews | "Offer complimentary upgrade to at-risk repeat guest" |
| **Inventory** | Stockouts, overstock, wastage | "Reorder housekeeping linens — 4-day supply remaining" |
| **Pricing** | Demand/supply imbalance, competitor rates | "Dynamic pricing: Tuesday night −10%, Saturday +15%" |
| **Staffing** | Absence, vacancy, workload | "Approve overtime for front desk — 2 no-shows today" |
| **Risk** | Critical alerts, concentration, exposure | "Diversify ad spend — 78% on single Meta campaign" |
| **Compliance** | Filing deadlines, audit findings, licenses | "Submit GST filing — due in 5 days" |
| **Growth** | Acquisition, expansion, new channels | "Launch referral programme — repeat rate at 6-month high" |
| **Technology** | Integration failures, security, debt | "Reconnect GA4 provider — marketing health confidence at 60%" |
| **Strategic** | OKR drift, market shift, portfolio balance | "Review Q3 expansion plan — pipeline insufficient for target" |

## Category Routing Rules

- **Risk** and **Compliance** recommendations bypass daily cap when severity = Critical  
- **Strategic** recommendations surface weekly, not daily (avoid noise)  
- **Technology** recommendations route to operator role when RBAC enabled (V2)  
- Categories map to **Recommendation Engine filters** in Command Center and Brief  

---

# 4. Recommendation Model

Every recommendation is a **structured decision artifact** — complete enough for an executive to act without opening another system, yet traceable enough for audit.

## Core Fields

| Field | Requirement | Description |
|-------|-------------|-------------|
| **ID** | Required · immutable | `rec-{org}-{uuid}` · globally unique |
| **Title** | Required · ≤ 12 words | Action-oriented headline |
| **Executive Summary** | Required · ≤ 2 sentences | Plain-language "what and why" |
| **Business Context** | Required | Domain, workspace, time sensitivity, strategic link |
| **Evidence** | Required · ≥ 1 item | Structured evidence objects (see below) |
| **Root Cause** | Required when diagnostic | Why the situation exists — fact or labelled inference |
| **Suggested Action** | Required · specific | Concrete next step executable by executive or delegate |
| **Expected Benefit** | Required | Quantified where possible ("Protect 4.8★ rating" · "+₹2.1L revenue/week") |
| **Estimated Effort** | Required | Low · Medium · High · or hours range |
| **Estimated Time** | Required | Minutes · Hours · Days · Weeks |
| **Risk Level** | Required | Low · Medium · High · Critical (of inaction) |
| **Confidence Score** | Required · 0–100% | Composite certainty (see Section 10) |
| **Priority** | Required · 1–5 | Display rank (1 = highest) |
| **Business Impact** | Required | Transformational · Major · Moderate · Minor |
| **Dependencies** | Optional | Other recommendations, approvals, or data prerequisites |
| **Supporting Metrics** | Required · ≥ 1 | KPI name, value, delta, baseline, source |
| **Historical Examples** | Optional · V2 | "Similar action improved occupancy 4 pts in March" |

## Evidence Object Structure

```
Evidence {
  id
  type: "metric" | "alert" | "trend" | "health_driver" | "calendar" | "record"
  source: { provider_id, workspace, timestamp }
  label: human-readable fact
  value: raw or formatted value
  delta: change vs baseline (optional)
  uri: deep link to source record (optional)
  confidence: per-evidence confidence
}
```

**Rule:** Recommendations with zero validated evidence objects **never publish**.

## Recommendation Types (Horizon)

Cross-reference Section 8 for full type taxonomy. Every recommendation carries a `horizon` field: Immediate · Today · This Week · This Month · Strategic.

## Severity vs Priority

| Concept | Meaning |
|---------|---------|
| **Severity** | How bad is inaction? (risk lens) |
| **Priority** | What should executive do first? (ranking lens) |
| **Impact** | How much value does action create? (opportunity lens) |

A high-severity item may rank below a high-impact item if urgency differs — prioritisation engine resolves transparently.

---

# 5. Prioritization Engine

The Prioritization Engine ranks validated candidates into an **Overall Recommendation Score (ORS)** — a transparent composite used for ordering, surfacing, and cap enforcement.

## Scoring Dimensions

| Dimension | Weight (V1) | Description |
|-----------|-------------|-------------|
| **Business Impact** | 28% | Revenue, margin, retention, strategic value |
| **Urgency** | 22% | Time sensitivity, deadline proximity, decay rate |
| **Risk (of inaction)** | 18% | Severity if ignored |
| **Confidence** | 15% | Evidence quality and data freshness |
| **Strategic Alignment** | 10% | Match to org OKRs and executive-stated priorities |
| **Cost / Effort (inverse)** | 5% | Lower effort boosts rank when impact equal |
| **Executive Preferences** | 2% | Learned from accept/reject history (V2 active) |

Weights are **organisation-configurable** within ±10% per dimension without architecture review.

## Dimension Scoring (0–100 each)

### Business Impact

| Score | Criteria |
|-------|----------|
| 90–100 | Transformational · > 5% revenue or critical strategic shift |
| 70–89 | Major · material P&L or customer impact |
| 50–69 | Moderate · meaningful but localised |
| 30–49 | Minor · optimisation |
| 0–29 | Informational · low materiality |

### Urgency

Derived from: deadline proximity · rate of deterioration · calendar conflicts · guest/ customer arrival times · compliance due dates.

### Risk

Mapped from EC-002 Risk Detection severity. Critical risk → Urgency floor of 80.

### Confidence

From evidence completeness, source reliability, cross-provider agreement, and AI validation pass/fail.

### Strategic Alignment

Manual OKR tags (V1) · AI alignment inference (V2). Unaligned recommendations capped at Priority 3 unless Risk = Critical.

### Executive Preferences

V1: static role profile (CEO vs COO weighting).  
V2: learned from accept/reject/defer patterns per category and time-of-day.

### Data Freshness

Stale evidence (> 24h) applies −15 to Confidence dimension. Expired evidence disqualifies recommendation.

## Overall Recommendation Score

```
ORS = Σ (dimension_score × dimension_weight)
  adjusted by:
    − duplicate penalty (near-identical recs merged)
    − recent rejection penalty (same pattern suppressed 72h)
    − category cap (max 2 per category in top 5)
    + critical bypass (Risk/Compliance critical ignores cap)
```

## Surfacing Rules

| Surface | Max Recommendations | Selection |
|---------|---------------------|-----------|
| **Morning Brief** | 3 (1 hero + 2 secondary) | Top ORS · diversity across categories |
| **Command Center** | 7 | Top ORS · full explainability |
| **Workspace** | 5 | Category-filtered ORS |
| **Push notification** | 1 | Critical only · ORS ≥ 90 · opt-in |

---

# 6. Recommendation Card

The Recommendation Card is the **primary interaction surface** for EC-003 across Brief, Command Center, and workspaces.

## Card Hierarchy

1. Priority badge + category  
2. Title  
3. Executive summary  
4. Expected benefit · Confidence · Horizon  
5. Top evidence (2 items visible)  
6. Suggested action  
7. Actions: **Act · Delegate · Defer · Dismiss · Why?**  

## Desktop

```
┌────────────────────────────────────────────────────────────────────────────┐
│  PRIORITY 1 · CUSTOMER EXPERIENCE                    Confidence 94%      │
│  Horizon: TODAY                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Resolve guest complaint before VIP check-in at 2 PM                       │
│                                                                            │
│  Room 305 complaint open 9 hours. VIP guest arrives today. Unresolved      │
│  issues correlate with 1-star reviews within 48 hours at this property.    │
│                                                                            │
│  EXPECTED BENEFIT          EFFORT        RISK IF IGNORED                   │
│  Protect 4.8★ rating       30 min        High · Review + repeat loss       │
│  Retain ₹1.8L lifetime value                                               │
│                                                                            │
│  EVIDENCE                                                                  │
│  ● CRM · Complaint #1847 · Open 9h · Room 305                             │
│  ● Calendar · VIP arrival · 2:00 PM · Mr. Sharma                          │
│  ● Hospitality · Guest sentiment · Declining                               │
│                                                                            │
│  SUGGESTED ACTION                                                          │
│  Call guest personally · authorise room move or complimentary F&B          │
│                                                                            │
│  [Act Now]  [Delegate]  [Defer ▾]  [Dismiss]  [Why am I seeing this?]     │
└────────────────────────────────────────────────────────────────────────────┘
```

## Tablet

```
┌──────────────────────────────────────────────────────┐
│  P1 · CUSTOMER EXPERIENCE              94% · TODAY   │
│                                                      │
│  Resolve guest complaint before VIP 2 PM             │
│                                                      │
│  Room 305 open 9h · VIP arrives today.               │
│  Protect 4.8★ · ₹1.8L lifetime value.                │
│                                                      │
│  ● CRM Complaint #1847 · ● Calendar VIP 2 PM        │
│                                                      │
│  Call guest · room move or F&B comp                  │
│                                                      │
│  [Act] [Delegate] [Defer] [Dismiss] [Why?]         │
└──────────────────────────────────────────────────────┘
```

## Mobile

```
┌─────────────────────────────┐
│ P1 · CX          94% TODAY  │
│                             │
│ Resolve guest complaint     │
│ before VIP 2 PM             │
│                             │
│ Room 305 · 9h open          │
│ Protect 4.8★ rating         │
│                             │
│ [Act Now]                   │
│ [Delegate] [Defer] [More ▾] │
└─────────────────────────────┘
```

Mobile defaults to **hero recommendation only**; full queue accessible via "See all recommendations."

## Expanded "Why?" Drawer

Includes full explainability (Section 7), root cause, historical examples, dependency graph, and confidence breakdown.

---

# 7. Explainability

Every recommendation must answer six executive questions before publication.

## Mandatory Questions

| Question | Required Output |
|----------|-----------------|
| **Why now?** | Time sensitivity: deadline, deterioration rate, calendar event, seasonality |
| **Why me?** | Executive role relevance: only CEO-appropriate recs surface to CEO; delegatable items labelled |
| **Why this?** | Why this recommendation over alternatives; suppressed alternatives listed internally |
| **What evidence supports it?** | Evidence objects with source, timestamp, value, delta |
| **What happens if ignored?** | Risk statement with quantified impact where possible |
| **Expected outcome** | Benefit statement with measurement criteria |
| **Confidence** | Score + breakdown + missing data disclaimer |

## Explainability Bundle

```
RecommendationExplanation {
  recommendation_id
  why_now
  why_me
  why_this
  evidence[]
  if_ignored { risk_level, impact_statement, horizon }
  expected_outcome { benefit, measurement_kpi, measurement_window }
  confidence { score, breakdown[], missing_data[] }
  alternatives_considered[]   // internal · V2 executive-visible
  generated_at
  engine_version
}
```

## Anti-Patterns (Never Shown)

- "Metrics declined" without specifying which metric  
- "Consider reviewing marketing" without specific action  
- Recommendations citing AI inference without labelling  
- Confidence of 100% when data is incomplete  

---

# 8. Recommendation Types

Types describe **when** action is needed — orthogonal to **category** (what domain).

| Type | Horizon | Surfacing | Example |
|------|---------|-----------|---------|
| **Immediate** | < 2 hours | Push + Brief hero | Guest complaint before VIP arrival |
| **Today** | Same business day | Brief + Command Center | Approve supplier payment |
| **This Week** | 1–7 days | Command Center | Refresh ad creative |
| **This Month** | 8–30 days | Weekly digest | Renegotiate vendor contract |
| **Strategic** | 30+ days | Monthly review | Enter new market segment |
| **Preventive** | Before predicted event | Brief when forecast triggers | Staff up before predicted occupancy spike |
| **Predictive** | Forecast-derived (V2+) | Labelled "Predicted" | "Sessions likely −15% next week — act now" |

## Type Interaction with Prioritization

- **Immediate** receives Urgency floor of 95  
- **Strategic** receives Urgency cap of 40 unless manually promoted  
- **Predictive** requires Confidence ≥ 75% and "prediction" badge  
- **Preventive** linked to Trend Engine forecast evidence  

---

# 9. Learning Engine

The Learning Engine closes the loop between executive behaviour and recommendation quality. **Dismissal is data. Acceptance without outcome is incomplete data.**

## Executive Feedback Signals

| Signal | Capture Method | Learning Use |
|--------|----------------|--------------|
| **Accepted** | "Act Now" · task created · explicit accept | Reinforce pattern · boost category weight |
| **Rejected** | "Dismiss" + optional reason | Suppress similar signals 72h–30d |
| **Deferred** | Snooze with date/condition | Resurface with Urgency boost at due time |
| **Ignored** | Recommended but no interaction 7d | Reduce ORS for similar low-engagement patterns |
| **Modified** | Executive edits suggested action | Capture preferred action phrasing |
| **Delegated** | Assign to team member | Learn role routing · reduce "why me" misfires |
| **Outcome tracked** | KPI delta post-action | Validate impact model · adjust scoring |

## Rejection Reason Taxonomy

- Not relevant to my role  
- Already handled  
- Incorrect data / disagree with evidence  
- Not urgent  
- Bad suggestion / too vague  
- Other (free text)

Free-text feeds V2 NLP clustering; V1 uses taxonomy counts only.

## Outcome Measurement

| Category | Measurement Window | Success KPI |
|----------|-------------------|-------------|
| Revenue / Pricing | 7–14 days | Revenue delta vs counterfactual baseline |
| Marketing | 7 days | ROAS, sessions, conversion |
| Customer Experience | 48 hours | Complaint resolved · rating preserved |
| Finance | 1–3 days | Cash collected · payment made |
| Operations | 24–72 hours | Occupancy · SLA restored |
| Strategic | 30–90 days | OKR progress |

## Learning Loop (Batch + Event)

```
Executive Action
      │
      ▼
Outcome Measurement (scheduled)
      │
      ▼
Impact Model Update (was predicted benefit accurate?)
      │
      ▼
Prioritization Weight Adjustment (bounded ±5% per cycle)
      │
      ▼
Pattern Library Update (success templates · suppression rules)
      │
      ▼
Next Recommendation Cycle
```

**Governance:** Learning adjusts **ranking and suppression** — never auto-publishes new recommendation types without human review (V1). V2 introduces ML ranking with audit trail.

## Continuous Improvement Metrics

- Acceptance rate by category  
- Rejection reason distribution  
- Predicted vs actual benefit variance  
- Time-to-action after recommend  
- Repeat rejection rate (same pattern)  

---

# 10. AI Reasoning

AI assists recommendation **narrative, root cause inference, and conflict resolution** — it does not replace deterministic detection and validation.

## Reasoning Stack

```
Provider Signals + Health + Trends + Alerts
              │
              ▼
    Deterministic Candidate Generation (rules + thresholds)
              │
              ▼
    Evidence Assembly (structured · no LLM)
              │
              ▼
    Validation Gate (completeness · confidence floor · dedup)
              │
              ▼
    Prioritization Engine (ORS · deterministic)
              │
              ▼
    AI Narration Layer (summary · root cause · optional)
              │
              ▼
    Post-Validation (citation check · fallback to template)
              │
              ▼
    Published Recommendation
```

## Evidence Gathering

- All evidence from structured provider contributions — no LLM data retrieval at V1  
- Cross-reference minimum 1 primary metric + 1 contextual signal when available  
- Calendar and record evidence linked by ID, not description alone  

## Reasoning Chain

AI may construct ** labelled inference chains**:

1. **Fact:** Sessions −8% WoW (GA4)  
2. **Fact:** Meta campaign CTR −12% (Marketing Provider)  
3. **Inference:** Traffic decline likely campaign-driven, not seasonal  
4. **Recommendation:** Refresh creative on Campaign X  

Steps 1–2 are evidence. Step 3 is labelled inference (max confidence 75%). Step 4 is validated against business rules.

## Business Rules (Deterministic Guardrails)

- Never recommend terminating staff without HR workflow  
- Never recommend legal action  
- Financial recommendations above ₹X require Finance Provider evidence  
- Guest-facing actions require Hospitality or CRM evidence  
- Compliance recommendations require Compliance category evidence  
- Maximum 1 pricing recommendation per day (avoid whiplash)  

## Confidence Calculation

```
Recommendation Confidence =
  Evidence Completeness     (35%)
+ Source Reliability        (25%)
+ Cross-Provider Agreement  (15%)
+ Historical Pattern Match  (10%)   // V2
+ AI Validation Pass        (10%)
+ Data Freshness            (5%)
```

Recommendations below **60% confidence** do not publish to Brief (logged internally). Below **40%** discarded entirely.

## Conflict Resolution

When two candidates conflict (e.g. "Cut marketing spend" vs "Increase ad budget"):

1. Merge into single recommendation with alternatives in explainability  
2. Rank by ORS; suppress lower unless categories differ materially  
3. AI narrates trade-off — executive decides  
4. Log conflict for learning engine  

## Human Override

Executives may:

- **Promote** a lower-ranked recommendation to Priority 1 (logged · not learned until outcome)  
- **Permanently suppress** a category or pattern (admin setting)  
- **Edit** suggested action (capture for learning)  
- **Flag incorrect** — triggers evidence re-fetch and engine audit  

Override never hidden from audit trail.

---

# 11. APIs

Conceptual contract — implementation aligned with ES-029 and ES-065.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| `ProviderDashboardContribution[]` | Orchestrator · Provider Framework | Yes |
| `PlatformHealthSnapshot` | EC-002 Health Engine | Yes |
| `RiskSnapshot` | EC-002 Risk Detection | Optional |
| `OpportunitySnapshot` | EC-002 Opportunity Engine | Optional |
| `TrendSnapshot` | Trend Engine | Optional (V2) |
| `AlertSnapshot` | Alert Engine | Optional |
| `ExecutiveFeedback[]` | Learning store | Optional |
| `OrganisationRecommendationConfig` | Configuration | Yes (defaults) |
| `ExecutiveProfile` | Identity / role service | Optional (V2) |

## Outputs

| Output | Consumer |
|--------|----------|
| `RecommendationSnapshot` | Brief · Command Center · Dashboard |
| `RankedRecommendation[]` | All executive surfaces |
| `RecommendationExplanation` | Card "Why?" drawer |
| `RecommendationHistory` | Audit · learning · reports |
| `RecommendationOutcome` | Learning engine |
| `RecommendationEvent[]` | Event bus · analytics |

## Events

| Event | Trigger | Subscribers |
|-------|---------|-------------|
| `recommendation.generated` | Candidate validated | Cache · Brief composer |
| `recommendation.published` | Surfaced to executive | UI · notification |
| `recommendation.reviewed` | Any executive interaction | Learning engine |
| `recommendation.accepted` | Act / explicit accept | Task service · audit |
| `recommendation.completed` | Action marked done | Outcome measurement |
| `recommendation.outcome.measured` | KPI delta computed | Learning engine |
| `recommendation.conflict.detected` | Internal · conflict resolver | Audit log |

## Caching

| Key | TTL | Invalidation |
|-----|-----|--------------|
| `rec:snapshot:{orgId}` | 15 min | Provider sync · health change |
| `rec:explanation:{recId}` | Immutable per version | New evidence |
| `rec:suppression:{orgId}` | 72h rolling | Expiry · override |
| `rec:learning:weights:{orgId}` | 24h | Batch learning cycle |

## Versioning

- Each recommendation carries `engine_version` and `model_version` (AI layer)  
- Explanation bundles versioned; prior versions retained for audit  
- Scoring weight changes logged with effective date  
- Breaking schema changes require ES-029 alignment review  

---

# 12. Security

## Tenant Isolation

- Recommendations scoped to `organisation_id`  
- Evidence references validated against tenant provider registry  
- Cross-tenant pattern learning uses anonymised aggregates only (V3) · never raw evidence  

## Audit Trail

| Event | Retained |
|-------|----------|
| Recommendation generated | 2 years |
| Published / reviewed / acted | 2 years |
| Explanation viewed | 1 year |
| Override / suppress | Permanent |
| Scoring weight change | Permanent |
| AI narration validation result | 2 years |

## Recommendation History

- Full history searchable by executive (filtered by role)  
- Export for governance review (PDF/CSV V2)  
- PII in evidence redacted in exports per data policy  

## Decision History

- Links recommendation → executive action → outcome  
- Supports "what did we decide and what happened?" board queries  
- Immutable append-only log  

---

# 13. Performance

## Generation Latency

| Operation | Target (P95) |
|-----------|--------------|
| Candidate detection (full pipeline) | ≤ 2s |
| Validation + prioritization | ≤ 500ms |
| Snapshot serve (cached) | ≤ 150ms |
| Explanation bundle | ≤ 300ms |
| AI narration (V2, streaming) | ≤ 2s after deterministic |

## Refresh Strategy

| Trigger | Behaviour |
|---------|-----------|
| Morning Brief open | Full regenerate if cache stale |
| Provider sync complete | Invalidate affected categories |
| Health domain degradation | Regenerate Risk + Operations candidates |
| Executive action | Invalidate learning cache only |
| Scheduled | Every 15 min business hours |

## Caching

- L1: Request-scoped (orchestrator pipeline)  
- L2: Organisation snapshot (15 min)  
- L3: Historical outcomes (persistent)  

## Scalability

- Candidate generation parallelised by category  
- Validation is CPU-light; prioritization O(n log n) for typical n < 200 candidates  
- Learning batch runs off-peak  
- Event-driven invalidation avoids full recompute where possible  

---

# 14. KPIs

## Recommendation Quality

| KPI | Definition | V1 Target |
|-----|------------|-----------|
| **Evidence Coverage** | Published recs with ≥ 1 validated evidence | 100% |
| **Explainability Completeness** | Recs answering all 6 questions | 100% |
| **False Positive Rate** | Rejected as "incorrect data" or "not relevant" | ≤ 15% |
| **Duplicate Rate** | Recs flagged as duplicate by executive | ≤ 5% |
| **Confidence Calibration** | Predicted confidence vs outcome success correlation | ≥ 0.7 (V2) |

## Executive Impact

| KPI | Definition | V1 Target |
|-----|------------|-----------|
| **Acceptance Rate** | Act + Delegate / Published | ≥ 40% |
| **Decision Quality** | Executive self-rated confidence post-action | ≥ 4.0 / 5 |
| **Business Value Delivered** | Measured positive outcome / Accepted | ≥ 50% |
| **Time Saved** | Reduction in priority-setting time | 25 min / day |
| **Executive Satisfaction** | In-app CSAT for recommendation system | ≥ 4.2 / 5 |
| **Time to Action** | Median hours from publish to accept | ≤ 4h (Immediate/Today) |

## Anti-Metrics

- Do not optimise for recommendation volume  
- Do not optimise for notification open rate  
- Do not penalise low acceptance if evidence quality is high (executives may correctly reject)  

---

# 15. Future Vision

## Predictive Recommendations (V2)

- "Occupancy likely to miss target Friday — increase OTA promotion now"  
- Forecast evidence required · labelled Predictive · confidence ≥ 75%  

## Cross-Company Benchmarking (V3)

- "Properties in your cohort that refreshed creative saw +11% sessions"  
- Anonymised cooperative · opt-in only  

## Simulation (V2)

- "If you implement this pricing recommendation, modelled revenue impact +₹3.2L/week"  
- Deterministic scenario engine · not LLM guess  

## "What If" Analysis (V3)

- Executive adjusts levers · recommendation engine recalculates ranked actions  
- Saved scenarios for leadership meetings  

## Board Recommendations (V3)

- Curated subset for board prep: strategic category only  
- Export with evidence appendix  
- Redaction controls for sensitive operations data  

## Investor Recommendations (V3)

- Growth and financial categories mapped to investor narrative  
- Configurable for fundraising vs operational investor updates  

## Industry-Specific Intelligence (V2+)

| Vertical | Specialised Recommendation Patterns |
|----------|--------------------------------------|
| **Hospitality** | Occupancy-pricing-staffing dynamic recommendations |
| **SaaS** | Churn-save · expansion · usage-drop interventions |
| **Retail** | Inventory-markdown-promotion triangulation |
| **Professional Services** | Utilisation · pipeline · delivery risk |

Templates ship as ORION Plugin Marketplace extensions with declared permissions.

---

# Appendix A — ORION Intelligence Stack Position

```
Providers → Orchestrator
                │
                ├── Health Engine (EC-002) ──► risk + opportunity signals
                ├── Trend Engine (ES-031) ──► temporal evidence
                ├── Alert Engine (ES-030) ──► problem signals (not recommendations)
                │
                ▼
        Recommendation Engine (EC-003)
                │
                ├── Morning Brief (EC-001) · top 3
                ├── Command Center · full queue
                ├── Workspaces · category-filtered
                └── Learning Engine · feedback loop
```

| Document | Relationship |
|----------|--------------|
| **EC-001 Morning Brief** | Surfaces hero recommendations |
| **EC-002 Business Health** | Supplies health-linked candidates |
| **ES-029 Recommendation Engine** | Engineering implementation target |
| **ES-030 Alert Engine** | Upstream signal · not duplicate of EC-003 |

---

# Appendix B — Document Governance

| Field | Value |
|-------|-------|
| **Document ID** | EC-003 |
| **Title** | Executive Recommendation Engine |
| **Owner** | Chief AI Architect |
| **Reviewers** | Founder · Chief Architect · Product · Design |
| **Next Review** | Architecture Review Board |
| **Implementation Specs** | ES-029 · ES-028 · ES-065 (EC-003 alignment pending) |

---

**Status:**  
READY FOR ARCHITECTURE REVIEW

**Version:**  
1.0

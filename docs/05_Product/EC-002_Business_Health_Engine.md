# EC-002 — Business Health Engine

**Executive Capability ID:** EC-002  
**Classification:** Product & Intelligence Architecture Specification  
**Author:** Chief Systems Architect · AI Intelligence Engineer  
**Audience:** Founder · Chief Architect · Product · Design · Engineering · Data Science  
**Related:** [ES-032](../02_Engineering/ES-032-Business-Health-Engine.md) · [EC-001](./EC-001_Morning_Executive_Brief.md) · [ES-029](../02_Engineering/ES-029-Recommendation-Engine.md) · [ES-030](../02_Engineering/ES-030-Alert-Engine.md) · [ES-031](../02_Engineering/ES-031-Trend-Engine.md) · [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) · [ORION Constitution](../00_PROJECT/ORION_CONSTITUTION.md)

---

> **North Star Principle**
>
> *Every health score must be explainable in one sentence — and defensible in a board meeting.*

---

# 1. Vision

## Purpose

The Business Health Engine is the **intelligence core of ORION**. It continuously evaluates the overall condition of an organisation by synthesising signals from every connected provider, workspace, and intelligence engine into a single, trustworthy judgment of business health.

It does not report data. It **interprets** data.

Its job is to answer the executive's most fundamental question:

> *"How is my business doing — and why?"*

## Business Value

| Stakeholder | Value |
|-------------|-------|
| **Executive** | One authoritative health judgment instead of reconciling conflicting KPIs across systems |
| **Leadership Team** | Shared vocabulary for business condition — reduces meeting time spent on "what does the number mean?" |
| **ORION Platform** | Central intelligence layer that every surface (Brief, Command Center, workspaces, alerts) references |
| **Investors / Board (V3)** | Auditable, evidence-backed health narrative for governance reporting |

Quantifiable hypothesis: executives currently hold a **mental model** of business health that updates inconsistently — often lagging reality by 24–72 hours. The Health Engine targets **≤ 15-minute signal latency** for material domain changes with **100% evidence traceability**.

## Executive Outcome

After engaging with Business Health, the executive can state:

1. **Overall condition** — numeric score, status band, and trend direction  
2. **Primary reason** — the top driver explaining the score in plain language  
3. **What changed** — material deltas since yesterday, last week, and last month  
4. **Biggest risk** — the domain or metric most likely to degrade health if ignored  
5. **Biggest opportunity** — the domain where action yields disproportionate improvement  
6. **Recommended next step** — one action linked to evidence, not intuition  

The executive never sees a mysterious "AI Score." Every point traces to a metric, a provider, and a timestamp.

## Design Philosophy

| Principle | Meaning |
|-----------|---------|
| **Explainability over precision** | A slightly imprecise score with clear reasoning beats a perfect black box |
| **Evidence before inference** | Deterministic calculation first; AI narration second |
| **Confidence is mandatory** | No score without a confidence indicator and data quality disclosure |
| **Domains before dashboards** | Health is multidimensional — collapse only at the executive summary layer |
| **Degrade gracefully** | Missing providers reduce confidence, never fabricate health |
| **Temporal context always** | A score without trend is a snapshot without meaning |
| **Action-linked output** | Health that does not connect to a recommendation is incomplete |

## Why ORION Uses Health Instead of Dashboards

Dashboards answer **"What is happening?"** — they display metrics and expect the executive to interpret them.

Health answers **"What does it mean?"** — it synthesises metrics into a judgment with reasoning.

| Dashboard | Business Health |
|-----------|-----------------|
| Shows 47 KPIs | Shows 1 score + 5 drivers |
| Requires expertise to interpret | Requires no statistical literacy |
| Static until refreshed manually | Continuously evaluated with freshness metadata |
| No confidence indicator | Always shows certainty level |
| No recommended action | Links to Recommendation Engine |
| Optimised for analysts | Optimised for executives |

ORION is an **Executive Operating System**, not a BI tool. Health is the operating system's **vital signs monitor** — the first thing checked, not the deepest thing explored.

---

# 2. Health Philosophy

Business Health is not a single number. It is a **multidimensional model of organisational vitality** — the capacity to deliver on commitments today while remaining resilient tomorrow.

Each dimension below represents a **Health Domain** in the ORION model. Domains are independently scored, weighted, and explainable.

## Business Health

The composite judgment of organisational condition. Aggregates all domain scores into Overall Health with confidence-adjusted weighting. Represents *"Can this business execute its plan today?"*

## Operational Health

The ability to deliver products and services reliably. Signals: occupancy, fulfilment rate, SLA adherence, inventory availability, process cycle time, facility status. Critical for hospitality, logistics, and service businesses.

## Financial Health

The ability to fund operations and meet obligations. Signals: revenue vs plan, margin, cash position, receivables aging, payables due, burn rate, working capital ratio.

## Marketing Health

The ability to attract and convert demand efficiently. Signals: traffic trend, conversion rate, ROAS, CAC, campaign performance, channel mix, creative fatigue.

## Sales Health

The ability to convert pipeline into revenue. Signals: pipeline velocity, win rate, deal stage aging, forecast accuracy, average deal size, sales cycle length.

## Customer Health

The quality and stability of customer relationships. Signals: NPS, CSAT, complaint volume, resolution time, churn rate, repeat purchase rate, sentiment trend.

## People Health

The capacity and stability of the workforce. Signals: absence rate, attrition, open roles, employee escalations, training completion, engagement pulse (when available).

## Growth Health

The trajectory toward strategic expansion. Signals: new customer acquisition, market share proxy, product adoption, geographic expansion, pipeline growth rate, revenue growth vs market.

## Risk Health

The inverse measure of unresolved threats. Signals: critical alert count, severity-weighted risk score, overdue compliance items, concentration risk (single customer, single channel), insurance of business continuity.

## Compliance Health

Adherence to regulatory, contractual, and policy obligations. Signals: audit findings, license renewals due, tax filing status, data protection compliance, contractual SLA breaches.

## Technology Health

The reliability and security of systems enabling the business. Signals: integration uptime, sync failure rate, security incidents, technical debt indicators, provider health from Integration Center.

## Brand Health

External perception and reputation. Signals: review scores, rating trends, social sentiment, media mentions, brand search volume, complaint-to-praise ratio.

## Sustainability

Long-term resource and responsibility stewardship (V2+). Signals: energy cost trend, waste metrics, supply chain ethics flags, ESG commitments vs progress. Weight configurable by industry.

## Future Readiness

Capacity to adapt to change. Signals: innovation pipeline, skills gap analysis, technology adoption, scenario preparedness, dependency on single providers or markets.

---

# 3. Executive Health Model

The Health Engine uses a **five-layer hierarchical model**. Each layer is independently auditable. Executives interact primarily at Layers 1–3; Layers 4–5 exist for engineering, governance, and drill-down.

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — OVERALL HEALTH                                       │
│  Single composite score (0–100) · Status band · Trend · Confidence│
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  LAYER 2 — CATEGORY HEALTH                                      │
│  14 domain scores · each with weight · trend · confidence        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  LAYER 3 — METRIC HEALTH                                        │
│  Individual KPI normalised scores · threshold state · delta      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  LAYER 4 — EVIDENCE                                             │
│  Structured facts · provider id · timestamp · raw value · rule   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  LAYER 5 — RAW DATA                                             │
│  Provider contributions · API responses · workspace computations │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Interaction Rules

- **Overall Health** never overrides a **Critical** domain without explicit escalation flag  
- **Category Health** cannot exceed confidence cap imposed by missing providers  
- **Metric Health** uses normalised z-scores against rolling baseline (30-day default)  
- **Evidence** is immutable once recorded for a snapshot; corrections create new evidence entries  
- **Raw Data** is never displayed to executives; always mediated through Evidence layer  

## Status Bands

| Band | Score Range | Label | Executive Meaning |
|------|-------------|-------|-----------------|
| **Excellent** | 90–100 | Thriving | Exceeding plan; protect and scale |
| **Good** | 80–89 | Healthy | On track; optimise selectively |
| **Stable** | 70–79 | Stable | Acceptable; monitor trends |
| **Watch** | 60–69 | Attention | Emerging pressure; investigate |
| **At Risk** | 45–59 | At Risk | Material degradation; act this week |
| **Critical** | 0–44 | Critical | Immediate executive intervention |

Platform V1 maps to three-band simplification (`healthy` · `attention` · `critical`) for UI consistency; six-band taxonomy applies in drill-down and board reports.

---

# 4. Categories

## Category Definition Template

Each category includes: **Weight** · **Purpose** · **Primary KPIs** · **Dependencies** · **Confidence factors** · **Thresholds**

---

### Financial Health

| Attribute | Definition |
|-----------|------------|
| **Weight (V1 default)** | 22% |
| **Purpose** | Can the business meet obligations and sustain operations? |
| **Primary KPIs** | Revenue vs plan · Gross margin · Cash balance · DSO · Overdue receivables · Overdue payables |
| **Dependencies** | Finance Provider · ERP · Payment gateway |
| **Confidence** | Reduced if finance provider mock; −20% if cash data > 24h stale |
| **Thresholds** | Critical if cash < 14-day runway; Watch if revenue > 10% below plan |

---

### Operational Health

| Attribute | Definition |
|-----------|------------|
| **Weight** | 18% |
| **Purpose** | Can the business deliver today? |
| **Primary KPIs** | Occupancy · Fulfilment rate · SLA breaches · Inventory stockouts · Open maintenance tickets |
| **Dependencies** | Hospitality Provider · PMS · Inventory · ERP |
| **Confidence** | −15% per missing ops provider |
| **Thresholds** | Critical if occupancy > 15% below forecast; Watch if SLA breach rate > 5% |

---

### Customer Health

| Attribute | Definition |
|-----------|------------|
| **Weight** | 14% |
| **Purpose** | Are customers satisfied and retained? |
| **Primary KPIs** | NPS · Complaint count · Resolution time · Churn rate · Repeat rate |
| **Dependencies** | CRM Provider · Review platforms · Support system |
| **Confidence** | −10% if sentiment data unavailable |
| **Thresholds** | Critical if unresolved critical complaint > 8h; Watch if NPS drops > 5 pts |

---

### Marketing Health

| Attribute | Definition |
|-----------|------------|
| **Weight** | 12% |
| **Purpose** | Is demand generation efficient? |
| **Primary KPIs** | Sessions trend · Conversion rate · ROAS · CAC · Bounce rate |
| **Dependencies** | GA4 · Google Ads · Meta Ads · Marketing Provider |
| **Confidence** | GA4 live = full; mock = capped at 60% |
| **Thresholds** | Watch if sessions −10% WoW; Critical if ROAS < breakeven for 7 days |

---

### Sales Health

| Attribute | Definition |
|-----------|------------|
| **Weight** | 12% |
| **Purpose** | Is pipeline converting to revenue? |
| **Primary KPIs** | Pipeline value · Win rate · Stage velocity · Forecast accuracy |
| **Dependencies** | CRM Provider · Salesforce · HubSpot |
| **Confidence** | −15% if pipeline data > 48h stale |
| **Thresholds** | Watch if forecast miss > 15%; Critical if top deal stalled > 14 days |

---

### People Health

| Attribute | Definition |
|-----------|------------|
| **Weight** | 6% |
| **Purpose** | Does the team have capacity and stability? |
| **Primary KPIs** | Absence rate · Attrition · Open roles · Escalation count |
| **Dependencies** | HR Provider · Calendar · Email |
| **Confidence** | Often lowest coverage; default 50% until HR connected |
| **Thresholds** | Watch if absence > baseline + 20%; Critical if key role vacancy > 30 days |

---

### Growth Health

| Attribute | Definition |
|-----------|------------|
| **Weight** | 6% |
| **Purpose** | Is the business expanding sustainably? |
| **Primary KPIs** | Revenue growth rate · New customers · Market share proxy · Pipeline growth |
| **Dependencies** | Finance · CRM · Marketing · Trend Engine |
| **Confidence** | Requires ≥ 2 providers |
| **Thresholds** | Watch if growth < plan for 2 consecutive periods |

---

### Risk Health

| Attribute | Definition |
|-----------|------------|
| **Weight** | 5% (inverse scoring) |
| **Purpose** | How much unresolved threat exists? |
| **Primary KPIs** | Critical alert count · Risk severity score · Concentration index |
| **Dependencies** | Alert Engine · All domain providers |
| **Confidence** | High when alert engine active |
| **Thresholds** | Each unresolved critical alert applies −5 to −15 penalty to Overall Health |

---

### Compliance Health

| Attribute | Definition |
|-----------|------------|
| **Weight** | 3% |
| **Purpose** | Are obligations met? |
| **Primary KPIs** | Overdue filings · Audit findings · License expiry · Policy breaches |
| **Dependencies** | Compliance module · Calendar · Document store |
| **Confidence** | Manual attestation acceptable at V1 |
| **Thresholds** | Critical if regulatory deadline < 7 days unresolved |

---

### Technology Health

| Attribute | Definition |
|-----------|------------|
| **Weight** | 2% |
| **Purpose** | Are systems reliable and secure? |
| **Primary KPIs** | Provider sync success · Integration uptime · Security incidents |
| **Dependencies** | Integration Center · Provider Manager · Orchestrator |
| **Confidence** | Derived from platform observability |
| **Thresholds** | Watch if > 2 providers in error state |

---

### Brand Health

| Attribute | Definition |
|-----------|------------|
| **Weight** | 2% |
| **Purpose** | Is external perception strong? |
| **Primary KPIs** | Review rating · Rating trend · Sentiment score · Response rate |
| **Dependencies** | Review APIs · Social listening (V2) |
| **Confidence** | −20% without review data |
| **Thresholds** | Critical if rating drops below 4.0 with ↑ complaint volume |

---

### Sustainability · Future Readiness

| Attribute | Definition |
|-----------|------------|
| **Weight** | 0% V1 · configurable V2+ |
| **Purpose** | Long-horizon stewardship and adaptability |
| **Primary KPIs** | ESG progress · Skills gap · Innovation pipeline · Scenario readiness |
| **Dependencies** | Custom providers · manual input |
| **Confidence** | Manual / partial until providers connected |
| **Thresholds** | Organisation-defined |

**Note:** V1 active weight total = 100% across Financial, Operational, Customer, Marketing, Sales, People, Growth, Risk, Compliance, Technology, Brand. Sustainability and Future Readiness activate in V2 industry templates.

---

# 5. Score Calculation

## Weighted Composite Model

```
Overall Health Score =
  Σ (Category Score × Category Weight × Category Confidence)
  − Risk Penalties
  − Critical Alert Penalties
  normalized to 0–100
```

Category weights are **organisation-configurable** via industry templates:

| Template | Financial | Operational | Customer | Marketing | Other |
|----------|-----------|-------------|----------|-----------|-------|
| **Hospitality (default)** | 22% | 18% | 14% | 12% | 34% |
| **SaaS** | 20% | 8% | 18% | 20% | 34% |
| **Retail / Commerce** | 24% | 12% | 16% | 16% | 32% |
| **Professional Services** | 18% | 10% | 20% | 10% | 42% |

## Rolling Averages

| Window | Use |
|--------|-----|
| **3-day EMA** | Smooth daily volatility for metric scores |
| **7-day rolling** | Category trend direction |
| **30-day baseline** | Normalisation reference for z-scores |
| **90-day rolling** | Seasonal context comparison |

## Moving Trends

Each score carries a **trend vector**:

| Symbol | Meaning | Calculation |
|--------|---------|-------------|
| **↑ Strong** | Improving materially | > +5% vs 7-day prior |
| **↑** | Improving | +2% to +5% |
| **→** | Stable | −2% to +2% |
| **↓** | Declining | −5% to −2% |
| **↓ Strong** | Declining materially | < −5% |

## Confidence Scoring

```
Category Confidence (0–100%) =
  Data Completeness    (40%)
+ Data Freshness       (25%)
+ Source Reliability   (20%)
+ Historical Consistency (10%)
+ Cross-Provider Agreement (5%)
```

**Overall Confidence** = weighted average of active category confidences.

**Display rule:** If Overall Confidence < 60%, show amber "Low confidence" badge alongside score. If < 40%, suppress numeric score — show "Insufficient data" with missing provider list.

## Data Freshness

| Age | Freshness Grade | Confidence Impact |
|-----|-----------------|-------------------|
| < 1 hour | Live | Full |
| 1–4 hours | Recent | −5% |
| 4–24 hours | Stale | −15% |
| > 24 hours | Expired | −30%; metric excluded from calculation |

## Outlier Detection

- Metrics exceeding **3σ from 30-day mean** flagged as anomalies  
- Anomalies trigger **Watch** minimum on affected category  
- Outliers excluded from rolling average until confirmed (executive dismiss or 48h persistence)  
- Documented in Evidence layer as `anomaly_detected: true`  

## Seasonality

- Hospitality: day-of-week and holiday calendar adjustments  
- Retail: festival and sale period baselines  
- B2B: quarter-end and fiscal calendar awareness  
- Seasonality profiles stored per organisation template (V2)  
- V1: weekday vs weekend split for occupancy and traffic metrics  

## Normalisation

Raw KPI values normalised to 0–100 scale:

```
Metric Score = f(actual, baseline, direction, threshold)
  where direction = "higher_is_better" | "lower_is_better"
  capped at 0 and 100
```

Non-linear caps apply for critical thresholds (e.g. cash runway < 7 days → score forced to Critical band regardless of other metrics).

## Historical Comparison

Every health snapshot stores:

- Score vs yesterday  
- Score vs 7 days ago  
- Score vs 30 days ago  
- Score vs same period prior year (when history available)  

Displayed as: *"Health 82 (↑ +4 vs last week)"*

## Peer Comparison (V3)

- Anonymised vertical benchmarks ("Hospitality SMB median: 74")  
- Opt-in data cooperative; never expose identifiable peer data  
- Displayed only when sample size ≥ 30 organisations  

---

# 6. Explainability Engine

The Explainability Engine is not an afterthought — it is a **first-class output** equal to the score itself.

## Mandatory Questions

Every health presentation must answer:

| Question | Output |
|----------|--------|
| **Why?** | Top 3 positive and negative drivers with metric evidence |
| **What changed?** | Delta since last snapshot with magnitude and direction |
| **Compared to what?** | Baseline reference (plan, forecast, 30-day avg, prior period) |
| **What is the impact?** | Business consequence if trend continues (quantified where possible) |
| **How certain are we?** | Confidence score with missing/stale data disclosure |
| **What should be done?** | Link to Recommendation Engine top action for this domain |

## Explainability Bundle Structure

```
HealthExplanation {
  overall_score
  overall_status
  overall_trend
  overall_confidence
  summary_sentence          // ≤ 20 words, human-readable
  primary_drivers[]         // ranked, with evidence ids
  negative_drivers[]
  positive_drivers[]
  changes_since_prior[]     // { metric, delta, period }
  comparisons[]             // { reference, value, delta }
  impact_statements[]       // { domain, consequence, horizon }
  confidence_breakdown      // { factor, value, impact }
  recommended_actions[]     // links to Recommendation Engine
  evidence_refs[]           // traceable to Layer 4
  generated_at
  snapshot_id
}
```

## Summary Sentence Generation

**V1:** Template-based from top drivers.  
**V2:** AI-narrated from evidence bundle with citation validation (same architecture as EC-001 AI Summary).

Example: *"Health is 82 (Healthy) driven by strong occupancy and revenue, partially offset by marketing session decline (−8% WoW)."*

## "Why This Score?" Interaction

Expandable drawer (desktop) · bottom sheet (mobile):

1. Score gauge with trend arrow  
2. Domain breakdown horizontal bars  
3. Top drivers list with drill-to-evidence  
4. Confidence breakdown  
5. Missing data callout  
6. Link to full health history  

---

# 7. Trend Engine

The Trend Engine (ES-031 alignment) provides **temporal intelligence** to the Health Engine. Health without trend is a photograph; trend makes it a story.

## Time Horizons

| Horizon | Granularity | Primary Use |
|---------|-------------|-------------|
| **Daily** | Hourly / daily snapshots | Overnight change detection · Morning Brief |
| **Weekly** | Daily aggregates | Executive weekly rhythm · team standups |
| **Monthly** | Weekly aggregates | Board prep · budget review |
| **Quarterly** | Monthly aggregates | Strategic review · investor reporting |
| **Yearly** | Quarterly aggregates | Annual planning · YoY comparison |

## Forecast

- **7-day health projection** based on current trend momentum (V2)  
- **Scenario label:** "If current trend continues, health reaches 74 by next Friday"  
- Forecast always labelled **projected**, never presented as fact  
- Confidence band displayed (e.g. 74 ± 6)  

## Momentum

```
Momentum = (Current Period Score − Prior Period Score) / Prior Period Score
  classified as: Accelerating · Stable · Decelerating · Reversing
```

## Acceleration

Second derivative of trend — detects **inflection points**:

- "Marketing health was declining but decelerated this week — possible stabilisation"  
- Surfaces in Explainability as `acceleration_signal`  

## Volatility

```
Volatility = standard deviation of daily scores over 14 days
  high volatility → reduce confidence by 5–10%
  display "Unstable" badge if volatility > threshold
```

---

# 8. Risk Detection

The Risk Detection layer continuously evaluates **threat signals** across domains and feeds both Risk Health category and the Alert Engine (ES-030).

## Risk Signal Matrix

| Risk Type | Detection Logic | Severity Escalation |
|-----------|-----------------|---------------------|
| **Revenue risk** | Revenue > 10% below plan for 3+ days | High → Critical if > 20% |
| **Marketing risk** | ROAS below breakeven · sessions −15% WoW | Medium → High if sustained 7d |
| **Occupancy risk** | Occupancy > 10% below forecast | High during peak season |
| **Customer risk** | Unresolved critical complaint · churn spike | Critical immediately |
| **Cash flow risk** | Runway < 30 days · overdue AR > threshold | Critical if runway < 14d |
| **Staff risk** | Key role vacancy · absence spike · escalation | Medium → High if ops impacted |
| **Operational risk** | SLA breach · stockout · facility failure | High if guest-facing |
| **Technology risk** | > 2 providers failing sync · security incident | Medium → Critical if data breach |
| **Legal risk** | Contract dispute · litigation flag · IP issue | Critical when confirmed |
| **Compliance risk** | Filing overdue · audit finding · license expiry | Critical if deadline < 7d |

## Risk Scoring

```
Domain Risk Score = Σ (active_risks × severity_weight × probability_weight)
Overall Risk Penalty = f(domain_risk_scores) applied to Overall Health
```

Risks are **never hidden inside the health score** — they surface as named items in Explainability and as alerts when severity ≥ High.

## Risk Lifecycle

```
Detected → Acknowledged → Mitigating → Resolved → Archived
```

Executive acknowledgement reduces noise but does not remove risk from history.

---

# 9. Opportunity Engine

The Opportunity Engine identifies **positive asymmetry** — domains where action yields disproportionate health improvement.

## Opportunity Types

| Type | Detection Pattern | Example |
|------|-------------------|---------|
| **Growth** | Pipeline expanding · conversion improving · market signal positive | "Pipeline up 18% — scale sales capacity" |
| **Marketing** | Campaign outperforming · channel efficiency improving | "Meta ROAS 5.2× — increase budget 15%" |
| **Pricing** | Demand exceeds supply · occupancy > 90% · price below market | "Raise weekend rates 8–12%" |
| **Efficiency** | Cost per unit declining · process time improving | "Housekeeping efficiency +11%" |
| **Retention** | Repeat rate increasing · churn declining | "Repeat guest rate at 6-month high" |
| **Upselling** | Attach rate opportunity · premium inventory available | "Suite upsell conversion 34% on arrivals" |
| **Cross-selling** | Multi-product penetration gap | "F&B attach rate below benchmark" |
| **Cost reduction** | Vendor renegotiation signal · waste metric spike reversible | "Linens cost 12% above benchmark" |

## Opportunity Scoring

```
Opportunity Score =
  (Potential Impact × 0.40)
+ (Confidence × 0.25)
+ (Effort Inverse × 0.20)
+ (Time Sensitivity × 0.15)
```

Top opportunities feed the Recommendation Engine and appear in Health Explainability as **Improvement Opportunities**.

## Opportunity vs Recommendation

| Layer | Role |
|-------|------|
| **Opportunity Engine** | Detects and scores potential |
| **Recommendation Engine** | Prioritises and actionises |
| **Health Engine** | Reports opportunity impact on domain scores |

---

# 10. Business Health Card

The Business Health Card is the **primary visual surface** for EC-002. It appears in Morning Brief (EC-001), Command Center, and every workspace overview.

## Card Information Hierarchy

1. Overall score (large, central)  
2. Status band + trend arrow  
3. Confidence indicator  
4. Summary sentence  
5. Domain mini-bars (top 5 by weight or anomaly)  
6. "Why this score?" affordance  
7. Top risk · Top opportunity (single line each)  

## Desktop (Card — 480px width)

```
┌────────────────────────────────────────────────────────────┐
│  BUSINESS HEALTH                              Confidence 91%│
│                                                            │
│         ┌─────────────────────────────────┐                │
│         │           82                    │                │
│         │      ████████████░░  Healthy ↑  │                │
│         └─────────────────────────────────┘                │
│                                                            │
│  Revenue and occupancy are strong. Marketing sessions      │
│  declined 8% week-over-week.                               │
│                                                            │
│  Finance    ████████████████░░  88  ↑                      │
│  Operations ██████████████░░░░  84  ↑                      │
│  Customer   █████████████░░░░░  79  →                      │
│  Marketing  ██████████░░░░░░░░  68  ↓                      │
│  Sales      █████████████░░░░░  76  →                      │
│                                                            │
│  ⚠ Top Risk: Guest complaint unresolved · Room 305         │
│  ✦ Top Opportunity: Weekend rate optimisation              │
│                                                            │
│  [Why this score?]              Updated 6:42 AM · 5 sources│
└────────────────────────────────────────────────────────────┘
```

## Tablet (Card — full width, condensed)

```
┌──────────────────────────────────────────────────┐
│  BUSINESS HEALTH                          91% conf│
│                                                  │
│     82   Healthy ↑     ████████████░░             │
│                                                  │
│  Occupancy strong · Marketing sessions −8%       │
│                                                  │
│  Fin 88↑  Ops 84↑  Mkt 68↓  CRM 79→  Sales 76→  │
│                                                  │
│  ⚠ Guest complaint · Room 305                    │
│  [Why this score?]                               │
└──────────────────────────────────────────────────┘
```

## Mobile (Card — stacked)

```
┌─────────────────────────┐
│ BUSINESS HEALTH    91%  │
│                         │
│        82               │
│     Healthy ↑           │
│   ████████████░░        │
│                         │
│ Occupancy strong.       │
│ Marketing −8%.          │
│                         │
│ Fin 88↑  Ops 84↑       │
│ Mkt 68↓  CRM 79→       │
│                         │
│ ⚠ Guest · Room 305     │
│ [Why this score?]       │
└─────────────────────────┘
```

## Expanded "Why This Score?" (Desktop Drawer)

```
┌────────────────────────────────────────────────────────────┐
│  WHY HEALTH IS 82                                    [×]   │
├────────────────────────────────────────────────────────────┤
│  SUMMARY                                                   │
│  Strong operational and financial performance offset by    │
│  marketing traffic decline and one unresolved guest issue. │
│                                                            │
│  TOP POSITIVE DRIVERS                                      │
│  1. Occupancy 84% (+6 pts vs forecast)     Hospitality     │
│  2. Revenue +8.2% vs plan                  Finance         │
│  3. Pipeline +₹2.1L this week              CRM             │
│                                                            │
│  TOP NEGATIVE DRIVERS                                      │
│  1. Sessions −8% WoW                       GA4             │
│  2. Unresolved guest complaint             CRM             │
│  3. Bounce rate 58% on landing page        GA4             │
│                                                            │
│  COMPARED TO                                               │
│  Yesterday: 80 (+2) · Last week: 78 (+4) · Plan: 80 (+2) │
│                                                            │
│  CONFIDENCE BREAKDOWN                                      │
│  Data completeness 95% · Freshness 98% · Sources 5/7     │
│  Missing: HR Provider · Review Platform                    │
│                                                            │
│  RECOMMENDED ACTION                                        │
│  → Resolve guest complaint before VIP check-in [Act]       │
│                                                            │
│  [View full health history →]                              │
└────────────────────────────────────────────────────────────┘
```

---

# 11. AI Reasoning

AI supports the Health Engine — it does **not replace** deterministic scoring.

## Reasoning Stack

```
Layer 5 — Raw Data
        │
        ▼
Layer 4 — Evidence (deterministic)
        │
        ▼
Layer 3 — Metric Scores (deterministic)
        │
        ▼
Layer 2 — Category Scores (deterministic)
        │
        ▼
Layer 1 — Overall Health (deterministic)
        │
        ▼
Explainability Bundle (template V1 · AI-assisted V2)
        │
        ▼
Executive-Facing Narrative (AI with citation validation)
```

## AI Role Boundaries

| AI May | AI May Not |
|--------|------------|
| Narrate deterministic scores | Calculate or override scores |
| Summarise drivers in plain language | Invent metrics or trends |
| Prioritise narrative emphasis | Hide negative drivers |
| Suggest questions for leadership | Prescribe legal/HR actions |
| Generate board-ready prose (V3) | Access raw data without evidence packet |

## Evidence → Reasoning → Recommendation → Confidence

| Stage | Content |
|-------|---------|
| **Evidence first** | Structured JSON of scores, drivers, deltas, sources |
| **Reasoning second** | AI explains relationships ("Marketing decline may affect weekend occupancy in 5–7 days") — labelled **inference** |
| **Recommendation third** | Linked to Recommendation Engine output with shared evidence IDs |
| **Confidence always** | Every AI sentence tagged with confidence; inferences capped at 75% |

## Inference Labelling

Inferences are visually distinct from facts:

- **Fact:** "Occupancy is 84%" — solid indicator · linked to evidence  
- **Inference:** "Marketing decline may reduce weekend bookings" — dashed indicator · labelled "AI inference"  

Executives must never confuse inference for measurement.

---

# 12. APIs

Conceptual API contract — implementation specified in ES-032 and ES-065 alignment.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| `ProviderDashboardContribution[]` | Provider Framework · Orchestrator | Yes |
| `ProviderHealthReport` | Provider Manager | Yes |
| `AlertSnapshot` | Alert Engine | Optional (V1 partial) |
| `TrendSnapshot` | Trend Engine | Optional (V2) |
| `OrganisationHealthConfig` | Configuration service | Yes (defaults if absent) |
| `PriorHealthSnapshot` | Health History store | Optional (enables delta) |
| `ExecutiveFeedback[]` | Recommendation Engine | Optional (V2 learning) |

## Outputs

| Output | Consumer |
|--------|----------|
| `PlatformHealthSnapshot` | Morning Brief · Command Center · Dashboard |
| `HealthExplanation` | Business Health Card · "Why this score?" |
| `DomainHealthBundle` | Workspace overviews · drill-down |
| `RiskSnapshot` | Alert Engine · Brief Critical Alerts |
| `OpportunitySnapshot` | Recommendation Engine |
| `HealthHistoryRecord` | History service · Board reports |
| `HealthEvent[]` | Event bus · real-time subscribers |

## Events

| Event | Trigger | Subscribers |
|-------|---------|-------------|
| `health.snapshot.generated` | Pipeline completion | Brief Composer · Cache |
| `health.domain.degraded` | Category crosses Watch threshold | Alert Engine · Push |
| `health.domain.recovered` | Category returns to Stable | Brief delta · Notification |
| `health.confidence.low` | Confidence drops below 60% | Integration Center |
| `health.risk.detected` | Risk signal ≥ High | Alert Engine |
| `health.opportunity.detected` | Opportunity score ≥ threshold | Recommendation Engine |

## Caching

| Cache Key | TTL | Invalidation |
|-----------|-----|--------------|
| `health:snapshot:{orgId}` | 15 min | Provider sync · manual refresh |
| `health:explanation:{orgId}:{snapshotId}` | 60 min | Immutable per snapshot |
| `health:history:{orgId}:daily` | 24h | New daily snapshot |
| `health:domain:{orgId}:{domain}` | 15 min | Domain provider update |

## Refresh Frequency

| Trigger | Behaviour |
|---------|-----------|
| **Morning Brief open** | Full pipeline if cache expired |
| **Manual sync** | Force refresh all providers then recalculate |
| **Provider webhook** | Invalidate affected domains only |
| **Scheduled** | Every 15 min during business hours; hourly overnight |
| **Real-time (V2)** | WebSocket push on domain degradation |

## Historical Storage

| Record | Retention |
|--------|-----------|
| Daily health snapshot | 3 years |
| Domain-level detail | 1 year |
| Evidence layer | 90 days (raw); aggregates permanent |
| Explainability bundle | 1 year |
| Risk / opportunity events | 2 years |

Storage aligns with ES-036 Database Persistence Architecture (planned).

---

# 13. Security

## Data Isolation

- Health snapshots scoped to `organisation_id` — no cross-tenant queries  
- Provider contributions validated against tenant provider registry  
- AI evidence packets constructed server-side; never client-assembled  

## Tenant Isolation

- Separate cache namespaces per tenant  
- Health history partitioned by tenant in persistence layer  
- Benchmark peer comparison uses anonymised aggregate only (V3)  

## Audit Logs

| Event | Logged Fields |
|-------|---------------|
| Snapshot generated | orgId · score · confidence · provider versions · timestamp |
| Score viewed | userId · orgId · snapshotId · surface |
| Explanation expanded | userId · snapshotId |
| Config changed | userId · old weights · new weights · approver |
| Manual override (V2) | userId · domain · reason · expiry |

## Explainability Logs

- Every AI-generated narrative stored with evidence packet hash  
- Model version and prompt version recorded  
- Post-validation result (pass/fail/fallback) logged  
- Retained 2 years for AI governance compliance  

---

# 14. Performance

## Expected Response Times

| Operation | Target (P95) |
|-----------|--------------|
| Health snapshot (cached) | ≤ 200ms |
| Health snapshot (cold · full pipeline) | ≤ 3s |
| Explainability bundle | ≤ 500ms (deterministic) |
| AI narrative (V2) | ≤ 2s (streaming after deterministic) |
| History query (30 days) | ≤ 800ms |
| Domain drill-down | ≤ 400ms |

## Caching Strategy

- L1: In-process React cache (request-scoped)  
- L2: Redis / edge cache (organisation-scoped, 15 min)  
- L3: Daily snapshot persistence (historical)  

## Lazy Loading

- Business Health Card renders Layer 1–2 immediately  
- Domain mini-bars load asynchronously  
- "Why this score?" drawer fetches full Explainability on demand  
- AI narrative streams after deterministic content (V2)  

## Real-Time Updates

- V1: Poll on Brief open + manual refresh  
- V2: SSE/WebSocket for domain degradation events  
- Health Card shows "Updated 2 min ago" with live dot when streaming active  

---

# 15. KPIs

## Engine Quality KPIs

| KPI | Definition | V1 Target |
|-----|------------|-----------|
| **Explainability Coverage** | Snapshots with full driver set | 100% |
| **Confidence Accuracy** | Low-confidence flags match missing data | 100% |
| **False Positive Risk Rate** | Risks dismissed as not real | ≤ 12% |
| **Score Stability** | Intra-day variance without material events | ≤ ±3 pts |
| **Evidence Traceability** | Drivers link to valid evidence | 100% |
| **Pipeline Success Rate** | Snapshots generated without error | ≥ 99% |

## Executive Impact KPIs

| KPI | Definition | V1 Target |
|-----|------------|-----------|
| **Decision Quality** | Executive self-rated decision confidence after health review | ≥ 4.0 / 5 |
| **Time Saved** | Reduction in manual KPI reconciliation time | 20 min / day |
| **Recommendation Acceptance** | Health-linked recommendations acted on | ≥ 45% |
| **Executive Engagement** | Health card expanded ("Why this score?") per week | ≥ 3 times |
| **Business Improvement** | Domains in Watch or below that improve within 14 days | ≥ 50% |

## Anti-Metrics

- Do not optimise for score inflation (health should reflect reality)  
- Do not optimise for AI narrative length  
- Do not penalise low scores — low scores with clear explanation are success  

---

# 16. Future Vision

## Predictive Health (V2)

- 7-day and 30-day health forecasts with confidence bands  
- Early warning: "Financial health likely to enter Watch within 10 days"  
- Leading indicator library per industry template  

## Scenario Simulation (V2)

- "What if occupancy drops 10%?" — modelled health impact  
- "What if we increase marketing spend 20%?" — projected ROI on health  
- Sliders for key levers with instant recalculation (deterministic, not AI guess)  

## "What-If" Analysis (V3)

- Multi-variable scenarios saved and compared  
- Integration with financial forecast models  
- Executive can bookmark scenarios for leadership meetings  

## Industry Benchmarking (V3)

- Anonymised peer comparison per domain  
- "Your marketing health is in the 72nd percentile for hospitality SMB"  
- Opt-in cooperative data sharing with privacy preservation  

## Board Reports (V3)

- One-click health report export (PDF / slides)  
- 90-day trend narrative with evidence appendix  
- Audit-ready explainability log attachment  

## Investor Reports (V3)

- Curated health summary for investor updates  
- Configurable redaction of sensitive domains  
- Standardised metrics mapping to investor KPI language  

## Executive Coaching (V3)

- Health trend correlated with executive actions taken  
- Coaching prompts: "When you acted on occupancy recommendations, health improved 6 pts within 14 days"  
- Personalised domain weight suggestions based on business stage  

---

# Appendix A — Relationship to ORION Intelligence Stack

```
Providers → Orchestrator → Health Engine → Brief / Command Center / Workspaces
                │              │
                │              ├── Trend Engine (temporal)
                │              ├── Risk Detection → Alert Engine
                │              └── Opportunity Engine → Recommendation Engine
                │
                └── AI Narration (evidence-grounded · post-deterministic)
```

| Document | Relationship |
|----------|--------------|
| **EC-001 Morning Brief** | Primary consumer of Overall Health + Explainability |
| **ES-032 Business Health Engine** | Engineering implementation spec · alignment target |
| **ES-031 Trend Engine** | Temporal input provider |
| **ES-030 Alert Engine** | Risk output consumer |
| **ES-029 Recommendation Engine** | Opportunity output consumer |

---

# Appendix B — Document Governance

| Field | Value |
|-------|-------|
| **Document ID** | EC-002 |
| **Title** | Business Health Engine |
| **Owner** | Chief Systems Architect |
| **Reviewers** | Founder · Chief Architect · AI Intelligence Lead · Product |
| **Next Review** | Architecture Review Board |
| **Implementation Specs** | ES-032 · ES-031 · ES-065 (EC-002 alignment pending) |

---

**Status:**  
READY FOR ARCHITECTURE REVIEW

**Version:**  
1.0

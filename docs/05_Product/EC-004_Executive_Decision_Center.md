# EC-004 — Executive Decision Center

**Executive Capability ID:** EC-004  
**Classification:** Product & Executive Workflow Architecture Specification  
**Author:** Chief Product Architect · Executive Workflow Designer  
**Audience:** Founder · Chief Architect · Product · Design · Engineering · Legal · Compliance  
**Related:** [EC-001](./EC-001_Morning_Executive_Brief.md) · [EC-002](./EC-002_Business_Health_Engine.md) · [EC-003](./EC-003_Executive_Recommendation_Engine.md) · [ES-015](../02_Engineering/ES-015-Executive-Command-Center.md) · [ES-028](../02_Engineering/ES-028-Executive-Brief-Engine.md) · [ES-029](../02_Engineering/ES-029-Recommendation-Engine.md) · [ORION Constitution](../00_PROJECT/ORION_CONSTITUTION.md)

---

> **North Star Principle**
>
> *Intelligence without decision is noise. Decision without outcome is theatre.*

---

# 1. Executive Vision

## Purpose

The Executive Decision Center is ORION's **Decision Operating System** — the central workspace where intelligence becomes commitment, commitment becomes action, and action becomes measurable business outcome.

Every important recommendation, alert, opportunity, and risk eventually arrives here. The Decision Center is where executives **understand**, **decide**, **delegate**, **monitor**, and **learn** — in one continuous, accountable workflow.

It is not a task manager. Tasks are execution units without strategic context.

It is not a project management tool. Projects organise work; the Decision Center organises **judgment**.

It is the institutional memory of how this organisation decides — and whether those decisions worked.

Its fundamental question:

> *"What must I decide, what happens when I decide, and did we get the result we expected?"*

## Business Value

| Stakeholder | Value |
|-------------|-------|
| **Executive** | Single queue for decisions that matter — no scattered approvals across email, chat, and spreadsheets |
| **Leadership Team** | Shared decision record with evidence, ownership, and outcome — eliminates "I thought we agreed to…" |
| **Organisation** | Faster decision velocity with accountability; patterns of success and failure become visible |
| **Board / Investors (V3)** | Auditable decision trail linked to business impact |
| **ORION Platform** | Completes the intelligence loop: Brief orients → Health interprets → Recommendations propose → **Decision Center commits** |

Quantifiable hypothesis: material business decisions currently take **3–14 days** from signal to delegated action, with **no systematic outcome tracking**. The Decision Center targets **same-day executive review** on Critical items and **≥ 60% measured outcomes** within defined windows.

## Executive Outcome

After using the Decision Center, the executive can:

1. **See every decision awaiting judgment** — prioritised, evidenced, and time-bound  
2. **Decide with clarity** — alternatives compared, risks explicit, confidence visible  
3. **Delegate with precision** — owner, deadline, escalation path, and success criteria attached  
4. **Monitor execution** — without micromanaging — through status and exception signals  
5. **Learn from outcomes** — what worked, what did not, and how future recommendations improve  

The executive closes each session knowing **decisions were made or deliberately deferred** — not accidentally postponed.

## Decision Philosophy

| Belief | Implication |
|--------|-------------|
| **Decisions are assets** | Each decision is recorded, searchable, and measurable |
| **Deferral is valid** | "Not now" with reason beats silent neglect |
| **Delegation is decision** | Assigning ownership is an executive act requiring audit |
| **Outcomes teach** | Unmeasured decisions cannot improve the organisation |
| **Evidence precedes commitment** | No approval without traceable supporting intelligence |
| **AI advises; executives decide** | Advisor never approves on behalf of the executive |
| **Accountability is kindness** | Clear owners and deadlines reduce organisational anxiety |

## Operating Principles

1. **One decision, one record** — merge duplicates; never fragment accountability  
2. **Status is always honest** — stale "In Progress" is worse than "Deferred"  
3. **Critical path visible** — today's decisions above this week's above strategic queue  
4. **Minimal friction to decide** — three taps to approve a prepared decision on mobile  
5. **Maximum friction to hide** — dismissals require reason; overrides are logged  
6. **Execution is monitored, not surveilled** — status updates, not activity tracking  
7. **Learning is institutional** — lessons feed EC-003 weighting and EC-002 health models  
8. **Board-ready by design** — every decision exportable with evidence appendix (V2+)  

## Relationship to ORION Surfaces

| Surface | Role | Relationship to EC-004 |
|---------|------|------------------------|
| **Morning Brief (EC-001)** | Orient | Surfaces top decisions needed today · links to Decision Center |
| **Command Center** | Situational awareness | KPIs and alerts · drill-down into Decision Center |
| **Recommendation Engine (EC-003)** | Propose | Feeds Decision Queue with prepared decision candidates |
| **Business Health (EC-002)** | Interpret | Contextualises urgency and impact |
| **Workspaces** | Domain depth | Source evidence · receive delegated execution |
| **Mission Control** | Team operations | Operational tasks — not executive decisions |

---

# 2. Executive Workflow

The Decision Center implements a **closed-loop executive workflow** from business event to organisational learning.

```
┌─────────────────┐
│  BUSINESS EVENT │  Metric breach · guest complaint · payment due ·
└────────┬────────┘  pipeline stall · compliance deadline · market signal
         │
┌────────▼────────┐
│   AI ANALYSIS   │  Pattern detection · root cause · alternative paths
└────────┬────────┘  (evidence-grounded · inference labelled)
         │
┌────────▼────────────┐
│ HEALTH ASSESSMENT │  EC-002 domain impact · risk severity · urgency
└────────┬────────────┘
         │
┌────────▼──────────────────┐
│ RECOMMENDATION GENERATED  │  EC-003 candidate · validated · prioritised
└────────┬──────────────────┘
         │
┌────────▼────────────┐
│   DECISION QUEUE    │  Ranked decisions awaiting executive review
└────────┬────────────┘
         │
┌────────▼────────────┐
│ EXECUTIVE REVIEW    │  Understand · question · compare alternatives
└────────┬────────────┘
         │
┌────────▼────────────┐
│     DECISION        │  Approve · Reject · Defer · Modify · Escalate
└────────┬────────────┘
         │
┌────────▼────────────┐
│     DELEGATE        │  Owner · team · deadline · success criteria
└────────┬────────────┘
         │
┌────────▼────────────┐
│    EXECUTION        │  Owner acts · status updates · blockers surfaced
└────────┬────────────┘
         │
┌────────▼────────────┐
│    MONITORING       │  Exception alerts · SLA breach · exec dashboard
└────────┬────────────┘
         │
┌────────▼────────────────┐
│  OUTCOME MEASUREMENT    │  Expected vs actual · variance · impact
└────────┬────────────────┘
         │
┌────────▼────────────────┐
│    KNOWLEDGE BASE       │  Lessons learned · pattern library · EC-003 learning
└─────────────────────────┘
```

## Workflow SLAs

| Stage | Critical | High | Medium | Strategic |
|-------|----------|------|--------|-----------|
| Event → Queue | ≤ 5 min | ≤ 15 min | ≤ 1 hr | ≤ 24 hr |
| Queue → Review | Same day | ≤ 2 days | ≤ 7 days | Next review cycle |
| Review → Decision | ≤ 4 hr | ≤ 24 hr | ≤ 3 days | Scheduled session |
| Decision → Delegate | ≤ 1 hr | ≤ 4 hr | ≤ 24 hr | ≤ 3 days |
| Execution → Measured | 48 hr | 7 days | 30 days | 90 days |

---

# 3. Decision Categories

Categories organise the Decision Queue, permissions, outcome windows, and reporting.

| Category | Typical Source | Decision Examples |
|----------|----------------|-------------------|
| **Revenue** | Finance · Commerce · Hospitality | Rate change approval · channel mix shift |
| **Marketing** | GA4 · Ads · Marketing Provider | Campaign pause · budget reallocation |
| **Finance** | Finance Provider · ERP | Payment approval · credit extension · cost cut |
| **Operations** | Hospitality · Inventory | Staffing change · supplier switch · SLA exception |
| **Sales** | CRM | Deal discount · escalation · resource assignment |
| **Pricing** | Revenue · Market data | Dynamic pricing rule · package restructure |
| **Hiring** | HR · People Health | Role approval · offer sign-off · contractor engage |
| **Customer Experience** | CRM · Reviews | Complaint resolution · compensation authority |
| **Hospitality** | PMS · Guest systems | Upgrade authority · overbooking resolution |
| **Compliance** | Compliance module | Filing approval · audit response · policy exception |
| **Technology** | Integration Center | Vendor selection · security exception · integration priority |
| **Strategic** | OKR · Leadership | Market entry · partnership · portfolio change |
| **Board** | Board pack | Resolution prep · governance approval |
| **Investment** | Finance · Strategy | Capex · acquisition · major contract |
| **Risk** | Alert · Health · Risk Engine | Risk acceptance · mitigation plan approval |

## Category Rules

- **Risk** and **Compliance** Critical items bypass queue depth caps  
- **Board** and **Investment** require dual approval workflow (V2)  
- **Hiring** routes additional notification to HR role when RBAC enabled  
- Categories map to EC-003 recommendation categories for seamless promotion  

---

# 4. Decision Object

Every decision in ORION is a **first-class domain object** — durable, auditable, and lifecycle-managed.

## Field Specification

| Field | Requirement | Description |
|-------|-------------|-------------|
| **Decision ID** | Required · immutable | `dec-{org}-{uuid}` |
| **Title** | Required · ≤ 14 words | Decision statement, not topic label |
| **Executive Summary** | Required | 2–3 sentences: situation, choice, stakes |
| **Business Context** | Required | Category · workspace · health link · strategic OKR |
| **Evidence** | Required · ≥ 1 | Structured evidence from EC-003 model |
| **Supporting Metrics** | Required | KPIs with value, delta, baseline, source |
| **Alternatives** | Required · ≥ 2 when material | Options considered with pros/cons |
| **Recommended Option** | Required | ORION / analyst suggested path |
| **Expected Outcome** | Required | Measurable success criteria |
| **Estimated Cost** | Optional | Financial or resource cost of chosen path |
| **Expected ROI** | Optional | Quantified return where applicable |
| **Estimated Time** | Required | Decision-to-outcome horizon |
| **Risk Level** | Required | Of chosen path and of inaction |
| **Confidence** | Required · 0–100% | Evidence-backed certainty |
| **Strategic Alignment** | Required | OKR / priority mapping |
| **Owner** | Required post-approval | Accountable executor |
| **Approver** | Required | Executive who decided |
| **Due Date** | Required for delegated | Execution deadline |
| **Dependencies** | Optional | Blocking decisions or data |
| **Attachments** | Optional | Documents, links, board materials |
| **Discussion** | Optional | Threaded executive comments |
| **Decision Status** | Required | Lifecycle state (Section 5) |
| **Outcome** | Post-measurement | Actual result vs expected |
| **Lessons Learned** | Post-measurement | Institutional knowledge capture |

## Promotion from Recommendation

When EC-003 recommendation is accepted, a Decision Object is **auto-instantiated**:

- Evidence, metrics, confidence, and suggested action copy forward  
- Recommendation ID linked for traceability  
- Executive may edit before final approval — edits logged  

## Alternatives Structure

```
Alternative {
  id
  label: "Option A — Approve payment"
  description
  expected_outcome
  estimated_cost
  risk_level
  confidence
  pros[]
  cons[]
  is_recommended: boolean
}
```

Executives may add custom alternatives; AI may propose but never auto-select.

---

# 5. Decision Lifecycle

```
Draft → Pending Review → Approved | Rejected | Deferred
                              │
                    Delegated → In Progress → Completed → Measured → Archived
```

## State Definitions

| State | Description | Executive Action Available |
|-------|-------------|---------------------------|
| **Draft** | Auto-created from recommendation; incomplete | Edit · Submit for review |
| **Pending Review** | Ready for executive judgment | Approve · Reject · Defer · Request info |
| **Approved** | Executive committed to recommended or selected option | Delegate · Self-assign |
| **Rejected** | Declined with reason | Archive · Link to counter-decision |
| **Deferred** | Postponed until date/condition | Set wake date · Add note |
| **Delegated** | Owner assigned · awaiting pickup | Monitor · Reassign · Escalate |
| **In Progress** | Owner executing | Monitor · Comment · Block/unblock |
| **Completed** | Owner marks done · pending measurement | Trigger measurement |
| **Measured** | Outcome recorded vs expected | Add lessons · Archive |
| **Archived** | Closed · searchable in Knowledge Base | View only |

## Transition Rules

- **Pending Review → Approved** requires approver identity + timestamp  
- **Approved → Delegated** requires owner + due date + success criteria  
- **In Progress → Completed** requires owner attestation + optional evidence  
- **Completed → Measured** triggered automatically per category window or manual  
- **Rejected** and **Deferred** require reason (taxonomy + optional free text)  
- State regression (e.g. Completed → In Progress) requires executive override + audit  

---

# 6. Decision Dashboard

The Decision Dashboard is the **home surface** of EC-004 — default route `/decisions` (evolution from Command Center Decision panel).

## Information Hierarchy

1. Decision velocity summary (today · week · overdue)  
2. Critical decisions requiring judgment now  
3. Awaiting approval queue  
4. Delegated work monitor  
5. Recently completed with outcome preview  
6. Business impact scorecard (period)  
7. Decision calendar  

## Desktop (1440px)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  ORION    Executive Decision Center              Today: 4 pending · 2 overdue    [+]  │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ Pending  4  │ │ Critical 2  │ │ Delegated 7 │ │ Done (7d) 12│ │ Impact ↑18% │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                                                          │
│  CRITICAL — DECIDE TODAY                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ ● CX · Resolve Room 305 complaint before VIP 2 PM          Due: 4h   Conf: 94%  │  │
│  │   Evidence: CRM #1847 · Calendar VIP · Health CX driver                          │  │
│  │   [Review Decision]  [Quick Approve]  [Defer]                                     │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ ● Finance · Approve supplier payment ₹1.2L                   Due: EOD  Conf: 88%  │  │
│  │   [Review Decision]  [Quick Approve]  [Defer]                                     │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  AWAITING YOUR APPROVAL (2)          DELEGATED — MONITOR (7)                             │
│  ┌──────────────────────────┐       ┌──────────────────────────────────────────────┐  │
│  │ Marketing · Pause Meta   │       │ Ops · Weekend staffing plan    On track  ●    │  │
│  │ Pricing · Weekend +8%    │       │ Sales · Enterprise follow-up   At risk  ●    │  │
│  └──────────────────────────┘       └──────────────────────────────────────────────┘  │
│                                                                                          │
│  RECENTLY COMPLETED · MEASURED                                                           │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ ✓ Pricing · Weekend rate increase · Outcome: +₹2.4L vs ₹2.1L expected (+14%)     │  │
│  │ ✓ Marketing · Creative refresh · Outcome: CTR +9% (target +8%)                   │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  DECISION CALENDAR — This Week                                                           │
│  Mon: Board prep · Tue: Pricing review · Thu: Q3 strategic (deferred from last week)      │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## Tablet (768px)

```
┌────────────────────────────────────────────┐
│  Decision Center          4 pending        │
├────────────────────────────────────────────┤
│ [Pending 4] [Critical 2] [Delegated 7]     │
│                                            │
│ CRITICAL TODAY                             │
│ ┌────────────────────────────────────────┐ │
│ │ CX · Room 305 · VIP 2 PM    94%       │ │
│ │ [Review] [Approve] [Defer]             │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ Finance · Payment ₹1.2L       88%     │ │
│ │ [Review] [Approve] [Defer]             │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ DELEGATED · 1 at risk                      │
│ Sales · Enterprise deal · overdue 1d       │
│                                            │
│ COMPLETED · +14% vs expected revenue       │
└────────────────────────────────────────────┘
```

## Mobile (390px)

```
┌─────────────────────────┐
│ Decisions        4 pending│
├─────────────────────────┤
│ CRITICAL (2)            │
│                         │
│ ┌─────────────────────┐ │
│ │ Room 305 · VIP 2PM  │ │
│ │ 94% · Decide by 4h  │ │
│ │ [Review] [Approve]  │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Payment ₹1.2L       │ │
│ │ [Review] [Approve]  │ │
│ └─────────────────────┘ │
│                         │
│ [Delegated 7] [Done 12] │
│ [Calendar] [Search]     │
└─────────────────────────┘
```

Mobile optimises for **Critical queue + one-tap approve** on pre-reviewed decisions.

---

# 7. Executive Workspace

The Executive Workspace organises decisions into **action-oriented views** — not folders.

## Today's Decisions

All decisions with horizon = Immediate or Today · sorted by ORS then due time. Default landing tab.

## Critical Decisions

Severity = Critical OR risk-of-inaction = High · bypasses deferral without explicit acknowledgment. Red badge persists until decided or escalated.

## Awaiting Approval

Pending Review state · assigned to current executive as approver. Includes board and investment dual-approval queue (V2).

## Delegated Work

Decisions in Delegated or In Progress where executive is approver (not owner). Shows status chip: On Track · At Risk · Blocked · Overdue.

## Recently Completed

Completed and Measured in last 30 days · outcome variance highlighted · lessons learned preview.

## Business Impact

Rolling scorecard:

| Metric | Period |
|--------|--------|
| Decisions completed | 7d · 30d |
| Measured outcome success rate | 30d |
| Aggregate expected vs actual ROI | 30d |
| Average decision turnaround | 7d |
| Category breakdown | 30d |

## Decision Calendar

Time-based view of: due dates · scheduled strategic reviews · board dates · deferred wake dates · measurement checkpoints. Integrates with Calendar Provider for conflict detection ("Board meeting same day as pricing decision due").

---

# 8. Delegation Engine

Delegation transforms **approval into accountable execution** without losing executive oversight.

## Assign Owner

- Single **accountable owner** (DRI) — not a team  
- Optional **contributors** notified but not accountable  
- Owner must acknowledge within SLA (4h Critical · 24h High · 72h Medium)  
- Unacknowledged delegation escalates to executive  

## Assign Team

- Team assignment creates linked Mission Control tasks (V2) — EC-004 remains decision record  
- Team lead auto-suggested from org chart when available  

## Deadlines

- **Due date** required on delegation  
- **Reminder cadence:** 50% · 80% · 100% of time elapsed  
- **Grace period** configurable per category before Overdue status  

## Escalations

| Trigger | Action |
|---------|--------|
| Owner non-acknowledgment | Notify executive + backup owner |
| Due date passed | Status → Overdue · executive alert |
| Blocked > 24h | Executive review prompt |
| At-risk signal from provider | Exception badge on monitor view |

## Follow-Up

- Executive one-tap **"Request update"** — owner prompted within 4h  
- Owner provides structured update: Progress · Blocker · Revised ETA  
- Updates append to decision Discussion timeline  

## Automatic Reminders

- Owner reminders via in-app · email (opt-in) · push (Critical only)  
- Executive digest: daily delegated summary · exception-only mode available  

## Status Tracking

| Status | Meaning |
|--------|---------|
| **On Track** | Progress aligns with plan |
| **At Risk** | Delay or blocker likely to miss due date |
| **Blocked** | External dependency preventing progress |
| **Overdue** | Due date passed without completion |
| **Completed** | Owner attestation submitted |

---

# 9. Outcome Tracking

Outcome tracking closes the loop between **executive judgment** and **business reality**.

## Expected Result

Captured at approval from Decision Object `expected_outcome` — must include measurable KPI and target value where possible.

Example: *"Guest complaint resolved · NPS maintained ≥ 4.5 · no 1-star review within 7 days"*

## Actual Result

Measured automatically from providers where possible · owner attestation where not:

| Source | Measurement |
|--------|-------------|
| CRM | Complaint status · sentiment |
| GA4 / Finance | Revenue · conversion |
| Hospitality | Occupancy · ADR |
| Reviews | Rating delta |
| Owner | Qualitative attestation with evidence upload |

## Variance

```
Variance = (Actual − Expected) / Expected
  classified: Exceeded · Met · Partial · Missed · Not Measurable
```

Displayed on Recently Completed and Knowledge Base entries.

## Business Impact

Aggregate impact score per decision:

- Revenue impact (INR or %)  
- Cost impact  
- Risk reduced (qualitative score)  
- Customer impact (retention proxy)  
- Time saved  

Feeds **Business Impact** workspace view and EC-002 health historical record.

## Lessons Learned

Structured capture at Measured state:

| Field | Content |
|-------|---------|
| **What worked** | Free text + tagged patterns |
| **What didn't** | Free text |
| **Would decide differently** | Yes/No + note |
| **Recommendation quality** | Was EC-003 advice accurate? |
| **Share with organisation** | Opt-in anonymised pattern |

## Future Recommendation Weighting

Lessons feed EC-003 Learning Engine:

- Successful patterns boost ORS for similar future candidates  
- Missed outcomes increase evidence threshold for similar recommendations  
- "Would decide differently" triggers architecture review if pattern repeats  

---

# 10. AI Decision Advisor

The AI Decision Advisor assists executive judgment — **it never approves, rejects, or delegates autonomously**.

## Capabilities

| Capability | Description |
|------------|-------------|
| **Explain options** | Plain-language comparison of alternatives |
| **Compare alternatives** | Side-by-side: outcome · cost · risk · confidence |
| **Highlight risks** | Downside of each path · risk of inaction |
| **Estimate impact** | Quantified where evidence supports · labelled inference otherwise |
| **Show confidence** | Per-option and overall · missing data disclosed |
| **Answer questions** | "What if we defer 48 hours?" · evidence-grounded responses |
| **Prepare briefing** | One-page decision summary for board or delegate |

## Boundaries

| AI May | AI May Not |
|--------|------------|
| Summarise evidence | Approve or reject decisions |
| Compare alternatives | Assign owners |
| Estimate impact (labelled) | Modify decision records without executive action |
| Suggest questions to ask | Contact external parties |
| Draft delegation brief | Override executive rejection |

## Interaction Model

- **Advisor panel** in decision review screen — conversational but citation-linked  
- Every AI statement maps to evidence ID or labelled inference  
- **"Show your reasoning"** expands chain (mirrors EC-003 Section 10)  
- Fallback to structured comparison table if AI validation fails  

## Confidence Display

- Per-alternative confidence bar  
- Overall recommendation confidence from EC-003  
- "Insufficient data to compare options A and C" when evidence gaps exist  

---

# 11. Collaboration

Executive decisions are rarely solitary — collaboration must be **structured, auditable, and async-first**.

## Executive Notes

- Private notes visible only to author · for pre-decision thinking  
- Not shared with delegate unless explicitly published  

## Comments

- Threaded discussion on decision record  
- @mention owners and approvers  
- Comments immutable · edits create revision entries  

## Approvals

| Workflow | V1 | V2 |
|----------|----|----|
| Single executive approve | Yes | Yes |
| Dual approval (Investment, Board) | — | Yes |
| Sequential approval chain | — | Yes |
| Delegated approval authority | — | Role-based |

## Discussion Timeline

Unified chronological feed:

- Decision created · evidence updated · comment · status change · delegation · owner update · outcome measured  

Exportable for audit.

## Board Review

- **Board category** decisions generate board pack snippet (V2)  
- Evidence appendix · alternatives considered · recommendation · decision draft  
- Export PDF with redaction controls  

## Audit Trail

Immutable log of every state transition, field change, approver identity, and AI advisory interaction. Retained 7 years for Compliance category · 2 years default.

---

# 12. APIs

Conceptual API surface — implementation via Decision Service (future ES alignment).

## Decision API

| Operation | Description |
|-----------|-------------|
| `GET /decisions` | List with filters · pagination |
| `GET /decisions/{id}` | Full decision object + explanation |
| `POST /decisions` | Create (manual or from recommendation) |
| `PATCH /decisions/{id}` | Update draft fields |
| `POST /decisions/{id}/approve` | Approve with selected alternative |
| `POST /decisions/{id}/reject` | Reject with reason |
| `POST /decisions/{id}/defer` | Defer with wake condition |
| `POST /decisions/{id}/delegate` | Assign owner · due date |
| `POST /decisions/{id}/complete` | Mark execution complete |
| `POST /decisions/{id}/measure` | Record outcome |
| `GET /decisions/{id}/timeline` | Audit + discussion feed |

## Workflow API

| Operation | Description |
|-----------|-------------|
| `GET /workflow/queue` | Prioritised decision queue |
| `GET /workflow/critical` | Critical-only view |
| `GET /workflow/delegated` | Monitor view |
| `POST /workflow/escalate/{id}` | Trigger escalation |

## Approval API

| Operation | Description |
|-----------|-------------|
| `POST /approvals/request` | Dual-approval workflow start |
| `POST /approvals/{id}/sign` | Approver signature |
| `GET /approvals/pending` | Awaiting current user |

## Notification API

| Operation | Description |
|-----------|-------------|
| `POST /notifications/subscribe` | Channel preferences |
| `GET /notifications/digest` | Daily executive digest |
| Webhook events | `decision.*` event family |

## Analytics API

| Operation | Description |
|-----------|-------------|
| `GET /analytics/impact` | Business impact scorecard |
| `GET /analytics/turnaround` | Decision velocity metrics |
| `GET /analytics/outcomes` | Success rate by category |
| `GET /analytics/lessons` | Knowledge base search |

## Event Bus (Conceptual)

`decision.created` · `decision.approved` · `decision.delegated` · `decision.completed` · `decision.measured` · `decision.escalated` · `decision.overdue`

Subscribers: EC-003 Learning · Notification Service · Mission Control (V2) · Analytics.

---

# 13. Security

## Role-Based Permissions

| Role | Permissions |
|------|-------------|
| **Executive** | Full approve · delegate · override · view all org decisions |
| **Delegate Owner** | Update assigned decisions · complete · comment |
| **Leadership** | View · comment · approve within domain |
| **Board Viewer** | Read-only Board category |
| **Auditor** | Read-only full trail · export |
| **Operator** | No access to Decision Center by default |

## Executive Privacy

- Private notes encrypted at rest · never in search index  
- Decision visibility scopes: Executive-only · Leadership · Organisation  
- Sensitive categories (Hiring, Investment) restricted by default  

## Audit Logs

- Append-only · tamper-evident hash chain (V2)  
- Captures: who · what · when · before/after state · IP · device  

## Decision History

- Full history searchable by authorised roles  
- Soft-delete prohibited · archive only  

## Compliance

- GDPR / DPDP data subject requests supported via redaction export  
- Retention policies per category (Compliance: 7y · Operational: 2y)  
- Legal hold prevents archive deletion  

---

# 14. Performance

## Search

- Full-text search across title · summary · comments · lessons  
- Faceted filters: category · status · owner · date · outcome · confidence  
- Target: ≤ 300ms P95 for search results  

## Filtering

- Saved filters: "My critical" · "Overdue delegated" · "Measured this month"  
- Shared filter views for leadership team (V2)  

## Caching

| Layer | Content | TTL |
|-------|---------|-----|
| Queue snapshot | Pending + critical counts | 1 min |
| Decision detail | Full object | 5 min · invalidate on update |
| Analytics aggregates | Impact scorecard | 15 min |
| Search index | Near real-time | Event-driven update |

## Real-Time Updates

- V1: Poll on focus + manual refresh  
- V2: WebSocket for critical queue · delegation status changes  
- Presence indicators for active reviewers (V2 · optional)  

## Scalability

- Decision objects append-heavy · read by queue filters  
- Partition by organisation · archive cold decisions > 2 years  
- Analytics pre-aggregated nightly · incremental hourly  

---

# 15. KPIs

## Decision Velocity

| KPI | Definition | V1 Target |
|-----|------------|-----------|
| **Decision Turnaround Time** | Median event → approved | Critical ≤ 4h · High ≤ 24h |
| **Queue Depth** | Pending decisions per executive | ≤ 7 avg |
| **Overdue Rate** | Delegated past due / total delegated | ≤ 10% |
| **Deferral Rate** | Deferred / total reviewed | Track · no target (valid choice) |

## Decision Quality

| KPI | Definition | V1 Target |
|-----|------------|-----------|
| **Recommendation Acceptance** | Approved / recommendations promoted | ≥ 40% |
| **Outcome Success Rate** | Met or Exceeded / Measured | ≥ 55% |
| **Variance Accuracy** | Predicted impact within ±25% of actual | ≥ 50% (V2) |
| **Lesson Capture Rate** | Measured with lessons / Measured total | ≥ 70% |

## Business Impact

| KPI | Definition | V1 Target |
|-----|------------|-----------|
| **Aggregate ROI** | Sum actual impact / sum expected | ≥ 0.85 |
| **Revenue-Linked Decisions** | Decisions with positive revenue outcome | Track |
| **Risk Avoided** | Critical alerts resolved via decision | Track |

## Executive Engagement

| KPI | Definition | V1 Target |
|-----|------------|-----------|
| **Daily Decision Session** | Executives opening Decision Center | ≥ 5 days/week |
| **Review Depth** | Decisions opened in full review vs quick approve | Track |
| **Advisor Usage** | AI advisor invoked per review | Track |
| **Satisfaction** | CSAT for Decision Center | ≥ 4.3 / 5 |

---

# 16. Future Vision

## AI Simulations (V2)

- Model outcome paths before approval: "If you approve pricing +8%, projected occupancy impact −2 pts, revenue +₹4.1L"  
- Deterministic scenario engine · labelled assumptions  

## Scenario Comparison (V2)

- Split-screen: Option A vs B vs C with modelled KPIs at 7/30/90 days  
- Save scenarios to decision record  

## Board Decision Packs (V2)

- One-click pack: decision summary · evidence · alternatives · recommendation · risk · financial impact  
- Board portal integration · e-signature  

## Meeting Preparation (V2)

- "Prepare for Tuesday leadership meeting" — auto-bundle pending decisions · talking points · outcome report  
- Calendar-linked · Advisor-generated brief  

## Voice Approvals (V3)

- "ORION, approve the Room 305 decision" — voice biometric + confirmation step  
- Full audit trail · optional dual confirmation for Investment/Board  

## Executive Memory (V3)

- "Last time we faced this occupancy pattern, we raised rates and revenue increased 11%"  
- Knowledge Base pattern retrieval · anonymised cross-property (opt-in)  

## Decision Intelligence (V3)

- Organisational decision graph: which decisions cascade · which owners deliver · which categories underperform  
- Board-level dashboard: decision velocity and outcome trends  
- Industry benchmark: "Hospitality executives decide pricing in 6h median — you: 4h"  

---

# Appendix A — ORION Executive Stack

```
Morning Brief (EC-001)     ── orient · top 3 decisions needed
        │
        ▼
Business Health (EC-002)   ── context · urgency · impact
        │
        ▼
Recommendations (EC-003)   ── propose · evidence · prioritise
        │
        ▼
Decision Center (EC-004)   ── decide · delegate · monitor · learn
        │
        ├── Command Center (awareness drill-down)
        ├── Workspaces (execution detail)
        └── Knowledge Base (institutional memory)
```

| Transition | Mechanism |
|------------|-----------|
| Recommendation → Decision | Accept promotes to Draft → Pending Review |
| Decision → Task | Delegate creates Mission Control linkage (V2) |
| Outcome → Learning | Measure feeds EC-003 weight adjustment |
| Lessons → Health | Patterns inform EC-002 risk/opportunity models |

---

# Appendix B — Document Governance

| Field | Value |
|-------|-------|
| **Document ID** | EC-004 |
| **Title** | Executive Decision Center |
| **Owner** | Chief Product Architect |
| **Reviewers** | Founder · Chief Architect · AI Lead · Design · Compliance |
| **Next Review** | Architecture Review Board |
| **Implementation Specs** | ES-015 · ES-029 · ES-065 (EC-004 alignment pending) |

---

**Status:**  
READY FOR ARCHITECTURE REVIEW

**Version:**  
1.0

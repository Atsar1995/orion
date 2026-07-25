# EC-005 — AI Executive Copilot

**Executive Capability ID:** EC-005  
**Classification:** Product & Executive AI Architecture Specification  
**Author:** Chief AI Architect · Executive Intelligence Designer  
**Audience:** Founder · Chief Architect · Product · Design · Engineering · AI Governance · Legal  
**Related:** [EC-001](./EC-001_Morning_Executive_Brief.md) · [EC-002](./EC-002_Business_Health_Engine.md) · [EC-003](./EC-003_Executive_Recommendation_Engine.md) · [EC-004](./EC-004_Executive_Decision_Center.md) · [ES-065](../02_Engineering/ES-065-Executive-Intelligence-Architecture.md) · [ES-028](../02_Engineering/ES-028-Executive-Brief-Engine.md) · [ORION Constitution](../00_PROJECT/ORION_CONSTITUTION.md)

---

> **North Star Principle**
>
> *The Copilot thinks with you — never for you.*

---

# 1. Executive Vision

## Purpose

The AI Executive Copilot is ORION's **Executive Thinking Partner** — a conversational intelligence layer that helps executives understand their business, reason through complex situations, explore alternatives, and prepare better decisions.

It is not a chatbot. Chatbots answer prompts without accountability.

It is not a dashboard with a text box. Dashboards display; the Copilot **reasons**.

It is not an autonomous agent. Agents act; the Copilot **prepares judgment**.

The Copilot sits at the intersection of every ORION intelligence engine — Health, Recommendations, Decisions, Brief, and connected providers — and translates organisational complexity into **executive-grade dialogue** that is always evidence-backed, confidence-labelled, and auditable.

Its fundamental question:

> *"Help me understand this situation well enough to decide with confidence."*

## Business Value

| Stakeholder | Value |
|-------------|-------|
| **Executive** | On-demand strategic thinking partner available 24/7 — no waiting for analyst reports |
| **Leadership Team** | Shared reasoning language aligned to ORION evidence — reduces misinterpretation in meetings |
| **Organisation** | Faster comprehension of complex cross-domain situations; better-prepared decisions |
| **ORION Platform** | Human interface to the entire intelligence stack — makes EC-001 through EC-004 accessible through natural dialogue |
| **Governance (V3)** | Auditable AI advisory trail for board and compliance review |

Quantifiable hypothesis: executives spend **15–25 hours weekly** in meetings and async communication to synthesise cross-functional context. The Copilot targets **40% reduction in time-to-comprehension** on complex business questions while maintaining **100% evidence citation** on factual claims.

## Executive Outcome

After engaging with the Copilot, the executive can:

1. **Understand** — articulate the situation in plain language with supporting evidence  
2. **Reason** — follow a transparent chain from data to conclusion  
3. **Explore** — compare alternatives and scenarios without leaving ORION  
4. **Prepare** — enter Decision Center or meetings with structured thinking already done  
5. **Trust or challenge** — see confidence, assumptions, and gaps explicitly  

The executive never feels **talked at** — they feel **thought with**.

## Copilot Philosophy

| Belief | Implication |
|--------|-------------|
| **Augment, never replace** | Copilot prepares; executive decides |
| **Evidence before eloquence** | A plain answer with citations beats a fluent hallucination |
| **Confidence is honesty** | "I don't know" is a valid, respected response |
| **Context is continuity** | The Copilot remembers what matters for this executive and this business |
| **Reasoning is visible** | Multi-step thinking is shown, not hidden |
| **Business language, not data language** | Revenue "ahead of plan" not "metric_id_47 delta +0.082" |
| **Conversation is workflow** | Dialogue links to decisions, not orphaned chat threads |

## Trust Principles

1. **No unsupported claims** — every factual statement cites a source or is labelled inference  
2. **No silent actions** — Copilot never approves, pays, sends, or modifies records without explicit executive command elsewhere  
3. **No credential exposure** — Copilot never surfaces secrets, tokens, or PII beyond role permission  
4. **No fabricated metrics** — validation gate blocks responses failing citation check  
5. **No false certainty** — confidence score and assumptions always visible  
6. **Full auditability** — every conversation retrievable with evidence packet hash  
7. **Human override always** — executive may reject Copilot reasoning without penalty  
8. **Tenant isolation absolute** — no cross-organisation learning without explicit anonymised opt-in (V3)  

---

# 2. Executive Conversation Model

The Copilot supports **structured conversational workflows** — not free-form chat alone. Each workflow type has defined entry points, context injection, reasoning templates, and exit actions.

## Workflow Catalogue

| Workflow | Entry Point | Primary Context | Typical Exit Action |
|----------|-------------|-----------------|---------------------|
| **Business Questions** | "How is the business doing?" | EC-002 Health · EC-001 Brief | Drill to domain · open Decision Center |
| **Operational Questions** | "Any ops issues today?" | Hospitality · Inventory · Alerts | Create decision · delegate |
| **Financial Questions** | "Cash position?" · "Revenue vs plan?" | Finance Provider · AR/AP | Approve payment decision |
| **Marketing Questions** | "How did campaigns perform?" | GA4 · Ads · Marketing Health | Recommendation review |
| **Strategic Planning** | "Should we expand to X?" | OKRs · Health trends · EC-004 history | Draft strategic decision |
| **Board Preparation** | "Prepare board summary" | Health · decisions · outcomes | Export board pack (V2) |
| **Risk Reviews** | "What are our biggest risks?" | EC-002 Risk · Alerts · EC-003 | Risk acceptance decision |
| **Growth Planning** | "Where is growth coming from?" | CRM · Marketing · Trend Engine | Growth decision draft |
| **Scenario Analysis** | "What if occupancy drops 10%?" | Health model · historical patterns | Save scenario to EC-004 |
| **Decision Support** | "Help me decide on X" | EC-004 decision object · alternatives | Approve · defer · delegate |

## Conversation Flow Pattern

```
Executive Intent
      │
      ▼
Intent Classification (workflow router)
      │
      ▼
Context Assembly (Section 5)
      │
      ▼
Evidence Collection (deterministic)
      │
      ▼
Reasoning Chain (Section 6)
      │
      ▼
Response Generation (Section 7)
      │
      ▼
Validation Gate (citation · confidence · policy)
      │
      ▼
Executive Response + Follow-ups
      │
      ▼
Optional: Link to Decision · Brief · Report
```

## Multi-Turn Behaviour

- Copilot maintains **thread context** within session  
- Cross-session continuity via **Executive Memory** (Section 8)  
- Clarifying questions asked when intent ambiguous — never guess silently  
- Maximum **3 clarifying turns** before offering best-effort with confidence discount  

---

# 3. Executive Personas

Each persona receives tailored context, permissions, conversation style, and surfacing rules.

## Persona Matrix

| Persona | Primary Goals | Context Emphasis | Conversation Style | Permissions |
|---------|---------------|------------------|-------------------|-------------|
| **Founder** | Whole-business health · strategic bets · cash | All domains · EC-004 full history | Direct · strategic · long-horizon | Full org · all decisions |
| **CEO** | Performance · risk · leadership alignment | Health · recommendations · decisions | Balanced · decision-oriented | Full org · approve all categories |
| **COO** | Operations · delivery · staffing · suppliers | Ops · Hospitality · Inventory · SLA | Operational · action-focused | Ops · CX · Hiring · Technology |
| **CFO** | Cash · margin · AR/AP · forecast | Finance · Revenue · Compliance | Precise · numbers-first | Finance · Investment · Board |
| **CMO** | ROAS · traffic · campaigns · brand | Marketing · GA4 · Ads · Brand Health | Creative · metric-driven | Marketing · Pricing (shared) |
| **Hotel General Manager** | Occupancy · guest experience · staff | Hospitality · CX · Ops · Reviews | Guest-centric · today-focused | Hospitality · CX · Ops · Staffing |
| **Sales Director** | Pipeline · win rate · forecast | CRM · Sales Health · Revenue | Deal-focused · urgency-aware | Sales · Pricing (shared) · CRM |
| **Operations Manager** | Fulfilment · inventory · maintenance | Ops · Inventory · Technology | Detail-oriented · checklist style | Operations · Inventory · Technology |
| **Board Member** | Governance · risk · strategic direction | Board category · aggregated health | Formal · summary-first | Read-only · Board + Strategic + Investment |
| **Investor** | Growth · unit economics · runway | Finance · Growth · anonymised KPIs | Financial · milestone-focused | Read-only · curated investor view (V3) |

## Persona Configuration

```
PersonaProfile {
  role_id
  default_workflows[]
  domain_visibility[]        // which health domains surfaced unprompted
  decision_visibility[]      // which EC-004 categories visible
  memory_scope               // personal · leadership · organisation
  tone: "direct" | "formal" | "coaching"
  proactivity_level: 0-3     // unsolicited insights (V2)
  restricted_topics[]        // e.g. individual compensation for non-HR
}
```

## Conversation Style Adaptation

- **Founder / CEO:** Lead with condition → risk → opportunity → recommended focus  
- **CFO:** Lead with numbers → variance → cash implication → decision needed  
- **GM:** Lead with today → guests → staff → immediate actions  
- **Board Member:** Lead with summary → governance risk → strategic question — no operational noise  

---

# 4. Copilot Capabilities

## Core Capabilities (V1)

| Capability | Description | Primary EC Integration |
|------------|-------------|------------------------|
| **Ask Questions** | Natural language Q&A across business domains | All EC stack |
| **Explain KPIs** | Define metric, show value, trend, baseline, source | EC-002 · Providers |
| **Summarize Business Health** | Narrate health score with drivers | EC-002 |
| **Explain Recommendations** | Why ORION recommended X · evidence · alternatives | EC-003 |
| **Compare Time Periods** | Yesterday vs last week · WoW · MoM | Trend Engine |
| **Identify Trends** | Emerging patterns · inflection points | EC-002 · ES-031 |
| **Detect Risks** | Surface risk signals across domains | EC-002 Risk · Alerts |
| **Recommend Actions** | Suggest next steps — links to EC-003/EC-004, never auto-executes | EC-003 |
| **Explain Decisions** | Past decision context · outcome · lessons | EC-004 · Memory |
| **Search Executive Memory** | Retrieve past conversations · decisions · milestones | Section 8 |

## Advanced Capabilities (V2+)

| Capability | Description |
|------------|-------------|
| **Forecast Outcomes** | Model likely results of actions — labelled predictive |
| **Prepare Meetings** | Agenda · talking points · decision bundle for calendar event |
| **Draft Executive Emails** | Context-aware drafts — executive sends manually |
| **Generate Reports** | Board · investor · weekly summary exports |
| **Scenario Analysis** | Multi-variable what-if with deterministic model |
| **Voice Dialogue** | Spoken conversation with citation confirmation |

## Capability Boundaries

| Copilot May | Copilot May Not |
|-------------|-----------------|
| Explain · compare · summarise · suggest | Approve payments · send emails · modify records |
| Draft text for executive review | Publish drafts without explicit executive action |
| Link to Decision Center pre-fill | Create approved decisions autonomously |
| Access data permitted by persona role | Access cross-tenant or unauthorised domains |
| Label inference and uncertainty | Present inference as fact |

---

# 5. Context Engine

The Context Engine assembles **everything the Copilot knows** for the current turn — bounded, ranked, and permission-filtered.

## Context Layers

| Layer | Source | TTL | Priority |
|-------|--------|-----|----------|
| **Business Context** | Health snapshot · Brief · active alerts | 15 min | Highest |
| **Conversation Context** | Current thread · last 20 turns | Session | High |
| **Decision History** | EC-004 pending · recent outcomes | 24 hr | High |
| **User Preferences** | Persona profile · tone · proactivity | Persistent | Medium |
| **Current Objectives** | OKRs · stated goals · Memory | Persistent | Medium |
| **Connected Systems** | Provider sync status · data freshness | 5 min | Medium |
| **Historical Performance** | Trend data · past outcomes · lessons | 30 days | Context-dependent |
| **Active Recommendation** | EC-003 queue top items | 15 min | Workflow-dependent |

## Context Assembly Pipeline

```
1. Classify intent → determine required layers
2. Fetch deterministic snapshots (no LLM retrieval at V1)
3. Apply persona permission filter
4. Rank by relevance to intent
5. Truncate to token budget (preserve evidence ids)
6. Inject into reasoning framework
```

## Context Budget

| Surface | Max Context Tokens | Rationale |
|---------|-------------------|-----------|
| Quick answer | 4K | KPI lookup · single domain |
| Standard dialogue | 8K | Multi-domain reasoning |
| Decision support | 12K | Full decision object + alternatives |
| Board prep (V2) | 16K | Wide historical span |

Stale context labelled: *"Based on data synced 3 hours ago."*

## Context Persistence

- **Session context:** in-memory · cleared on logout  
- **Thread context:** persisted 90 days · searchable  
- **Executive Memory:** long-term · Section 8  

---

# 6. Reasoning Framework

The Reasoning Framework ensures every Copilot response is **structured, validated, and auditable** — not raw LLM output.

## Stage 1 — Evidence Collection

- Pull structured data from Context Engine — **never LLM-browse live databases at V1**  
- Minimum evidence set defined per workflow type  
- Missing evidence → confidence discount or refusal to answer  

## Stage 2 — Business Rules

Deterministic guardrails applied before reasoning:

- No staff termination advice without HR workflow reference  
- No legal conclusions — suggest legal review  
- Financial figures must match provider snapshot (no LLM arithmetic on raw numbers — use pre-computed deltas)  
- Guest PII masked per role  
- Cross-domain claims require ≥ 2 source agreement or labelled single-source  

## Stage 3 — Reasoning Chain

Multi-step chain recorded internally:

```
Step 1 [FACT]: Occupancy 84% (+6 pts vs forecast) — Hospitality Provider
Step 2 [FACT]: Revenue +8.2% vs plan — Finance Provider
Step 3 [FACT]: Marketing sessions −8% WoW — GA4
Step 4 [INFERENCE]: Traffic decline may pressure weekend bookings — confidence 65%
Step 5 [SYNTHESIS]: Business stable but marketing warrants review before weekend
```

Steps 1–3 cite evidence IDs. Step 4 labelled inference. Step 5 is executive-facing synthesis.

## Stage 4 — Conflict Detection

- Contradictory provider signals flagged  
- Copilot presents both · explains discrepancy · does not hide conflict  
- Example: "CRM shows pipeline up; Finance shows revenue flat — possible collection lag"  

## Stage 5 — Confidence Calculation

```
Response Confidence =
  Evidence Completeness     (30%)
+ Source Freshness          (20%)
+ Cross-Source Agreement    (20%)
+ Reasoning Chain Quality   (15%)   // all facts cited · inferences labelled
+ Historical Pattern Match  (10%)   // V2 · Memory
+ Validation Pass           (5%)
```

Displayed as percentage with breakdown on expand.

## Stage 6 — Response Generation

- Template-first for factual queries (V1)  
- LLM narration for synthesis — constrained to evidence packet  
- Maximum response length by workflow · executive readability target: Grade 10  

## Stage 7 — Executive Review

- Validation gate: citation check · policy check · confidence floor  
- Fail → fallback to structured template or "Insufficient data to answer reliably"  
- Pass → stream to executive with metadata block  

---

# 7. Response Model

Every Copilot response follows a **consistent executive structure** — never a wall of text alone.

## Response Components

| Component | Required | Description |
|-----------|----------|-------------|
| **Executive Answer** | Yes | 1–4 sentences · direct answer to question |
| **Supporting Evidence** | Yes · ≥ 1 | Cited facts with source · timestamp · value |
| **Confidence Level** | Yes | 0–100% · colour-coded · breakdown on expand |
| **Assumptions** | When applicable | Explicit premises · e.g. "Assumes weekend demand pattern holds" |
| **Recommended Next Actions** | When applicable | 1–3 actions · link to EC-003/EC-004 |
| **Related Decisions** | When applicable | Pending or past EC-004 items |
| **Suggested Follow-up Questions** | Yes · 2–3 | Deepen understanding · never manipulative |

## Response Template (Visual)

```
┌─────────────────────────────────────────────────────────────┐
│  EXECUTIVE ANSWER                                           │
│  Your business is in a stable position. Revenue is ahead    │
│  of plan (+8.2%) and occupancy is strong (84%). Marketing   │
│  sessions declined 8% week-over-week — worth reviewing        │
│  before the weekend push.                                   │
│                                                             │
│  CONFIDENCE  87%  ████████░░                                │
│                                                             │
│  EVIDENCE                                                   │
│  ● Finance · Revenue vs plan · +8.2% · synced 6:42 AM      │
│  ● Hospitality · Occupancy · 84% (+6 pts) · synced 6:40 AM │
│  ● GA4 · Sessions · −8% WoW · synced 6:38 AM               │
│                                                             │
│  ASSUMPTIONS                                                │
│  · Weekend demand follows historical Saturday pattern       │
│                                                             │
│  SUGGESTED ACTIONS                                          │
│  → Review marketing campaign performance [Open Decision]    │
│  → Confirm weekend staffing plan [View Recommendation]        │
│                                                             │
│  RELATED DECISIONS                                          │
│  · Pending: Approve supplier payment (Finance · due today)    │
│                                                             │
│  FOLLOW-UP                                                  │
│  · "Which campaign drove the session decline?"               │
│  · "Compare this week to same week last year"                │
│  · "What is our cash runway at current burn?"                │
└─────────────────────────────────────────────────────────────┘
```

## Inference Labelling

Any sentence not directly supported by cited evidence displays **inference badge** and reduced confidence contribution.

---

# 8. Executive Memory

Executive Memory gives the Copilot **continuity across time** — without uncontrolled data hoarding.

## Memory Types

| Type | Content | Retention | Scope |
|------|---------|-----------|-------|
| **Past Decisions** | EC-004 records · outcomes · lessons | 3 years | Organisation · role-filtered |
| **Past Conversations** | Thread summaries · key conclusions | 1 year | User · optionally shared with leadership |
| **Business Milestones** | Launches · openings · major wins/losses | Permanent | Organisation |
| **Recurring Issues** | Patterns flagged ≥ 3 times | 2 years | Organisation |
| **Goals** | OKRs · executive-stated objectives | Active + 1 year | User / org |
| **Lessons Learned** | EC-004 post-measurement capture | Permanent | Organisation · anonymisable |

## Memory Model

```
MemoryEntry {
  id
  type: decision | conversation | milestone | issue | goal | lesson
  summary: ≤ 100 words
  evidence_refs[]
  created_at
  last_accessed_at
  relevance_tags[]
  visibility: private | leadership | organisation
  embedding_vector          // V2 · semantic retrieval
}
```

## Memory Retrieval

- **Explicit:** "What did we decide about weekend pricing last month?"  
- **Implicit:** Auto-injected when relevant to current workflow  
- **Never:** Memory surfaced for unrelated queries (no creepy proactivity V1)  

## Memory Privacy

- Executives may delete personal conversation memory  
- Organisational memory deletion requires admin + audit (except legal hold)  
- Board and Investor personas receive filtered memory views only  
- Memory never crosses tenant boundary  

## Memory → Learning Loop

- Lessons feed EC-003 recommendation weighting  
- Recurring issues boost risk detection sensitivity  
- Successful decision patterns surface in Decision Support workflow  

---

# 9. Prompt Orchestration

Internal prompt strategy — conceptual, not implementation code.

## System Prompts (Layered)

| Layer | Purpose |
|-------|---------|
| **Constitution layer** | ORION trust principles · never decide · always cite |
| **Persona layer** | Role · tone · permissions · domain visibility |
| **Workflow layer** | Intent-specific instructions · evidence requirements |
| **Safety layer** | Refusal rules · PII · legal · HR boundaries |
| **Output layer** | Response model structure · citation format |

System prompts versioned · changes require AI governance review · logged.

## Business Context Injection

Structured JSON evidence packet injected — not prose summaries of data:

- Health snapshot · top drivers  
- Active recommendations · top 3  
- Pending decisions · critical only  
- Provider freshness metadata  

## Provider Context

Per-provider blocks with: id · last sync · confidence · key metrics · anomaly flags.

Missing provider explicitly stated: *"HR data unavailable — people questions may be incomplete."*

## Security Filters

- Input: prompt injection detection · sensitive topic routing  
- Output: PII redaction · credential scan · policy violation block  
- Cross-tenant isolation validation on every context fetch  

## Reasoning Templates

Pre-built chain templates per workflow:

- **KPI Explain:** Define → Value → Trend → Baseline → So-what  
- **Decision Support:** Situation → Options → Evidence → Risk → Suggested path  
- **Risk Review:** Scan domains → Rank risks → Evidence → Mitigation options  
- **Board Prep:** Health → Decisions → Outcomes → Strategic questions  

## Response Validation

Post-generation checks:

1. Every numeric claim maps to evidence ID  
2. No uncited factual assertions  
3. Inference sentences ≤ 30% of response  
4. Confidence score matches evidence quality  
5. No policy violations  
6. Recommended actions link to valid EC-003/EC-004 objects  

Fail any check → regenerate once → fallback template → refuse gracefully.

## Hallucination Prevention

| Control | Mechanism |
|---------|-----------|
| **Grounded generation** | LLM receives evidence packet only |
| **No free calculation** | Numbers from pre-computed engine outputs |
| **Citation enforcement** | Post-processor validation |
| **Refusal training** | "I don't have data on X" preferred over guessing |
| **Confidence gating** | Below 50% → refuse or heavy disclaimer |
| **Human audit sampling** | Random conversation review (V2) |

---

# 10. Explainability

Explainability is the **trust interface** of the Copilot — not an optional expander.

## Mandatory Disclosures

Every answer must explain:

| Question | Disclosure |
|----------|------------|
| **Where did information come from?** | Provider · engine · memory entry · timestamp |
| **Why was conclusion reached?** | Reasoning chain summary · top 3 steps |
| **What evidence supports it?** | Evidence list with values and deltas |
| **What assumptions were made?** | Explicit assumption block |
| **What confidence exists?** | Score · breakdown · missing data callout |

## "Show Reasoning" Interaction

Expandable panel reveals full chain:

- Facts (linked to evidence)  
- Inferences (labelled · confidence per inference)  
- Conflicts considered  
- Rules applied  
- Memory entries used  

## Explainability for Refusals

When Copilot cannot answer reliably:

> "I can't answer that with confidence. Finance data synced 26 hours ago (stale), and I have no connected HR provider for headcount questions. Connect Finance sync or ask a narrower question about revenue."

Refusals are **helpful**, not dead ends.

## Explainability Audit

- Every response stores: evidence packet hash · reasoning chain · model version · validation result  
- Executives may export explanation for board or compliance (V2)  

---

# 11. User Experience

## Desktop

- **Persistent Copilot panel** — right rail on Command Center · Decision Center · Brief · full-screen mode  
- Thread list · pinned conversations · search  
- Evidence cards inline · click to source  
- Drag decision into Copilot: "Help me think through this"  

## Tablet

- **Bottom sheet Copilot** — swipe up from any executive surface  
- Split view: decision record + Copilot on landscape  
- Touch-optimised follow-up chips  

## Mobile

- **Full-screen Copilot tab** in executive shell  
- Voice input prominent  
- Quick commands: "Brief me" · "Biggest risk" · "Pending decisions"  
- Minimal text · maximum structure  

## Voice Mode (V2)

- Push-to-talk · wake word optional (device settings)  
- Spoken answer with confirmation: "Confidence 87%. Want details?"  
- Voice never bypasses citation — summary spoken · evidence on screen  

## Quick Commands

| Command | Action |
|---------|--------|
| `/brief` | Summarise Morning Brief state |
| `/health` | Explain Business Health |
| `/decide` | Open Decision Support for pending critical |
| `/risk` | Risk review workflow |
| `/compare` | Time period comparison prompt |
| `/memory` | Search executive memory |
| `/prepare [meeting]` | Meeting prep workflow (V2) |

## Pinned Conversations

- Pin ongoing strategic threads  
- Auto-pin Decision Support sessions until decision resolved  

## Conversation Search

- Full-text · filter by workflow · date · linked decision · confidence range  
- Search respects role permissions  

---

# 12. Integrations

The Copilot is the **conversational facade** of the entire ORION platform.

## Intelligence Engines

| Integration | Copilot Use |
|-------------|-------------|
| **EC-001 Morning Brief** | `/brief` · summarise · explain sections |
| **EC-002 Business Health** | Explain score · drivers · trends · risks |
| **EC-003 Recommendations** | Explain why recommended · compare alternatives |
| **EC-004 Decision Center** | Decision support · explain past decisions · draft delegation |

## Provider Integrations

| Provider | Copilot Use |
|----------|-------------|
| **Google Analytics 4** | Traffic · conversion · campaign · landing page questions |
| **Google Ads (V2)** | Spend · ROAS · creative performance |
| **CRM** | Pipeline · complaints · customer · VIP questions |
| **Finance** | Revenue · cash · AR/AP · margin questions |
| **Hospitality / PMS** | Occupancy · guests · arrivals · housekeeping |
| **Email** | Summarise priority threads (V2 · read-only · permissioned) |
| **Calendar** | Meeting prep · conflict · "what's on today" |
| **Tasks** | Overdue · blocked · delegation status |

## Plugin Framework

Plugins registering `ai-skill` extension point may add Copilot capabilities with declared permissions reviewed in Integration Center.

Example: "Explain loyalty programme performance" skill from hospitality plugin.

## Integration Health

Copilot proactively discloses integration gaps:

*"Marketing answers may be incomplete — Google Ads not connected."*

---

# 13. Security

## Role-Based Permissions

- Copilot context filtered by persona (Section 3)  
- Board Member cannot query individual employee details  
- Investor view excludes operational minutiae and sensitive decisions  

## Sensitive Data Controls

| Data Class | Copilot Access |
|------------|----------------|
| Aggregate business metrics | Role-permitted domains |
| Individual guest/customer PII | Masked · executive role only |
| Employee HR records | HR role or explicit permission |
| Credentials / tokens | Never |
| Unreleased financial results | Executive + CFO only |

## Conversation Audit Logs

- Every turn logged: user · timestamp · intent · evidence hash · response hash · model version  
- Retention: 2 years default · 7 years Compliance tenants  
- Export for governance review  

## Memory Privacy

- User controls personal memory deletion  
- Organisation memory admin-controlled  
- No training on tenant data without explicit opt-in contract  

## Tenant Isolation

- Context · memory · audit strictly partitioned by organisation  
- Embeddings indexed per tenant (V2)  
- Cross-tenant benchmark patterns anonymised aggregate only (V3)  

---

# 14. Performance

## Streaming Responses

- Executive Answer streams first (≤ 800ms to first token target)  
- Evidence block follows  
- Confidence and actions append on completion  

## Latency Goals

| Operation | P95 Target |
|-----------|------------|
| Context assembly | ≤ 400ms |
| Evidence fetch (cached) | ≤ 200ms |
| First token (stream) | ≤ 800ms |
| Full response (standard) | ≤ 4s |
| Decision support (complex) | ≤ 8s |
| Memory search | ≤ 500ms |

## Caching

| Cache | TTL |
|-------|-----|
| Context snapshot per org | 5 min |
| Evidence packet per workflow | 5 min |
| Frequent KPI answers | 15 min · invalidate on sync |
| Memory retrieval | 1 hr |

## Context Optimization

- Relevance ranking before injection  
- Deduplicate overlapping provider metrics  
- Summarise historical spans > 30 days into trend objects  

## Scalability

- Stateless inference workers · horizontal scale  
- Context assembly on orchestrator path (shared with Brief)  
- Rate limits per tenant tier · burst allowance for executives  

---

# 15. KPIs

## Adoption

| KPI | V1 Target |
|-----|-----------|
| **Executive Adoption** | ≥ 70% WAU of executive roles |
| **Sessions per Week** | ≥ 8 per active executive |
| **Workflow Diversity** | ≥ 3 workflow types used per executive |

## Quality

| KPI | V1 Target |
|-----|-----------|
| **Questions Answered Successfully** | ≥ 85% without refusal |
| **Citation Coverage** | 100% factual claims cited |
| **Validation Pass Rate** | ≥ 95% first-pass |
| **Hallucination Incident Rate** | ≤ 0.5% (audited sample) |
| **Decision Support Quality** | ≥ 4.0 / 5 self-rated |

## Impact

| KPI | V1 Target |
|-----|-----------|
| **Time Saved** | ≥ 30 min / executive / day (self-report + session proxy) |
| **Recommendation Acceptance via Copilot** | ≥ 25% of accepts preceded by Copilot session |
| **Decision Prep Time Reduction** | ≥ 40% for Decision Support workflows |
| **Executive Satisfaction (CSAT)** | ≥ 4.4 / 5 |

## Trust

| KPI | V1 Target |
|-----|-----------|
| **"Show Reasoning" Usage** | Track · target ≥ 20% of complex queries |
| **Refusal Acceptance** | Low dispute rate on "insufficient data" responses |
| **Audit Finding Rate** | Zero critical uncited claims in monthly audit |

---

# 16. Future Vision

## Voice Executive Assistant (V2)

- Hands-free morning briefing dialogue  
- Car / mobile-first · full evidence on paired screen  
- Voice biometric optional confirmation  

## Board Meeting Mode (V2)

- Real-time Copilot during board session — executive-private sidebar  
- "Board member asked about margin — here's evidence"  
- Post-meeting decision capture auto-linked  

## Predictive Discussions (V3)

- "Let's talk about where the business will be in 90 days"  
- Forecast-backed dialogue · scenarios saved to EC-004  

## Autonomous Research (V3)

- Copilot conducts multi-step research across providers overnight  
- Morning delivery: "Research brief ready — 3 strategic questions for you"  
- Never autonomous action — research only  

## Strategic Planning Sessions (V3)

- Multi-hour facilitated dialogue · structured agenda · memory persistence  
- Output: strategic decision drafts · OKR adjustments · board questions  

## Industry Intelligence (V3)

- Anonymised vertical benchmarks in conversation  
- "Similar properties saw 12% session lift from this pattern"  

## Digital Executive Twin (V4 — Research)

- Model learns executive decision preferences from EC-004 history (opt-in)  
- Simulates: "How would you likely decide this?" — advisory only  
- Ethical review required before any productisation  

---

# Appendix A — ORION Executive Intelligence Stack

```
                    ┌─────────────────────────┐
                    │  AI Executive Copilot   │
                    │        (EC-005)         │
                    │  Conversational facade  │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
   EC-001 Brief           EC-004 Decisions        Providers
   EC-002 Health          EC-003 Recommendations   GA4 · CRM · Finance…
        │                       │
        └───────────────────────┴───────────────────────┘
                                │
                    Intelligence Orchestrator
```

| Capability | Relationship |
|------------|--------------|
| **EC-001** | Copilot explains and summarises Brief |
| **EC-002** | Copilot narrates Health with drivers |
| **EC-003** | Copilot explains and compares recommendations |
| **EC-004** | Copilot supports decision review and records reasoning |
| **Plugin AI Skills** | Extend Copilot domain capabilities |

---

# Appendix B — Document Governance

| Field | Value |
|-------|-------|
| **Document ID** | EC-005 |
| **Title** | AI Executive Copilot |
| **Owner** | Chief AI Architect |
| **Reviewers** | Founder · Chief Architect · Product · Design · AI Governance · Legal |
| **Next Review** | Architecture Review Board · AI Ethics Review |
| **Implementation Specs** | ES-065 · ES-028 · AI Architecture (pending EC-005 alignment) |

---

**Status:**  
READY FOR ARCHITECTURE REVIEW

**Version:**  
1.0

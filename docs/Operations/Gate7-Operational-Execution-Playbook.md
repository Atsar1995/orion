# Gate 7 Operational Execution Playbook

**Document ID:** OPS-GATE7-001  
**Program:** P-018 — ORION Enterprise Platform v2.0 · Gate 7 Operational Execution  
**Mission:** P-018.3 — Gate 7 Operational Execution Playbook  
**Version:** 1.0  
**Status:** Ratified — Authoritative Operational Manual  
**Classification:** Platform Operations · Gate 7 Execution  
**Authority:** Platform Operations Lead · Chief Enterprise Architect  
**Effective Date:** 6 August 2026  
**Development Branch:** `develop/v2.0` @ `63aa7cf`  
**Platform Version:** 0.2.0

**Parent:** [P-018.1 Gate 7 Operational Execution Program](../00_Governance/P-018.1-Gate7-Operational-Execution-Program.md) · [P-018.2 Gate 7 Operational Assessment](../00_Governance/P-018.2-Gate7-Operational-Assessment.md)  
**Evidence:** [Enterprise Operations Readiness](./Enterprise-Operations-Readiness.md) · [Gate 6 Evidence Checklist](./Gate6-Evidence-Checklist.md) · [PostgreSQL Operational Certification](./PostgreSQL-Operational-Certification.md)  
**Supersedes:** Ad-hoc operational procedures prior to Gate 7 playbook  
**Related:** [Runbook-Platform-Startup](./Runbook-Platform-Startup.md) · [Runbook-Platform-Shutdown](./Runbook-Platform-Shutdown.md) · [Runbook-Production-Deployment](./Runbook-Production-Deployment.md) · [Runbook-Operational-Monitoring](./Runbook-Operational-Monitoring.md) · [Runbook-Disaster-Recovery](./Runbook-Disaster-Recovery.md)

**Scope:** Operations documentation only. Converts P-018.1 governance and P-018.2 assessment into step-by-step operational procedures. No production code · no platform changes · no schema changes · no REST implementation.

**Rule:** This document is the **authoritative operational manual for Gate 7 execution**. The Gate 7 Operations Team shall execute every operational activity using this playbook without requiring additional engineering guidance for standard procedures.

---

## Table of Contents

1. [Purpose, Audience, Scope, Responsibilities](#1-purpose-audience-scope-responsibilities)
2. [Environment Preparation](#2-environment-preparation)
3. [OPS-001 Execution](#3-ops-001-execution)
4. [Deployment Procedure](#4-deployment-procedure)
5. [Operational Monitoring](#5-operational-monitoring)
6. [Performance Validation](#6-performance-validation)
7. [Disaster Recovery](#7-disaster-recovery)
8. [Security Validation](#8-security-validation)
9. [Operational Checklists](#9-operational-checklists)
10. [Failure Scenarios](#10-failure-scenarios)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Executive Summary](#12-executive-summary)

**Appendices:** [A](#appendix-a--infrastructure-inventory) · [B](#appendix-b--operational-contacts) · [C](#appendix-c--escalation-matrix) · [D](#appendix-d--environment-variables) · [E](#appendix-e--monitoring-metrics) · [F](#appendix-f--runbook-references)

---

# 1. Purpose, Audience, Scope, Responsibilities

## 1.1 Purpose

This playbook converts the governance defined in [P-018.1](../00_Governance/P-018.1-Gate7-Operational-Execution-Program.md) and assessed in [P-018.2](../00_Governance/P-018.2-Gate7-Operational-Assessment.md) into **executable operational procedures** for Gate 7.

| Objective | Description |
|-----------|-------------|
| **Operationalize Gate 7** | Provide step-by-step instructions for Phases 7A–7D |
| **Close OPS-001** | Live staging PostgreSQL GA-001 evidence collection |
| **Enable OPS-002–004** | 72h monitoring · performance · DR validation |
| **Support Gate 7 pass** | Evidence archive for final P-018.2 successor assessment |
| **Prepare RC pathway** | Operational foundation for Release Candidate planning |

**Success criterion:** Any qualified Platform Ops engineer can execute Gate 7 operational activities using only this playbook and referenced runbooks.

## 1.2 Audience

| Audience | Usage |
|----------|-------|
| **Platform Operations Team** | Primary executors — OPS-001 through OPS-004 |
| **Platform Engineering** | Deployment support · hotfix · migration assistance |
| **Security Team** | RBAC audit · cross-tenant isolation · secrets review |
| **QA / Test Engineering** | Staging regression · chain smoke tests |
| **Program Director** | Phase gate decisions · evidence sign-off |
| **Executive Sponsor** | P0 escalation · resource authorization |

## 1.3 Scope

### In Scope

| Area | Coverage |
|------|----------|
| Environment preparation | Development · Test · Staging · Production |
| OPS-001 | Live staging PostgreSQL certification |
| OPS-002 | 72-hour continuous health monitoring |
| OPS-003 | Performance baseline establishment |
| OPS-004 | Disaster recovery drill with RTO/RPO |
| Deployment | Pre-deploy · deploy · verify · rollback · post-deploy |
| Monitoring | Health · metrics · alerts · logging · dashboards |
| Security validation | RBAC · auth · secrets · audit |
| Operational checklists | Daily · weekly · monthly · release · incident |
| Failure scenarios | Database · service · restart · event backlog · network |
| Acceptance criteria | OPS-001–004 · Gate 7 pass |

### Out of Scope

| Area | Reason |
|------|--------|
| Production code changes | Governance/ops mission only |
| Architecture modifications | Deferred to ARB |
| Schema / migration authoring | Engineering responsibility |
| Business domain implementation | Gate 7 is operational, not domain construction |
| FIN-R-001 engineering remediation | Parallel track (P-009.12) |
| Registry engineering (ENT-R-006) | Parallel track (P-014.5) |

## 1.4 Responsibilities

### RACI Matrix — Gate 7 Operations

| Activity | Platform Ops | Platform Eng | Security | QA | Program Director | Executive Sponsor |
|----------|:------------:|:------------:|:--------:|:--:|:----------------:|:-----------------:|
| Staging infra provision | C | I | — | — | A | R (resource) |
| OPS-001 execution | **R/A** | C | C | C | I | I |
| Deployment to staging | **R** | C | I | I | A | — |
| 72h monitoring (OPS-002) | **R/A** | C | — | — | I | — |
| Performance testing (OPS-003) | **R** | C | — | C | A | — |
| DR drill (OPS-004) | **R/A** | C | — | — | I | I |
| Runbook execution (8) | **R/A** | C | C | — | I | — |
| Rollback drill | C | **R/A** | — | C | I | — |
| Cross-tenant isolation | I | C | **R/A** | C | I | — |
| Evidence archive | **R** | C | C | C | **A** | I |
| Phase gate sign-off | C | C | C | C | **A** | R (P0) |
| Gate 7 pass declaration | I | I | I | I | **R/A** | A |

**Legend:** R = Responsible · A = Accountable · C = Consulted · I = Informed

### Role Definitions

| Role | Gate 7 Mandate |
|------|----------------|
| **Platform Ops Lead** | Owns OPS-001–004 · go/no-go for staging operations · daily standups |
| **Platform Engineering Lead** | Hotfix support · migration triage · deployment pipeline · rollback drill |
| **Security Lead** | RBAC staging audit · cross-tenant negative tests · secrets scan |
| **QA Lead** | Staging test suite replay · chain smoke tests · evidence validation |
| **Program Director** | Timeline · phase gates · risk register · assessment preparation |
| **Executive Sponsor** | P0 escalation · budget · GA/RC authorization decisions |

### Reporting Cadence

| Activity | Frequency | Owner |
|----------|-----------|-------|
| OPS-001 daily standup | Daily during Phase 7A | Platform Ops Lead |
| Gate 7 weekly status | Weekly | Program Director |
| Health dashboard review | Every 4 hours during OPS-002 | Platform Ops |
| Risk register update | Bi-weekly | Program Director |
| Phase gate review | End of each phase (7A–7D) | Program Director |
| Executive briefing | Monthly | Program Director → Executive Sponsor |

---

# 2. Environment Preparation

## 2.1 Environment Strategy (ADR-012)

ORION follows a four-tier environment model. Gate 7 evidence is collected exclusively on **staging with live PostgreSQL**.

| Environment | Purpose | PostgreSQL | Gate 7 Evidence Weight |
|-------------|---------|------------|:----------------------:|
| **Development** | Local engineering | Optional (in-memory) | None |
| **Test (CI)** | Automated validation | Ephemeral mock | Engineering only |
| **Staging** | Pre-production ops validation | **Mandatory live** | **Primary** |
| **Production** | Customer-facing | Durable replicated | Post Gate 7 pass only |

**Rule:** In-memory or mock persistence in development/CI is **not** production evidence. All Gate 7 sign-off requires live staging PostgreSQL replay.

## 2.2 Development Environment

### Purpose

Local engineering · composition root verification · partial readiness checks.

### Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| `NODE_ENV` | `development` | Default local |
| `ORION_STORE_PROVIDER` | `memory` or `postgresql` | Optional local PG |
| `ORION_AUTH_FAIL_CLOSED` | Optional | Recommended `true` for auth testing |
| `DATABASE_URL` | Optional | Required only if using local PostgreSQL |

### Development Checklist

| # | Item | Verification |
|---|------|--------------|
| 1 | Node.js LTS installed | `node --version` |
| 2 | Dependencies installed | `npm install` |
| 3 | Test suite passes locally | `npm test` |
| 4 | Health endpoints respond | `GET /api/health` → 200 |
| 5 | Composition roots resolve | Dev startup without error |

**Gate 7 relevance:** Development validates engineering readiness only. No Gate 7 evidence collected here.

## 2.3 Test Environment (CI)

### Purpose

Automated certification · Gate 6 engineering evidence · regression on every commit.

### Configuration

| Setting | Value |
|---------|-------|
| `NODE_ENV` | `test` |
| `ORION_STORE_PROVIDER` | Mock PostgreSQL via `MockDatabaseConnection` |
| Database | Ephemeral — no persistent state |

### CI Validation Commands

```bash
# Full platform operations suite (52 tests)
npx vitest run tests/lib/platform/operations/

# Gate 6 validation orchestrator (12 scenarios)
npx vitest run tests/lib/platform/operations/Gate6OperationalValidation.test.ts

# PostgreSQL certification (11 scenarios)
npx vitest run tests/lib/platform/operations/PostgresOperationalCertification.test.ts

# Enterprise readiness baseline
npx vitest run tests/lib/platform/operations/EnterpriseOperationalReadiness.test.ts
```

### CI Acceptance

| Metric | Target | Current Baseline |
|--------|--------|:----------------:|
| Platform operations tests | 52/52 pass | ✅ |
| Gate 6 validation verdict | `conditional_pass` or `pass` | ✅ |
| PostgreSQL certification | `pass` or `conditional` | ✅ |
| Enterprise test suite | 1,291 pass | ✅ |

**Gate 7 relevance:** CI proves engineering readiness. Staging must **replay** all CI scenarios on live PostgreSQL.

## 2.4 Staging Environment

### Purpose

**Primary Gate 7 evidence collection environment.** OPS-001 · OPS-002 · OPS-003 · OPS-004 · runbook validation · rollback drill.

### Staging Requirements

| Requirement | Specification | Owner |
|-------------|---------------|-------|
| PostgreSQL instance | Live · dedicated · version ≥ 14 | Infra |
| Replication | Standby recommended (not required for OPS-001) | Infra |
| Connection pooling | PgBouncer or platform pool · max 20 connections | Infra |
| Network | Isolated VPC · HTTPS termination | Infra |
| Secrets | Vault or CI secrets injection — no repo secrets | Security |
| Monitoring | Health endpoints registered · 5-min poll interval | Platform Ops |
| Backup | Scheduled daily · retention 30 days | Infra |
| IIL transport | Durable transport configured (P-009.16 parallel) | Platform Eng |

### Staging Configuration

| Variable | Required Value | Verification |
|----------|----------------|--------------|
| `NODE_ENV` | `staging` | Environment audit |
| `ORION_STORE_PROVIDER` | `postgresql` | Startup log |
| `DATABASE_URL` / `ORION_DATABASE_URL` | Live PostgreSQL connection string | Connection probe |
| `ORION_AUTH_FAIL_CLOSED` | `true` | Unauthenticated route → 401 |
| `ORION_SESSION_SECRET` | ≥ 32 bytes random | Secrets audit |
| `ORION_LOG_FORMAT` | `json` | Log output format |
| `ORION_DEMO_PASSWORD` | **Not set** | Secrets scan |

### Staging Infrastructure Checklist

| # | Item | Owner | Status (Baseline) |
|---|------|-------|:-----------------:|
| 1 | PostgreSQL instance provisioned | Infra | ⏳ |
| 2 | Database user and schema created | Infra | ⏳ |
| 3 | `DATABASE_URL` injected via secrets | Platform Ops | ⏳ |
| 4 | Network / firewall rules configured | Infra | ⏳ |
| 5 | TLS certificate installed | Infra | ⏳ |
| 6 | Health monitoring endpoint registered | Platform Ops | ⏳ |
| 7 | Backup schedule configured | Infra | ⏳ |
| 8 | Log aggregation connected | Platform Ops | ⏳ |
| 9 | Alert routing configured | Platform Ops | ⏳ |
| 10 | Rollback artifact repository accessible | Platform Eng | ⏳ |

## 2.5 Production Environment

### Purpose

Customer-facing deployment. **Blocked until Gate 7 pass.**

### Production Preconditions

| Precondition | Source | Status |
|--------------|--------|:------:|
| Gate 7 pass declared | P-018.1 §3.7 | ❌ |
| OPS-001 through OPS-004 closed | P-018.1 | ❌ |
| RC 30-day stability | P-018.1 §6 | ❌ |
| Production readiness ≥ 78/100 | P-018.2 | ❌ (65/100) |
| Executive GA matrix | P-017.2 | ❌ |

### Production Configuration (Reference Only)

Production configuration follows staging with additional hardening:

| Variable | Production Requirement |
|----------|------------------------|
| `NODE_ENV` | `production` |
| `ORION_AUTH_FAIL_CLOSED` | `true` (enforced by default) |
| `ORION_STORE_PROVIDER` | `postgresql` |
| PostgreSQL | Durable · replicated · automated backups |
| `ORION_DEMO_PASSWORD` | **Must not be set** |
| `ORION_LOG_FORMAT` | `json` |

**Rule:** Do not deploy to production under this playbook until Gate 7 pass and RC authorization are declared.

## 2.6 Infrastructure Checklist — Gate 7 Entry

Complete before OPS-001 Week 2 deployment:

| # | Category | Item | Pass Criteria |
|---|----------|------|---------------|
| 1 | Database | Staging PostgreSQL live and reachable | `SELECT 1` succeeds |
| 2 | Database | Connection string in secrets vault | Not in repository |
| 3 | Database | Migration registry accessible | Full registry deployed |
| 4 | Application | Staging build pipeline green | CI artifact available |
| 5 | Application | Health endpoints routable | `/api/health` → 200 |
| 6 | Monitoring | 5-minute poll configured | Dashboard shows checks |
| 7 | Monitoring | Alert on `unhealthy` > 5 min | Alert fires in test |
| 8 | Backup | Scheduled backup job | First backup completes |
| 9 | Security | Fail-closed enabled | 401 on unauthenticated |
| 10 | Security | Secrets scan clean | No credentials in repo |
| 11 | Operations | Runbooks accessible | 8 runbooks in registry |
| 12 | Operations | Evidence archive directory | `docs/Operations/Gate7-Evidence/` created |
| 13 | Operations | Rollback procedure documented | Previous tag identified |
| 14 | Governance | OPS-001 daily standup scheduled | Calendar confirmed |

---

# 3. OPS-001 Execution

## 3.1 Mission Overview

**OPS-001:** Live staging PostgreSQL GA-001 evidence collection.

| Field | Value |
|-------|-------|
| **Severity** | P0 |
| **Phase** | 7A |
| **Owner** | Platform Ops Lead |
| **Engineering status** | ✅ Substantially closed (P-011.2 · P-011.3) |
| **Operational status** | ⏳ Open — In Progress |
| **Target closure** | September 2026 (P-018.1 §5.10 W5) |

**OPS-001 closes when:** Gate 6 validation verdict = `pass` on live staging · all 22 evidence checklist staging items = ✅ · ENT-R-003 closed.

## 3.2 OPS-001 Timeline

| Week | Activity | Deliverable | Owner |
|------|----------|-------------|-------|
| **W1** | Staging infra validation · pre-deployment checklist | Checklist signed | Platform Ops + Infra |
| **W2** | Live deployment · migrations · composition root wiring | Staging operational | Platform Ops |
| **W3** | Scenario replay (items 1–7) | Partial evidence log | Platform Ops |
| **W4** | Scenario replay (items 8–14) · Gate 6 validation | Gate 6 `pass` verdict | Platform Ops |
| **W5** | Evidence archive · OPS-001 closure · OPS-002 start | OPS-001 closed | Platform Ops Lead |

## 3.3 Pre-Deployment Checklist (OPS-001)

Complete all items before staging deployment:

| # | Item | Owner | Verification | Status |
|---|------|-------|--------------|:------:|
| 1 | Staging PostgreSQL instance provisioned | Infra | Connection test | ⏳ |
| 2 | `DATABASE_URL` configured for staging | Platform Ops | Secrets vault | ⏳ |
| 3 | `NODE_ENV=staging` confirmed | Platform Ops | Env audit | ⏳ |
| 4 | Full migration registry deployed | Platform Eng | Migration version log | ⏳ |
| 5 | IIL durable transport configured | Platform Eng | IIL health check | ⏳ |
| 6 | Health endpoints registered with monitoring | Platform Ops | Dashboard live | ⏳ |
| 7 | Rollback procedure documented | Platform Eng | Rollback tag identified | ✅ |

**Go/No-Go:** Platform Ops Lead signs pre-deployment checklist. **No deployment without all 7 items complete.**

## 3.4 Step 1 — Provision PostgreSQL

### Procedure

1. **Request staging PostgreSQL instance** from Infra team
   - Version: PostgreSQL ≥ 14
   - Size: Minimum 2 vCPU · 4 GB RAM · 50 GB storage (adjust per load test plan)
   - Network: Accessible from staging application subnet only

2. **Create database and user**
   ```sql
   CREATE DATABASE orion_staging;
   CREATE USER orion_app WITH ENCRYPTED PASSWORD '<from-secrets-vault>';
   GRANT ALL PRIVILEGES ON DATABASE orion_staging TO orion_app;
   ```

3. **Verify connectivity**
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1 AS connectivity_test;"
   ```

4. **Configure connection pooling** (if PgBouncer)
   - Pool mode: transaction
   - Max connections: 20
   - Verify platform pool does not exhaust connections

5. **Configure backup schedule**
   - Daily automated backup
   - Retention: 30 days
   - Verify first backup completes before OPS-004

6. **Record infrastructure details** in Appendix A inventory

### Acceptance

| Criterion | Pass |
|-----------|:----:|
| `SELECT 1` succeeds from staging app subnet | ✅ |
| Connection string in secrets vault (not repo) | ✅ |
| Backup schedule active | ✅ |
| Inventory updated | ✅ |

## 3.5 Step 2 — Platform Initialization

Follow [Runbook-Platform-Startup](./Runbook-Platform-Startup.md):

1. **Verify environment variables** (Appendix D)
2. **Build staging artifact**
   ```bash
   npm run build
   ```
3. **Initialize PlatformStore**
   - `verifyPlatformStartup()` via operational script or API bootstrap
   - Confirm lifecycle → `initialized`
4. **Start application process**
   ```bash
   npm start
   ```
5. **Verify health endpoints**
   - `GET /api/health` → 200 · status `healthy` or `degraded`
   - `GET /api/health/readiness` → not `not_ready`
   - `GET /api/health/operations` → `healthy`

### Acceptance

| Check | Expected |
|-------|----------|
| `verifyPlatformStartup()` | `healthy` or `degraded` |
| `platform_store` check | `healthy` |
| `platform_security` check | `healthy` |
| Domain checks registered | `hcm_platform` · `finance_platform` · `crm_platform` · `procurement_platform` |

## 3.6 Step 3 — Migration Verification

1. **Confirm migration auto-run enabled** or execute manually via `MigrationRunner`
2. **Verify full migration registry applied**
   - Check migration version table matches expected registry
   - No pending migrations
3. **Validate schema integrity**
   - All domain backing tables present
   - No migration errors in application log
4. **Record migration version** in Gate 7 evidence log

### Acceptance

| Criterion | Pass |
|-----------|:----:|
| All migrations applied | ✅ |
| Migration version matches registry | ✅ |
| No migration errors in log | ✅ |
| Persistence health check green | ✅ |

## 3.7 Step 4 — PlatformStore Validation

Execute PlatformStore lifecycle verification on live staging:

| # | Scenario | Method | Pass Criteria |
|---|----------|--------|---------------|
| 1 | Cold boot | `verifyPostgresColdBoot()` | Store initialized · health green |
| 2 | Warm restart | `verifyPostgresWarmRestart()` | Hydration preserved |
| 3 | Multiple restart (3×) | `verifyPostgresMultipleRestartCycles()` | No corruption |
| 4 | Transaction recovery | `verifyPostgresTransactionRecovery()` | Rollback succeeds · store operational |
| 5 | Organization isolation | `verifyPostgresOrganizationIsolation()` | Cross-tenant denied |
| 6 | Lifecycle audit | PlatformStore lifecycle state | `initialized` after boot |

**Execution:** Use operational certification script or invoke via `EnterpriseReadinessService` on staging context with live connection.

**Reference:** [PostgreSQL Operational Certification](./PostgreSQL-Operational-Certification.md)

## 3.8 Step 5 — Composition Root Verification

Wire and verify all four Gate 5 composition roots on staging:

| Root | Wiring Function | Verification |
|------|-----------------|--------------|
| Finance | `createFinanceWiring` | Finance platform health green |
| CRM | `createCrmWiring` | CRM platform health green |
| Procurement | `createProcurementWiring` | Procurement platform health green |
| HCM | HCM composition root | HCM platform health green |

### Procedure

1. Confirm all four domain backings hydrated after PlatformStore init
2. Verify `HealthStatusService.verifyHealth()` reports all domain checks ≥ `partial`
3. Execute domain hydration check via `verifyDomains()`
4. Confirm canonical event publishers registered via `verifyEventInfrastructure()`

### Acceptance

| Criterion | Pass |
|-----------|:----:|
| All four composition roots resolve | ✅ |
| All four domain backings populated | ✅ |
| Canonical event infrastructure ready | ✅ |
| Health aggregation ≥ partial all checks | ✅ |

## 3.9 Step 6 — Gate 6 Validation Replay

Execute full Gate 6 validation on live staging:

```bash
# On staging environment with live PostgreSQL context:
# Invoke enterpriseReadinessService.executeGate6Validation(context)
```

### Scenario Replay Matrix

| # | Scenario | Staging Action | Pass |
|---|----------|----------------|:----:|
| 1 | Platform startup | Runbook startup → health probe | ⏳ |
| 2 | Platform shutdown | Runbook shutdown → lifecycle | ⏳ |
| 3 | Cold boot | Fresh store → initialize | ⏳ |
| 4 | Warm restart | Shutdown → re-init → hydration | ⏳ |
| 5 | Multiple restart (3×) | 3× init/shutdown cycles | ⏳ |
| 6 | Transaction recovery | Begin → rollback → verify | ⏳ |
| 7 | Organization isolation | Cross-tenant negative test | ⏳ |
| 8 | PlatformStore lifecycle | Lifecycle state audit | ⏳ |
| 9 | Composition roots | Wire all four roots | ⏳ |
| 10 | Domain hydration | HCM · Finance · CRM · Procurement | ⏳ |
| 11 | Canonical events | Pipeline registries ready | ⏳ |
| 12 | Health aggregation | 10+ checks | ⏳ |
| 13 | Security | SecurityHealthService | ⏳ |
| 14 | Full Gate 6 report | `executeGate6Validation()` | ⏳ |

**Target verdict:** `pass` (transition from Gate 6 engineering `conditional_pass`)

### Evidence Archive

Archive outputs to `docs/Operations/Gate7-Evidence/`:

| Artifact | Filename Pattern |
|----------|------------------|
| Gate 6 validation report | `gate6-validation-staging-YYYY-MM-DD.json` |
| PostgreSQL certification report | `postgres-cert-staging-YYYY-MM-DD.json` |
| Readiness report | `readiness-staging-YYYY-MM-DD.json` |
| Scenario execution log | `ops001-scenario-log-YYYY-MM-DD.md` |

## 3.10 Step 7 — Reference Chain Smoke Tests

After PlatformStore validation, smoke-test three reference chains on staging:

| Chain | Route | Verification |
|-------|-------|--------------|
| **Hire-to-Retire** | HCM → Finance payroll event | Event published · Finance consumed |
| **Lead-to-Revenue** | CRM → Finance revenue event | Posting pipeline triggered |
| **Source-to-Pay** | Procurement → Finance AP event | AP journal created |

### Procedure

1. Seed minimal staging test data per chain (authorized test org only)
2. Trigger canonical event per chain
3. Verify downstream Finance consumption
4. Confirm no cross-tenant leakage
5. Archive chain smoke test log

## 3.11 OPS-001 Acceptance Checklist

| # | Criterion | Evidence | Met |
|---|-----------|----------|:---:|
| 1 | Gate 6 validation verdict = `pass` on live staging | Archived report | ⏳ |
| 2 | All 22 Gate 6 evidence checklist staging items = ✅ | Updated checklist | ⏳ |
| 3 | ENT-R-003 closed | Sign-off record | ⏳ |
| 4 | Warm restart preserves four domain backings | Certification log | ⏳ |
| 5 | Three reference chains smoke-tested | Chain test log | ⏳ |
| 6 | OPS-002 monitoring initiated | Dashboard timestamp | ⏳ |

**OPS-001 closure:** Platform Ops Lead signs acceptance · Program Director acknowledges · update [Gate6-Evidence-Checklist](./Gate6-Evidence-Checklist.md) staging column.

---

# 4. Deployment Procedure

## 4.1 Overview

Gate 7 deployments target **staging only** unless explicitly authorized for production post Gate 7 pass. All deployments follow [Runbook-Production-Deployment](./Runbook-Production-Deployment.md) adapted for staging.

## 4.2 Pre-Deployment

### Pre-Deployment Checklist

| # | Item | Owner | Verification |
|---|------|-------|--------------|
| 1 | CI quality gate passed on release branch | Platform Eng | CI green |
| 2 | Staging OPS-001 evidence current (if re-deploy) | Platform Ops | Evidence date ≤ 30 days |
| 3 | Rollback artifact identified | Platform Eng | Previous tag recorded |
| 4 | Migration compatibility reviewed | Platform Eng | No breaking migrations |
| 5 | Change window communicated | Platform Ops | Stakeholders notified |
| 6 | On-call engineer assigned | Platform Ops | Contact confirmed |
| 7 | Database backup taken (if schema change) | Infra | Backup timestamp recorded |

### CI Quality Gate

```bash
npm test
npm run build
```

Verify deployment health assessment passes before staging promotion.

## 4.3 Deployment Steps

1. **Build production artifact**
   ```bash
   npm run build
   ```

2. **Record deployment correlation ID**
   - Git commit SHA
   - Build number
   - Deployment timestamp

3. **Deploy to staging**
   - Apply new application version
   - Do not route external traffic until health verified

4. **Apply migrations** (if included in release)
   - Migrations run via `PlatformStore.initialize()` or manual `MigrationRunner`
   - Monitor migration log for errors

5. **Initialize PlatformStore**
   - Execute startup runbook (§3.5)

6. **Wire composition roots**
   - Verify all four domain platforms register

## 4.4 Post-Deployment Verification

### Immediate Verification (0–15 minutes)

| Check | Endpoint / Method | Expected |
|-------|-------------------|----------|
| Liveness | `GET /api/health` | 200 · healthy/degraded |
| Readiness | `GET /api/health/readiness` | not `not_ready` |
| Operations | `GET /api/health/operations` | healthy |
| Security | `GET /api/health/security` | fail-closed active |
| Domain platforms | HealthStatusService | All ≥ partial |

### Extended Verification (15–60 minutes)

| Check | Duration | Expected |
|-------|----------|----------|
| Continuous health poll | 15 min | No `unhealthy` |
| Smoke test suite | Once | Pass |
| Log review | 15 min | No ERROR/FATAL |
| Connection pool monitor | 15 min | No exhaustion |

### Staging Smoke Test Commands

```bash
# Platform operations suite on staging-connected environment
npx vitest run tests/lib/platform/operations/Gate6OperationalValidation.test.ts

# Unauthenticated access rejection
curl -s -o /dev/null -w "%{http_code}" https://staging.orion/api/hcm/employees
# Expected: 401
```

## 4.5 Rollback Procedure

Execute rollback if health degrades during verification window:

1. **Stop routing traffic** to new deployment
2. **Deploy previous known-good release tag**
3. **Verify migration rollback compatibility**
   - If migration is forward-only, restore database from pre-deploy backup
4. **Re-initialize PlatformStore** on rollback version
5. **Execute monitoring runbook** — confirm health green
6. **Notify stakeholders** — document rollback reason
7. **Schedule post-incident review** within 5 business days

### Rollback Decision Matrix

| Condition | Action |
|-----------|--------|
| `unhealthy` > 5 minutes | Immediate rollback |
| `degraded` > 15 minutes | Investigate · rollback if unresolved |
| Migration failure | Rollback + database restore if needed |
| Data corruption suspected | DR runbook (§7) |

## 4.6 Post-Deployment Activities

| Activity | Timing | Owner |
|----------|--------|-------|
| Update deployment log | Immediate | Platform Ops |
| Archive health snapshots | +15 min | Platform Ops |
| Update Gate 7 evidence (if OPS-001 active) | Same day | Platform Ops |
| Communicate deployment success | +1 hour | Platform Ops Lead |
| Schedule next monitoring review | +4 hours | Platform Ops |

---

# 5. Operational Monitoring

## 5.1 Overview

Operational monitoring is the foundation for OPS-002 (72-hour green window) and ongoing Gate 7 health assurance.

**Reference:** [Runbook-Operational-Monitoring](./Runbook-Operational-Monitoring.md)

## 5.2 Health Services

### Health Endpoints

| Endpoint | Purpose | Poll Interval | Expected |
|----------|---------|:-------------:|----------|
| `GET /api/health` | Liveness | 5 min | `healthy` or `degraded` |
| `GET /api/health/readiness` | Release readiness | 5 min | Score ≥ threshold |
| `GET /api/health/operations` | Operational aggregation | 5 min | `healthy` |
| `GET /api/health/security` | Security posture | 15 min | Fail-closed active |
| `GET /api/health/metrics` | Performance baselines | 15 min | Within thresholds |

### Registered Health Checks

| Check | Subsystem | Critical |
|-------|-----------|:--------:|
| `environment` | Configuration validation | ✅ |
| `logging` | Structured logging | — |
| `errors` | Client error rate | ✅ |
| `platform_store` | PlatformStore health | ✅ |
| `platform_store_live` | Async PostgreSQL probe | ✅ |
| `hcm_platform` | HCM domain backing | ✅ |
| `finance_platform` | Finance domain backing | ✅ |
| `crm_platform` | CRM domain backing | ✅ |
| `procurement_platform` | Procurement domain backing | ✅ |
| `platform_security` | RBAC and security catalog | ✅ |
| `rbac_fail_closed` | Authorization enforcement | ✅ |
| `backup_readiness` | Backup policy compliance | — |
| `disaster_recovery` | DR procedure readiness | — |

## 5.3 Metrics

### Platform Metrics (OPS-002 / OPS-003)

| Metric | Source | Baseline Target |
|--------|--------|:---------------:|
| Health check pass rate | Monitoring dashboard | 100% |
| REST p95 latency (reads) | `/api/health/metrics` | ≤ 500ms |
| REST p95 latency (writes) | `/api/health/metrics` | ≤ 1000ms |
| PostgreSQL query p95 | PlatformStore probe | ≤ 200ms |
| Event throughput | IIL metrics | ≥ 100 events/min |
| Concurrent sessions | Load test | ≥ 50 |
| Restart recovery time | Startup runbook | ≤ 60s |
| Error rate | `errors` health check | < 1% |
| Connection pool utilization | DB monitor | < 80% |

### Domain Metrics

| Metric | Domain | Alert Threshold |
|--------|--------|:---------------:|
| Platform health status | All four | `unhealthy` |
| DLQ depth | IIL (when enabled) | > 100 messages |
| Auth failure rate | Security | > 5% spike |
| Posting pipeline latency | Finance | > 2s p95 |

## 5.4 Alerts

### Alert Configuration

| Alert | Condition | Severity | Response |
|-------|-----------|:--------:|----------|
| Platform unhealthy | `unhealthy` any critical check | P0 | Incident response (§10) |
| Sustained degraded | `degraded` > 15 min | P1 | Investigate subsystem |
| Health poll failure | 3 consecutive poll failures | P1 | Check network · restart probe |
| DLQ depth high | > 100 messages | P1 | IIL investigation |
| Connection pool exhaustion | > 90% utilization | P0 | Scale pool · investigate leak |
| Backup failure | Scheduled backup miss | P1 | Infra escalation |
| Auth failure spike | > 5% increase | P2 | Security review |

### OPS-002 Alert Rules

During 72-hour monitoring window:

- **Any `unhealthy` > 5 minutes** → incident response · **72h window restarts from Hour 0**
- **3+ consecutive `degraded`** → investigate · document · may restart window if unresolved > 15 min

## 5.5 Logging

| Requirement | Staging | Production |
|-------------|:-------:|:----------:|
| `ORION_LOG_FORMAT=json` | ✅ Required | ✅ Required |
| Structured fields (timestamp · level · correlationId) | ✅ | ✅ |
| No secrets in logs | ✅ | ✅ |
| Log retention | 30 days | 90 days |
| Centralized aggregation | Recommended | Required |

### Log Review Procedure (Daily)

1. Filter ERROR and FATAL entries in last 24 hours
2. Correlate with health check degradation events
3. Document anomalies in ops daily log
4. Escalate P0 patterns immediately

## 5.6 Dashboards

### Gate 7 Monitoring Dashboard (Required)

| Panel | Content |
|-------|---------|
| **Health Overview** | All 13+ checks · current status |
| **72h Window** | OPS-002 countdown · green/red timeline |
| **Domain Platforms** | HCM · Finance · CRM · Procurement status |
| **PostgreSQL** | Connection pool · query latency |
| **Events** | Throughput · DLQ depth |
| **Deployments** | Last deploy · version · correlation ID |

### Dashboard Review Schedule

| Review | Frequency | Owner |
|--------|-----------|-------|
| Health overview | Every 4 hours (OPS-002) | Platform Ops |
| Full dashboard | Daily standup | Platform Ops Lead |
| Trend analysis | Weekly | Program Director |

## 5.7 Escalation

See [Appendix C — Escalation Matrix](#appendix-c--escalation-matrix).

| Severity | Condition | First Responder | Escalation Time |
|----------|-----------|-----------------|:---------------:|
| P0 | Platform `unhealthy` on staging | Platform Ops on-call | 15 min → Ops Lead |
| P0 | Data corruption suspected | Platform Ops + Eng | Immediate → Executive Sponsor |
| P1 | Sustained `degraded` | Platform Ops | 30 min → Ops Lead |
| P1 | Performance threshold breach | Platform Ops + Eng | 1 hour → Program Director |
| P2 | Non-critical warning | Platform Ops | Next business day |

---

# 6. Performance Validation

## 6.1 Overview

**OPS-003:** Establish performance baselines on staging for Release Candidate planning.

| Field | Value |
|-------|-------|
| **Phase** | 7C |
| **Owner** | Platform Ops |
| **Prerequisite** | OPS-001 closed |
| **Standard** | ES-096 Testing & Certification Standards |
| **Deliverable** | OPS-003 Performance Baseline Report |

## 6.2 Load Testing Procedure

### Pre-Test Checklist

| # | Item | Verification |
|---|------|--------------|
| 1 | OPS-001 closed · staging stable | Gate 6 pass |
| 2 | Baseline health green | Dashboard snapshot |
| 3 | Test data seeded | Authorized test org |
| 4 | Load test tool configured | k6 · Artillery · or equivalent |
| 5 | Monitoring dashboard active | All panels live |
| 6 | On-call engineer assigned | Contact confirmed |

### Test Scenarios

| Scenario | Description | Duration | Target |
|----------|-------------|----------|--------|
| **Baseline read load** | GET health + domain read routes | 15 min | p95 ≤ 500ms |
| **Write load** | POST/PUT mutating routes (test org) | 15 min | p95 ≤ 1000ms |
| **Event throughput** | Canonical event publish/consume | 15 min | ≥ 100 events/min |
| **Concurrent users** | 50 simulated sessions | 15 min | No `unhealthy` |
| **Sustained load** | Mixed read/write | 60 min | Stable · no degradation |
| **Restart under load** | Warm restart during load | 5 min | Recovery ≤ 60s |

## 6.3 Response Time Measurement

| Route Class | Method | p95 Target | p99 Target |
|-------------|--------|:----------:|:----------:|
| Health endpoints | GET | ≤ 100ms | ≤ 250ms |
| Domain reads | GET | ≤ 500ms | ≤ 1000ms |
| Domain writes | POST/PUT | ≤ 1000ms | ≤ 2000ms |
| Finance posting | POST | ≤ 1500ms | ≤ 3000ms |
| Event publish | Internal | ≤ 200ms | ≤ 500ms |

### Measurement Procedure

1. Execute load test scenario
2. Collect p50 · p95 · p99 from monitoring or load tool
3. Record in OPS-003 report template
4. Compare against ES-096 targets
5. Document any threshold breaches with root cause

## 6.4 Memory and CPU

| Metric | Measurement | Acceptable Range |
|--------|-------------|:----------------:|
| Node.js heap used | Process monitor | < 80% of allocated |
| Node.js RSS | Process monitor | Stable over 60 min load |
| CPU utilization | Host monitor | < 70% sustained |
| CPU spike | During restart | < 90% for ≤ 30s |
| Memory leak | 60 min sustained load | < 5% growth |

### Procedure

1. Record baseline memory/CPU before load test
2. Run sustained load scenario (60 min)
3. Sample every 5 minutes
4. Plot trend — flag monotonic memory growth
5. Archive graphs in Gate 7 evidence

## 6.5 Database Performance

| Metric | Target | Measurement |
|--------|:------:|-------------|
| Query p95 (repository reads) | ≤ 200ms | PostgreSQL slow query log |
| Connection acquisition | ≤ 50ms | Pool monitor |
| Transaction commit | ≤ 100ms | Application metrics |
| Pool utilization under load | < 80% | DB monitor |
| Lock wait time | < 100ms p95 | PG stat views |

### Procedure

1. Enable slow query logging (threshold 200ms) during load test
2. Review top 10 slow queries post-test
3. Verify no connection pool exhaustion
4. Document findings in OPS-003 report

## 6.6 Acceptance Thresholds (OPS-003)

OPS-003 is **closed** when:

| # | Criterion | Target | Met |
|---|-----------|--------|:---:|
| 1 | REST read p95 documented | ≤ 500ms | ⏳ |
| 2 | REST write p95 documented | ≤ 1000ms | ⏳ |
| 3 | Event throughput documented | ≥ 100 events/min | ⏳ |
| 4 | Concurrent users tested | ≥ 50 sessions | ⏳ |
| 5 | Restart recovery measured | ≤ 60s | ⏳ |
| 6 | PostgreSQL query p95 documented | ≤ 200ms | ⏳ |
| 7 | OPS-003 report archived | Gate 7 evidence | ⏳ |

---

# 7. Disaster Recovery

## 7.1 Overview

**OPS-004:** Validate backup · restore · recovery · failover procedures with measured RTO/RPO.

| Field | Value |
|-------|-------|
| **Phase** | 7C |
| **Owner** | Platform Ops Lead |
| **Prerequisite** | OPS-001 closed |
| **Reference** | [Runbook-Disaster-Recovery](./Runbook-Disaster-Recovery.md) |

## 7.2 Policy Targets

| Metric | Staging Target | Production Target |
|--------|:--------------:|:-----------------:|
| **RPO** (Recovery Point Objective) | ≤ 1 hour | ≤ 1 hour |
| **RTO** (Recovery Time Objective) | ≤ 60 minutes | ≤ 60 minutes |
| **Retention** | 30 days | 30 days |

## 7.3 Backup Procedure

### Scheduled Backup

1. Verify backup schedule configured on staging PostgreSQL
2. Confirm backup job executes without error
3. Record backup timestamp and size
4. Verify backup integrity checksum via `BackupService.assessBackupReadiness()`
5. Document retention policy compliance (ADR-012)

### Backup Verification Checklist

| # | Item | Pass |
|---|------|:----:|
| 1 | Scheduled backup completes | ⏳ |
| 2 | Backup integrity checksum valid | ⏳ |
| 3 | Retention policy documented | ⏳ |
| 4 | RPO target recorded (≤ 1 hour staging) | ⏳ |
| 5 | Backup stored in secure location | ⏳ |

## 7.4 Restore Procedure

### Restore Steps

1. **Assess incident scope**
   - `GET /api/health/operations` — identify failed subsystem
   - Review operational diagnostics and structured logs

2. **Validate latest backup**
   - Confirm backup artifact integrity
   - Record backup timestamp vs incident time (RPO calculation)

3. **Stop write traffic**
   - Execute [Platform Shutdown](./Runbook-Platform-Shutdown.md)
   - Confirm no active transactions

4. **Restore database**
   - Restore PostgreSQL from verified backup artifact
   - Follow provider-specific restore procedure

5. **Reinitialize PlatformStore**
   - Run migrations via `PlatformStore.initialize()`
   - Verify migration version matches registry

6. **Validate recovery readiness**
   - `disasterRecoveryService.validateRecoveryReadiness()`

7. **Verify health**
   - Execute operational monitoring runbook
   - Confirm all critical checks green

## 7.5 Recovery Validation

| Step | Action | Acceptance |
|------|--------|------------|
| 1 | Simulate platform failure | Incident logged |
| 2 | Execute shutdown runbook | Clean shutdown verified |
| 3 | Restore from backup | Restore completes without error |
| 4 | Cold boot PlatformStore | Store initialized |
| 5 | Confirm transaction recovery | Rollback scenario pass |
| 6 | Measure RTO | ≤ 60 minutes documented |
| 7 | Measure RPO | ≤ 1 hour documented |
| 8 | Re-run health verification | All critical checks green |

## 7.6 Failover Procedure

### PostgreSQL Failover (if replication configured)

1. Detect primary failure via health check or Infra alert
2. Promote standby to primary (provider-specific)
3. Update `DATABASE_URL` in secrets vault
4. Restart application via startup runbook
5. Verify health green
6. Document failover timeline

**Note:** Failover testing is recommended but not mandatory for OPS-004 closure if single-instance staging is used. Document architecture limitation in OPS-004 report.

## 7.7 OPS-004 Acceptance

| # | Criterion | Evidence | Met |
|---|-----------|----------|:---:|
| 1 | Backup executed and verified | Backup log | ⏳ |
| 2 | Restore completed successfully | Restore log | ⏳ |
| 3 | RTO measured and documented | OPS-004 report | ⏳ |
| 4 | RPO measured and documented | OPS-004 report | ⏳ |
| 5 | Platform operational post-recovery | Health snapshot | ⏳ |
| 6 | DR drill report archived | Gate 7 evidence | ⏳ |

---

# 8. Security Validation

## 8.1 Overview

Security validation on staging confirms fail-closed posture · RBAC enforcement · secrets hygiene · and audit logging before Gate 7 pass.

**Reference:** [Security Hardening Guide](../Platform/Security/Security-Hardening-Guide.md)

## 8.2 RBAC Validation

### Fail-Closed Route Audit

Verify unauthenticated requests return 401 on all Gate 5 routes:

| Domain | Routes | Fail-Closed | Staging Verified |
|--------|:------:|:-----------:|:----------------:|
| Finance | ~40 | ✅ Engineering | ⏳ |
| CRM | 47 | ✅ Engineering | ⏳ |
| Procurement | ~30 | ✅ Engineering | ⏳ |
| HCM | ~37 | ⚐ Partial | ⏳ |

### RBAC Test Procedure

1. **Unauthenticated access test**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://staging.orion/api/hcm/employees
   # Expected: 401
   ```
2. **Cross-organization access test** — user in Org A cannot access Org B data
3. **Permission denial test** — authenticated user without permission receives 403
4. **Super admin audit** — super_admin cross-org access logged

### Acceptance

| Criterion | Pass |
|-----------|:----:|
| All Gate 5 routes reject unauthenticated (where fail-closed) | ⏳ |
| Cross-tenant isolation enforced | ⏳ |
| Permission catalog matches route map | ⏳ |
| HCM REST gap documented (ENT-R-015) | ⏳ |

## 8.3 Authentication Validation

| Control | Verification Method | Expected |
|---------|---------------------|----------|
| Session tokens HMAC-signed | Code review + runtime test | Valid signature |
| Fail-closed in staging | `ORION_AUTH_FAIL_CLOSED=true` | 401 unauthenticated |
| No default API context | Route handler audit | Context required |
| Session expiry | Token TTL test | Expired → 401 |

## 8.4 Authorization Validation

| Control | Verification |
|---------|--------------|
| Default deny | Unknown permissions rejected |
| Organization isolation | Cross-org denied (except audited super_admin) |
| Route permissions | Catalog maps routes → permissions |
| Least privilege | Role registry minimum permissions |

## 8.5 Secrets Validation

| Rule | Verification |
|------|--------------|
| No hard-coded production secrets | Repository scan |
| Secrets from environment only | ADR-010 compliance |
| `ORION_DEMO_PASSWORD` not set | Environment audit |
| `ORION_SESSION_SECRET` ≥ 32 bytes | Secrets vault |
| `DATABASE_URL` not in repository | Git history scan |
| Weak defaults rejected | `validateEnvironment()` pass |

## 8.6 Certificates and TLS

| Item | Staging | Production |
|------|:-------:|:----------:|
| HTTPS termination | ✅ Required | ✅ Required |
| Valid certificate | ✅ Required | ✅ Required |
| Certificate expiry monitoring | Recommended | Required |
| HSTS (production) | — | Required |

## 8.7 Audit Logs

| Requirement | Verification |
|-------------|--------------|
| Mutating routes emit audit events | Sample mutation trace |
| Authentication events logged | Login/logout audit |
| Authorization denials logged | 403 trace |
| Audit log format structured JSON | Log review |
| No PII in audit metadata beyond policy | Compliance review |

## 8.8 Security Validation Checklist

| # | Item | Owner | Met |
|---|------|-------|:---:|
| 1 | RBAC fail-closed spot-check all Gate 5 routes | Security | ⏳ |
| 2 | Cross-tenant negative test suite | Security | ⏳ |
| 3 | Auth middleware coverage audit | Security | ⏳ |
| 4 | Audit logging on mutating routes | Security | ⏳ |
| 5 | Secrets not in repository | Security | ⏳ |
| 6 | `ORION_AUTH_FAIL_CLOSED=true` confirmed | Platform Ops | ⏳ |
| 7 | Security health check green | Platform Ops | ⏳ |

---

# 9. Operational Checklists

## 9.1 Daily Checklist (During Gate 7 Active Phases)

| # | Task | Owner | Time |
|---|------|-------|------|
| 1 | Review health dashboard — all checks | Platform Ops | 09:00 |
| 2 | Check OPS-002 72h window status (if active) | Platform Ops | 09:00 |
| 3 | Review ERROR/FATAL logs (24h) | Platform Ops | 09:30 |
| 4 | Verify backup job status | Platform Ops | 10:00 |
| 5 | OPS-001 standup (Phase 7A only) | Platform Ops Lead | 09:00 |
| 6 | Update Gate 7 evidence log | Platform Ops | EOD |
| 7 | Confirm on-call contact reachable | Platform Ops | EOD |

## 9.2 Weekly Checklist

| # | Task | Owner |
|---|------|-------|
| 1 | Gate 7 weekly status report to steering committee | Program Director |
| 2 | Risk register review and update | Program Director |
| 3 | CI operations suite green confirmation | Platform Eng |
| 4 | Staging deployment log review | Platform Ops |
| 5 | Security scan (secrets · dependencies) | Security |
| 6 | Evidence checklist progress update | Platform Ops |
| 7 | Phase gate readiness assessment | Program Director |

## 9.3 Monthly Checklist

| # | Task | Owner |
|---|------|-------|
| 1 | Executive briefing preparation | Program Director |
| 2 | Infrastructure inventory update (Appendix A) | Platform Ops |
| 3 | Runbook accuracy review | Platform Ops |
| 4 | DR backup restore spot-check | Platform Ops + Infra |
| 5 | Performance trend review | Platform Ops |
| 6 | Operational contact list update (Appendix B) | Program Director |

## 9.4 Release Checklist (Staging Deployment)

| # | Task | Owner | Complete |
|---|------|-------|:--------:|
| 1 | CI quality gate passed | Platform Eng | ☐ |
| 2 | Pre-deployment checklist complete (§4.2) | Platform Ops | ☐ |
| 3 | Rollback artifact identified | Platform Eng | ☐ |
| 4 | Database backup (if schema change) | Infra | ☐ |
| 5 | Deploy to staging | Platform Ops | ☐ |
| 6 | Migration verification | Platform Eng | ☐ |
| 7 | Health endpoints green (§4.4) | Platform Ops | ☐ |
| 8 | Smoke tests pass | QA | ☐ |
| 9 | 15-minute monitoring window clean | Platform Ops | ☐ |
| 10 | Deployment log updated | Platform Ops | ☐ |
| 11 | Stakeholders notified | Platform Ops Lead | ☐ |

## 9.5 Incident Checklist

| # | Task | Owner | Timing |
|---|------|-------|--------|
| 1 | Acknowledge alert / report | On-call | ≤ 5 min |
| 2 | Assess severity (P0/P1/P2) | On-call | ≤ 10 min |
| 3 | Execute relevant failure scenario (§10) | On-call | Immediate |
| 4 | Escalate per Appendix C | On-call | Per matrix |
| 5 | Update status page / stakeholders | Ops Lead | ≤ 30 min |
| 6 | Document timeline in incident log | On-call | Continuous |
| 7 | Resolve and verify health green | On-call + Eng | Per SLA |
| 8 | Post-incident review scheduled | Program Director | ≤ 5 business days |
| 9 | Update Gate 7 evidence if staging affected | Platform Ops | ≤ 24 hours |
| 10 | OPS-002 window restart assessment (if applicable) | Platform Ops Lead | Immediate |

---

# 10. Failure Scenarios

## 10.1 Database Unavailable

### Symptoms

- `platform_store` health check → `unhealthy`
- `platform_store_live` probe fails
- Application errors: connection refused · timeout · pool exhausted

### Recovery Procedure

1. **Confirm scope** — PostgreSQL down vs network vs credentials
2. **Check PostgreSQL service status** on host/container
3. **Verify connection string** in secrets vault (no rotation mismatch)
4. **Check connection pool** — kill leaked connections if exhausted
5. **If PostgreSQL down:**
   - Restart PostgreSQL service
   - Verify `SELECT 1` succeeds
   - Execute platform startup runbook
6. **If data corruption suspected:**
   - Execute DR runbook (§7) — restore from backup
7. **Verify health green** — all checks pass
8. **Document incident** — root cause · timeline · RTO

### Escalation

Platform Ops → Platform Eng (15 min) → Executive Sponsor (if > 60 min)

## 10.2 Service Failure

### Symptoms

- Individual domain platform check → `unhealthy` or `degraded`
- Specific API routes return 500
- One domain backing fails hydration

### Recovery Procedure

1. **Identify failing subsystem** via `/api/health/operations`
2. **Review application logs** for domain-specific errors
3. **Check composition root wiring** — domain may have failed to initialize
4. **Attempt warm restart:**
   - Shutdown runbook → Startup runbook
   - Verify domain hydration restored
5. **If persistent:**
   - Escalate to Platform Engineering for hotfix triage
   - Do not deploy unreviewed patches to staging during OPS-002 window
6. **Verify all domain checks green**

## 10.3 Platform Restart

### Planned Restart

1. Notify stakeholders of maintenance window
2. Execute [Platform Shutdown](./Runbook-Platform-Shutdown.md)
3. Wait 30 seconds for connection drain
4. Execute [Platform Startup](./Runbook-Platform-Startup.md)
5. Verify health green within 60 seconds
6. Confirm warm restart hydration (all four domain backings)

### Unplanned Restart (Crash)

1. Detect via health poll failure or process monitor alert
2. Check application logs for crash reason (OOM · uncaught exception)
3. Execute startup runbook
4. Verify health green
5. Run warm restart validation scenario
6. If OPS-002 active: assess whether 72h window must restart
7. Document crash root cause · escalate if recurring

## 10.4 Event Backlog

### Symptoms

- IIL DLQ depth increasing
- Event throughput below baseline
- Finance posting delays · chain events not consumed

### Recovery Procedure

1. **Check IIL health** and DLQ depth on monitoring dashboard
2. **Identify failing consumer** — Finance · CRM · Procurement subscriber
3. **Verify downstream domain health** — consumer domain must be green
4. **Pause event publishing** if backlog critical (> 1000 messages)
5. **Restart consumer domain** via warm restart
6. **Replay DLQ messages** per IIL operational procedure (P-009.16)
7. **Verify throughput** returns to ≥ 100 events/min
8. **Monitor for 30 minutes** — confirm backlog draining

## 10.5 Network Failure

### Symptoms

- Health poll failures from monitoring
- Intermittent 502/503 from load balancer
- PostgreSQL connection timeouts

### Recovery Procedure

1. **Distinguish** application failure vs network failure
   - Can application host reach PostgreSQL directly?
   - Can monitoring reach health endpoints?
2. **Check infrastructure** — VPC · security groups · DNS · TLS
3. **Verify load balancer** health probe configuration
4. **If network restored:**
   - Execute startup runbook if application was stopped
   - Verify health green
5. **If prolonged (> 30 min):**
   - Escalate to Infra team
   - Assess OPS-002 window impact

## 10.6 Failure Response Summary

| Failure | Primary Runbook | RTO Target | OPS-002 Impact |
|---------|-------------------|:----------:|:--------------:|
| Database unavailable | DR + Startup | ≤ 60 min | Window restart |
| Service failure | Startup (warm restart) | ≤ 15 min | Assess case-by-case |
| Platform crash | Startup | ≤ 60 min | Window restart |
| Event backlog | IIL recovery | ≤ 30 min | Assess case-by-case |
| Network failure | Infra + Startup | ≤ 60 min | Window restart |

---

# 11. Acceptance Criteria

## 11.1 OPS-001 Acceptance

| # | Criterion | Evidence | Owner | Met |
|---|-----------|----------|-------|:---:|
| 1 | Gate 6 validation = `pass` on live staging | Archived report | Platform Ops | ⏳ |
| 2 | 22/22 Gate 6 evidence checklist staging items | Updated checklist | Platform Ops | ⏳ |
| 3 | ENT-R-003 closed | Risk sign-off | Program Director | ⏳ |
| 4 | Warm restart preserves four domain backings | Certification log | Platform Ops | ⏳ |
| 5 | Three reference chains smoke-tested | Chain test log | QA | ⏳ |
| 6 | OPS-002 monitoring initiated | Dashboard timestamp | Platform Ops | ⏳ |

## 11.2 OPS-002 Acceptance

| # | Criterion | Evidence | Owner | Met |
|---|-----------|----------|-------|:---:|
| 1 | 72 continuous hours health green | Monitoring log | Platform Ops | ⏳ |
| 2 | Zero `unhealthy` > 5 min events | Alert log | Platform Ops | ⏳ |
| 3 | `/api/health/operations` healthy ≥ 99% | Dashboard export | Platform Ops | ⏳ |
| 4 | All critical health checks green | Health snapshot | Platform Ops | ⏳ |
| 5 | OPS-002 closure report archived | Gate 7 evidence | Platform Ops | ⏳ |

## 11.3 OPS-003 Acceptance

| # | Criterion | Evidence | Owner | Met |
|---|-----------|----------|-------|:---:|
| 1 | REST read p95 ≤ 500ms documented | OPS-003 report | Platform Ops | ⏳ |
| 2 | REST write p95 ≤ 1000ms documented | OPS-003 report | Platform Ops | ⏳ |
| 3 | Event throughput ≥ 100 events/min | OPS-003 report | Platform Ops | ⏳ |
| 4 | 50 concurrent sessions tested | OPS-003 report | Platform Ops | ⏳ |
| 5 | Restart recovery ≤ 60s measured | OPS-003 report | Platform Ops | ⏳ |
| 6 | PostgreSQL query p95 ≤ 200ms | OPS-003 report | Platform Ops | ⏳ |

## 11.4 OPS-004 Acceptance

| # | Criterion | Evidence | Owner | Met |
|---|-----------|----------|-------|:---:|
| 1 | Backup executed and verified | Backup log | Platform Ops | ⏳ |
| 2 | Restore completed successfully | Restore log | Infra | ⏳ |
| 3 | RTO ≤ 60 minutes measured | OPS-004 report | Platform Ops | ⏳ |
| 4 | RPO ≤ 1 hour measured | OPS-004 report | Platform Ops | ⏳ |
| 5 | Platform operational post-recovery | Health snapshot | Platform Ops | ⏳ |

## 11.5 Gate 7 Pass Criteria

Gate 7 pass is declared when **all 10 criteria** from P-018.1 §3.7 are satisfied:

| # | Criterion | Evidence Owner | Met |
|---|-----------|----------------|:---:|
| 1 | OPS-001 closed — Gate 6 `pass` on live staging | Platform Ops | ⏳ |
| 2 | OPS-002 closed — 72h health green | Platform Ops | ⏳ |
| 3 | OPS-003 closed — performance baselines documented | Platform Ops | ⏳ |
| 4 | OPS-004 closed — DR drill with RTO/RPO | Platform Ops | ⏳ |
| 5 | All 8 runbooks executed on staging | Platform Ops | ⏳ |
| 6 | Deployment rollback drill pass | Platform Eng | ⏳ |
| 7 | Cross-tenant isolation verified | Security | ⏳ |
| 8 | Zero open P0 at Gate 7 exit | Program Director | ❌ (2 open) |
| 9 | Production readiness ≥ 78/100 | Program Director | ❌ (65/100) |
| 10 | Enterprise readiness ≥ 85/100 | Chief Architect | ❌ (82/100) |

**Gate 7 pass criteria met:** **0/10**

### Runbook Execution Requirements (Criterion 5)

| # | Runbook | Staging Executed |
|---|---------|:----------------:|
| 1 | Runbook-Platform-Startup | ⏳ |
| 2 | Runbook-Platform-Shutdown | ⏳ |
| 3 | Runbook-Production-Deployment | ⏳ |
| 4 | Runbook-Operational-Monitoring | ⏳ |
| 5 | Runbook-Disaster-Recovery | ⏳ |
| 6 | Platform Operations Runbook | ⏳ |
| 7 | Backup & Recovery Guide | ⏳ |
| 8 | Security Hardening Guide procedures | ⏳ |

---

# 12. Executive Summary

## 12.1 Operational Readiness

| Dimension | Status | Assessment |
|-----------|--------|------------|
| **Engineering baseline** | ✅ Complete | Gate 6 CONDITIONAL PASS · 1,291 tests · 52 ops scenarios |
| **Governance framework** | ✅ Complete | P-018.1 program · P-018.2 interim assessment · this playbook |
| **Runbook registry** | ✅ Complete | 8 runbooks registered · procedures defined |
| **Staging infrastructure** | ⏳ Not ready | WP-G7-004 — PostgreSQL not provisioned |
| **Live operational evidence** | ⏳ Not collected | OPS-001 not started on staging |
| **72h monitoring** | ⏳ Not started | OPS-002 pending OPS-001 |
| **Performance baselines** | ⏳ Not started | OPS-003 pending OPS-001 |
| **DR validation** | ⏳ Not started | OPS-004 pending OPS-001 |

**Overall operational readiness:** **Engineering ready · staging execution not initiated**

## 12.2 Remaining Blockers

| ID | Severity | Blocker | Owner | Mitigation |
|----|:--------:|---------|-------|------------|
| **WP-G7-004** | P0 | Staging PostgreSQL not provisioned | Infra | Immediate provisioning |
| **OPS-001** | P0 | Live staging GA-001 evidence | Platform Ops | Execute §3 after infra |
| **ENT-R-003** | P0 | Production PostgreSQL promotion evidence | Platform Ops | Closes with OPS-001 |
| **FIN-R-001** | P0 | GL PostgreSQL durability | Finance Eng | Parallel track P-009.12 |
| **OPS-002** | P1 | 72h continuous health green | Platform Ops | Phase 7B after OPS-001 |
| **OPS-003** | P1 | Performance baselines | Platform Ops | Phase 7C |
| **OPS-004** | P1 | DR drill RTO/RPO | Platform Ops | Phase 7C |
| **ENT-R-015** | P2 | HCM REST fail-closed gap | Platform Eng | Parallel · non-blocking OPS-001 |

## 12.3 Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|:--------:|-------|
| 1 | **Provision staging PostgreSQL immediately** (WP-G7-004) | P0 | Infra |
| 2 | Execute OPS-001 pre-deployment checklist (§3.3) upon infra ready | P0 | Platform Ops |
| 3 | Maintain daily OPS-001 standups per P-018.1 §4.10 | P0 | Platform Ops Lead |
| 4 | Create `docs/Operations/Gate7-Evidence/` archive directory | P1 | Platform Ops |
| 5 | Configure monitoring dashboard before staging deploy | P1 | Platform Ops |
| 6 | Schedule Phase 7A W2 deployment upon checklist completion | P1 | Platform Ops Lead |
| 7 | Initiate OPS-002 immediately upon OPS-001 closure | P1 | Platform Ops |
| 8 | Parallel track: FIN-R-001 engineering remediation continues | P1 | Finance Eng |
| 9 | Do not authorize RC or production deployment | — | Executive Sponsor |

## 12.4 Executive Verdict

| Decision | Verdict |
|----------|---------|
| **Use this playbook for Gate 7 execution** | **GO** |
| **Continue Gate 7 operational program** | **GO** |
| **OPS-001 execution readiness** | **CONDITIONAL GO** — pending WP-G7-004 |
| **Release Candidate authorization** | **NO GO** |
| **General Availability authorization** | **NO GO** |

**Expected timeline:** OPS-001 closure Sep 2026 · Gate 7 pass Jan 2027 · RC Q2 2027 · GA Q3 2027 (per P-018.1).

---

# Appendix A — Infrastructure Inventory

| Component | Development | CI/Test | Staging | Production |
|-----------|-------------|---------|---------|------------|
| **Application host** | Local | CI runner | TBD | Blocked |
| **PostgreSQL** | Optional local | Mock | ⏳ TBD | Blocked |
| **PostgreSQL version** | — | Mock | ≥ 14 | ≥ 14 |
| **Connection pool** | — | — | PgBouncer recommended | Required |
| **Load balancer** | — | — | TBD | Blocked |
| **TLS certificate** | — | — | TBD | Blocked |
| **Secrets vault** | Local env | CI secrets | TBD | Blocked |
| **Log aggregation** | Console | CI output | TBD | Blocked |
| **Backup storage** | — | — | TBD | Blocked |
| **Monitoring** | — | — | TBD | Blocked |

*Update this inventory upon WP-G7-004 completion.*

---

# Appendix B — Operational Contacts

| Role | Responsibility | Contact Method |
|------|----------------|----------------|
| **Platform Ops Lead** | OPS-001–004 execution · go/no-go | Gate 7 ops channel |
| **Platform Engineering Lead** | Hotfix · deployment · migration | Engineering channel |
| **Security Lead** | RBAC audit · cross-tenant tests | Security channel |
| **QA Lead** | Staging regression · chain tests | QA channel |
| **Program Director** | Phase gates · timeline · escalation | Program channel |
| **Executive Sponsor** | P0 decisions · resource authorization | Executive escalation |
| **Infra On-Call** | PostgreSQL · network · backup | Infra on-call rotation |
| **Platform Ops On-Call** | Health · incidents · monitoring | Ops on-call rotation |

*Populate contact details in internal directory — not stored in repository.*

---

# Appendix C — Escalation Matrix

| Severity | Condition | L1 (0–15 min) | L2 (15–30 min) | L3 (30–60 min) | L4 (> 60 min) |
|:--------:|-----------|---------------|----------------|----------------|---------------|
| **P0** | Platform `unhealthy` | Ops on-call | Ops Lead | Platform Eng Lead | Executive Sponsor |
| **P0** | Data corruption | Ops on-call + Eng | Ops Lead + Eng Lead | Program Director | Executive Sponsor |
| **P0** | Connection pool exhaustion | Ops on-call | Platform Eng | Ops Lead | Program Director |
| **P1** | Sustained `degraded` | Ops on-call | Ops Lead | Platform Eng | Program Director |
| **P1** | Performance breach | Ops on-call | Platform Eng | Ops Lead | Program Director |
| **P1** | Backup failure | Ops on-call | Infra on-call | Ops Lead | Program Director |
| **P2** | Non-critical warning | Ops on-call | — | Ops Lead (next day) | — |
| **P2** | Log anomaly | Ops on-call | — | Platform Eng (next day) | — |

### OPS-002 Window Escalation

During 72-hour monitoring, any P0 automatically:
1. Triggers incident response (§9.5)
2. Notifies Program Director within 15 minutes
3. Assesses 72h window restart requirement
4. Documents in Gate 7 evidence log

---

# Appendix D — Environment Variables

## D.1 Required — Staging

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `staging` | Environment identification |
| `ORION_STORE_PROVIDER` | `postgresql` | Persistent store |
| `DATABASE_URL` or `ORION_DATABASE_URL` | PostgreSQL connection string | Database connectivity |
| `ORION_AUTH_FAIL_CLOSED` | `true` | Reject unauthenticated API |
| `ORION_SESSION_SECRET` | ≥ 32 bytes random | Session HMAC signing |
| `ORION_LOG_FORMAT` | `json` | Structured logging |

## D.2 Prohibited — Staging and Production

| Variable | Reason |
|----------|--------|
| `ORION_DEMO_PASSWORD` | Demo access must be disabled |

## D.3 Optional — Staging

| Variable | Purpose |
|----------|---------|
| `ORION_STORE_ADAPTER` | `postgres` (alternative to ORION_STORE_PROVIDER) |
| IIL transport variables | Durable event transport (P-009.16) |

## D.4 Production-Only (Reference)

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `ORION_AUTH_FAIL_CLOSED` | `true` (default enforced) |
| `ORION_LOG_FORMAT` | `json` |

## D.5 Verification Commands

```bash
# Verify fail-closed
curl -s -o /dev/null -w "%{http_code}" https://staging.orion/api/hcm/employees
# Expected: 401

# Verify health
curl -s https://staging.orion/api/health | jq .status
# Expected: "healthy" or "degraded"

# Verify operations health
curl -s https://staging.orion/api/health/operations | jq .status
# Expected: "healthy"
```

---

# Appendix E — Monitoring Metrics

## E.1 Health Check Metrics

| Metric | Type | Alert Threshold |
|--------|------|:---------------:|
| `health.status` | Gauge (per check) | != healthy/degraded |
| `health.operations.aggregate` | Gauge | != healthy |
| `health.poll.success_rate` | Percentage | < 99% |
| `health.degraded.duration_seconds` | Counter | > 900 (15 min) |
| `health.unhealthy.duration_seconds` | Counter | > 300 (5 min) |

## E.2 Application Metrics

| Metric | Type | Baseline |
|--------|------|----------|
| `http.request.duration.p95` | Histogram | ≤ 500ms reads |
| `http.request.duration.p99` | Histogram | ≤ 1000ms reads |
| `http.request.error_rate` | Percentage | < 1% |
| `events.publish.rate` | Counter/min | ≥ 100 |
| `events.dlq.depth` | Gauge | < 100 |
| `platform.restart.recovery_seconds` | Gauge | ≤ 60 |

## E.3 Database Metrics

| Metric | Type | Alert Threshold |
|--------|------|:---------------:|
| `postgres.connections.active` | Gauge | > 80% pool |
| `postgres.query.duration.p95` | Histogram | > 200ms |
| `postgres.connection.errors` | Counter | > 0 sustained |
| `backup.last_success_timestamp` | Gauge | > 25 hours ago |

## E.4 OPS-002 Dashboard Metrics

| Panel | Metrics |
|-------|---------|
| 72h window timer | Elapsed · remaining · restart count |
| Health timeline | Green/yellow/red per check over 72h |
| Incident markers | P0/P1 events on timeline |
| Uptime percentage | Target ≥ 99% |

---

# Appendix F — Runbook References

| # | Runbook | Path | Gate 7 Phase | Purpose |
|---|---------|------|:------------:|---------|
| 1 | Platform Startup | [Runbook-Platform-Startup.md](./Runbook-Platform-Startup.md) | 7A | Initialize platform on staging |
| 2 | Platform Shutdown | [Runbook-Platform-Shutdown.md](./Runbook-Platform-Shutdown.md) | 7A | Graceful shutdown |
| 3 | Production Deployment | [Runbook-Production-Deployment.md](./Runbook-Production-Deployment.md) | 7A · 7D | Staging deployment · rollback |
| 4 | Operational Monitoring | [Runbook-Operational-Monitoring.md](./Runbook-Operational-Monitoring.md) | 7B | 72h health monitoring |
| 5 | Disaster Recovery | [Runbook-Disaster-Recovery.md](./Runbook-Disaster-Recovery.md) | 7C | Backup · restore · DR drill |
| 6 | Enterprise Operations Readiness | [Enterprise-Operations-Readiness.md](./Enterprise-Operations-Readiness.md) | 7A | Readiness framework reference |
| 7 | PostgreSQL Operational Certification | [PostgreSQL-Operational-Certification.md](./PostgreSQL-Operational-Certification.md) | 7A | Certification scenarios |
| 8 | Gate 6 Evidence Checklist | [Gate6-Evidence-Checklist.md](./Gate6-Evidence-Checklist.md) | 7A | Evidence tracking |
| 9 | Gate 6 Validation Report | [Gate6-Operational-Validation-Report.md](./Gate6-Operational-Validation-Report.md) | 7A | Validation reference |
| 10 | Security Hardening Guide | [Security-Hardening-Guide.md](../Platform/Security/Security-Hardening-Guide.md) | 7D | Security validation |
| 11 | Gate 7 Execution Program | [P-018.1](../00_Governance/P-018.1-Gate7-Operational-Execution-Program.md) | All | Governance master plan |
| 12 | Gate 7 Operational Assessment | [P-018.2](../00_Governance/P-018.2-Gate7-Operational-Assessment.md) | All | Status reference |

### Runbook Execution Log Template

| Field | Value |
|-------|-------|
| Runbook | |
| Version / date | |
| Executor | |
| Environment | Staging |
| Start time | |
| End time | |
| Result | Pass / Fail |
| Deviations | |
| Sign-off | Platform Ops Lead |

---

*P-018.3 — Gate 7 Operational Execution Playbook · ORION Enterprise Platform v2.0 · Operations only · 6 August 2026*

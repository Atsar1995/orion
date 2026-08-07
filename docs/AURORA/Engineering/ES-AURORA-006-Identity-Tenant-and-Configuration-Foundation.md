# ES-AURORA-006 — Aurora Identity, Tenant & Configuration Foundation

**Document ID:** ES-AURORA-006  
**Program:** Project Aurora — AI Marketing Platform  
**Mission:** A-008 — Identity, Tenant & Configuration Foundation  
**Prior Mission:** A-007 — Platform Foundation Implementation (ES-AURORA-005)  
**Version:** 1.0  
**Status:** Ratified — Authoritative Engineering Specification  
**Classification:** Engineering Specification · Identity · Multi-Tenant · Configuration · RBAC  
**Authority:** Founder & Chief Architect · Aurora Architecture Review Board  
**Architecture Sources:** [A-001 Constitution](../A-001-Aurora-Constitution.md) · [A-005 Runtime Architecture](../A-005-Aurora-Platform-Foundation-and-Runtime-Architecture.md) · [A-006 Product Backlog](../A-006-Aurora-Product-Backlog-and-Mission-Breakdown.md) · [ES-AURORA-005 Platform Foundation](./ES-AURORA-005-Platform-Foundation-Implementation-Specification.md)  
**Platform Parent:** [ORION ES-009 Identity](../02_Engineering/ES-009-Identity-Authentication-Foundation.md) · [ORION ES-037 Auth Architecture](../02_Engineering/ES-037-Authentication-Authorisation-Architecture.md)  
**Effective Date:** 7 August 2026  
**Subordinate To:** A-001 · A-005 · ES-AURORA-005

**Rule:** This document is the **authoritative engineering specification** for Aurora Identity, Tenant & Configuration Foundation (Mission A-008). All identity, tenant, configuration, and RBAC code in `lib/aurora/` must comply. **No production implementation in this document.** **Specification only.**

**Mission Numbering Note:** ES-AURORA-006 was preliminarily assigned to Knowledge & Memory in A-006 backlog. **This document supersedes that assignment.** Knowledge & Memory moves to **ES-AURORA-007** (Mission A-009). Identity/Tenant/Configuration is the authoritative ES-AURORA-006 scope.

**Scope Boundary:** Enterprise identity model · multi-tenant hierarchy · hierarchical configuration · RBAC integration · secrets architecture · configuration runtime. **Builds on** ES-AURORA-005 admin stubs. **Excludes:** Knowledge/Memory (ES-AURORA-007) · domain modules · agents · UI.

---

## Engineering Principles (Binding)

| # | Principle | Enforcement |
|---|-----------|-------------|
| **IP-1** | **ORION Identity is single source of authentication** | No Aurora login · session from ORION only |
| **IP-2** | **Aurora extends · never duplicates identity** | Map ORION org/user → Aurora context |
| **IP-3** | **Every request executes within a tenant** | `tenantId` mandatory on AuroraRuntimeContext |
| **IP-4** | **Tenant isolation is mandatory** | RLS · query scoping · cross-tenant tests |
| **IP-5** | **Configuration is hierarchical and inheritable** | Global → tenant → brand → workspace |
| **IP-6** | **Feature flags are runtime configurable** | ConfigurationService · not compile-time |
| **IP-7** | **Secrets never appear in code** | Vault · encrypted storage only |
| **IP-8** | **All services resolve config via ConfigurationService** | No direct env reads in domain services |

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Identity Architecture](#2-identity-architecture)
3. [Multi-Tenant Architecture](#3-multi-tenant-architecture)
4. [Configuration Architecture](#4-configuration-architecture)
5. [RBAC Integration](#5-rbac-integration)
6. [Secrets & Security](#6-secrets--security)
7. [Configuration Runtime](#7-configuration-runtime)
8. [Testing Strategy](#8-testing-strategy)
9. [Engineering Standards](#9-engineering-standards)
10. [Acceptance Criteria](#10-acceptance-criteria)
11. [Implementation Roadmap](#11-implementation-roadmap)
12. [Executive Recommendation](#12-executive-recommendation)

**Appendices:** [A — Identity Model](#appendix-a--identity-model) · [B — Tenant Hierarchy](#appendix-b--tenant-hierarchy) · [C — Configuration Schema](#appendix-c--configuration-schema) · [D — Permission Matrix](#appendix-d--permission-matrix) · [E — Feature Flag Catalogue](#appendix-e--feature-flag-catalogue) · [F — Implementation Checklist](#appendix-f--implementation-checklist)

---

# Preamble

Platform without identity is a building without locks.

ES-AURORA-005 established Aurora's runtime engine — wiring, lifecycle, and admin stubs. ES-AURORA-006 defines the **enterprise identity and configuration layer** that makes Aurora safe for multi-brand agencies, multi-tenant enterprises, and governed AI marketing at scale.

Every Aurora operation from this point forward executes within a resolved identity context, hierarchical configuration, and ORION-backed authorization.

---

# 1. Executive Overview

## 1.1 Purpose

| Field | Definition |
|-------|------------|
| **Document purpose** | Implementation-ready spec for Identity · Tenant · Configuration foundation |
| **Audience** | Platform engineers · security · architects · mission owners |
| **Binding authority** | Mission A-008 implementation |
| **Deliverable type** | Engineering specification — no code |

This specification answers:

- How does Aurora identity relate to ORION Identity without duplication?
- What is the tenant → business → brand → workspace hierarchy?
- How does hierarchical configuration inherit and override?
- How are RBAC permissions mapped from ORION to Aurora operations?
- How are secrets stored, encrypted, and rotated?
- How does ConfigurationService resolve config at runtime?

## 1.2 Scope

### In Scope

| Area | Coverage |
|------|----------|
| **Identity model** | User · org · brand · workspace · service identity |
| **Multi-tenant architecture** | Provisioning · isolation · lifecycle |
| **Configuration system** | 5-level hierarchy · feature flags · policies |
| **RBAC integration** | ORION permissions · Aurora roles · agent permissions |
| **Secrets architecture** | Providers · encryption · rotation |
| **Configuration runtime** | Service · repository · provider · cache · validation |
| **Testing** | Isolation · permissions · config · flags |

### Out of Scope

| Exclusion | Spec / Mission |
|-----------|----------------|
| ORION login/session implementation | ES-009 · ES-037 |
| Knowledge & Memory layer | ES-AURORA-007 · A-009 |
| Domain modules (content · SEO · etc.) | A-010+ |
| Agent identity beyond service accounts | A-018 |
| Enterprise SSO/SAML | A-035 · Phase 3 |
| UI for admin/settings | A-020 |

### Relationship to ES-AURORA-005

| ES-AURORA-005 (A-007) | ES-AURORA-006 (A-008) Extension |
|----------------------|--------------------------------|
| `TenantService` stub CRUD | Full tenant model · provisioning · tiers |
| `BrandService` stub CRUD | Brand hierarchy · brand kit link · scoping |
| `ConfigurationService` basic | Full hierarchical config · cache · validation |
| `AuroraRuntimeContext` | Extended with workspace · permission cache |
| `AuroraContextFactory` | ORION session → full Aurora context |
| Admin RLS basic | Complete isolation test suite |

## 1.3 Implementation Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| 1 | **ORION identity integration** | Session → AuroraRuntimeContext without duplicate auth |
| 2 | **Tenant hierarchy** | Tenant → Business → Brand → Workspace model operational |
| 3 | **Tenant provisioning** | Onboard tenant with defaults · tier limits |
| 4 | **Tenant isolation** | Zero cross-tenant leakage in test suite |
| 5 | **Hierarchical configuration** | 5-level inheritance · override resolution |
| 6 | **Feature flags** | Runtime toggles per tenant/brand |
| 7 | **RBAC integration** | Aurora permissions mapped to ORION roles |
| 8 | **Secrets architecture** | Encrypted credential storage · no secrets in code |
| 9 | **Configuration runtime** | ConfigurationService with cache · validation · reload |
| 10 | **Agent service identity** | Service accounts for agent audit attribution |

## 1.4 Relationship with Architecture Documents

| Document | ES-AURORA-006 Response |
|----------|------------------------|
| **A-001 Constitution** | Multi-tenant · multi-brand · RBAC · commercial tiers |
| **A-002 Blueprint** | Admin domain · security §9 · folder structure |
| **A-003 AI Workforce** | Agent service identity · permission boundaries |
| **A-004 Knowledge & Memory** | Brand-scoped knowledge context from identity |
| **A-005 Runtime** | AuroraRuntimeContext · config boot Phase 1 |
| **A-006 Backlog** | Mission A-008 · EP-IDENTITY · EP-CONFIG · F-020–F-034 |
| **A-007 / ES-AURORA-005** | Extends admin stubs · context factory · config service |

---

# 2. Identity Architecture

## 2.1 Aurora Identity Model

Aurora does **not** implement authentication. Aurora implements an **identity extension layer** that maps ORION authenticated sessions to marketing-specific identity context.

```
ORION Identity (authentication · session · org · workspace)
        ↓
Aurora Identity Extension (tenant · brand · marketing roles · config)
        ↓
AuroraRuntimeContext (every operation)
```

| Layer | Owner | Aurora Action |
|-------|-------|---------------|
| Authentication | ORION | Consume session — never reimplement |
| Organization | ORION | Map to Aurora Tenant |
| Workspace | ORION | Map to Aurora Workspace |
| User | ORION | Map to Aurora User Identity |
| Brand | Aurora | Aurora-owned marketing entity |
| Business Entity | Aurora | Aurora-owned org subdivision |
| Marketing RBAC | Aurora | Extends ORION permissions |

## 2.2 User Identity

**File:** `lib/aurora/identity/AuroraUserIdentity.ts`

```typescript
export interface AuroraUserIdentity {
  readonly userId: string;              // ORION user ID
  readonly email: string;
  readonly displayName: string;
  readonly orionOrganizationId: string;
  readonly orionWorkspaceId: string;
  readonly orionRoles: readonly string[];
  readonly auroraRoles: readonly AuroraRole[];
  readonly auroraPermissions: ReadonlySet<AuroraPermission>;
  readonly locale: string;
  readonly timezone: string;
}
```

| Field | Source |
|-------|--------|
| `userId` | ORION session |
| `orionRoles` | ORION RBAC |
| `auroraRoles` | Mapped from ORION + Aurora role bindings |
| `auroraPermissions` | Resolved permission set (cached per request) |

## 2.3 Organization Identity

ORION `organizationId` maps 1:1 to Aurora `tenantId` for Phase 1. Aurora Tenant record extends ORION org with marketing-specific metadata.

```typescript
export interface Tenant {
  readonly id: string;                  // = ORION organizationId
  readonly orionOrganizationId: string; // Same value · explicit link
  readonly name: string;
  readonly slug: string;
  readonly tier: CommercialTier;
  readonly status: TenantStatus;
  readonly industryTemplate?: IndustryTemplate;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export type CommercialTier = 'starter' | 'professional' | 'agency' | 'enterprise';
export type TenantStatus = 'provisioning' | 'active' | 'suspended' | 'archived';
```

## 2.4 Brand Identity

Brand is Aurora-first-class — not an ORION entity. Multiple brands per tenant.

```typescript
export interface Brand {
  readonly id: string;                  // brd_ UUID
  readonly tenantId: string;
  readonly businessId: string;
  readonly name: string;
  readonly slug: string;
  readonly status: BrandStatus;
  readonly defaultLocale: string;
  readonly defaultTimezone: string;
  readonly brandKitId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type BrandStatus = 'active' | 'archived';
```

## 2.5 Workspace Identity

Aurora workspace maps to ORION workspace with Aurora module scope.

| Field | Value |
|-------|-------|
| **Aurora workspace ID** | `aurora-workspace` (constant) |
| **ORION workspace** | Active workspace from session |
| **Scope** | Marketing module operations within tenant |

```typescript
export interface AuroraWorkspaceIdentity {
  readonly workspaceId: string;         // ORION workspaceId
  readonly auroraModuleKey: 'aurora';   // AURORA_MODULE_KEY
  readonly tenantId: string;
  readonly activeBrandId: string;
  readonly businessId: string;
}
```

## 2.6 Service Identity

AI agents and background workers execute under service identity — not human user identity.

```typescript
export interface AuroraServiceIdentity {
  readonly serviceId: string;           // e.g. 'aurora.agent.copywriter'
  readonly tenantId: string;
  readonly brandId?: string;
  readonly invocationType: 'scheduled' | 'event' | 'agent-handoff' | 'system';
  readonly attributedUserId?: string;   // Human who triggered (if applicable)
}

export const AURORA_SYSTEM_SERVICE_ID = 'aurora.system';
export const AURORA_AGENT_SERVICE_PREFIX = 'aurora.agent.';
```

| Rule | Description |
|------|-------------|
| **SVC-1** | Agent actions audit under service ID + attributed user |
| **SVC-2** | Background jobs carry tenant · brand in payload |
| **SVC-3** | Service identity cannot escalate permissions beyond triggering user |

## 2.7 Identity Lifecycle

| Entity | States | Transitions |
|--------|--------|-------------|
| **Tenant** | provisioning → active → suspended → archived | Admin · billing |
| **Business** | active → archived | Tenant admin |
| **Brand** | active → archived | Brand admin |
| **User binding** | invited → active → deactivated | ORION user lifecycle |
| **Service account** | created → active → revoked | System |

---

# 3. Multi-Tenant Architecture

## 3.1 Tenant Model

```
┌─────────────────────────────────────────────────────────────┐
│ Aurora Tenant (= ORION Organization)                         │
│  tier: starter | professional | agency | enterprise          │
│  ├── Business Entity 1 (optional subdivision)                │
│  │   ├── Brand A                                             │
│  │   └── Brand B                                             │
│  ├── Business Entity 2                                       │
│  │   └── Brand C                                             │
│  └── Default Business (single-brand tenants)                 │
│      └── Brand (default)                                     │
└─────────────────────────────────────────────────────────────┘
```

| Tier | Max Brands | Max Users | Max Agent Tokens/Day | Storage |
|------|:----------:|:---------:|:--------------------:|:-------:|
| **Starter** | 1 | 3 | 50,000 | 5 GB |
| **Professional** | 5 | 15 | 200,000 | 50 GB |
| **Agency** | 50 | 100 | 1,000,000 | 500 GB |
| **Enterprise** | Unlimited | Unlimited | Configurable | Configurable |

**Enforcement:** `TierLimitService` validates on create operations · throws `AURORA_ERR_0429` on limit breach.

## 3.2 Organization Hierarchy

**Business Entity** — optional organizational subdivision within tenant (e.g., company within a holding group).

```typescript
export interface BusinessEntity {
  readonly id: string;                  // biz_ UUID
  readonly tenantId: string;
  readonly name: string;
  readonly slug: string;
  readonly status: 'active' | 'archived';
  readonly createdAt: string;
}
```

| Pattern | Usage |
|---------|-------|
| **Single-brand founder** | 1 default business · 1 brand |
| **Multi-brand enterprise** | Multiple businesses · multiple brands each |
| **Agency** | 1 business per client · brands per client |

## 3.3 Brand Hierarchy

Brands are flat within business entity — no nested brand trees in Phase 1. Brand scoping applies to:

- Knowledge domains (A-004)
- Memory tiers
- Campaigns · content · creative assets
- Analytics attribution
- Agent context assembly

**Brand switch:** `AuroraContextFactory.withBrand(brandId)` validates user has access · returns new context.

## 3.4 Workspace Hierarchy

| Level | ORION | Aurora |
|-------|-------|--------|
| Platform | ORION Platform | — |
| Organization | `organizationId` | `tenantId` |
| Workspace | `workspaceId` | Aurora workspace scope |
| Module | — | `aurora` module key |
| Brand | — | `brandId` (Aurora-specific) |

## 3.5 Tenant Provisioning

**File:** `lib/aurora/admin/services/TenantProvisioningService.ts`

```typescript
export interface TenantProvisioningService {
  provision(ctx: AuroraRuntimeContext, input: ProvisionTenantInput): Promise<TenantProvisionResult>;
  suspend(ctx: AuroraRuntimeContext, tenantId: string, reason: string): Promise<void>;
  reactivate(ctx: AuroraRuntimeContext, tenantId: string): Promise<void>;
  archive(ctx: AuroraRuntimeContext, tenantId: string): Promise<void>;
}

export interface ProvisionTenantInput {
  readonly orionOrganizationId: string;
  readonly name: string;
  readonly tier: CommercialTier;
  readonly industryTemplate?: IndustryTemplate;
  readonly adminUserId: string;
  readonly defaultBrandName: string;
}
```

### Provisioning Sequence

```
1. Verify ORION organization exists
2. Create Tenant record (status: provisioning)
3. Create default BusinessEntity
4. Create default Brand
5. Apply tier default configuration (ConfigurationService.seedTenantDefaults)
6. Apply industry template (if specified)
7. Register tier limits
8. Emit aurora.tenant.provisioned
9. Set status → active
```

## 3.6 Tenant Isolation

| Layer | Isolation Mechanism |
|-------|---------------------|
| **PostgreSQL** | Row-Level Security · `tenant_id` column on every table |
| **Repository** | Mandatory `tenantId` first parameter · assert match with context |
| **Redis keys** | Prefix `aurora:{tenantId}:` |
| **Object storage** | Prefix `{tenantId}/{brandId}/` |
| **Queue jobs** | `tenantId` · `brandId` in job payload · validated at dequeue |
| **Cache** | Tenant-scoped cache keys |
| **Audit** | Tenant ID on every audit entry |

### RLS Policy Template

```sql
ALTER TABLE aurora_brand ENABLE ROW LEVEL SECURITY;

CREATE POLICY aurora_brand_tenant_isolation ON aurora_brand
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

**Session variable:** Set `app.tenant_id` on every database connection from AuroraRuntimeContext.

### Cross-Tenant Protection Rules

| Rule | Description |
|------|-------------|
| **ISO-T1** | Repository rejects `tenantId` mismatch with context |
| **ISO-T2** | Facade validates context tenant matches resource tenant |
| **ISO-T3** | Background jobs reject dequeue if tenant context missing |
| **ISO-T4** | Integration credentials scoped per tenant |
| **ISO-T5** | Search index filtered by tenant |
| **ISO-T6** | Automated cross-tenant isolation test on every CI run |

## 3.7 Lifecycle Management

| Event | Service | Audit |
|-------|---------|-------|
| Tenant provisioned | TenantProvisioningService | ✅ |
| Tenant suspended | TenantProvisioningService | ✅ · reason logged |
| Brand created | BrandService | ✅ |
| Brand archived | BrandService | ✅ · soft delete |
| Tier upgraded | TenantService | ✅ · config migration |
| User brand access granted | BrandAccessService | ✅ |

---

# 4. Configuration Architecture

## 4.1 Configuration Hierarchy

```
Global Defaults (constants · env)
    ↓ overridden by
Tenant Configuration (tier · limits · policies)
    ↓ overridden by
Business Configuration (optional)
    ↓ overridden by
Brand Configuration (voice · approval · channels)
    ↓ overridden by
Workspace Configuration (user preferences · active brand)
    ↓ overridden by
Environment Overrides (env vars · feature flags)
```

**Resolution:** Deepest non-null value wins. `ConfigurationService.resolve(key, ctx)` walks hierarchy.

## 4.2 Global Configuration

**File:** `lib/aurora/config/globalDefaults.ts`

| Key | Default | Description |
|-----|---------|-------------|
| `aurora.approval.defaultTier` | `2` | Default approval tier |
| `aurora.agent.maxTokensPerInvocation` | `8000` | Single agent call limit |
| `aurora.publish.retry.maxAttempts` | `3` | Publish retry count |
| `aurora.scheduler.precisionSeconds` | `30` | Schedule precision |
| `aurora.notification.rateLimitPerHour` | `100` | Notification cap |

## 4.3 Tenant Configuration

**Table:** `aurora_tenant_config`

| Column | Type | Description |
|--------|------|-------------|
| `tenant_id` | UUID PK | FK tenant |
| `tier` | enum | Commercial tier |
| `approval_policy` | JSONB | Tier 0–3 rules per action type |
| `automation_policy` | JSONB | Auto-approve guardrails |
| `token_budget_daily` | integer | Agent token limit |
| `feature_overrides` | JSONB | Feature flag overrides |
| `limits` | JSONB | Brand · user · storage limits |
| `industry_template` | varchar | Template ID |
| `locale_default` | varchar | Default locale |
| `timezone_default` | varchar | Default timezone |

## 4.4 Brand Configuration

**Table:** `aurora_brand_config`

| Column | Type | Description |
|--------|------|-------------|
| `brand_id` | UUID PK | FK brand |
| `voice_profile` | JSONB | Brand voice settings |
| `approval_overrides` | JSONB | Brand-specific approval rules |
| `channel_config` | JSONB | Enabled channels · credentials refs |
| `publishing_policy` | JSONB | Schedule · auto-publish rules |
| `agent_preferences` | JSONB | Agent behaviour overrides |
| `locale` | varchar | Brand locale |
| `timezone` | varchar | Brand timezone |

## 4.5 Workspace Configuration

**Table:** `aurora_workspace_config`

| Column | Type | Description |
|--------|------|-------------|
| `tenant_id` | UUID | FK tenant |
| `user_id` | UUID | FK ORION user |
| `active_brand_id` | UUID | Last selected brand |
| `dashboard_layout` | JSONB | UI preferences (A-020) |
| `notification_preferences` | JSONB | Channel preferences |

## 4.6 Environment Configuration

Environment variables override hierarchy for infrastructure — not business rules.

| Variable | Overrides |
|----------|-----------|
| `AURORA_ENABLED` | Platform enable |
| `AURORA_*` feature env flags | Matching feature flags |
| `AURORA_LOG_LEVEL` | Logging verbosity |

## 4.7 Feature Flags

See [Appendix E](#appendix-e--feature-flag-catalogue). Flags resolve via `ConfigurationService.isFeatureEnabled(key, ctx)`.

| Resolution Order | Source |
|------------------|--------|
| 1 | Environment variable (`AURORA_FF_{KEY}=true`) |
| 2 | Brand `feature_overrides` |
| 3 | Tenant `feature_overrides` |
| 4 | Tier defaults |
| 5 | Global default |

## 4.8 Runtime Policies

| Policy | Config Path | Default |
|--------|-------------|---------|
| Approval tier per action | `approval_policy.{action}` | Tier 2 |
| Auto-approve enabled | `automation_policy.autoApprove` | false (Starter) |
| Token budget | `token_budget_daily` | Per tier |
| Publish retry | `publish.retry` | 3 attempts |
| Agent timeout | `agent.timeoutMs` | 30000 |
| Rate limit API | `api.rateLimitPerMinute` | 120 |

## 4.9 Inheritance Rules

```typescript
export interface ConfigInheritanceRules {
  /** Walk hierarchy: workspace → brand → business → tenant → global */
  resolve<T>(key: ConfigKey, ctx: AuroraRuntimeContext): T;

  /** Merge JSONB objects — deep merge · child overrides parent */
  resolveMerged(key: ConfigKey, ctx: AuroraRuntimeContext): Record<string, unknown>;

  /** List effective config at context level (debug/admin) */
  dumpEffectiveConfig(ctx: AuroraRuntimeContext): EffectiveConfigSnapshot;
}
```

| Rule | Description |
|------|-------------|
| **CFG-1** | Null/missing at level → inherit from parent |
| **CFG-2** | Explicit null at level → inherit (not disable) |
| **CFG-3** | Arrays replace — not merge |
| **CFG-4** | Objects deep-merge |
| **CFG-5** | Environment always wins for infra flags |

## 4.10 Validation

**File:** `lib/aurora/config/ConfigurationValidator.ts`

| Validation | When | Failure |
|------------|------|---------|
| Schema validation (Zod) | On write · on load | Reject save |
| Tier limit consistency | Tenant config save | Reject downgrade if over limit |
| Approval policy bounds | Tenant/brand save | Tier 0–3 only |
| Feature flag existence | Flag check | Default false · warn unknown |
| Cross-reference (brand belongs to tenant) | Brand config save | Reject |

---

# 5. RBAC Integration

## 5.1 ORION Identity Integration

**File:** `lib/aurora/identity/AuroraIdentityBridge.ts`

```typescript
export interface AuroraIdentityBridge {
  /** Map ORION session to Aurora user identity */
  resolveUserIdentity(session: OrionSession): Promise<AuroraUserIdentity>;

  /** Build AuroraRuntimeContext from HTTP request */
  buildContext(session: OrionSession, brandId?: string): Promise<AuroraRuntimeContext>;

  /** Verify ORION org maps to Aurora tenant */
  resolveTenant(orionOrganizationId: string): Promise<Tenant | null>;
}
```

**Integration points:**

| ORION Component | Aurora Usage |
|-----------------|--------------|
| `IdentityService` | Session validation |
| `getDecisionServiceContext()` pattern | Aurora API context helper |
| `middleware.ts` RBAC | Extended with Aurora permissions |
| `role-permissions.ts` | Aurora permission extension |

## 5.2 Permission Model

```typescript
export type AuroraPermission =
  | 'aurora.admin.tenant'
  | 'aurora.admin.brand'
  | 'aurora.admin.config'
  | 'aurora.admin.users'
  | 'aurora.content.read'
  | 'aurora.content.write'
  | 'aurora.content.approve'
  | 'aurora.content.publish'
  | 'aurora.campaign.read'
  | 'aurora.campaign.write'
  | 'aurora.campaign.approve'
  | 'aurora.seo.read'
  | 'aurora.seo.write'
  | 'aurora.analytics.read'
  | 'aurora.analytics.export'
  | 'aurora.creative.read'
  | 'aurora.creative.write'
  | 'aurora.agent.invoke'
  | 'aurora.agent.configure'
  | 'aurora.integration.manage'
  | 'aurora.knowledge.read'
  | 'aurora.knowledge.write'
  | 'aurora.approval.override';
```

## 5.3 Roles

| Aurora Role | ORION Role Mapping | Permissions |
|-------------|-------------------|-------------|
| `aurora.admin` | org admin | All aurora.* |
| `aurora.director` | workspace admin | All except aurora.admin.tenant |
| `aurora.manager` | editor + approve | read · write · approve · agent.invoke |
| `aurora.editor` | editor | read · write · agent.invoke |
| `aurora.approver` | reviewer | read · approve |
| `aurora.viewer` | viewer | read only |
| `aurora.agent.service` | service account | agent.invoke · scoped write |

**File:** `lib/aurora/identity/aurora-role-permissions.ts`

## 5.4 Groups

Phase 1: Role-based only. Phase 2: Brand-scoped groups (e.g., "Brand A editors").

```typescript
export interface BrandAccessGroup {
  readonly id: string;
  readonly brandId: string;
  readonly name: string;
  readonly memberUserIds: readonly string[];
  readonly role: AuroraRole;
}
```

## 5.5 Service Permissions

| Service Type | Permission Check |
|--------------|-----------------|
| Human API request | User permissions from context |
| Agent invocation | `aurora.agent.invoke` + action-specific |
| Background job | Service identity · tenant scope only |
| System maintenance | `AURORA_SYSTEM_SERVICE_ID` |

## 5.6 Agent Permissions

| Rule | Description |
|------|-------------|
| **AGP-1** | Agents never hold permissions beyond triggering user |
| **AGP-2** | Tier 3 autonomous actions require `automation_policy` enabled |
| **AGP-3** | Agent cannot invoke `aurora.admin.*` permissions |
| **AGP-4** | Agent audit attributed to service ID + user |

## 5.7 Administrative Permissions

| Operation | Required Permission |
|-----------|-------------------|
| Create tenant | `aurora.admin.tenant` (ORION platform admin) |
| Suspend tenant | `aurora.admin.tenant` |
| Create brand | `aurora.admin.brand` |
| Update tier config | `aurora.admin.config` |
| Manage integrations | `aurora.integration.manage` |
| Override approval | `aurora.approval.override` |

## 5.8 Audit

All permission denials logged at warn level with `userId` · `permission` · `resource`. All admin mutations audit via ORION AuditStore extension.

**File:** `lib/aurora/identity/AuroraAuthorizationService.ts`

```typescript
export class AuroraAuthorizationService {
  assertPermission(ctx: AuroraRuntimeContext, permission: AuroraPermission): void;
  assertBrandAccess(ctx: AuroraRuntimeContext, brandId: string): void;
  assertTenantAccess(ctx: AuroraRuntimeContext, tenantId: string): void;
  hasPermission(ctx: AuroraRuntimeContext, permission: AuroraPermission): boolean;
}
```

---

# 6. Secrets & Security

## 6.1 Secret Providers

```typescript
export interface AuroraSecretsProvider {
  getSecret(ref: SecretReference): Promise<string>;
  setSecret(ref: SecretReference, value: string, metadata?: SecretMetadata): Promise<void>;
  deleteSecret(ref: SecretReference): Promise<void>;
  rotateSecret(ref: SecretReference): Promise<void>;
}

export interface SecretReference {
  readonly tenantId: string;
  readonly scope: 'tenant' | 'brand' | 'integration';
  readonly key: string;
  readonly brandId?: string;
  readonly providerId?: string;
}
```

| Provider | Phase | Usage |
|----------|:-----:|-------|
| **EnvironmentSecretsProvider** | 1 (dev) | Dev/test only |
| **DatabaseSecretsProvider** | 1 (prod) | Encrypted PostgreSQL storage |
| **VaultSecretsProvider** | 2 | HashiCorp/AWS Secrets Manager |

## 6.2 Credential Storage

**Table:** `aurora_secrets`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Secret record ID |
| `tenant_id` | UUID | Tenant scope |
| `brand_id` | UUID nullable | Brand scope (optional) |
| `provider_id` | varchar nullable | Integration provider |
| `secret_key` | varchar | Logical key |
| `encrypted_value` | bytea | AES-256-GCM encrypted |
| `encryption_key_id` | varchar | Key version for rotation |
| `expires_at` | timestamptz nullable | OAuth expiry |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Never:** Store secrets in code · env files (prod) · logs · config JSONB.

## 6.3 Encryption

| Field | Standard |
|-------|----------|
| Algorithm | AES-256-GCM |
| Key management | `AURORA_ENCRYPTION_KEY` env (dev) · KMS (prod) |
| At rest | PostgreSQL encrypted column |
| In transit | TLS 1.2+ |
| Key rotation | Re-encrypt on rotation · old key retained 30 days |

## 6.4 Rotation

| Secret Type | Rotation Trigger | Method |
|-------------|-----------------|--------|
| OAuth refresh tokens | On refresh failure | Connector re-auth flow |
| API keys | Manual admin · 90-day policy | SecretsProvider.rotateSecret |
| Encryption key | Annual · compromise | Re-encrypt all secrets |

## 6.5 Environment Variables

Secrets in environment **only** for:
- `AURORA_ENCRYPTION_KEY` (master key reference)
- Vault connection credentials
- Dev-mode integration tokens (local only)

## 6.6 Provider Credentials

Integration credentials (A-016+) stored via `SecretsProvider` with scope `{ tenantId, providerId, key: 'oauth_tokens' }`. Connectors retrieve via `ConnectorRegistry.getCredentials()` — never direct DB access.

## 6.7 Compliance

| Requirement | Implementation |
|-------------|---------------|
| GDPR right to deletion | Tenant archive purges secrets after 30 days |
| Audit trail | All secret access logged (not values) |
| Least privilege | Service accounts scoped to tenant |
| PII in logs | Never log secret values · tokens · passwords |

---

# 7. Configuration Runtime

## 7.1 ConfigurationService

**File:** `lib/aurora/config/ConfigurationService.ts`

Extends ES-AURORA-005 stub with full hierarchical resolution.

```typescript
export interface ConfigurationService {
  // Resolution
  resolve<T>(key: ConfigKey, ctx: AuroraRuntimeContext): Promise<T>;
  resolveMerged(key: ConfigKey, ctx: AuroraRuntimeContext): Promise<Record<string, unknown>>;
  getEffectiveConfig(ctx: AuroraRuntimeContext): Promise<EffectiveConfigSnapshot>;

  // Tenant
  getTenantConfig(ctx: AuroraRuntimeContext): Promise<TenantConfig>;
  updateTenantConfig(ctx: AuroraRuntimeContext, input: UpdateTenantConfigInput): Promise<TenantConfig>;
  seedTenantDefaults(tenantId: string, tier: CommercialTier): Promise<void>;

  // Brand
  getBrandConfig(ctx: AuroraRuntimeContext, brandId: string): Promise<BrandConfig>;
  updateBrandConfig(ctx: AuroraRuntimeContext, brandId: string, input: UpdateBrandConfigInput): Promise<BrandConfig>;

  // Feature flags
  isFeatureEnabled(key: FeatureFlagKey, ctx: AuroraRuntimeContext): Promise<boolean>;
  listFeatureFlags(ctx: AuroraRuntimeContext): Promise<Readonly<Record<FeatureFlagKey, boolean>>>;

  // Tier limits
  getTierLimits(ctx: AuroraRuntimeContext): Promise<TierLimits>;
  validateWithinLimits(ctx: AuroraRuntimeContext, resource: LimitResource): Promise<LimitCheckResult>;

  // Validation
  validateConfig(config: unknown, schema: ConfigSchema): ConfigValidationResult;

  // Cache
  invalidateCache(scope: ConfigCacheScope): Promise<void>;
}
```

## 7.2 ConfigurationRepository

**File:** `lib/aurora/config/repositories/ConfigurationRepository.ts`

```typescript
export interface ConfigurationRepository {
  getTenantConfig(tenantId: string): Promise<TenantConfigRecord | null>;
  saveTenantConfig(tenantId: string, config: TenantConfigRecord): Promise<void>;
  getBrandConfig(brandId: string): Promise<BrandConfigRecord | null>;
  saveBrandConfig(brandId: string, config: BrandConfigRecord): Promise<void>;
  getWorkspaceConfig(tenantId: string, userId: string): Promise<WorkspaceConfigRecord | null>;
  saveWorkspaceConfig(tenantId: string, userId: string, config: WorkspaceConfigRecord): Promise<void>;
  getBusinessConfig(businessId: string): Promise<BusinessConfigRecord | null>;
  saveBusinessConfig(businessId: string, config: BusinessConfigRecord): Promise<void>;
}
```

Implementations: `PostgresConfigurationRepository` · `InMemoryConfigurationRepository`

## 7.3 ConfigurationProvider

Pluggable providers for config sources beyond database.

```typescript
export interface ConfigurationProvider {
  readonly priority: number;            // Higher = checked first
  readonly scope: ConfigProviderScope;
  get(key: ConfigKey, ctx: AuroraRuntimeContext): Promise<unknown | undefined>;
}

export type ConfigProviderScope = 'environment' | 'tenant' | 'brand' | 'workspace' | 'global';
```

| Provider | Priority | Scope |
|----------|:--------:|-------|
| `EnvironmentConfigurationProvider` | 100 | environment |
| `WorkspaceConfigurationProvider` | 40 | workspace |
| `BrandConfigurationProvider` | 30 | brand |
| `BusinessConfigurationProvider` | 20 | business |
| `TenantConfigurationProvider` | 10 | tenant |
| `GlobalDefaultsConfigurationProvider` | 0 | global |

**Chain:** ConfigurationService walks providers in priority order · first non-undefined wins (per inheritance rules).

## 7.4 ConfigurationCache

**File:** `lib/aurora/config/ConfigurationCache.ts`

```typescript
export interface ConfigurationCache {
  get(cacheKey: string): Promise<unknown | undefined>;
  set(cacheKey: string, value: unknown, ttlSeconds: number): Promise<void>;
  invalidate(pattern: string): Promise<number>;
  invalidateTenant(tenantId: string): Promise<void>;
  invalidateBrand(brandId: string): Promise<void>;
}
```

| Field | Value |
|-------|-------|
| Backend | Redis |
| Key format | `aurora:config:{tenantId}:{brandId?}:{key}` |
| Default TTL | 300 seconds |
| Invalidation | On config write · tenant tier change |

## 7.5 Validation Pipeline

```
Config write request
    ↓
Authorization check (aurora.admin.config)
    ↓
Zod schema validation
    ↓
Tier limit consistency check
    ↓
Cross-reference validation (brand ∈ tenant)
    ↓
Repository save
    ↓
Cache invalidation
    ↓
Emit aurora.config.updated event
    ↓
Audit log
```

**File:** `lib/aurora/config/ConfigurationValidator.ts`

## 7.6 Reload Strategy

| Trigger | Action |
|---------|--------|
| Config update via API | Invalidate cache for scope · next read reloads |
| Tenant tier change | Invalidate entire tenant cache · re-seed defaults |
| Admin `reloadConfig()` | Force invalidate · optional warm reload |
| Boot Phase 1 | Load global defaults · validate environment |

**No hot-reload of env vars** — requires process restart.

## 7.7 Startup Loading

Boot Phase 1 (A-005) extended:

```
Phase 1 — Configuration Load
    ├── AuroraRuntimeConfiguration.fromEnvironment()
    ├── Validate environment config
    ├── Register ConfigurationProviders (chain)
    ├── Warm global defaults cache
    └── Verify ConfigurationService health
```

Tenant/brand configs loaded lazily on first request — not at boot.

---

# 8. Testing Strategy

## 8.1 Identity Tests

**Location:** `tests/aurora/unit/identity/`

| Test | Assertion |
|------|-----------|
| `AuroraIdentityBridge.test.ts` | ORION session → AuroraUserIdentity |
| `AuroraContextFactory.test.ts` | Full context with brand · permissions |
| `AuroraAuthorizationService.test.ts` | Permission assert · deny |
| `brandSwitch.test.ts` | withBrand validates access |

## 8.2 Tenant Isolation Tests

**Location:** `tests/aurora/integration/security/`

| Test | Assertion |
|------|-----------|
| `crossTenantRead.test.ts` | Tenant A cannot read Tenant B brand |
| `crossTenantWrite.test.ts` | Tenant A cannot write Tenant B config |
| `rlsPolicy.test.ts` | PostgreSQL RLS blocks cross-tenant query |
| `redisKeyIsolation.test.ts` | Cache keys tenant-prefixed |
| `queueJobIsolation.test.ts` | Job dequeue validates tenant |

```typescript
describe('Tenant Isolation', () => {
  it('rejects cross-tenant brand access', async () => {
    const tenantA = await createTestTenant('A');
    const tenantB = await createTestTenant('B');
    const brandB = await createTestBrand(tenantB);
    const ctxA = createContextForTenant(tenantA);
    await expect(
      facade.admin.getBrand(ctxA, brandB.id)
    ).rejects.toMatchObject({ code: 'AURORA_ERR_0403' });
  });
});
```

## 8.3 Permission Tests

| Test | Scenario |
|------|----------|
| `rolePermissionMapping.test.ts` | Each role has expected permissions |
| `permissionDenial.test.ts` | Missing permission throws 403 |
| `agentPermissionBoundary.test.ts` | Agent cannot exceed user permissions |
| `adminPermission.test.ts` | Admin operations require admin role |

## 8.4 Configuration Validation Tests

| Test | Scenario |
|------|----------|
| `configInheritance.test.ts` | Brand overrides tenant · tenant overrides global |
| `configMerge.test.ts` | Deep merge JSONB objects |
| `invalidConfigRejected.test.ts` | Schema validation rejects bad config |
| `tierLimitValidation.test.ts` | Downgrade blocked when over limit |

## 8.5 Feature Flag Tests

| Test | Scenario |
|------|----------|
| `featureFlagResolution.test.ts` | Env > brand > tenant > default |
| `unknownFlagDefault.test.ts` | Unknown flag returns false |
| `featureFlagCache.test.ts` | Cache invalidated on update |

## 8.6 Startup Tests

| Test | Scenario |
|------|----------|
| `configBootPhase.test.ts` | Phase 1 loads and validates config |
| `providerChainRegistration.test.ts` | All providers registered in order |
| `tenantProvisioningBoot.test.ts` | New tenant gets default config |

## 8.7 Coverage Targets

| Layer | Minimum |
|-------|:-------:|
| `lib/aurora/identity/` | 90% |
| `lib/aurora/admin/` | 85% |
| `lib/aurora/config/` | 90% |
| `lib/aurora/security/` | 85% |
| **A-008 scope overall** | **85%** |

---

# 9. Engineering Standards

## 9.1 Folder Layout

```
lib/aurora/
├── identity/
│   ├── AuroraIdentityBridge.ts
│   ├── AuroraUserIdentity.ts
│   ├── AuroraAuthorizationService.ts
│   ├── AuroraContextFactory.ts
│   ├── aurora-role-permissions.ts
│   └── aurora-permission-catalog.ts
├── admin/
│   ├── services/
│   │   ├── TenantService.ts          # Extended from A-007
│   │   ├── BrandService.ts
│   │   ├── BusinessEntityService.ts
│   │   ├── TenantProvisioningService.ts
│   │   ├── BrandAccessService.ts
│   │   └── TierLimitService.ts
│   └── repositories/
│       ├── TenantRepository.ts
│       ├── BrandRepository.ts
│       ├── BusinessEntityRepository.ts
│       └── BrandAccessRepository.ts
├── config/
│   ├── ConfigurationService.ts
│   ├── ConfigurationCache.ts
│   ├── ConfigurationValidator.ts
│   ├── globalDefaults.ts
│   ├── configSchemas.ts
│   ├── providers/
│   │   ├── EnvironmentConfigurationProvider.ts
│   │   ├── TenantConfigurationProvider.ts
│   │   ├── BrandConfigurationProvider.ts
│   │   ├── BusinessConfigurationProvider.ts
│   │   ├── WorkspaceConfigurationProvider.ts
│   │   └── GlobalDefaultsConfigurationProvider.ts
│   └── repositories/
│       ├── ConfigurationRepository.ts
│       ├── PostgresConfigurationRepository.ts
│       └── InMemoryConfigurationRepository.ts
├── security/
│   ├── AuroraSecretsProvider.ts
│   ├── DatabaseSecretsProvider.ts
│   ├── EnvironmentSecretsProvider.ts
│   └── encryption/
│       └── AuroraEncryptionService.ts
└── persistence/migrations/
    ├── 002_aurora_business_entity.sql
    ├── 003_aurora_config_tables.sql
    ├── 004_aurora_secrets.sql
    └── 005_aurora_rls_policies.sql
```

## 9.2 Interfaces

All public contracts as `interface` · explicit return types · readonly fields. See ES-AURORA-005 §10.3.

## 9.3 Repository Contracts

| Rule | Description |
|------|-------------|
| **REP-1** | `tenantId` first parameter on all queries |
| **REP-2** | Return `null` for not found — not throw |
| **REP-3** | Throw `AURORA_ERR_0403` on tenant mismatch |
| **REP-4** | Immutable return types |

## 9.4 Naming

Extends ES-AURORA-005 §10.2. Additional:

| Element | Convention | Example |
|---------|-----------|---------|
| Config key | dot.notation | `approval_policy.content` |
| Feature flag | `aurora.{domain}.{feature}` | `aurora.ads.enabled` |
| Permission | `aurora.{domain}.{action}` | `aurora.content.write` |
| Secret ref | `{scope}/{key}` | `integration/google/oauth` |

## 9.5 Error Handling

| Code | HTTP | Usage |
|------|:----:|-------|
| `AURORA_ERR_0403` | 403 | Permission denied · cross-tenant |
| `AURORA_ERR_0404` | 404 | Tenant/brand not found |
| `AURORA_ERR_0429` | 429 | Tier limit exceeded |
| `AURORA_ERR_0400` | 400 | Invalid configuration |

## 9.6 Review Checklist

| # | Check |
|---|-------|
| 1 | No Aurora authentication implementation |
| 2 | All operations use AuroraRuntimeContext |
| 3 | tenantId on every repository call |
| 4 | Cross-tenant isolation tests pass |
| 5 | Config resolved via ConfigurationService only |
| 6 | No secrets in code or logs |
| 7 | RBAC checks on admin operations |
| 8 | Coverage ≥ 85% |

---

# 10. Acceptance Criteria

## 10.1 Definition of Done

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | ORION session maps to AuroraRuntimeContext | Integration test |
| 2 | Tenant → Business → Brand hierarchy operational | CRUD tests |
| 3 | Tenant provisioning creates defaults | Provisioning test |
| 4 | Cross-tenant isolation — zero leakage | Security test suite |
| 5 | RLS policies on all Aurora tables | Migration + test |
| 6 | Hierarchical config resolution | Inheritance tests |
| 7 | Feature flags resolve correctly | Flag tests |
| 8 | Tier limits enforced | Limit tests |
| 9 | RBAC permissions mapped and enforced | Permission tests |
| 10 | Secrets encrypted at rest | Encryption tests |
| 11 | ConfigurationService cache works | Cache tests |
| 12 | Configuration validation pipeline | Validation tests |
| 13 | Agent service identity defined | Unit test |
| 14 | Coverage ≥ 85% | CI report |
| 15 | Extends ES-AURORA-005 without breaking wiring | Regression tests |

## 10.2 Implementation Checklist

See [Appendix F](#appendix-f--implementation-checklist).

## 10.3 Operational Readiness

| Check | Target |
|-------|--------|
| Config cache hit rate | > 90% |
| Permission check latency p95 | < 5ms |
| Context factory latency p95 | < 20ms |
| Tenant provisioning time | < 2s |
| Cross-tenant test CI | 100% pass rate |

## 10.4 Required Test Suites

| Suite | Minimum Tests |
|-------|:-------------:|
| Identity unit | 25+ |
| Tenant isolation integration | 15+ |
| Permission unit | 20+ |
| Configuration unit | 30+ |
| Feature flag unit | 10+ |
| Security/secrets unit | 15+ |
| **Total** | **115+** |

## 10.5 Engineering Sign-Off

| Role | Criteria |
|------|----------|
| A-008 Mission Lead | All DoD met |
| Security Lead | Isolation · secrets · RBAC verified |
| Architecture Review Board | IP-1–IP-8 enforced |
| ORION Identity Owner | No duplication · bridge correct |

---

# 11. Implementation Roadmap

## 11.1 Sprint Sequencing

| Sprint | Focus | Deliverables |
|:------:|-------|-------------|
| **S1** | Identity bridge · context factory | AuroraIdentityBridge · AuroraContextFactory · AuroraAuthorizationService |
| **S2** | Tenant hierarchy · provisioning | BusinessEntity · TenantProvisioning · TierLimitService |
| **S3** | Configuration runtime | ConfigurationService · providers · cache · validator |
| **S4** | Secrets · RBAC · tests | SecretsProvider · RLS migrations · isolation suite |

**Duration:** 6 weeks · 3 sprints (2 weeks each) — can parallel S3 with S2 after S1.

## 11.2 Dependencies

| Dependency | Owner | Required For |
|------------|-------|-------------|
| ES-AURORA-005 (A-007) complete | Aurora | Wiring · admin stubs |
| ORION Identity (ES-009) | ORION | Session · RBAC |
| ORION PlatformStore | ORION | Persistence |
| PostgreSQL RLS support | Infrastructure | Tenant isolation |
| Redis | Infrastructure | Config cache |

## 11.3 Critical Path

```
A-007 Platform Foundation (ES-AURORA-005)
    ↓
A-008 Identity/Tenant/Config (ES-AURORA-006) ← THIS SPEC
    ↓
A-009 Knowledge & Memory (ES-AURORA-007)
    ↓
A-010+ Domain modules
```

**A-008 blocks all domain modules** — every module requires identity context and configuration.

## 11.4 Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R-1 | ORION session schema change | Bridge abstraction · contract test |
| R-2 | RLS performance impact | Index tenant_id · connection pooling |
| R-3 | Config cache stale reads | TTL 300s · invalidate on write |
| R-4 | Tier limit edge cases | Comprehensive limit test matrix |
| R-5 | Secret encryption key management | Document KMS migration path Phase 2 |

## 11.5 Future Expansion

| Horizon | Enhancement |
|---------|-------------|
| Phase 2 | Brand access groups · agency client isolation |
| Phase 2 | VaultSecretsProvider · OAuth token refresh |
| Phase 3 | Enterprise SSO/SAML · custom roles |
| Phase 3 | Config UI · self-service admin portal |
| Phase 3 | Multi-region tenant data residency |

---

# 12. Executive Recommendation

## 12.1 Implementation Readiness

| Dimension | Status |
|-----------|:------:|
| ES-AURORA-005 (A-007) spec | ✅ Ratified |
| ES-AURORA-006 (A-008) spec | ✅ This document |
| ORION Identity patterns | ✅ ES-009 · ES-037 |
| Architecture alignment | ✅ A-001 · A-005 |
| Dependency on A-007 code | ⏳ A-007 implementation first |

**ES-AURORA-006 is complete. A-008 implementation authorized upon A-007 completion.**

## 12.2 Approval

| Authorization | Status |
|---------------|:------:|
| ES-AURORA-006 Identity/Tenant/Config spec | **✅ RATIFIED** |
| A-008 implementation | **✅ AUTHORIZED** (after A-007) |
| ES-AURORA-007 Knowledge & Memory spec | **✅ AUTHORIZED TO DRAFT** |

## 12.3 Authorize ES-AURORA-007

| Field | Value |
|-------|-------|
| **Next Spec** | ES-AURORA-007 — Knowledge & Memory Layer Implementation |
| **Mission** | A-009 — Knowledge & Memory Implementation |
| **Dependency** | A-007 · A-008 complete |
| **Scope** | 11 knowledge domains · 10 memory tiers · retrieval pipeline |

---

### Mohammad Shafi Goroo

Founder & Chief Architect

ORION Enterprise Platform · Project Aurora

7 August 2026

---

# Appendices

## Appendix A — Identity Model

```
ORION User (authenticated)
    │
    ├── orionOrganizationId ──────► Aurora Tenant
    │                                   │
    │                                   ├── BusinessEntity (0..n)
    │                                   │       │
    │                                   │       └── Brand (1..n per business)
    │                                   │
    │                                   └── Default Business
    │                                           └── Default Brand
    │
    ├── orionWorkspaceId ─────────► Aurora Workspace Scope
    │
    └── orionRoles ───────────────► Aurora Roles + Permissions

Aurora ServiceIdentity (agents · workers)
    │
    ├── serviceId (aurora.agent.* · aurora.system)
    ├── tenantId (required)
    ├── brandId (optional)
    └── attributedUserId (optional)
```

## Appendix B — Tenant Hierarchy

| Level | Entity | ID Format | Parent | Cardinality |
|:-----:|--------|-----------|--------|:-----------:|
| 0 | Tenant | `tnt_{uuid}` | ORION Org | 1 per org |
| 1 | Business Entity | `biz_{uuid}` | Tenant | 0..n |
| 2 | Brand | `brd_{uuid}` | Business | 1..n |
| 3 | Workspace Config | — | User + Tenant | 1 per user |

## Appendix C — Configuration Schema

### TenantConfig (JSONB)

```json
{
  "tier": "professional",
  "approval_policy": {
    "content.publish": 2,
    "campaign.launch": 2,
    "agent.autonomous": 3
  },
  "automation_policy": {
    "autoApprove": false,
    "tier3Enabled": false
  },
  "token_budget_daily": 200000,
  "limits": {
    "maxBrands": 5,
    "maxUsers": 15,
    "storageGb": 50
  },
  "feature_overrides": {
    "aurora.ads.enabled": false
  }
}
```

### BrandConfig (JSONB)

```json
{
  "voice_profile": {
    "tone": "professional",
    "formality": "medium",
    "personality": ["innovative", "trustworthy"]
  },
  "approval_overrides": {
    "content.publish": 1
  },
  "channel_config": {
    "social": { "enabled": true },
    "email": { "enabled": false }
  },
  "locale": "en-US",
  "timezone": "America/New_York"
}
```

## Appendix D — Permission Matrix

| Permission | admin | director | manager | editor | approver | viewer |
|------------|:-----:|:--------:|:-------:|:------:|:--------:|:------:|
| aurora.admin.tenant | ✅ | — | — | — | — | — |
| aurora.admin.brand | ✅ | ✅ | — | — | — | — |
| aurora.admin.config | ✅ | ✅ | — | — | — | — |
| aurora.content.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| aurora.content.write | ✅ | ✅ | ✅ | ✅ | — | — |
| aurora.content.approve | ✅ | ✅ | ✅ | — | ✅ | — |
| aurora.content.publish | ✅ | ✅ | ✅ | — | — | — |
| aurora.campaign.write | ✅ | ✅ | ✅ | ✅ | — | — |
| aurora.agent.invoke | ✅ | ✅ | ✅ | ✅ | — | — |
| aurora.integration.manage | ✅ | ✅ | — | — | — | — |
| aurora.approval.override | ✅ | ✅ | — | — | — | — |

## Appendix E — Feature Flag Catalogue

| Flag Key | Default | Tier | Phase | Mission |
|----------|:-------:|------|:-----:|---------|
| `aurora.platform.enabled` | true | all | 1 | A-007 |
| `aurora.agents.enabled` | true | all | 1 | A-018 |
| `aurora.publish.enabled` | true | all | 1 | A-016 |
| `aurora.automation.tier3` | false | pro+ | 1 | A-016 |
| `aurora.ads.enabled` | false | pro+ | 2 | A-022 |
| `aurora.email.enabled` | false | pro+ | 2 | A-023 |
| `aurora.whatsapp.enabled` | false | agency+ | 2 | A-024 |
| `aurora.agency.multi_client` | false | agency+ | 2 | A-031 |
| `aurora.phase2_agents.enabled` | false | pro+ | 2 | A-032 |
| `aurora.crm_bridge.enabled` | false | enterprise | 2 | A-034 |
| `aurora.analytics.advanced` | false | pro+ | 2 | A-033 |
| `aurora.api.public` | false | enterprise | 3 | A-045 |
| `aurora.whitelabel.enabled` | false | agency+ | 3 | A-043 |
| `aurora.sso.enabled` | false | enterprise | 3 | A-042 |

## Appendix F — Implementation Checklist

### Sprint 1 — Identity Bridge

- [ ] `AuroraIdentityBridge` ORION session mapping
- [ ] `AuroraContextFactory` with brand resolution
- [ ] `AuroraAuthorizationService` permission checks
- [ ] `aurora-role-permissions.ts` role mapping
- [ ] Extend `AuroraRuntimeContext` with workspace · permissions
- [ ] API middleware `getAuroraApiContext()`
- [ ] Unit tests (25+)

### Sprint 2 — Tenant Hierarchy

- [ ] `BusinessEntityService` · repository · migration
- [ ] Extend `TenantService` with tier · status lifecycle
- [ ] Extend `BrandService` with business scoping
- [ ] `TenantProvisioningService` full sequence
- [ ] `TierLimitService` enforcement
- [ ] `BrandAccessService` user-brand bindings
- [ ] RLS migrations for all admin tables
- [ ] Cross-tenant isolation test suite

### Sprint 3 — Configuration Runtime

- [ ] `ConfigurationRepository` Postgres + in-memory
- [ ] Six `ConfigurationProvider` implementations
- [ ] `ConfigurationService` full implementation
- [ ] `ConfigurationCache` Redis backend
- [ ] `ConfigurationValidator` Zod schemas
- [ ] Feature flag resolution
- [ ] Config inheritance tests

### Sprint 4 — Secrets & Certification

- [ ] `AuroraEncryptionService` AES-256-GCM
- [ ] `DatabaseSecretsProvider`
- [ ] `aurora_secrets` migration
- [ ] Secrets access audit logging
- [ ] Permission matrix integration tests
- [ ] Coverage ≥ 85% verification
- [ ] Mission completion report

---

## Document Approval

| Field | Value |
|-------|-------|
| **Document** | ES-AURORA-006 — Identity, Tenant & Configuration Foundation |
| **Version** | 1.0 |
| **Status** | Ratified |
| **Approved By** | Mohammad Shafi Goroo — Founder & Chief Architect |
| **Date** | 7 August 2026 |
| **Classification** | Engineering Specification · Identity · Multi-Tenant |
| **Implements** | A-001 §7 · A-005 §3.7 · A-006 EP-IDENTITY · EP-CONFIG |
| **Authorizes** | A-008 Identity, Tenant & Configuration Implementation |
| **Depends On** | A-007 / ES-AURORA-005 |
| **Next Spec** | ES-AURORA-007 — Knowledge & Memory Layer |

---

### Project Aurora

*Identity Defined · Tenants Isolated · Configuration Governed · Powered by ORION*

**Let's build something remarkable.**


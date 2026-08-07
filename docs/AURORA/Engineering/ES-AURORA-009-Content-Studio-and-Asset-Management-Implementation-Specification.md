# ES-AURORA-009 — Aurora Content Studio & Asset Management Implementation Specification

**Document ID:** ES-AURORA-009  
**Program:** Project Aurora — AI Marketing Platform  
**Mission:** A-011 — Content Studio & Asset Management  
**Prior Missions:** A-007 (ES-AURORA-005) · A-008 (ES-AURORA-006) · A-009 (ES-AURORA-007) · A-010 (ES-AURORA-008)  
**Version:** 1.0  
**Status:** Ratified — Authoritative Engineering Specification  
**Classification:** Engineering Specification · Content Studio · Asset Management · Brand · SEO Integration  
**Authority:** Founder & Chief Architect · Aurora Architecture Review Board  
**Architecture Source:** [A-001 Aurora Constitution](../A-001-Aurora-Constitution.md) · [A-002 Enterprise Engineering Blueprint](../A-002-Aurora-Enterprise-Engineering-Blueprint.md)  
**Platform Parent:** [ES-AURORA-005 Platform Foundation](./ES-AURORA-005-Platform-Foundation-Implementation-Specification.md) · [ES-AURORA-006 Identity/Tenant/Config](./ES-AURORA-006-Identity-Tenant-and-Configuration-Foundation.md) · [ES-AURORA-007 Knowledge & Memory](./ES-AURORA-007-Enterprise-Knowledge-Graph-and-Memory-Infrastructure.md) · [ES-AURORA-008 AI Workforce Runtime](./ES-AURORA-008-AI-Workforce-Runtime-Implementation-Specification.md)  
**Effective Date:** 7 August 2026  
**Subordinate To:** A-001 · A-002 · A-005 · ES-AURORA-005 · ES-AURORA-006 · ES-AURORA-007 · ES-AURORA-008

**Rule:** This document is the **authoritative engineering specification** for Aurora Content Studio & Asset Management (Mission A-011). All code in `lib/aurora/content/` and `lib/aurora/assets/` must comply. **No production implementation in this document.** **Specification only.**

**Scope:** Content workspace · draft management · templates · prompts · versioning · approval · publishing preparation · asset repository · brand assets · AI content engine · brand management · SEO integration · ORION integration. **Excludes:** Publish pipeline execution (A-015) · Content Studio UI (A-019) · Creative AI image generation (A-013).

---

## Engineering Principles (Binding)

| # | Principle | Enforcement |
|---|-----------|-------------|
| **CP-1** | **All content is versioned** | Immutable version records · no overwrite |
| **CP-2** | **AI never publishes directly** | Status `approved` required · PublishPipeline only |
| **CP-3** | **Human approval mandatory before publication** | Approval workflow · no auto-publish external content |
| **CP-4** | **Brand rules are enforced** | BrandComplianceValidator on every save and generation |
| **CP-5** | **Knowledge retrieval precedes content generation** | Workforce pre-flight via ES-AURORA-007/008 |
| **CP-6** | **Assets are immutable** | New version on change · original blob retained |
| **CP-7** | **Every revision is auditable** | ORION AuditStore · version + approval trail |
| **CP-8** | **Publishing is channel-independent** | Content entity separate from channel formatting |
| **CP-9** | **SEO optimization is built in** | ContentSeoScore · metadata generation on save |
| **CP-10** | **Every content item belongs to tenant and brand** | tenant_id · brand_id · RLS on all tables |

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Content Studio](#2-content-studio)
3. [Asset Management](#3-asset-management)
4. [Content Lifecycle](#4-content-lifecycle)
5. [AI Content Engine](#5-ai-content-engine)
6. [Brand Management](#6-brand-management)
7. [SEO Integration](#7-seo-integration)
8. [ORION Integration](#8-orion-integration)
9. [Testing Strategy](#9-testing-strategy)
10. [Engineering Standards](#10-engineering-standards)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Executive Recommendation](#12-executive-recommendation)

**Appendices:** [A — Content Taxonomy](#appendix-a--content-taxonomy) · [B — Asset Taxonomy](#appendix-b--asset-taxonomy) · [C — Brand Model](#appendix-c--brand-model) · [D — Lifecycle Diagrams](#appendix-d--lifecycle-diagrams) · [E — SEO Rules](#appendix-e--seo-rules) · [F — Implementation Checklist](#appendix-f--implementation-checklist)

---

# Preamble

Content is Aurora's voice.

Assets are Aurora's visual identity.

Every word published represents the brand. Every image deployed carries trust. ES-AURORA-009 defines the engineering systems that create, govern, version, and prepare enterprise marketing content and assets — with AI assistance, human approval, and institutional knowledge at the core.

AI drafts. Humans approve. Aurora publishes with discipline.

---

# 1. Executive Overview

## 1.1 Purpose

| Field | Definition |
|-------|------------|
| **Document purpose** | Implementation specification for Content Studio & Asset Management |
| **Audience** | Content engineers · backend engineers · brand managers · AI architects |
| **Binding authority** | Mission A-011 · all `lib/aurora/content/` · `lib/aurora/assets/` code |
| **Deliverable type** | Engineering specification — no code |

## 1.2 Scope

### In Scope (A-011)

| Area | Coverage |
|------|----------|
| **Content Studio** | Workspace · drafts · templates · prompts · editor · versions · approval |
| **Asset Management** | Repository · image/video/document libraries · brand assets · collections |
| **Content lifecycle** | Draft → AI → review → approval → publish-ready → archive |
| **AI Content Engine** | Workforce integration · brand voice · scoring · fact validation |
| **Brand Management** | Voice · style · visual identity · compliance rules |
| **SEO Integration** | Metadata · scoring · readability · internal linking suggestions |
| **Persistence** | PostgreSQL · S3-compatible object storage |
| **ORION integration** | PlatformStore · Event Bus · Knowledge · Workforce · Analytics |

### Out of Scope

| Exclusion | Mission |
|-----------|---------|
| Publish pipeline execution | A-015 |
| Content Studio UI pages | A-019 |
| AI image generation | A-013 (Creative Studio) |
| Full Approval Engine | A-015 (integration stub) |
| Email/Social channel publish | A-015 · A-022+ |

### Phase Delivery

| Phase | Content Types | Assets | AI Generation |
|-------|---------------|--------|---------------|
| **A-011 Phase 1** | Blog · social · email · ad copy | Image · document · brand kit | Copywriter · Strategist · SEO agents |
| **A-011 Phase 1 complete** | Landing page · product description | Video metadata (Phase 2 blob) | Full workflow WF-01 |
| **Phase 2** | Press release · WhatsApp · localization | Video library full | Repurposing pipeline |

## 1.3 Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| 1 | **Content CRUD + lifecycle** | Full status machine operational |
| 2 | **Immutable versioning** | Every edit creates version record |
| 3 | **AI generation via workforce** | Copywriter agent · knowledge pre-flight |
| 4 | **Approval workflow** | Submit → approve/reject · events emitted |
| 5 | **Asset repository** | Upload · metadata · collections · immutable versions |
| 6 | **Brand compliance** | Voice score ≥ 80% or flag for review |
| 7 | **SEO integration** | ContentSeoScore · metadata on every content item |
| 8 | **Publishing preparation** | Publish-ready payload · channel-independent |
| 9 | **Tenant isolation** | Zero cross-tenant content/asset leakage |
| 10 | **Audit trail** | All mutations · approvals · generations logged |

## 1.4 Relationship with Architecture Documents

| Document | ES-AURORA-009 Response |
|----------|------------------------|
| **A-001** | Module 2 Content Studio · approval before publish · content types |
| **A-002** | `lib/aurora/content/` domain · ContentService contracts · events |
| **A-003** | Copywriter · Content Strategist · SEO Specialist agent integration |
| **A-004** | Content Knowledge domain · brand memory · learning signals |
| **A-005** | Content module runtime · Boot Phase registration |
| **A-006** | Mission A-011 · EP-CONTENT epic · F-090–F-099 features |
| **A-007 / ES-AURORA-005** | Module registry · object storage · facade extension |
| **A-008 / ES-AURORA-006** | Tenant/brand scoping · RBAC · brand config |
| **A-009 / ES-AURORA-007** | Knowledge retrieval · ContentPattern · ContentSeoScore entities |
| **A-010 / ES-AURORA-008** | AuroraWorkforceRuntime · taskType content.* |

---

# 2. Content Studio

## 2.1 ContentModuleRuntime

**File:** `lib/aurora/content/ContentModuleRuntime.ts`

```typescript
export class ContentModuleRuntime implements AuroraModuleRuntime {
  readonly moduleKey = 'content';
  readonly displayName = 'Content Studio';
  readonly phase = 1 as const;
  readonly tier = 2;
  readonly dependencies = ['admin', 'knowledge', 'workforce'] as const;
}
```

## 2.2 ContentWorkspace

**File:** `lib/aurora/content/workspace/ContentWorkspace.ts`

Brand-scoped workspace aggregating drafts · templates · recent content · pending approvals.

```typescript
export interface ContentWorkspace {
  getWorkspace(ctx: AuroraRuntimeContext): Promise<ContentWorkspaceSnapshot>;
  getRecentContent(ctx: AuroraRuntimeContext, limit?: number): Promise<readonly ContentSummary[]>;
  getPendingApprovals(ctx: AuroraRuntimeContext): Promise<readonly ContentSummary[]>;
  getDrafts(ctx: AuroraRuntimeContext): Promise<readonly ContentSummary[]>;
  getStats(ctx: AuroraRuntimeContext): Promise<ContentWorkspaceStats>;
}

export interface ContentWorkspaceSnapshot {
  readonly brandId: string;
  readonly drafts: readonly ContentSummary[];
  readonly inReview: readonly ContentSummary[];
  readonly recentlyPublished: readonly ContentSummary[];
  readonly pendingApprovals: readonly ContentSummary[];
  readonly stats: ContentWorkspaceStats;
}
```

## 2.3 ContentService

**File:** `lib/aurora/content/services/ContentService.ts`

```typescript
export interface ContentService {
  create(ctx: AuroraRuntimeContext, input: CreateContentInput): Promise<Content>;
  update(ctx: AuroraRuntimeContext, id: string, input: UpdateContentInput): Promise<Content>;
  getById(ctx: AuroraRuntimeContext, id: string): Promise<Content | null>;
  list(ctx: AuroraRuntimeContext, filters: ContentFilters): Promise<PaginatedResult<Content>>;
  delete(ctx: AuroraRuntimeContext, id: string): Promise<void>;
  archive(ctx: AuroraRuntimeContext, id: string): Promise<Content>;
  restore(ctx: AuroraRuntimeContext, id: string): Promise<Content>;
  submitForApproval(ctx: AuroraRuntimeContext, id: string): Promise<Content>;
  markPublishReady(ctx: AuroraRuntimeContext, id: string): Promise<PublishReadyPayload>;
}
```

## 2.4 DraftManager

**File:** `lib/aurora/content/services/DraftManager.ts`

Manages in-progress content before submission.

```typescript
export interface DraftManager {
  createDraft(ctx: AuroraRuntimeContext, input: CreateDraftInput): Promise<Content>;
  saveDraft(ctx: AuroraRuntimeContext, id: string, body: ContentBody): Promise<Content>;
  autosave(ctx: AuroraRuntimeContext, id: string, body: ContentBody): Promise<void>;
  discardDraft(ctx: AuroraRuntimeContext, id: string): Promise<void>;
  listDrafts(ctx: AuroraRuntimeContext): Promise<readonly Content[]>;
}
```

| Field | Value |
|-------|-------|
| Autosave interval | 30 seconds (client) · debounced server write |
| Draft TTL | None — retained until submitted or deleted |
| Max drafts per brand (Starter) | 50 · Pro: 200 · Enterprise: unlimited |

## 2.5 TemplateLibrary

**File:** `lib/aurora/content/templates/TemplateLibrary.ts`

```typescript
export interface TemplateLibrary {
  list(ctx: AuroraRuntimeContext, filter?: TemplateFilter): Promise<readonly ContentTemplate[]>;
  get(ctx: AuroraRuntimeContext, templateId: string): Promise<ContentTemplate | null>;
  create(ctx: AuroraRuntimeContext, input: CreateTemplateInput): Promise<ContentTemplate>;
  apply(ctx: AuroraRuntimeContext, templateId: string, variables: TemplateVariables): Promise<ContentBody>;
}
```

### Built-in Templates (Phase 1)

| Template ID | Content Type | Variables |
|-------------|--------------|-----------|
| `tpl.blog.standard` | blog_post | title · topic · audience · keywords |
| `tpl.social.instagram` | social_caption | hook · cta · hashtags |
| `tpl.social.linkedin` | social_caption | headline · body · cta |
| `tpl.email.newsletter` | email_body | subject · sections · cta |
| `tpl.ads.google_rsa` | ad_copy | headlines[] · descriptions[] |
| `tpl.ads.meta_primary` | ad_copy | primary · headline · description |
| `tpl.landing.hero` | landing_page | headline · subhead · benefits[] |
| `tpl.product.description` | product_description | name · features[] · specs |

## 2.6 PromptLibrary

**File:** `lib/aurora/content/prompts/ContentPromptLibrary.ts`

Content-specific prompt templates consumed by workforce agents. Extends workforce `PromptRegistry`.

| Prompt Key | Agent | Purpose |
|------------|-------|---------|
| `content.blog.generate` | Copywriter | Blog post generation |
| `content.social.generate` | Copywriter | Social caption |
| `content.email.generate` | Copywriter | Email body |
| `content.ad.generate` | Copywriter | Ad copy variants |
| `content.repurpose` | Copywriter | Cross-format repurposing |
| `content.topic.plan` | Strategist | Topic + outline |
| `content.seo.optimize` | SEO Specialist | Inline SEO optimization |

## 2.7 Rich Editor Contract

**Architecture contract only** — UI implements TipTap or equivalent (A-001 §14).

```typescript
export interface ContentBody {
  readonly format: 'markdown' | 'html' | 'plain' | 'structured';
  readonly raw: string;
  readonly structured?: StructuredContent;   // TipTap JSON
  readonly wordCount: number;
  readonly readingTimeMinutes: number;
}

export interface StructuredContent {
  readonly type: 'doc';
  readonly content: readonly unknown[];      // TipTap document nodes
}
```

| Rule | Description |
|------|-------------|
| **ED-1** | Server stores both raw and structured when provided |
| **ED-2** | Word count computed server-side on save |
| **ED-3** | XSS sanitization on HTML before persist |
| **ED-4** | Editor never bypasses ContentService for save |

## 2.8 ContentVersionService

**File:** `lib/aurora/content/services/ContentVersionService.ts`

**CP-1:** All content is versioned.

```typescript
export interface ContentVersionService {
  createVersion(ctx: AuroraRuntimeContext, contentId: string, body: ContentBody, reason?: string): Promise<ContentVersion>;
  getVersion(ctx: AuroraRuntimeContext, contentId: string, version: number): Promise<ContentVersion | null>;
  listVersions(ctx: AuroraRuntimeContext, contentId: string): Promise<readonly ContentVersion[]>;
  diff(ctx: AuroraRuntimeContext, contentId: string, fromVersion: number, toVersion: number): Promise<ContentDiff>;
  rollback(ctx: AuroraRuntimeContext, contentId: string, toVersion: number): Promise<Content>;
}
```

| Rule | Description |
|------|-------------|
| **VER-C1** | Every update creates new version · never overwrite |
| **VER-C2** | Version records immutable |
| **VER-C3** | Rollback creates new version (not destructive) |
| **VER-C4** | AI-generated versions tagged `source: agent` |

## 2.9 Approval Workflow

**File:** `lib/aurora/content/workflows/ContentApprovalWorkflow.ts`

**CP-3:** Human approval mandatory before publication.

```typescript
export interface ContentApprovalWorkflow {
  submit(ctx: AuroraRuntimeContext, contentId: string): Promise<ApprovalSubmission>;
  approve(ctx: AuroraRuntimeContext, contentId: string, comment?: string): Promise<Content>;
  reject(ctx: AuroraRuntimeContext, contentId: string, reason: string): Promise<Content>;
  requestChanges(ctx: AuroraRuntimeContext, contentId: string, feedback: string): Promise<Content>;
  getApprovalHistory(ctx: AuroraRuntimeContext, contentId: string): Promise<readonly ApprovalRecord[]>;
}
```

### Approval Routing

| Content Type | Required Approver Role | Min Approvers |
|--------------|------------------------|:-------------:|
| Blog · landing page | Brand Manager or Approver | 1 |
| Social caption | Channel Manager or Approver | 1 |
| Email body (>100 recipients) | Brand Manager | 1 |
| Ad copy (external) | Marketing Director | 1 |
| Internal draft | Content Creator self-review | 0 (no external) |

Configured via ES-AURORA-006 `approval_policy.content.*` keys.

## 2.10 Publishing Preparation

**File:** `lib/aurora/content/services/PublishPreparationService.ts`

**CP-8:** Channel-independent content · formatting at publish time.

```typescript
export interface PublishPreparationService {
  prepare(ctx: AuroraRuntimeContext, contentId: string): Promise<PublishReadyPayload>;
  validatePublishReady(ctx: AuroraRuntimeContext, contentId: string): Promise<PublishValidationResult>;
}

export interface PublishReadyPayload {
  readonly contentId: string;
  readonly version: number;
  readonly contentType: ContentType;
  readonly body: ContentBody;
  readonly seoMetadata: SeoMetadata;
  readonly brandAssets: readonly AssetReference[];
  readonly channelHints: readonly ChannelHint[];
  readonly approvedAt: string;
  readonly approvedBy: string;
}
```

Publish pipeline (A-015) consumes `PublishReadyPayload` — Content module does not publish.

## 2.11 ContentRepository Schema

**Migration:** `migrations/aurora/009_content_assets.sql`

```sql
CREATE TABLE aurora_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  campaign_id UUID,
  content_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  current_version INT NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'human',
  agent_codename TEXT,
  seo_metadata JSONB,
  seo_score NUMERIC(5,2),
  quality_score NUMERIC(5,2),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (tenant_id, brand_id, slug)
);

CREATE TABLE aurora_content_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES aurora_content(id),
  version INT NOT NULL,
  body JSONB NOT NULL,
  format TEXT NOT NULL,
  word_count INT NOT NULL,
  source TEXT NOT NULL,
  agent_codename TEXT,
  generation_meta JSONB,
  change_reason TEXT,
  author_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (content_id, version)
);
```

## 2.12 API Route Contracts

| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| `GET` | `/api/aurora/content` | `aurora.content.read` | List content |
| `POST` | `/api/aurora/content` | `aurora.content.write` | Create content |
| `GET` | `/api/aurora/content/:id` | `aurora.content.read` | Get content |
| `PATCH` | `/api/aurora/content/:id` | `aurora.content.write` | Update content |
| `DELETE` | `/api/aurora/content/:id` | `aurora.content.write` | Soft delete |
| `POST` | `/api/aurora/content/generate` | `aurora.content.write` | AI generate |
| `POST` | `/api/aurora/content/:id/submit` | `aurora.content.write` | Submit for approval |
| `POST` | `/api/aurora/content/:id/approve` | `aurora.content.approve` | Approve |
| `POST` | `/api/aurora/content/:id/reject` | `aurora.content.approve` | Reject |
| `GET` | `/api/aurora/content/:id/versions` | `aurora.content.read` | Version history |
| `GET` | `/api/aurora/content/workspace` | `aurora.content.read` | Workspace snapshot |

## 2.13 Content Search Integration

Content entities indexed in ORION Search (A-018):

| Field | Indexed | Facet |
|-------|:-------:|:-----:|
| title | ✅ | — |
| contentType | ✅ | ✅ |
| status | ✅ | ✅ |
| brandId | ✅ | ✅ |
| campaignId | ✅ | ✅ |
| tags | ✅ | ✅ |
| body (full text) | ✅ | — |

---

# 3. Asset Management

## 3.1 AssetRepository

**File:** `lib/aurora/assets/repositories/AssetRepository.ts`

```typescript
export interface AssetRepository {
  save(tenantId: string, asset: AssetRecord): Promise<void>;
  getById(tenantId: string, assetId: string): Promise<AssetRecord | null>;
  query(tenantId: string, filter: AssetFilter): Promise<PaginatedResult<AssetRecord>>;
  saveVersion(tenantId: string, version: AssetVersionRecord): Promise<void>;
  softDelete(tenantId: string, assetId: string): Promise<void>;
}
```

**Tables:**
- `aurora_asset`
- `aurora_asset_version`
- `aurora_asset_tag`
- `aurora_asset_collection`
- `aurora_asset_collection_item`

## 3.2 AssetService

**File:** `lib/aurora/assets/services/AssetService.ts`

```typescript
export interface AssetService {
  upload(ctx: AuroraRuntimeContext, input: AssetUploadInput): Promise<Asset>;
  getById(ctx: AuroraRuntimeContext, assetId: string): Promise<Asset | null>;
  list(ctx: AuroraRuntimeContext, filter: AssetFilter): Promise<PaginatedResult<Asset>>;
  updateMetadata(ctx: AuroraRuntimeContext, assetId: string, metadata: AssetMetadata): Promise<Asset>;
  createVersion(ctx: AuroraRuntimeContext, assetId: string, file: AssetUploadInput): Promise<Asset>;
  archive(ctx: AuroraRuntimeContext, assetId: string): Promise<Asset>;
  getDownloadUrl(ctx: AuroraRuntimeContext, assetId: string): Promise<SignedUrl>;
}
```

## 3.3 Image Library

| Field | Specification |
|-------|---------------|
| Storage | S3-compatible · `{tenantId}/{brandId}/images/{assetId}/{version}` |
| Formats | JPEG · PNG · WebP · SVG |
| Max size (Starter) | 10 MB |
| Max size (Enterprise) | 100 MB |
| CDN | CloudFront or equivalent · signed URLs |
| Metadata | width · height · format · colorProfile · altText |

## 3.4 Video Library

| Phase | Capability |
|-------|------------|
| Phase 1 | Metadata + thumbnail · external URL reference |
| Phase 2 | Full blob storage · MP4 · WebM |

## 3.5 Document Library

| Type | Formats | Use Case |
|------|---------|----------|
| PDF | `.pdf` | Brand guidelines · reports |
| Office | `.docx` · `.pptx` | Briefs · presentations |
| Text | `.md` · `.txt` | Reference documents |

## 3.6 Brand Asset Library

**File:** `lib/aurora/assets/services/BrandAssetService.ts`

| Asset Class | Contents | Immutable |
|-------------|----------|:---------:|
| Logo | Primary · secondary · favicon · variants | ✅ versions only |
| Color palette | Hex · RGB · CSS variables | ✅ |
| Typography | Font files · fallbacks · scale | ✅ |
| Brand imagery | Approved photography · patterns | ✅ |
| Icons | Brand icon set | ✅ |

**CP-6:** Assets immutable — changes create new version · original blob retained 90 days minimum.

## 3.7 Campaign Assets

Link assets to campaigns without duplicating blobs:

```typescript
export interface CampaignAssetLink {
  readonly campaignId: string;
  readonly assetId: string;
  readonly role: 'hero' | 'thumbnail' | 'supporting' | 'ad_creative';
  readonly channel?: string;
}
```

**Table:** `aurora_campaign_asset_link`

## 3.8 Metadata

```typescript
export interface AssetMetadata {
  readonly title: string;
  readonly description?: string;
  readonly altText?: string;              // Required for images (accessibility)
  readonly copyright?: string;
  readonly license?: string;
  readonly source: 'upload' | 'ai_generated' | 'import' | 'brand_kit';
  readonly aiGenerationMeta?: AiGenerationMeta;
  readonly customFields?: Readonly<Record<string, string>>;
}
```

## 3.9 Tagging

**File:** `lib/aurora/assets/services/AssetTaggingService.ts`

```typescript
export interface AssetTaggingService {
  addTags(ctx: AuroraRuntimeContext, assetId: string, tags: readonly string[]): Promise<void>;
  removeTags(ctx: AuroraRuntimeContext, assetId: string, tags: readonly string[]): Promise<void>;
  searchByTags(ctx: AuroraRuntimeContext, tags: readonly string[]): Promise<readonly Asset[]>;
  suggestTags(ctx: AuroraRuntimeContext, assetId: string): Promise<readonly string[]>;
}
```

| Rule | Description |
|------|-------------|
| Tags lowercase · alphanumeric · max 32 chars | Normalized on write |
| Max tags per asset | 20 |
| System tags | `brand-kit` · `campaign` · `approved` · `archived` |

## 3.10 Collections

**File:** `lib/aurora/assets/services/AssetCollectionService.ts`

```typescript
export interface AssetCollectionService {
  create(ctx: AuroraRuntimeContext, input: CreateCollectionInput): Promise<AssetCollection>;
  addAsset(ctx: AuroraRuntimeContext, collectionId: string, assetId: string): Promise<void>;
  removeAsset(ctx: AuroraRuntimeContext, collectionId: string, assetId: string): Promise<void>;
  list(ctx: AuroraRuntimeContext): Promise<readonly AssetCollection[]>;
}
```

Built-in collections: `Brand Kit` · `Campaign Assets` · `Stock Approved` · `Archive`

## 3.11 Asset Lifecycle

```
uploaded → active → archived → deleted (soft)
              │
              └── new_version → active (prior version retained)
```

| Transition | Trigger | Authority |
|------------|---------|-----------|
| uploaded → active | Upload complete + validation | System |
| active → archived | Manual or retention policy | Brand Manager |
| archived → active | Restore request | Brand Manager |
| active → new_version | File replacement | Content Creator+ |
| any → deleted | Admin · retention expiry | Aurora Admin |

## 3.12 Object Storage Security

| Control | Implementation |
|---------|---------------|
| Path isolation | `{tenantId}/{brandId}/` prefix mandatory |
| Encryption at rest | SSE-S3 or KMS |
| Signed URLs | 15-minute expiry default |
| Virus scan | ClamAV hook on upload (Phase 2) |
| MIME validation | Magic byte check · not extension only |
| EXIF stripping | Remove GPS · camera metadata on images |

## 3.13 Asset API Routes

| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| `GET` | `/api/aurora/assets` | `aurora.content.read` | List assets |
| `POST` | `/api/aurora/assets/upload` | `aurora.content.write` | Upload asset |
| `GET` | `/api/aurora/assets/:id` | `aurora.content.read` | Get metadata |
| `GET` | `/api/aurora/assets/:id/download` | `aurora.content.read` | Signed URL |
| `PATCH` | `/api/aurora/assets/:id` | `aurora.content.write` | Update metadata |
| `POST` | `/api/aurora/assets/:id/version` | `aurora.content.write` | New file version |
| `GET` | `/api/aurora/assets/collections` | `aurora.content.read` | List collections |

---

# 4. Content Lifecycle

## 4.1 Status Machine

**CP-2 · CP-3:** AI never publishes directly · human approval required.

```
                    ┌──────────────────────────────────────┐
                    │                                      │
draft ──→ ai_generating ──→ draft                         │
  │                           │                           │
  │                           ▼                           │
  │                      submitted ──→ in_review          │
  │                           │              │            │
  │                           │              ├── approved ──┼──→ publish_ready ──→ published
  │                           │              │            │         (A-015)
  │                           │              └── rejected ─┘
  │                           │                      │
  │                           └── changes_requested ←┘
  │                                      │
  └── archived ←─────────────────────────┘
         │
         └── restored ──→ draft (new version)
```

## 4.2 Lifecycle States

| Status | Description | Editable | AI Generate |
|--------|-------------|:--------:|:-----------:|
| `draft` | Initial or post-rejection | ✅ | ✅ |
| `ai_generating` | Workforce task in flight | ❌ | — |
| `submitted` | Awaiting reviewer assignment | ❌ | ❌ |
| `in_review` | Under human review | ❌ | ❌ |
| `changes_requested` | Feedback provided · author revises | ✅ | ✅ |
| `approved` | Human approved · not yet publish-ready | ❌ | ❌ |
| `publish_ready` | Validated for publish pipeline | ❌ | ❌ |
| `published` | Handed to publish pipeline | ❌ | ❌ |
| `archived` | Retired content | ❌ | ❌ |

## 4.3 Draft Phase

Human or empty template. Autosave via DraftManager. Brand compliance on manual save.

## 4.4 AI Generation Phase

```typescript
// ContentGenerationService invokes workforce
const result = await workforce.invokeAgent(ctx, {
  taskType: 'content.draft',
  query: brief.topic,
  parameters: { contentType, brief, templateId },
  campaignId: brief.campaignId,
});
// Status: draft → ai_generating → draft
// New version created with source: agent.copywriter
```

## 4.5 Review Phase

Submitted content assigned to approvers per brand policy. Notifications via ORION (A-015 stub: event only).

## 4.6 Revision Phase

Author edits create new version. `changes_requested` → `draft` on first save. Diff available via ContentVersionService.

## 4.7 Approval Phase

Approver action transitions to `approved`. Emits `aurora.content.approved`. Learning signal +1.0 to ES-AURORA-007.

## 4.8 Localization Phase (Phase 2)

**File:** `lib/aurora/content/services/ContentLocalizationService.ts`

| Field | Phase 1 | Phase 2 |
|-------|:-------:|:-------:|
| Locale variants | Stub | Full · linked content IDs |
| Translation via AI | — | Copywriter agent per locale |
| Approval per locale | — | Required |

## 4.9 Scheduling Phase

Content marked `publish_ready` with optional `scheduledAt`. Scheduler (A-015) picks up — Content module stores intent only.

## 4.10 Publishing Ready

PublishPreparationService validates:
- Status = `approved`
- Brand compliance passed
- SEO metadata complete
- Required assets linked
- Alt text on images

## 4.11 Archive

Read-only retention. Contributes to Historical Memory (ES-AURORA-007 Tier 9). Search index updated.

## 4.12 Restoration

Archived → draft with new version. Requires re-approval before publish_ready.

---

# 5. AI Content Engine

## 5.1 ContentGenerationService

**File:** `lib/aurora/content/services/ContentGenerationService.ts`

```typescript
export interface ContentGenerationService {
  generateFromBrief(ctx: AuroraRuntimeContext, brief: ContentBrief): Promise<Content>;
  regenerate(ctx: AuroraRuntimeContext, contentId: string, instructions?: string): Promise<Content>;
  repurpose(ctx: AuroraRuntimeContext, contentId: string, targetType: ContentType): Promise<Content>;
  optimizeSeo(ctx: AuroraRuntimeContext, contentId: string): Promise<Content>;
  expand(ctx: AuroraRuntimeContext, contentId: string, section: string): Promise<Content>;
}
```

**CP-5:** All generation via AuroraWorkforceRuntime — never direct LLM.

## 5.2 Content Requests

```typescript
export interface ContentBrief {
  readonly topic: string;
  readonly contentType: ContentType;
  readonly audience?: string;
  readonly tone?: ToneProfile;
  readonly keywords?: readonly string[];
  readonly campaignId?: string;
  readonly templateId?: string;
  readonly constraints?: ContentConstraints;
  readonly referenceContentIds?: readonly string[];
}

export interface ContentConstraints {
  readonly maxWords?: number;
  readonly minWords?: number;
  readonly includeCta?: boolean;
  readonly prohibitedTerms?: readonly string[];
  readonly requiredTerms?: readonly string[];
}
```

## 5.3 Prompt Orchestration

```
ContentBrief
    ↓
TemplateLibrary.apply() (optional)
    ↓
ContentPromptLibrary.resolve(brief.contentType)
    ↓
AuroraWorkforceRuntime.execute({
  taskType: 'content.draft',
  query: assembledPrompt,
  parameters: { brief, brandVoice, seoKeywords }
})
    ↓
Knowledge pre-flight (automatic via WR-6)
    ↓
Copywriter agent execution
    ↓
Output validation pipeline
```

Multi-agent workflow WF-01 for complex content:
Strategist (topic) → SEO (keywords) → Copywriter (draft) → optional SEO optimize pass.

## 5.4 Brand Voice

**File:** `lib/aurora/content/quality/BrandVoiceScorer.ts`

| Dimension | Weight | Source |
|-----------|:------:|--------|
| Tone alignment | 30% | BrandConfig voice profile |
| Formality match | 20% | Brand Knowledge |
| Vocabulary compliance | 25% | BrandGuideline · prohibited terms |
| Personality traits | 15% | MessagingPillar |
| Historical preference | 10% | Brand Memory |

**CP-4:** Score < 80% → flag for review · block auto-approval.

## 5.5 Tone Management

```typescript
export interface ToneProfile {
  readonly tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
  readonly formality: 'low' | 'medium' | 'high';
  readonly emotion?: readonly string[];
  readonly channelOverride?: Readonly<Record<string, Partial<ToneProfile>>>;
}
```

Resolved: BrandConfig default → brief override → channel override.

## 5.6 Content Scoring

**File:** `lib/aurora/content/quality/ContentQualityScorer.ts`

| Dimension | Weight | Threshold |
|-----------|:------:|:---------:|
| Brand voice | 25% | ≥ 80% |
| Readability | 20% | Flesch ≥ 60 (configurable) |
| SEO score | 20% | ≥ 70% |
| Factual confidence | 20% | Citations present |
| Structure | 15% | Headings · CTA · length |

```typescript
export interface ContentQualityScore {
  readonly overall: number;
  readonly dimensions: Readonly<Record<string, number>>;
  readonly flags: readonly QualityFlag[];
  readonly recommendation: 'approve_candidate' | 'review_required' | 'regenerate';
}
```

## 5.7 Consistency Checking

**File:** `lib/aurora/content/quality/ConsistencyChecker.ts`

| Check | Description |
|-------|-------------|
| Terminology | Product names match Product Knowledge |
| Competitor mentions | Policy compliance |
| Claims | Fact validation against Knowledge Graph |
| Cross-content | No contradictory messaging vs. approved content |
| Legal | Restricted terms · industry pack rules |

## 5.8 Fact Validation

**File:** `lib/aurora/content/quality/FactValidator.ts`

Uses ES-AURORA-007 retrieval citations:

| Confidence | Action |
|------------|--------|
| High (≥0.85) | Proceed |
| Medium | Flag unsupported claims |
| Low | Block generation completion · escalate |
| Insufficient | No content output · knowledge gap report |

Agents never invent facts (KP-6 · WR-6).

## 5.9 Knowledge Retrieval

Every generation invokes workforce runtime which runs `KnowledgeRetrievalService.preflight()`:

| Domain | Used For |
|--------|----------|
| Brand | Voice · guidelines · messaging |
| Product | Features · pricing · audience |
| Content | ContentPattern · past performance |
| SEO | KeywordRecord · topic clusters |
| Campaign | Context · objectives |

## 5.10 Citation Support

Generated content includes `KnowledgeCitation[]` in metadata:

```typescript
export interface ContentGenerationMeta {
  readonly agentCodename: string;
  readonly promptVersion: string;
  readonly tokensUsed: number;
  readonly citations: readonly KnowledgeCitation[];
  readonly retrievalConfidence: RetrievalConfidence;
  readonly generatedAt: string;
}
```

Stored on ContentVersion record · displayed in editor UI (A-019).

## 5.11 Repurposing Pipeline

**File:** `lib/aurora/content/services/ContentRepurposingService.ts`

Transform approved content across formats (A-001 capability):

| Source Type | Target Types | Agent |
|-------------|--------------|-------|
| blog_post | social_caption · email_body · ad_copy | Copywriter |
| email_body | social_caption · ad_copy | Copywriter |
| landing_page | ad_copy · social_caption | Copywriter |
| product_description | ad_copy · social_caption | Copywriter |

Each repurposed item:
- New Content entity · links to source via `referenceContentIds`
- Inherits brand context · new SEO metadata
- Requires independent approval (CP-3)

## 5.12 Generation Rate Limits

| Tier | Generations/Hour/Brand | Burst |
|------|:----------------------:|:-----:|
| Starter | 20 | 5 |
| Professional | 100 | 20 |
| Enterprise | 500 | 50 |
| Agency | 1000 | 100 |

Exceeded → queue · 429 · audit log.

---

# 6. Brand Management

## 6.1 BrandContentService

**File:** `lib/aurora/content/brand/BrandContentService.ts`

Integrates ES-AURORA-006 BrandConfig with Content Studio enforcement.

```typescript
export interface BrandContentService {
  getBrandProfile(ctx: AuroraRuntimeContext): Promise<BrandContentProfile>;
  validateCompliance(ctx: AuroraRuntimeContext, body: ContentBody): Promise<BrandComplianceResult>;
  getStyleGuide(ctx: AuroraRuntimeContext): Promise<BrandStyleGuide>;
  getVisualIdentity(ctx: AuroraRuntimeContext): Promise<VisualIdentityBundle>;
}
```

## 6.2 Brand Profiles

Sourced from ES-AURORA-007 Brand Knowledge + ES-AURORA-006 BrandConfig:

| Field | Source |
|-------|--------|
| Voice profile | BrandConfig · BrandProfile entity |
| Messaging pillars | MessagingPillar entities |
| Value propositions | Brand Knowledge |
| Target audiences | ProductAudience · Brand Memory |
| Competitive positioning | Competitor Knowledge (Phase 2) |

## 6.3 Voice

```typescript
export interface BrandVoiceProfile {
  readonly tone: string;
  readonly formality: 'low' | 'medium' | 'high';
  readonly personality: readonly string[];
  readonly vocabulary: {
    readonly preferred: readonly string[];
    readonly prohibited: readonly string[];
  };
  readonly samplePhrases: readonly string[];
}
```

Enforced by BrandVoiceScorer on every save and generation.

## 6.4 Style Guide

| Element | Storage | Enforcement |
|---------|---------|-------------|
| Writing rules | BrandGuideline entity | ConsistencyChecker |
| Capitalization | BrandGuideline | Lint on save |
| Punctuation preferences | BrandConfig | Generation prompt |
| Inclusive language | BrandGuideline | Prohibited term scan |
| Industry terminology | Product Knowledge | Terminology check |

## 6.5 Visual Identity

| Element | Asset Library | Content Usage |
|---------|---------------|---------------|
| Logo usage rules | Brand Asset · BrandGuideline | Publish preparation |
| Color palette | Brand Asset | Creative reference |
| Typography | Brand Asset | Export formatting |
| Image style | VisualIdentity entity | AI generation brief (A-013) |

## 6.6 Logo

| Variant | Required | Format |
|---------|:--------:|--------|
| Primary | ✅ | SVG + PNG |
| Secondary | Optional | SVG + PNG |
| Favicon | Optional | ICO · PNG |
| Monochrome | Optional | SVG |

Minimum clear space · minimum size rules stored in BrandGuideline metadata.

## 6.7 Color Palette

```typescript
export interface ColorPalette {
  readonly primary: readonly ColorDefinition[];
  readonly secondary: readonly ColorDefinition[];
  readonly accent: readonly ColorDefinition[];
  readonly neutral: readonly ColorDefinition[];
  readonly semantic: Readonly<Record<'success' | 'warning' | 'error', ColorDefinition>>;
}
```

## 6.8 Typography

```typescript
export interface TypographyScale {
  readonly headingFont: FontDefinition;
  readonly bodyFont: FontDefinition;
  readonly scale: Readonly<Record<string, TypographySpec>>;
}
```

## 6.9 Legal Requirements

**File:** `lib/aurora/content/brand/LegalComplianceValidator.ts`

| Requirement | Check |
|-------------|-------|
| Copyright notices | Required on external content types |
| Trademark symbols | Product name first mention |
| Disclaimer blocks | Industry pack templates |
| AI disclosure | Configurable per tenant · channel |
| Regional restrictions | Locale-specific rules |

## 6.10 Compliance Rules

**File:** `lib/aurora/content/brand/BrandComplianceValidator.ts`

```typescript
export interface BrandComplianceResult {
  readonly passed: boolean;
  readonly score: number;
  readonly violations: readonly ComplianceViolation[];
  readonly warnings: readonly ComplianceWarning[];
}
```

| Violation Severity | Action |
|-------------------|--------|
| Error | Block save · block submit for approval |
| Warning | Allow save · flag on approval screen |
| Info | Log only |

Industry packs (healthcare · finance) extend validator via ConfigurationService.

---

# 7. SEO Integration

## 7.1 ContentSeoService

**File:** `lib/aurora/content/seo/ContentSeoService.ts`

**CP-9:** SEO optimization built into Content Studio.

```typescript
export interface ContentSeoService {
  score(ctx: AuroraRuntimeContext, contentId: string): Promise<ContentSeoScore>;
  generateMetadata(ctx: AuroraRuntimeContext, contentId: string): Promise<SeoMetadata>;
  suggestKeywords(ctx: AuroraRuntimeContext, contentId: string): Promise<readonly KeywordSuggestion[]>;
  suggestInternalLinks(ctx: AuroraRuntimeContext, contentId: string): Promise<readonly InternalLinkSuggestion[]>;
  analyzeReadability(ctx: AuroraRuntimeContext, body: ContentBody): Promise<ReadabilityScore>;
  suggestSchema(ctx: AuroraRuntimeContext, contentId: string): Promise<SchemaSuggestion>;
}
```

## 7.2 Keyword Optimization

| Action | Trigger | Agent |
|--------|---------|-------|
| Keyword injection suggestions | On save · on generate | SEO Specialist |
| Keyword density check | On score | ContentSeoService |
| LSI term suggestions | On brief | SEO Specialist via workforce |
| Target keyword from brief | ContentBrief.keywords | Stored on Content entity |

Integration with SEO Engine module (ES-AURORA-010) via shared `KeywordRecord` entities.

## 7.3 Metadata Generation

```typescript
export interface SeoMetadata {
  readonly title: string;               // 50–60 chars optimal
  readonly description: string;         // 150–160 chars optimal
  readonly slug: string;
  readonly canonicalUrl?: string;
  readonly ogTitle?: string;
  readonly ogDescription?: string;
  readonly ogImageAssetId?: string;
  readonly robots?: string;
  readonly hreflang?: readonly HreflangEntry[];
}
```

Generated on `approved` transition · editable before `publish_ready`.

## 7.4 Title Generation

Rules:
- Primary keyword in first 60 characters
- Brand name suffix configurable
- No truncation mid-word
- Unique per brand (slug collision check)

## 7.5 Description Generation

AI-assisted via SEO Specialist agent task `seo.optimize` when body changes.

## 7.6 Schema Suggestions

| Content Type | Schema Type |
|--------------|-------------|
| Blog post | Article · BlogPosting |
| Product description | Product |
| Landing page | WebPage · FAQPage (if FAQ) |
| Local content | LocalBusiness (Phase 2) |

Output: JSON-LD snippet stored in `Content.seoSchema` — not injected until publish.

## 7.7 Readability

| Metric | Target | Block Approval |
|--------|:------:|:--------------:|
| Flesch Reading Ease | ≥ 60 | If < 40 |
| Avg sentence length | ≤ 25 words | Warning > 30 |
| Paragraph length | ≤ 150 words | Warning |
| Heading structure | H1 once · logical hierarchy | Error if missing H1 (blog) |

## 7.8 Internal Linking

Suggests links to:
- Other approved content (same brand)
- Product Knowledge pages
- TopicCluster entities

Max 5 suggestions per content item · relevance score ≥ 0.75.

## 7.9 SEO Scoring

**File:** `lib/aurora/content/seo/ContentSeoScorer.ts`

Persisted as ES-AURORA-007 `ContentSeoScore` knowledge entity on publish.

| Dimension | Weight | Max Points |
|-----------|:------:|:----------:|
| Title optimization | 15 | 15 |
| Meta description | 10 | 10 |
| Keyword usage | 20 | 20 |
| Heading structure | 15 | 15 |
| Content length | 10 | 10 |
| Readability | 15 | 15 |
| Internal links | 10 | 10 |
| Image alt text | 5 | 5 |
| **Total** | **100** | **100** |

| Score | Rating |
|:-----:|--------|
| 90–100 | Excellent |
| 70–89 | Good |
| 50–69 | Needs improvement |
| < 50 | Poor · block publish_ready |

---

# 8. ORION Integration

## 8.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  AuroraFacade.content · AuroraFacade.assets                  │
├─────────────────────────────────────────────────────────────┤
│  ContentService · ContentGenerationService · AssetService    │
├─────────────────────────────────────────────────────────────┤
│  AuroraWorkforceRuntime · KnowledgeRetrievalService          │
│  ConfigurationService · AuroraAuthorizationService           │
├─────────────────────────────────────────────────────────────┤
│  PlatformStore · Object Storage · Event Bus · Audit          │
└─────────────────────────────────────────────────────────────┘
```

## 8.2 Knowledge Graph

| Action | Knowledge Impact |
|--------|-----------------|
| Content approved | ContentPattern provisional entity |
| Content published | Content Knowledge update · Learning signal |
| High engagement (Analytics) | ContentPattern promotion (A-012) |
| Brand voice correction | Brand Memory learning signal |
| SEO score on publish | ContentSeoScore entity |

## 8.3 Identity

| Integration | Usage |
|-------------|-------|
| `AuroraRuntimeContext` | All service methods |
| RBAC | `aurora.content.*` permissions |
| Author attribution | userId on ContentVersion |
| Agent attribution | agentCodename on AI versions |

## 8.4 PlatformStore

| Entity | Table | Pattern |
|--------|-------|---------|
| Content | `aurora_content` | ES-010 |
| ContentVersion | `aurora_content_version` | ES-010 |
| ContentBrief | `aurora_content_brief` | ES-010 |
| Asset | `aurora_asset` | ES-010 |
| AssetVersion | `aurora_asset_version` | ES-010 |
| ApprovalRecord | `aurora_content_approval` | ES-010 |

All include `tenant_id` · `brand_id` · RLS.

**Migration:** `migrations/aurora/009_content_assets.sql`

## 8.5 Campaign Runtime

| Integration | Direction |
|-------------|-----------|
| Campaign content link | Content.campaignId optional FK |
| Campaign asset link | `aurora_campaign_asset_link` |
| Campaign brief | ContentBrief from PlannerService (A-012) |
| Event `aurora.content.approved` | Campaign module may trigger scheduling |

## 8.6 AI Workforce

| Task Type | Agent | Service |
|-----------|-------|---------|
| `content.draft` | Copywriter | ContentGenerationService |
| `content.plan` | Strategist | ContentGenerationService |
| `content.topic` | Strategist | ContentGenerationService |
| `seo.optimize` | SEO Specialist | ContentSeoService |

**Rule:** ContentGenerationService never calls LLM directly (A-002 S-4).

## 8.7 Executive Provider

Approved content velocity contributes to `contentVelocity` in AuroraExecutiveSnapshot:

| Metric | Source |
|--------|--------|
| Content pieces/week | ContentService count by status |
| Pending approvals | ContentWorkspace |
| Brand compliance avg | BrandVoiceScorer aggregate |

## 8.8 Event Bus

### Events Published

| Event | Payload | Subscribers |
|-------|---------|-------------|
| `aurora.content.created` | contentId · type · brandId | Search · Analytics |
| `aurora.content.updated` | contentId · version | Search |
| `aurora.content.submitted` | contentId · approverIds | Notification |
| `aurora.content.approved` | contentId · approverId | Publish · Learning · Knowledge |
| `aurora.content.rejected` | contentId · reason | Notification · Learning |
| `aurora.content.publish_ready` | contentId · PublishReadyPayload hash | Publish pipeline |
| `aurora.content.published` | contentId · channel (from A-015) | Analytics · Knowledge |
| `aurora.content.archived` | contentId | Search |
| `aurora.asset.uploaded` | assetId · type | Search |
| `aurora.asset.archived` | assetId | — |

### Events Consumed

| Event | Action |
|-------|--------|
| `aurora.campaign.completed` | Archive campaign-linked draft content (optional) |
| `aurora.brand.guideline.updated` | Invalidate brand compliance cache |
| `aurora.knowledge.validated` (brand) | Refresh brand voice profile cache |

## 8.9 Analytics

| Direction | Data |
|-----------|------|
| Content → Analytics | contentId · type · publish date for attribution |
| Analytics → Content | Engagement metrics for ContentPattern learning (A-012) |

## 8.10 ContentModule Wiring

**File:** `lib/aurora/content/integration/AuroraContentWiring.ts`

```typescript
export function extendContentWiring(base: AuroraWiring): AuroraWiring {
  base.moduleRegistry.register(new ContentModuleRuntime());
  registerContentEventPublishers(base.eventBus);
  registerContentPersisters(base.platformStore);
  base.facade.extend({ content: createContentFacadeOperations(base) });
  return base;
}
```

## 8.11 Retention Policy

| Data Type | Starter | Professional | Enterprise |
|-----------|---------|-------------|------------|
| Draft content | 1 year | 2 years | Indefinite |
| Published content | Indefinite | Indefinite | Indefinite |
| Archived content | 1 year | 3 years | 7 years |
| Asset blobs (archived) | 90 days | 180 days | 365 days |
| Version history | Indefinite | Indefinite | Indefinite |
| Approval records | 1 year | 3 years | 7 years |

Configured via `ConfigurationService` — `content.retention.*` keys.

---

# 9. Testing Strategy

## 9.1 Test Structure

```
tests/aurora/
├── unit/content/
│   ├── ContentService.test.ts
│   ├── ContentVersionService.test.ts
│   ├── ContentGenerationService.test.ts
│   ├── DraftManager.test.ts
│   ├── BrandVoiceScorer.test.ts
│   ├── ContentSeoScorer.test.ts
│   └── ContentApprovalWorkflow.test.ts
├── unit/assets/
│   ├── AssetService.test.ts
│   ├── AssetTaggingService.test.ts
│   └── AssetCollectionService.test.ts
├── integration/content/
│   ├── contentLifecycle.test.ts
│   ├── approvalWorkflow.test.ts
│   ├── aiGenerationWorkforce.test.ts
│   ├── versionRollback.test.ts
│   └── publishPreparation.test.ts
├── integration/assets/
│   ├── assetUpload.test.ts
│   ├── assetVersionImmutability.test.ts
│   └── assetTenantIsolation.test.ts
├── integration/security/
│   ├── contentTenantIsolation.test.ts
│   └── contentRbac.test.ts
└── performance/
    ├── contentListLatency.test.ts
    └── assetUploadThroughput.test.ts
```

## 9.2 Content Lifecycle Tests

| Test | Assertion |
|------|-----------|
| `statusTransitions.test.ts` | Valid transitions only · invalid rejected |
| `aiNeverPublishes.test.ts` | AI generation cannot reach `published` |
| `approvalRequired.test.ts` | External content requires approval |
| `publishReadyValidation.test.ts` | SEO + brand checks before publish_ready |
| `archiveRestore.test.ts` | Restore creates new version · requires re-approval |

## 9.3 Versioning Tests

| Test | Assertion |
|------|-----------|
| `versionOnUpdate.test.ts` | Every update creates version |
| `versionImmutability.test.ts` | Historical versions unchanged |
| `rollbackCreatesVersion.test.ts` | Rollback is new version not delete |
| `aiVersionTagged.test.ts` | Agent source on AI versions |
| `diffAccuracy.test.ts` | Diff between versions correct |

## 9.4 Approval Workflow Tests

| Test | Assertion |
|------|-----------|
| `submitApproval.test.ts` | Status submitted · approvers notified |
| `approveTransition.test.ts` | approved · event emitted |
| `rejectReturnsDraft.test.ts` | rejected → changes_requested path |
| `permissionDenial.test.ts` | Non-approver cannot approve |
| `multiApproverPolicy.test.ts` | Tier policy enforced |

## 9.5 Asset Storage Tests

| Test | Assertion |
|------|-----------|
| `uploadValidation.test.ts` | Format · size limits enforced |
| `immutableBlob.test.ts` | Original blob retained on new version |
| `signedUrlExpiry.test.ts` | Download URLs expire |
| `metadataRequired.test.ts` | altText required for images |
| `tenantScopedStorage.test.ts` | Storage path includes tenantId |

## 9.6 Brand Compliance Tests

| Test | Assertion |
|------|-----------|
| `prohibitedTerms.test.ts` | Violation blocks save |
| `voiceScoreThreshold.test.ts` | < 80% flags review |
| `legalDisclaimer.test.ts` | Industry pack requires disclaimer |
| `aiDisclosure.test.ts` | Disclosure appended when configured |

## 9.7 SEO Validation Tests

| Test | Assertion |
|------|-----------|
| `seoScoreCalculation.test.ts` | Score matches dimension weights |
| `metadataLength.test.ts` | Title/description length warnings |
| `slugUniqueness.test.ts` | Duplicate slug rejected |
| `readabilityBlock.test.ts` | Flesch < 40 blocks publish_ready |
| `internalLinkSuggestions.test.ts` | Suggestions brand-scoped only |

## 9.8 Performance Tests

| Metric | Target |
|--------|:------:|
| Content list p95 | < 200ms |
| Content getById p95 | < 50ms |
| AI generation end-to-end p95 | < 30s |
| Asset upload (5MB) p95 | < 3s |
| SEO score calculation p95 | < 500ms |
| Version diff p95 | < 100ms |

## 9.9 Coverage Targets

| Layer | Minimum |
|-------|:-------:|
| `lib/aurora/content/services/` | 90% |
| `lib/aurora/content/quality/` | 85% |
| `lib/aurora/content/seo/` | 85% |
| `lib/aurora/assets/` | 85% |
| **A-011 scope overall** | **85%** |

## 9.10 Required Test Suites

| Suite | Minimum Tests |
|-------|:-------------:|
| Content service unit | 40+ |
| Version + lifecycle integration | 30+ |
| Approval workflow | 20+ |
| AI generation + workforce | 15+ |
| Brand compliance unit | 20+ |
| SEO unit | 25+ |
| Asset unit + integration | 25+ |
| Security/isolation | 15+ |
| **Total** | **190+** |

---

# 10. Engineering Standards

## 10.1 Folder Layout

```
lib/aurora/content/
├── ContentModuleRuntime.ts
├── index.ts
├── types/
│   ├── Content.ts
│   ├── ContentVersion.ts
│   ├── ContentBrief.ts
│   ├── ContentBody.ts
│   └── ContentTypes.ts
├── services/
│   ├── ContentService.ts
│   ├── ContentVersionService.ts
│   ├── ContentGenerationService.ts
│   ├── DraftManager.ts
│   └── PublishPreparationService.ts
├── workspace/
│   └── ContentWorkspace.ts
├── templates/
│   └── TemplateLibrary.ts
├── prompts/
│   └── ContentPromptLibrary.ts
├── workflows/
│   └── ContentApprovalWorkflow.ts
├── quality/
│   ├── BrandVoiceScorer.ts
│   ├── ContentQualityScorer.ts
│   ├── ConsistencyChecker.ts
│   └── FactValidator.ts
├── brand/
│   ├── BrandContentService.ts
│   ├── BrandComplianceValidator.ts
│   └── LegalComplianceValidator.ts
├── seo/
│   ├── ContentSeoService.ts
│   └── ContentSeoScorer.ts
├── repositories/
│   ├── ContentRepository.ts
│   └── postgres/
│       └── PostgresContentRepository.ts
├── persistence/
│   └── ContentEntityPersister.ts
├── integration/
│   └── AuroraContentWiring.ts
└── facade/
    └── ContentFacadeOperations.ts

lib/aurora/assets/
├── index.ts
├── types/
│   ├── Asset.ts
│   ├── AssetVersion.ts
│   └── AssetMetadata.ts
├── services/
│   ├── AssetService.ts
│   ├── BrandAssetService.ts
│   ├── AssetTaggingService.ts
│   └── AssetCollectionService.ts
├── storage/
│   ├── ObjectStorageAdapter.ts
│   └── S3ObjectStorageAdapter.ts
├── repositories/
│   ├── AssetRepository.ts
│   └── postgres/
│       └── PostgresAssetRepository.ts
└── persistence/
    └── AssetEntityPersister.ts
```

## 10.2 Service Contracts

### ContentFacadeOperations

```typescript
export interface ContentOperations {
  create(ctx: AuroraRuntimeContext, input: CreateContentInput): Promise<Content>;
  generate(ctx: AuroraRuntimeContext, brief: ContentBrief): Promise<Content>;
  update(ctx: AuroraRuntimeContext, id: string, input: UpdateContentInput): Promise<Content>;
  getById(ctx: AuroraRuntimeContext, id: string): Promise<Content | null>;
  list(ctx: AuroraRuntimeContext, filters: ContentFilters): Promise<PaginatedResult<Content>>;
  submitForApproval(ctx: AuroraRuntimeContext, id: string): Promise<Content>;
  approve(ctx: AuroraRuntimeContext, id: string): Promise<Content>;
  reject(ctx: AuroraRuntimeContext, id: string, reason: string): Promise<Content>;
  getVersions(ctx: AuroraRuntimeContext, id: string): Promise<readonly ContentVersion[]>;
  getWorkspace(ctx: AuroraRuntimeContext): Promise<ContentWorkspaceSnapshot>;
  preparePublish(ctx: AuroraRuntimeContext, id: string): Promise<PublishReadyPayload>;
}

export interface AssetOperations {
  upload(ctx: AuroraRuntimeContext, input: AssetUploadInput): Promise<Asset>;
  getById(ctx: AuroraRuntimeContext, assetId: string): Promise<Asset | null>;
  list(ctx: AuroraRuntimeContext, filter: AssetFilter): Promise<PaginatedResult<Asset>>;
  getDownloadUrl(ctx: AuroraRuntimeContext, assetId: string): Promise<SignedUrl>;
  addToCollection(ctx: AuroraRuntimeContext, collectionId: string, assetId: string): Promise<void>;
}
```

## 10.3 Repository Contracts

```typescript
export interface ContentRepository {
  save(tenantId: string, content: ContentRecord): Promise<void>;
  getById(tenantId: string, contentId: string): Promise<ContentRecord | null>;
  query(tenantId: string, filter: ContentFilter): Promise<PaginatedResult<ContentRecord>>;
  saveVersion(tenantId: string, version: ContentVersionRecord): Promise<void>;
  getVersions(tenantId: string, contentId: string): Promise<readonly ContentVersionRecord[]>;
  saveApproval(tenantId: string, record: ApprovalRecord): Promise<void>;
  softDelete(tenantId: string, contentId: string): Promise<void>;
}
```

| Rule | Description |
|------|-------------|
| **REP-C1** | tenant_id on every query |
| **REP-C2** | brand_id on content and brand-scoped assets |
| **REP-C3** | Published content update blocked at repository |
| **REP-C4** | Version writes in same transaction as content header update |

## 10.4 Canonical Content Entity

```typescript
export interface Content {
  readonly id: string;                    // cnt_{uuid}
  readonly tenantId: string;
  readonly brandId: string;
  readonly campaignId?: string;
  readonly contentType: ContentType;
  readonly status: ContentStatus;
  readonly title: string;
  readonly slug: string;
  readonly currentVersion: number;
  readonly source: 'human' | 'agent' | 'import';
  readonly agentCodename?: string;
  readonly seoMetadata?: SeoMetadata;
  readonly seoScore?: number;
  readonly qualityScore?: number;
  readonly scheduledAt?: string;
  readonly publishedAt?: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type ContentType =
  | 'blog_post'
  | 'social_caption'
  | 'email_body'
  | 'ad_copy'
  | 'landing_page'
  | 'product_description'
  | 'press_release'
  | 'whatsapp_message';

export type ContentStatus =
  | 'draft'
  | 'ai_generating'
  | 'submitted'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'publish_ready'
  | 'published'
  | 'archived';
```

## 10.5 Caching Strategy

| Cache | Backend | Key | TTL | Invalidation |
|-------|---------|-----|-----|-------------|
| Brand voice profile | Redis | `aurora:content:brand:{tenant}:{brand}:voice` | 600s | Brand config · knowledge change |
| Template list | Redis | `aurora:content:templates:{tenant}` | 3600s | Template CRUD |
| Content by ID | Redis | `aurora:content:entity:{tenant}:{id}` | 120s | Content write |
| SEO score | Redis | `aurora:content:seo:{tenant}:{id}` | 300s | Content body change |
| Signed URL | In-process | — | URL expiry | — |

## 10.6 Error Handling

**File:** `lib/aurora/content/errors/ContentErrors.ts`

| Code | Name | HTTP | When |
|------|------|:----:|------|
| `AURORA_CNT_001` | CONTENT_NOT_FOUND | 404 | Invalid content ID |
| `AURORA_CNT_002` | INVALID_STATUS_TRANSITION | 400 | Lifecycle violation |
| `AURORA_CNT_003` | PUBLISHED_READ_ONLY | 403 | Edit published content |
| `AURORA_CNT_004` | APPROVAL_DENIED | 403 | Missing approver permission |
| `AURORA_CNT_005` | BRAND_COMPLIANCE_FAILED | 422 | Compliance errors |
| `AURORA_CNT_006` | SEO_SCORE_TOO_LOW | 422 | Block publish_ready |
| `AURORA_CNT_007` | GENERATION_FAILED | 502 | Workforce task failed |
| `AURORA_CNT_008` | SLUG_COLLISION | 409 | Duplicate slug |
| `AURORA_ASSET_001` | ASSET_NOT_FOUND | 404 | Invalid asset ID |
| `AURORA_ASSET_002` | UPLOAD_TOO_LARGE | 413 | Exceeds tier limit |
| `AURORA_ASSET_003` | INVALID_FORMAT | 415 | Unsupported file type |
| `AURORA_ASSET_004` | ALT_TEXT_REQUIRED | 422 | Image missing alt text |

## 10.7 Review Checklist

Before merging A-011 content code:

- [ ] AuroraRuntimeContext on all service methods
- [ ] tenant_id · brand_id on all queries · RLS on tables
- [ ] Version created on every content update
- [ ] AI generation via workforce only · no direct LLM
- [ ] Knowledge pre-flight before generation (via workforce)
- [ ] Approval required before publish_ready
- [ ] Brand compliance on save and submit
- [ ] SEO score computed before publish_ready
- [ ] Asset blobs immutable · version on replace
- [ ] Events emitted on state transitions
- [ ] Audit log on mutations · approvals · generations
- [ ] Coverage meets 85% minimum

---

# 11. Acceptance Criteria

## 11.1 Definition of Done

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | ContentService CRUD + lifecycle | Integration test suite |
| 2 | 8 Phase 1 content types supported | Type registry test |
| 3 | Immutable versioning | Version tests |
| 4 | AI generation via Copywriter agent | Workforce integration test |
| 5 | Approval workflow with events | Workflow tests |
| 6 | PublishReadyPayload generation | Publish prep test |
| 7 | Asset upload · metadata · collections | Asset integration tests |
| 8 | Brand asset library | Brand kit upload test |
| 9 | Brand compliance scoring | Compliance unit tests |
| 10 | ContentSeoScore · metadata generation | SEO unit tests |
| 11 | Template library (8 built-in) | Template apply tests |
| 12 | ContentModuleRuntime registered | Boot integration test |
| 13 | Tenant isolation verified | Security suite (15+ tests) |
| 14 | 190+ tests passing | CI |
| 15 | Coverage ≥ 85% | CI gate |
| 16 | All CP-1–CP-10 principles verified | Certification checklist |

## 11.2 Operational Readiness

| Capability | Requirement |
|------------|-------------|
| Object storage | S3-compatible · tenant-scoped paths |
| CDN | Signed URLs for asset delivery |
| Content list performance | p95 < 200ms |
| Generation SLA | p95 < 30s including workforce |
| Backup | Daily PostgreSQL · object storage replication |
| Retention | Archived content per tier config |
| Rate limits | Generation requests per tenant tier |

## 11.3 Content Certification

| Certification | Criteria |
|---------------|----------|
| **CNT-C1** | No path from AI generation to `published` without approval |
| **CNT-C2** | 100% content items have tenant_id + brand_id |
| **CNT-C3** | 100% updates create version records |
| **CNT-C4** | Brand compliance run on every submit |
| **CNT-C5** | SEO score attached before publish_ready |
| **CNT-C6** | Asset blob immutability verified |
| **CNT-C7** | Zero cross-tenant content/asset access |

## 11.4 Required Tests

See §9.10 — **190+ tests minimum**.

## 11.5 Engineering Sign-Off

| Role | Criteria |
|------|----------|
| A-011 Mission Lead | All DoD met |
| Content Product Owner | A-001 Module 2 alignment |
| Brand Governance Owner | CP-3 · CP-4 verified |
| AI Architecture Owner | Workforce · knowledge integration |
| Security Lead | Isolation · RBAC verified |
| Architecture Review Board | CP-1–CP-10 enforced |

---

# 12. Executive Recommendation

## 12.1 Implementation Readiness

| Dimension | Status |
|-----------|:------:|
| A-001 Content Studio module definition | ✅ Ratified |
| A-002 Content domain architecture | ✅ Ratified |
| ES-AURORA-005 through ES-AURORA-008 | ✅ Ratified |
| ES-AURORA-009 (A-011) specification | ✅ This document |
| Workforce runtime for generation | ✅ ES-AURORA-008 |
| Knowledge retrieval for context | ✅ ES-AURORA-007 |
| Dependency on prior mission code | ⏳ A-007–A-010 implementation first |

**ES-AURORA-009 is complete. A-011 implementation authorized upon A-007–A-010 completion.**

## 12.2 Approval

| Authorization | Status |
|---------------|:------:|
| ES-AURORA-009 Content Studio & Asset Management spec | **✅ RATIFIED** |
| A-011 implementation | **✅ AUTHORIZED** (after A-007–A-010) |
| ES-AURORA-010 SEO Engine spec | **✅ AUTHORIZED TO DRAFT** |

## 12.3 Authorize ES-AURORA-010

| Field | Value |
|-------|-------|
| **Next Spec** | ES-AURORA-010 — SEO Engine Implementation |
| **Mission** | A-012 — SEO Engine Implementation |
| **Dependency** | A-007 · A-008 · A-009 · A-011 |
| **Scope** | KeywordService · SeoAuditService · RankTracking · GSC sync · ContentSeoScore integration |

SEO Engine consumes Content Studio outputs and shares `KeywordRecord` · `ContentSeoScore` entities with the knowledge graph defined in ES-AURORA-007.

---

### Mohammad Shafi Goroo

Founder & Chief Architect

ORION Enterprise Platform · Project Aurora

7 August 2026

---

# Appendices

## Appendix A — Content Taxonomy

| Content Type | Key | Channels | Min Words | Approval |
|--------------|-----|----------|:---------:|:--------:|
| Blog post | `blog_post` | Website · WordPress | 300 | Required |
| Social caption | `social_caption` | Instagram · Facebook · LinkedIn · Pinterest | 10 | Required |
| Email body | `email_body` | Email Marketing | 50 | Required |
| Ad copy | `ad_copy` | Google Ads · Meta Ads | 10 | Required |
| Landing page | `landing_page` | Website · Shopify | 200 | Required |
| Product description | `product_description` | E-commerce | 50 | Required |
| Press release | `press_release` | PR · Website | 200 | Phase 2 |
| WhatsApp message | `whatsapp_message` | WhatsApp | 10 | Phase 2 |

## Appendix B — Asset Taxonomy

| Asset Class | Subtypes | Storage | Max Size (Pro) |
|-------------|----------|---------|:--------------:|
| Image | photo · illustration · icon · logo | Blob | 25 MB |
| Video | mp4 · webm (Phase 2) | Blob / URL | 500 MB |
| Document | pdf · docx · pptx · md | Blob | 50 MB |
| Brand kit | logo · color · font | Blob | 10 MB |
| Audio | mp3 (Phase 3) | Blob | 50 MB |

## Appendix C — Brand Model

```
Brand (ES-AURORA-006)
    │
    ├── BrandConfig (voice · channels · approval overrides)
    │
    ├── Brand Knowledge (ES-AURORA-007)
    │   ├── BrandProfile
    │   ├── BrandGuideline
    │   ├── VisualIdentity
    │   └── MessagingPillar
    │
    ├── Brand Assets (ES-AURORA-009)
    │   ├── Logo variants
    │   ├── Color palette
    │   └── Typography
    │
    └── Brand Memory (ES-AURORA-007 Tier 5)
        └── Voice preferences · corrections
```

## Appendix D — Lifecycle Diagrams

### Content + Approval Flow

```
Author creates draft
    ↓
[Optional] AI generate (workforce · knowledge pre-flight)
    ↓
Author edits · autosave · brand lint
    ↓
Submit for approval → submitted → in_review
    ↓
    ├── Approve → approved → SEO finalize → publish_ready
    │                                              ↓
    │                                    Publish Pipeline (A-015)
    │                                              ↓
    │                                         published
    │
    └── Reject → changes_requested → draft (new version)
```

### Asset Version Flow

```
Upload v1 → active
    ↓
Replace file → v2 active (v1 blob retained)
    ↓
Update metadata only → same version · metadata record
    ↓
Archive → archived (soft · blob retained)
```

## Appendix E — SEO Rules

### Title Rules

| Rule | Requirement |
|------|-------------|
| SEO-T1 | 50–60 characters optimal |
| SEO-T2 | Primary keyword in first 40 characters |
| SEO-T3 | Unique per brand |
| SEO-T4 | No ALL CAPS |

### Meta Description Rules

| Rule | Requirement |
|------|-------------|
| SEO-D1 | 150–160 characters optimal |
| SEO-D2 | Include primary keyword naturally |
| SEO-D3 | Include CTA where appropriate |

### Content Structure Rules

| Content Type | H1 | Min Headings | CTA |
|--------------|:--:|:------------:|:---:|
| Blog post | 1 | 3 (H2+) | Recommended |
| Landing page | 1 | 2 | Required |
| Product description | 1 | 1 | Optional |
| Social caption | — | — | Recommended |

### Keyword Density

| Metric | Target | Warning |
|--------|:------:|:-------:|
| Primary keyword density | 1–2% | > 3% |
| Secondary keywords | 0.5–1% each | — |

### Channel-Specific SEO

| Channel | Additional Rules |
|---------|-----------------|
| Blog | Featured snippet optimization · FAQ schema |
| Social | Hashtag count · character limits |
| Email | Preheader text · subject line keywords |
| Ad copy | Headline count · description length per platform |
| Landing page | Above-fold keyword · CTA placement |

### ContentSeoScore Entity Mapping

On `publish_ready` transition, create/update ES-AURORA-007 entity:

| Content Field | Entity Attribute |
|---------------|------------------|
| contentId | `contentId` |
| seoScore | `overallScore` |
| dimension scores | `dimensionScores` |
| keywords | `targetKeywords` |
| publishedAt | `evaluatedAt` |

## Appendix F — Implementation Checklist

### Sprint 1 — Content Foundation

- [ ] Content entity · repository · migration · RLS
- [ ] ContentService CRUD · status machine
- [ ] ContentVersionService · immutable versions
- [ ] DraftManager · autosave
- [ ] ContentModuleRuntime · wiring
- [ ] Unit tests (40+)

### Sprint 2 — AI Generation

- [ ] ContentGenerationService · workforce integration
- [ ] ContentBrief · TemplateLibrary (8 templates)
- [ ] ContentPromptLibrary
- [ ] BrandVoiceScorer · FactValidator
- [ ] Generation integration tests

### Sprint 3 — Approval & Brand

- [ ] ContentApprovalWorkflow
- [ ] BrandContentService · BrandComplianceValidator
- [ ] LegalComplianceValidator
- [ ] Approval events · audit logging
- [ ] Workflow integration tests

### Sprint 4 — SEO & Publish Prep

- [ ] ContentSeoService · ContentSeoScorer
- [ ] SeoMetadata generation
- [ ] Readability · internal linking
- [ ] PublishPreparationService
- [ ] SEO unit tests (25+)

### Sprint 5 — Asset Management

- [ ] Asset entity · repository · object storage adapter
- [ ] AssetService · upload · versions · signed URLs
- [ ] AssetTaggingService · AssetCollectionService
- [ ] BrandAssetService · brand kit
- [ ] Campaign asset linking
- [ ] Asset integration tests

### Sprint 6 — Integration & Certification

- [ ] ContentFacadeOperations · AssetOperations on AuroraFacade
- [ ] Event subscribers · PlatformStore persisters
- [ ] ContentWorkspace API
- [ ] Tenant isolation suite
- [ ] Performance benchmarks
- [ ] Coverage ≥ 85% · mission completion report

---

## Document Approval

| Field | Value |
|-------|-------|
| **Document** | ES-AURORA-009 — Content Studio & Asset Management |
| **Version** | 1.0 |
| **Status** | Ratified |
| **Approved By** | Mohammad Shafi Goroo — Founder & Chief Architect |
| **Date** | 7 August 2026 |
| **Mission** | A-011 — Content Studio & Asset Management |
| **Next Mission** | A-012 — SEO Engine (ES-AURORA-010) |

---

*End of ES-AURORA-009*




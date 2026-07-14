# ORION Platform

# ORION Platform Architecture

---

## 1. Document Information

| Field | Value |
|-------|-------|
| **ID** | PA-001 |
| **Document** | ORION Platform Architecture |
| **Version** | 1.0 |
| **Status** | Approved (Frozen) |
| **Owner** | Mohammad Shafi Goroo — Founder & CEO |
| **Co-Owner** | ORION — Chief AI Architect & CTO |
| **Classification** | Internal |
| **Last Updated** | 14 July 2026 |
| **Scope** | Entire ORION Platform |

This document is the **master architecture reference** for the ORION Platform.

Engineering Specifications (ES) implement within this architecture. The Product Backlog defines the business capabilities this architecture must support.

---

## 2. Purpose

The ORION Platform Architecture defines how the ORION AI Business Operating System is structured, how its components interact, and how the platform scales from a single founder dashboard to a multi-module commercial SaaS platform.

This document answers:

- What are the platform layers?
- How are modules organized?
- What services are shared across the platform?
- How does data flow between ORION and external systems?
- What principles govern security, integration, and scalability?

All technical decisions must align with this document unless formally amended by the CTO.

---

## 3. ORION Philosophy

ORION architecture is governed by the [ORION Constitution](../09_Standards/ORION_Constitution.md).

| Principle | Architectural Implication |
|-----------|---------------------------|
| **Business First** | Every layer and module must solve a genuine business problem |
| **AI First** | Intelligence is embedded from the start—not bolted on later |
| **Simplicity** | Prefer the simplest architecture that delivers the outcome |
| **Exceptional UX** | Calm, elegant interfaces; Mission Control is the visual reference |
| **Automation** | Repeated tasks are candidates for platform-level automation |
| **Integration** | ORION connects existing systems; it does not replace them |
| **Reusability** | Components, services, and patterns are shared across modules |
| **Intelligence** | Dashboards explain what is happening and recommend what to do next |
| **Security** | Trust and privacy are designed in from the beginning |
| **Continuous Improvement** | Architecture evolves incrementally through approved sprints |

### The ORION Promise

Every architectural feature must satisfy at least one of:

- Save Time
- Increase Revenue
- Improve Customer Experience
- Reduce Manual Work
- Improve Decision Making

---

## 4. Platform Layers

ORION is organized as five vertical layers. Each layer builds on the one below it.

```
┌─────────────────────────────────────┐
│         Mission Control             │  ← Founder Dashboard
├─────────────────────────────────────┤
│         Business Modules            │  ← ORANIA, ATSAR, CRM, etc.
├─────────────────────────────────────┤
│         AI Intelligence             │  ← ORION Intelligence, Agents
├─────────────────────────────────────┤
│         Integration Layer           │  ← External system connectors
├─────────────────────────────────────┤
│         Infrastructure              │  ← Database, Auth, Hosting
└─────────────────────────────────────┘
```

### Layer 1 — Mission Control

The central command center. Real-time KPIs, briefings, tasks, and AI summaries in one workspace.

**Status:** Implemented (`/`)

### Layer 2 — Business Modules

Purpose-built applications for vertical and functional business operations.

**Status:** Planned (navigation defined; routes not yet implemented)

### Layer 3 — AI Intelligence

Conversational intelligence grounded in live business data. Explains, recommends, and automates.

**Status:** UI implemented (ES-007); backend AI services planned

### Layer 4 — Integration Layer

Standardized connectors to external business platforms.

**Status:** Planned

### Layer 5 — Infrastructure

Core runtime services: hosting, database, authentication, storage, and payments.

**Status:** Identity foundation implemented (ES-009, v0.3.0); Persistence foundation implemented (ES-010, v0.4.0); production database, storage, and payments planned

---

## 5. Primary Navigation

Navigation is defined in `lib/navigation.ts` and rendered by the platform shell (`Sidebar`).

### Primary Navigation

| Label | Route | Layer | Status |
|-------|-------|-------|--------|
| Mission Control | `/` | Mission Control | Implemented |
| Intelligence | `/intelligence` | AI Intelligence | Planned |
| Tasks | `/tasks` | Platform Core | Planned |
| Calendar | `/calendar` | Platform Core | Planned |
| Messages | `/messages` | Platform Core | Planned |

### Module Navigation

| Label | Route | Module | Codename | Status |
|-------|-------|--------|----------|--------|
| Hotels | `/hotels` | Hospitality | ORANIA | Planned |
| Commerce | `/commerce` | E-commerce | ATSAR | Planned |
| Marketing | `/marketing` | Marketing | — | Planned |
| CRM | `/crm` | CRM | — | Planned |
| Finance | `/finance` | Finance | — | Planned |
| Knowledge Vault | `/knowledge` | Knowledge | — | Planned |
| Integrations | `/integrations` | Integrations Hub | — | Planned |

### Utility Navigation

| Label | Route | Status |
|-------|-------|--------|
| Settings | `/settings` | Planned |

All routes are added under the `app/(platform)/` route group, wrapped by `DashboardLayout`. New modules do not require shell changes.

---

## 6. Module Architecture

Each business module follows a consistent internal architecture.

```
Module Route (app/(platform)/<module>/)
    ↓
Module Page (Server Component)
    ↓
Module Components (feature-specific)
    ↓
Shared UI (components/ui/)        ← ES-008 Design System
    ↓
Layout Shell (components/layout/)   ← ES-006 Component Architecture
    ↓
Module Services (lib/services/)     ← Planned
    ↓
Persistence Services (lib/persistence/services/)  ← ES-010 (v0.4.0)
    ↓
Repository Layer (lib/persistence/)               ← ES-010 (v0.4.0)
    ↓
Data Store (In-memory default; PostgreSQL target) ← ES-010 (v0.4.0)
```

### Module Rules

1. Every module uses the ORION Design System (`components/ui/`).
2. Every module is wrapped in `DashboardLayout` via the platform route group.
3. Module-specific components live under `components/<module>/` (as created).
4. Module business logic lives in `lib/services/<module>/` (as created).
5. Modules do not duplicate platform shell, navigation, or design tokens.
6. Modules communicate with external systems only through the Integration Layer.

### Current Component Architecture (ES-006 + ES-008)

| Directory | Responsibility | Specification |
|-----------|----------------|---------------|
| `components/ui/` | Design System primitives | ES-008 |
| `components/layout/` | Application shell | ES-006 |
| `components/dashboard/` | Mission Control widgets | ES-006, ES-007 |
| `components/common/` | Legacy shared primitives | ES-006 (migrating to `ui/`) |

---

## 7. Founder Dashboard

The Founder Dashboard is **Mission Control** — the primary interface for the business owner.

### Purpose

Answer *"How is the business doing right now?"* in seconds.

### Current Composition

| Widget | Component | Specification |
|--------|-----------|---------------|
| Page header | `SectionHeader` | ES-008 |
| Today's Briefing | `BriefingCard` | ES-006 |
| Hotels metrics | `Card` + `StatGrid` | ES-008 |
| Commerce metrics | `Card` + `StatGrid` | ES-008 |
| Marketing metrics | `Card` + `StatGrid` | ES-008 |
| ORION Intelligence | `OrionIntelligence` | ES-007 |
| Tasks | `TaskList` | ES-006, ES-008 |

### Founder Dashboard Principles

- **At-a-glance visibility** — KPIs from every connected business area
- **AI-assisted decisions** — summary, recommendations, and natural language queries
- **Action-oriented** — tasks and alerts surface what needs attention now
- **Consistent design** — all widgets use the ORION Design System

### Future Capabilities

- Live data from integrations (replacing static mock data)
- Role-specific dashboard views
- Configurable widget layout
- Daily Briefing automation

---

## 8. User Roles

ORION is designed as a multi-user platform with role-based access.

### Planned Roles

| Role | Access Scope |
|------|-------------|
| **Founder / Owner** | Full platform access; Founder Dashboard; all modules |
| **General Manager** | Mission Control; all operational modules; limited settings |
| **Department Manager** | Relevant module only (e.g. Hotels, Commerce, Marketing) |
| **Staff** | Assigned tasks, messages, and module-specific workflows |
| **Accountant** | Finance module; read-only access to revenue data |
| **AI Agent** | System role for automated actions and recommendations |

### Access Control Model

```
User
  ↓
Organization (Tenant)
  ↓
Role(s)
  ↓
Module Permissions
  ↓
Feature Permissions
```

Authentication, user management, and roles & permissions are defined in the [Product Backlog](../01_Product/ORION_Product_Backlog.md) under Platform Core.

**Status:** Foundation implemented (ES-009, v0.3.0) — identity types, roles, permissions, session flow, and route protection in `lib/auth/`; production authentication provider planned

---

## 9. Platform Services

Platform Services are core capabilities required by every module. They are owned by the platform—not by individual business modules.

| Service | Description | Status |
|---------|-------------|--------|
| **Authentication** | User login, session management, SSO | Foundation implemented (ES-009, v0.3.0); production SSO planned |
| **User Management** | User profiles, invitations, deactivation | Foundation types implemented (ES-009, v0.3.0); management APIs planned |
| **Roles & Permissions** | RBAC across modules and features | Foundation implemented (ES-009, v0.3.0) |
| **Notifications** | In-app, email, and push alerts | Planned |
| **Activity Log** | User and system event history | Planned |
| **Settings** | Organization and user preferences | Planned |
| **Audit Trail** | Compliance and security event logging | Foundation helpers implemented (ES-009, v0.3.0); persistence audit placeholders (ES-010, v0.4.0) |
| **Search** | Global platform search | Planned |

Platform Services are implemented as shared backend services accessible to all modules through a consistent API.

---

## 10. Shared Services

Shared Services are cross-cutting capabilities used by multiple modules but distinct from Platform Core.

| Service | Description | Status |
|---------|-------------|--------|
| **ORION Design System** | Tokens, UI components, visual language | Implemented (ES-008) |
| **Navigation Service** | Route configuration, active state, sidebar | Implemented (ES-006) |
| **ORION Intelligence** | AI summary, recommendations, NL queries | UI implemented (ES-007) |
| **Task Service** | Cross-module task creation and tracking | Planned |
| **Calendar Service** | Shared scheduling across modules | Planned |
| **Messaging Service** | Internal and external communication hub | Planned |
| **Document Service** | File storage and Knowledge Vault indexing | Planned |
| **Integration Service** | Connector management, sync, health monitoring | Planned |
| **Analytics Service** | Cross-module reporting and trend analysis | Planned |

### Design System (ES-008)

| Asset | Location |
|-------|----------|
| TypeScript tokens | `lib/design-tokens.ts` |
| CSS variables | `app/globals.css` |
| UI components | `components/ui/` |
| Guidelines | `docs/04_Design/ORION_Design_System.md` |
| Inventory | `docs/04_Design/Component_Inventory.md` |

All modules must consume the Design System. No module may introduce independent styling.

---

## 11. Data Ownership

### Principles

1. **ORION owns orchestration data** — tasks, settings, user preferences, AI context, audit logs.
2. **Source systems own domain data** — reservations belong to the PMS; orders belong to Shopify.
3. **ORION stores synchronized copies** — for unified visibility, not as the system of record.
4. **Tenants are isolated** — each organization's data is fully separated.
5. **AI context is tenant-scoped** — intelligence never crosses organizational boundaries.

### Data Categories

| Category | Owner | Storage |
|----------|-------|---------|
| User & auth data | ORION | In-memory (development); PostgreSQL (target) |
| Organization settings | ORION | In-memory (development); PostgreSQL (target) |
| Hotel reservations (synced) | Source PMS → ORION cache | PostgreSQL |
| Commerce orders (synced) | Source platform → ORION cache | PostgreSQL |
| Marketing campaigns (synced) | Source ad platform → ORION cache | PostgreSQL |
| Financial summaries (synced) | Source accounting → ORION cache | PostgreSQL |
| Documents & knowledge | ORION | Supabase Storage |
| AI conversation history | ORION | PostgreSQL |
| Integration credentials | ORION (encrypted) | PostgreSQL |

### Current State

Mission Control uses static mock data in `lib/dashboard-data.ts`. Identity foundation (ES-009, v0.3.0) and Persistence foundation (ES-010, v0.4.0) are implemented with in-memory adapters in `lib/auth/` and `lib/persistence/`. No production database or external data sources are connected.

### Target Data Flow

```
External System (source of record)
        ↓
Integration Layer (sync / webhook)
        ↓
PostgreSQL (ORION synchronized store)
        ↓
Application Services (business logic)
        ↓
Module UI / Mission Control / AI Intelligence
```

### Current Data Flow (Development)

```
Persistence Services (lib/persistence/services/)
        ↓
Repository Layer (lib/persistence/)
        ↓
In-memory adapters (default development store)
        ↓
Module UI / Mission Control / AI Intelligence
```

---

## 12. Integration Principles

ORION follows an **Integration Before Replacement** philosophy.

### Core Rules

1. **Connect, don't replace** — ORION enhances existing business software.
2. **Open by design** — integrations follow a repeatable connector pattern.
3. **Source system is authoritative** — ORION syncs; it does not overwrite source data.
4. **Health monitoring** — every connector reports sync status and errors.
5. **Incremental adoption** — businesses connect systems one at a time.

### Connector Pattern (Target)

```
Authenticate → Map Fields → Sync → Monitor → Alert
```

### Planned Integrations

| Platform | Category |
|----------|----------|
| Shopify, WooCommerce | Commerce |
| Stayflexi, STAAH, Djubo, Booking.com | Hotels |
| Google, Meta | Marketing |
| WhatsApp | Messaging |
| Stripe, Razorpay | Payments |
| OpenAI | AI |

### Integration Hub

The Integrations module (`/integrations`) will provide centralized connector management: setup, health, field mapping, and webhook configuration.

---

## 13. Security Principles

Per ORION Constitution Article 9 — Security.

| Principle | Implementation |
|-----------|----------------|
| **Security by design** | Security requirements defined before feature development |
| **Least privilege** | Users access only what their role requires |
| **Tenant isolation** | Organization data is fully separated at every layer |
| **Encrypted credentials** | Integration tokens and API keys are encrypted at rest |
| **No secrets in code** | All credentials via environment variables |
| **Authenticated APIs** | Every API route requires valid session or token |
| **Input validation** | All user and webhook input is validated |
| **Audit trail** | Security-relevant events are logged immutably |
| **Privacy by default** | Customer data is never exposed across tenants |

### Security Roadmap

| Capability | Priority | Status |
|------------|----------|--------|
| Authentication (Auth.js / Clerk) | High | Foundation implemented (ES-009, v0.3.0); production provider planned |
| RBAC | High | Foundation implemented (ES-009, v0.3.0) |
| API authentication | High | Planned |
| Audit trail | Medium | Foundation helpers implemented (ES-009, v0.3.0); persistence audit placeholders (ES-010, v0.4.0) |
| Data encryption at rest | Medium | Planned |
| Penetration testing | Low | Planned |

---

## 14. Scalability Principles

| Principle | Approach |
|-----------|----------|
| **Modular growth** | New modules plug into existing shell without restructuring |
| **Horizontal frontend scaling** | Stateless Next.js on Vercel serverless |
| **Database scaling** | PostgreSQL with connection pooling; read replicas as needed |
| **Integration scaling** | Async sync jobs; webhook-driven updates |
| **AI scaling** | Context window management; response caching for common queries |
| **Multi-tenant scaling** | Tenant ID on every query; row-level isolation |
| **Incremental delivery** | Each sprint adds capability without breaking existing features |

### Growth Phases

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Foundation, Mission Control, Design System | Complete |
| Phase 2 | Platform Core (auth, users, roles, persistence) | Foundation complete (v0.3.0 Identity, v0.4.0 Persistence) |
| Phase 3 | ORANIA (Hotels), ATSAR (Commerce) | Planned |
| Phase 4 | CRM, Marketing, Finance | Planned |
| Phase 5 | Full AI, automation, agents, voice | Planned |

Architecture must support each phase without requiring a rewrite of prior work.

---

## 15. Technology Stack

### Current (Implemented)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Design Tokens | `lib/design-tokens.ts` + CSS variables |
| Fonts | Geist Sans, Geist Mono |
| Identity Engine | `lib/auth/` (ES-009, v0.3.0) |
| Persistence Foundation | `lib/persistence/` (ES-010, v0.4.0) |
| Hosting | Vercel (target) |
| Version Control | GitHub |

### Planned

| Layer | Technology | Evaluation |
|-------|------------|------------|
| Database | PostgreSQL | Approved |
| Authentication Provider | Auth.js or Clerk | Under evaluation; foundation implemented (ES-009) |
| Object Storage | Supabase Storage | Approved |
| AI Provider | OpenAI | Approved |
| Payments | Stripe, Razorpay | Approved |
| Background Jobs | TBD | Future decision |
| Search | TBD | Future decision |
| Mobile | React Native or native | Future decision |

### Application Structure

```
app/                    # Next.js App Router
    (auth)/             # Authentication UI (ES-009)
    (platform)/         # Platform shell and Mission Control
components/
    ui/                 # Design System (ES-008)
    layout/             # Platform shell (ES-006)
    dashboard/          # Mission Control (ES-006, ES-007)
    auth/               # Session provider and auth guards (ES-009)
    common/             # Shared primitives
lib/
    auth/               # Identity engine (ES-009)
    persistence/        # Persistence foundation (ES-010)
    design-tokens.ts    # Token definitions
    navigation.ts       # Route configuration
    dashboard-data.ts   # Mock data (current)
    utils.ts            # Utilities
    constants.ts        # App constants
middleware.ts           # Route protection (ES-009)
docs/                   # Platform documentation
```

### Rendering Strategy

| Pattern | Usage |
|---------|-------|
| Server Components | Default — pages, static layouts, data fetching |
| Client Components | Interactive UI only — sidebar, AI input, forms |

---

## 16. Future Expansion

### Near-Term (Sprint 9–10)

| Capability | Source | Status |
|------------|--------|--------|
| Badge, Avatar, Modal, Dialog, Toast | ES-008 Future Sprints | Planned |
| Dropdown, Table, Pagination, Charts | ES-008 Future Sprints | Planned |
| Light theme / theme switching | Design System roadmap | Planned |
| Authentication & user management | ES-009 — Platform Core | Complete (v0.3.0) |
| Persistence foundation | ES-010 — Platform Core | Complete (v0.4.0) |

### Medium-Term

| Capability | Module |
|------------|--------|
| ORANIA — Reservations, housekeeping, guest messaging | Hotels |
| ATSAR — Products, inventory, orders | Commerce |
| Live AI — OpenAI, conversation history, memory | AI Intelligence |
| Integration Hub — connector setup and monitoring | Integrations |

### Long-Term

| Capability | Description |
|------------|-------------|
| Knowledge Vault | AI-indexed document repository |
| Workflow Automation | Cross-module automated workflows |
| AI Agents | Autonomous business agents |
| Mobile Applications | iOS and Android native apps |
| Public API | Third-party developer access |
| Integrations Marketplace | Community and partner connectors |
| Analytics Platform | Cross-business benchmarking |
| Enterprise Themes | White-label and brand customization |

All future expansion must trace back to the [Product Backlog](../01_Product/ORION_Product_Backlog.md) and be implemented through approved Engineering Specifications.

---

## 17. Related Documents

| Document | Location | Relationship |
|----------|----------|--------------|
| ORION Constitution | `docs/09_Standards/ORION_Constitution.md` | Governing principles |
| Engineering Standards | `docs/09_Standards/Engineering_Standards.md` | Development rules |
| ES Review Checklist | `docs/09_Standards/ES_Review_Checklist.md` | Sprint approval gate |
| ORION Master Plan | `docs/00_Strategy/ORION_Master_Plan.md` | Business vision and roadmap |
| Product Backlog | `docs/01_Product/ORION_Product_Backlog.md` | Business capabilities |
| Project Dashboard | `docs/00_Strategy/ORION_Project_Dashboard.md` | Sprint and milestone status |
| ES-006 Component Architecture | `docs/02_Engineering/ES-006-Component-Architecture.md` | Component layer foundation |
| ES-007 ORION Intelligence | `docs/02_Engineering/ES-007-ORION-Intelligence.md` | AI Intelligence UI |
| ES-008 Design System Foundation | `docs/02_Engineering/ES-008-Design-System.md` | Design System implementation |
| ES-009 Identity & Authentication | `docs/02_Engineering/ES-009-Identity-Authentication-Foundation.md` | Identity platform foundation (v0.3.0) |
| ES-010 Persistence Foundation | `docs/02_Engineering/ES-010-Persistence-Foundation.md` | Persistence architecture (v0.4.0) |
| ORION Design System | `docs/04_Design/ORION_Design_System.md` | Visual language and tokens |
| Component Inventory | `docs/04_Design/Component_Inventory.md` | UI component catalog |
| API Documentation | `docs/03_Architecture/Api.md` | API endpoints (as built) |

---

# Governance

This document is the master architecture reference for the ORION Platform.

- Engineering Specifications implement **within** this architecture.
- Changes to platform layers, technology stack, or data ownership require **CTO approval**.
- Deviations must be recorded as Architecture Decision Records in `docs/03_Architecture/`.
- This document is updated after major milestones and sprints.

---

# Architecture Approval

Status

Approved (Frozen)

Approved By

Mohammad Shafi Goroo

Founder & CEO

Chief AI Architect

ORION Platform

Approval Date

11 July 2026

Architecture Status

Frozen

Implementation Status

Foundation Implemented (v0.3.0 Identity, v0.4.0 Persistence)

Notes

This document is the master architecture reference for the ORION Platform.

All future Engineering Specifications, Product Backlog items, and implementation work must comply with this architecture.

Changes to this architecture require:

- Architecture Review
- Founder Approval
- Version Update

No architectural modifications may be made directly to this document once frozen.

Future architectural enhancements must be introduced through version-controlled revisions.

---

Approved

Mohammad Shafi Goroo

Founder & CEO

ORION Platform

Chief AI Architect & CTO

ORION

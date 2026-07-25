# EC-001 Sprint 6 — Morning Executive Brief Implementation

**Sprint:** 6  
**Capability:** EC-001 Morning Executive Brief  
**Status:** Production vertical slice (mock-backed)

---

## Overview

Sprint 6 delivers the first production-ready vertical slice of the Morning Executive Brief at `/brief`. Data flows through a repository-backed service layer with realistic mock content. UI components live in `components/executive/` and consume EC-000 shared types from `types/executive/`.

---

## Route

| Path | Surface |
|------|---------|
| `/brief` | EC-001 Morning Executive Brief (primary) |
| `/advisor` | Legacy advisor workspace (unchanged) |

Navigation **Executive Brief** now points to `/brief`.

---

## Architecture

```
app/(platform)/brief/page.tsx
  └── getMorningExecutiveBrief()
        └── BriefService
              └── BriefRepository (interface)
                    ├── MockBriefRepository      ← Sprint 6 default
                    └── OrchestratorBriefRepository ← future live path
```

### Service swap (future)

```typescript
import { createBriefService, OrchestratorBriefRepository } from "@/lib/executive/brief";

export const briefService = createBriefService(new OrchestratorBriefRepository());
```

The mapper `mapDashboardSnapshotToBriefView()` converts orchestrator output to `BriefView` without UI changes.

---

## Components

| Component | Purpose |
|-----------|---------|
| `BriefPageContent` | Composed EC-001 page |
| `ExecutiveGreeting` | Greeting + orientation headline |
| `BusinessHealthCard` | EC-002 health snapshot |
| `CriticalAlertsSection` | Must-see alerts |
| `OvernightChangesStrip` | Material overnight deltas |
| `ExecutiveRecommendationCard` | EC-003 recommendations |
| `TodaysPrioritiesSection` | Ranked priorities (max 5) |
| `AiExecutiveSummaryCard` | AI synthesis + confidence |
| `BriefEndSummary` | End-of-brief closure |
| `ConfidenceIndicator` | Shared confidence display |
| `EvidenceList` | Traceable evidence |
| `ExecutiveActionBar` | Act / Delegate / Snooze / Explain |
| `ExplainabilityDrawer` | Expandable explanation |
| `BriefSkeleton` | Loading state |
| `BriefStatusBanner` | Lifecycle states |

---

## States

| State | Implementation |
|-------|----------------|
| Loading | `app/(platform)/brief/loading.tsx` → `BriefSkeleton` |
| Error | `app/(platform)/brief/error.tsx` → retry boundary |
| Empty | `EmptyState` in alerts / priorities sections |
| Lifecycle | `BriefStatusBanner` for updated/stale/incomplete/offline |

---

## Tests

- `tests/executive/brief/BriefService.test.ts` — service, mapper, repository contract
- `tests/components/executive/MorningBrief.test.tsx` — key UI components

Run: `npm run test`

---

## Accessibility

- Semantic headings and `aria-label` on major sections
- `role="status"` on loading and lifecycle banners
- Confidence announced via `aria-label`
- Keyboard-accessible action buttons

---

## Future Integration Points

1. **OrchestratorBriefRepository** — wire when EC-000 snapshot composer is frozen
2. **GET `/api/v1/executive/brief`** — external/mobile consumers
3. **Persistence** — brief viewed state, delta banner (`changesSinceLastView`)
4. **EC-002 explainability** — connect "Why this score?" to health explain API
5. **EC-003 actions** — server actions for act/delegate/snooze
6. **EC-005 copilot** — inline "Ask ORION" from brief sections
7. **Navigation ADR** — default landing migration from `/advisor` to `/brief`

---

## Definition of Done

- [x] Route `/brief`
- [x] Responsive layout
- [x] Design system tokens only
- [x] Dark mode compatible (existing token system)
- [x] Mock repository + swappable interface
- [x] Unit tests
- [x] Documentation
- [ ] Storybook (not configured in repo)

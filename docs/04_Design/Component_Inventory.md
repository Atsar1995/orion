# ORION Design System — Component Inventory

Version 1.0 · Sprint 8 (ES-008)

This document catalogs the reusable UI components in `components/ui/`.

---

## Button

**Purpose:** Primary actions and icon-only controls across the platform.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "icon"` | `"primary"` | Visual style |
| `className` | `string` | — | Additional CSS classes |
| `children` | `ReactNode` | required | Button content |
| `...props` | `ButtonHTMLAttributes` | — | Native button attributes |

**Example Usage:**

```tsx
import { Button } from "@/components/ui/Button";

<Button>Save Changes</Button>

<Button variant="icon" aria-label="Notifications">
  <BellIcon />
</Button>
```

**Dependencies:** `@/lib/utils` (`cn`)

**Future Enhancements:** Secondary and ghost variants, loading state, size tokens (Sprint 9)

---

## Card

**Purpose:** Container for dashboard sections and module content with optional header action.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Card heading |
| `children` | `ReactNode` | required | Card body |
| `variant` | `"default" \| "premium"` | `"default"` | Visual emphasis |
| `action` | `ReactNode` | — | Header slot (e.g. badge) |
| `className` | `string` | — | Additional CSS classes |

**Example Usage:**

```tsx
import { Card } from "@/components/ui/Card";

<Card title="Hotels">
  <StatGrid stats={hotelsMetrics} />
</Card>

<Card title="ORION Intelligence" variant="premium">
  {/* AI content */}
</Card>
```

**Dependencies:** `@/lib/utils` (`cn`)

**Future Enhancements:** Footer slot, collapsible variant, size presets

---

## Input

**Purpose:** Text input field with accessible labeling and consistent focus states.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Accessible label (visually hidden) |
| `className` | `string` | — | Wrapper CSS classes |
| `...props` | `InputHTMLAttributes` | — | Native input attributes |

**Example Usage:**

```tsx
import { Input } from "@/components/ui/Input";

<Input
  label="Ask ORION"
  placeholder="Ask ORION anything..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
```

**Dependencies:** `@/lib/utils` (`cn`)

**Future Enhancements:** Error state, helper text, textarea variant

---

## SectionHeader

**Purpose:** Page-level title and subtitle for module sections.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Main heading |
| `subtitle` | `string` | — | Supporting description |
| `as` | `"header" \| "div"` | `"header"` | Semantic HTML element |
| `className` | `string` | — | Additional CSS classes |

**Example Usage:**

```tsx
import { SectionHeader } from "@/components/ui/SectionHeader";

<SectionHeader
  title="Mission Control"
  subtitle="Your business at a glance."
/>
```

**Dependencies:** `@/lib/utils` (`cn`)

**Future Enhancements:** Action slot, breadcrumb integration

---

## StatCard

**Purpose:** Single KPI metric tile for dashboards.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Metric name |
| `value` | `string` | required | Metric value |

**StatGrid Props:**

| Prop | Type | Description |
|------|------|-------------|
| `stats` | `Stat[]` | Array of label/value pairs |

**Example Usage:**

```tsx
import { StatCard, StatGrid } from "@/components/ui/StatCard";

<StatGrid stats={[{ label: "Occupancy", value: "78%" }]} />
```

**Dependencies:** None

**Future Enhancements:** Trend indicators, sparklines, color-coded status (Sprint 9 Charts)

---

## Divider

**Purpose:** Visual separator between content sections.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Divider direction |
| `className` | `string` | — | Additional CSS classes |

**Example Usage:**

```tsx
import { Divider } from "@/components/ui/Divider";

<Divider />
<Divider orientation="vertical" className="mx-4" />
```

**Dependencies:** `@/lib/utils` (`cn`)

**Future Enhancements:** Labelled divider with text

---

## LoadingState

**Purpose:** Indicates async content is loading.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `"Loading..."` | Status message |
| `className` | `string` | — | Additional CSS classes |

**Example Usage:**

```tsx
import { LoadingState } from "@/components/ui/LoadingState";

<LoadingState label="Fetching metrics..." />
```

**Dependencies:** `@/lib/utils` (`cn`)

**Future Enhancements:** Skeleton loaders, inline spinner size variants

---

## EmptyState

**Purpose:** Placeholder when no data is available.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | required | Empty state message |
| `title` | `string` | — | Optional heading |
| `icon` | `ReactNode` | — | Optional icon |
| `action` | `ReactNode` | — | Optional CTA |
| `className` | `string` | — | Additional CSS classes |

**Example Usage:**

```tsx
import { EmptyState } from "@/components/ui/EmptyState";

<EmptyState
  title="No tasks"
  description="You're all caught up."
/>
```

**Dependencies:** `@/lib/utils` (`cn`)

**Future Enhancements:** Illustration presets, module-specific variants

---

## SearchBox

**Purpose:** Search input with icon for global and module search.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `"Search ORION..."` | Input placeholder |
| `value` | `string` | — | Controlled value |
| `onChange` | `(value: string) => void` | — | Value change handler |
| `onValueChange` | `(event) => void` | — | Native change handler |
| `className` | `string` | — | Wrapper CSS classes |
| `id` | `string` | — | Input id |
| `name` | `string` | — | Input name |

**Example Usage:**

```tsx
import { SearchBox } from "@/components/ui/SearchBox";

<SearchBox className="min-w-[280px]" />
```

**Dependencies:** `@/components/common/icons`, `@/lib/utils`

**Future Enhancements:** Keyboard shortcuts, search suggestions dropdown (Sprint 9)

---

## Design Tokens

**Location:** `lib/design-tokens.ts` · `app/globals.css`

Centralized tokens for colors, typography, spacing, border radius, shadows, animation duration, and z-index. CSS variables in `globals.css` mirror TypeScript definitions for use in Tailwind and custom styles.

---

## Backward Compatibility

Legacy imports remain supported via thin re-exports:

- `components/common/Button.tsx` → `components/ui/Button`
- `components/common/SearchBar.tsx` → `components/ui/SearchBox`

These will be deprecated in Sprint 9 when Badge, Avatar, and additional components migrate to `components/ui/`.

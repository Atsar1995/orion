# ADR-003 — Global Command Palette

## Status

Accepted

## Date

2026-07-23

## Architecture Reference

[PA-001](../../03_Architecture/ORION_Platform_Architecture.md) · [ADR-001](./ADR-001-Executive-Shell.md)

---

## Context

As ORION grows across workspaces and sub-routes, executives need fast navigation without relying on sidebar depth or memorized URLs.

Traditional navigation alone does not scale to dozens of executive and workspace destinations.

---

## Decision

ORION implements a **Global Command Palette** with Universal Search, accessible via `Ctrl+K` / `⌘+K` from any Executive Shell surface.

The Command Palette provides:

- Categorized search across platform routes and workspace sections
- Recent and Favorites sections
- Lazy-loaded client component to preserve shell performance
- Workspace nav registry integration (`lib/search/`)

Every Business Workspace shall register Command Palette entries for its primary routes (ADR-005).

---

## Consequences

### Positive

- Respects executive time — fastest path to any destination
- Scales navigation without sidebar proliferation
- Consistent pattern across all workspaces

### Negative

- Requires maintenance of search index as routes grow
- Client-side index must stay synchronized with workspace nav registries

---

## Related Documents

| Document | Link |
|----------|------|
| ADR-001 Executive Shell | [ADR-001-Executive-Shell.md](./ADR-001-Executive-Shell.md) |
| ADR-005 Business Workspace Architecture | [ADR-005-Business-Workspace-Architecture.md](./ADR-005-Business-Workspace-Architecture.md) |
| Business Workspace Pattern | [BUSINESS_WORKSPACE_PATTERN.md](../../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md) |

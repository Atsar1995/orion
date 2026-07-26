# ADR-001 — Executive Shell

## Status

Accepted

## Date

2026-07-22

## Architecture Reference

[PA-001](../03_Architecture/ORION_Platform_Architecture.md) · [ORION Architecture Handbook](../03_Architecture/ORION_Architecture_Handbook.md)

---

## Context

ORION requires a unified application shell that provides consistent navigation, layout, authentication boundaries, and workspace routing across all executive and business surfaces.

Without a shared shell, each workspace would duplicate navigation, layout, and platform integration concerns.

---

## Decision

ORION adopts a single **Executive Shell** implemented as the platform layout under `app/(platform)/`.

The Executive Shell provides:

- Shared sidebar navigation (`lib/navigation.ts`)
- Consistent page layout and design system integration
- Authentication and session boundaries via middleware
- Workspace route hosting (Finance, CRM, Hospitality, Command Center, Brief, and future workspaces)
- Integration points for Command Palette and Universal Search

Business Workspaces integrate into the Executive Shell. They do not implement independent application chrome.

---

## Consequences

### Positive

- Consistent executive experience across all workspaces
- Single navigation and layout maintenance point
- Enforces separation between platform chrome and workspace content (ADR-005)

### Negative

- All workspaces must conform to shell layout constraints
- Shell changes require regression across workspaces

---

## Related Documents

| Document | Link |
|----------|------|
| ADR-003 Global Command Palette | [ADR-003-Global-Command-Palette.md](./ADR-003-Global-Command-Palette.md) |
| ADR-005 Business Workspace Architecture | [ADR-005-Business-Workspace-Architecture.md](./ADR-005-Business-Workspace-Architecture.md) |
| Business Workspace Pattern | [BUSINESS_WORKSPACE_PATTERN.md](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md) |

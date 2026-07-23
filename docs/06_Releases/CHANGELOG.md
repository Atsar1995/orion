# ORION Changelog

This document records the notable changes made to the ORION Platform.

During pre-release development, ORION follows milestone-based semantic versioning.

The format is based on "Keep a Changelog" principles.

---

## v1.1.0 – Executive Experience

**Release Status:** Released  
**Release Date:** 23 July 2026  
**Git Tag:** v1.1.0

### Summary

ORION v1.1.0 delivers the Executive Experience — a unified app shell, Executive Brief as the default landing surface, and a global Command Palette with Universal Search across the platform.

### Added

- Executive Experience Foundation
- Executive Brief (Advisor)
- Command Palette & Universal Search
- Global keyboard shortcut (Ctrl+K / ⌘+K)
- Universal Search with categorized results
- Recent and Favorites sections
- Search ranking engine
- Lazy-loaded Command Palette
- Accessibility improvements
- Responsive search experience

### Changed

- Advisor is now the default landing page.
- Root (`/`) redirects to Advisor.
- Mission Control moved to `/mission-control`.

### Engineering

- Mission 14A completed
- Mission 14B completed
- Mission 14C completed

| Check | Status |
|-------|--------|
| Build | PASS |
| Lint | PASS |

---

## v0.7 – Foundation Complete

**Release Status:** Released  
**Release Date:** 22 July 2026  
**Git Tag:** v0.7

### Summary

ORION v0.7 completes the foundational platform — executive workspaces, shared design system, platform polish, and a stable architecture for future development.

### Highlights

- Executive Command Center implemented
- Intelligence Workspace implemented
- Configuration Workspace completed
- Shared Design System
- Platform Polish
- Stable architecture
- Clean Git workflow

### Status

**Stable Internal Release**

This release marks the completion of ORION's foundational platform and establishes the architecture, design system, engineering workflow, and executive user experience for future development.

---

## v0.4.0 – Persistence Foundation

**Release Status:** Released

### Summary

ORION now includes a complete persistence architecture supporting repository contracts, in-memory repository implementations, persistence services, dependency injection, and adapter-based persistence configuration.

### Highlights

- Completed ES-010 Persistence Foundation
- Added repository contracts
- Added strongly typed persistence result model
- Added tenant-aware persistence architecture
- Added in-memory repositories
- Added persistence services
- Added transaction placeholders
- Added audit placeholders
- Added persistence factory
- Added dependency injection container
- Prepared future PostgreSQL adapter architecture

### Engineering

| Check | Status |
|-------|--------|
| Build | PASS |
| Lint | PASS |
| Git | Completed |
| Architecture | Stable |

---

## v0.3.0 – Identity Platform Foundation
### Added

- Authentication UI
- Identity Engine
- Session Provider
- Route Protection
- Permission Hooks

### Changed

- Application wrapped in SessionProvider
- Middleware added

### Fixed

- N/A

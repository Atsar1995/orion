# ORION Changelog

This document records the notable changes made to the ORION Platform.

During pre-release development, ORION follows milestone-based semantic versioning.

The format is based on "Keep a Changelog" principles.

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

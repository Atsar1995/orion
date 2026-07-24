# ORION Engineering Standard

**Status:** Frozen  
**Version:** 1.3  
**Owner:** ORION CTO  
**Effective Date:** 23 July 2026  
**Last Approved:** 23 July 2026  

---

This document is an official ORION Engineering Standard.

It defines the standard structure for documenting ORION software releases.

### Change Policy

- Minor editorial improvements (grammar, formatting, or clarifications) may be made without changing the version.
- Structural changes require review and approval by the ORION CTO.
- Approved structural changes must result in a new version number and an updated approval date.

---

## Subject

Release Record Template

---

# Release Record Template

## Release Information

- **Version:**
- **Release Name:**
- **Release Date:**
- **Git Tag:**
- **Commit Hash:**

### Engineering Verification

Every gate must pass in order per [Engineering Standards — Verification Hierarchy](./Engineering_Standards.md#verification-hierarchy). **CTO Approval** is issued only after all gates pass.

| Check | Result | Notes |
|-------|--------|-------|
| Build | PASS / FAIL | |
| Lint | PASS / FAIL | |
| Type Safety | PASS / FAIL | |
| Accessibility | PASS / FAIL | |
| Responsive | PASS / FAIL | |
| Regression | PASS / FAIL | |
| Manual Verification | PASS / FAIL | |
| Release Documentation | PASS / FAIL | |
| Architecture Review | PASS / FAIL / N/A | Required when structural or architectural changes are included |

---

## Executive Summary

Provide a concise overview of the release and its significance.

---

## Highlights

Summarize the major features, improvements, and achievements.

---

## Engineering Specifications Included

List all Engineering Specifications completed in this release.

---

## Repository Status

Document the repository state at the time of release.

---

## Known Limitations

List any known issues, deferred work, or planned improvements that are **not** tracked as technical debt.

---

## Technical Debt

Record debt **introduced or resolved** in this release. If none, write **None**. Every open item must also be recorded in the [Technical Debt Register](./Technical_Debt_Register.md).

**None**

—or, for each item:

| Field | Value |
|-------|-------|
| **ID** | TD-XXX |
| **Description** | |
| **Priority** | P0 / P1 / P2 / P3 |
| **Target Release** | |
| **Owner** | |

---

## Next Milestone

Describe the planned focus for the next release.

---

## CTO Approval

Issued only after every Engineering Verification gate passes. A rejected release must document the reason and required remediation in **Comments**.

| Field | Value |
|-------|-------|
| **Decision** | APPROVED / REJECTED |
| **Reviewer** | |
| **Date** | |
| **Comments** | |

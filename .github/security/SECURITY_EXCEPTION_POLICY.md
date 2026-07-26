# ORION Security Exception Policy

**Version:** 1.0  
**Status:** Active  
**Owner:** ORION CTO  
**Applies to:** Quality Gate G7 · production dependency audit

---

Security exceptions are permitted **only** when **all** of the following are true:

- The vulnerability is **transitive**.
- The dependency is owned by an **upstream framework**.
- **No stable patch** exists.
- The advisory is **documented** in [npm-audit-allowlist.json](./npm-audit-allowlist.json).
- A **review date** is assigned (`reviewBy`).
- **Critical** vulnerabilities are **never** exempt.
- Exceptions require approval from the **ORION CTO** (or designated maintainer), recorded as `owner` on each entry.

---

## Allowlist entry format

```json
{
  "advisory": "GHSA-qx2v-qp2m-jg93",
  "package": "postcss",
  "introducedBy": "next@16.2.11",
  "reason": "Bundled by Next.js",
  "reviewBy": "2026-10-26",
  "owner": "ORION CTO"
}
```

---

## Enforcement

- CI: `npm run audit:production` ([`scripts/audit-production.mjs`](../../scripts/audit-production.mjs))
- Policy reference: [`docs/08_Standards/QUALITY_GATE.md`](../../docs/08_Standards/QUALITY_GATE.md) §Dependency audit policy

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 26 July 2026 | ORION CTO | Initial security exception policy |

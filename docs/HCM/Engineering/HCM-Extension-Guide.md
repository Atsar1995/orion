# Enterprise HCM Extension Guide

**Document ID:** HCM-EXT-001  
**Parent:** [ES-HCM-001](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)

---

## Purpose

Guidance for extending Enterprise HCM with organization-specific metadata, reference data, and configuration — without violating domain boundaries.

---

## Metadata Extension

Employee and org records support optional metadata fields:

```typescript
// EmployeeProfile.metadata
profile: {
  metadata: { costCenter: "CC-100", badgeColor: "blue" },
}
```

**Rules:**

- Metadata is opaque to core business rules unless explicitly validated
- Do not store security-sensitive data in metadata
- Prefer typed fields for cross-organization reporting needs

---

## Reference Data

Organization-specific reference data (leave types, pay grades, competency frameworks) is seeded per organization:

| Data | Seed Location |
|------|---------------|
| Time calendars, shifts | `seed-hcm-time.ts` |
| Payroll calendars | `seed-hcm-payroll.ts` |
| Talent courses, frameworks | `seed-hcm-talent.ts` |
| Onboarding document requirements | `seedDefaultDocumentRequirements(store, orgId)` |

To extend for a new organization:

1. Add seed function targeting the organization ID
2. Call from `createHcmWiring()` bootstrap or organization provisioning hook (future)
3. Do not hardcode org IDs in services — use `context.organizationId`

---

## Organization Extension Pattern

```typescript
// Provisioning a new tenant (conceptual)
const context: ServiceContext = {
  organizationId: "org-new-tenant",
  workspaceId: "ws-new-tenant",
  userId: "system",
  role: "executive",
};

const rootUnit = hcmFacade.createOrgUnit(
  { unitType: "company", code: "ROOT", name: "New Tenant", effectiveFrom: "2026-01-01" },
  context,
);
```

Each organization receives isolated data via repository scoping.

---

## Adding a New Capability

Follow the layering contract:

1. Define types in `types/hcm-<module>.ts`
2. Create repository interface + in-memory implementation
3. Implement service with rules engine
4. Wire in `createHcmWiring.ts`
5. Expose on `HcmFacade` (property or flat method)
6. Add REST route(s) delegating to facade
7. Publish IIL events for lifecycle transitions
8. Add tests and update catalogues

See [HCM Dependency Matrix](./HCM-Dependency-Matrix.md) for import rules.

---

## Custom Workflow Templates

Add entries to `HCM_WORKFLOW_TEMPLATES` in `constants.ts` and map in `HCM_WORKFLOW_TRIGGERS` in `HcmWorkflowOrchestrator.ts`.

Ensure corresponding event type is in the appropriate outbound catalogue.

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|-------------------|
| Import repository from API route | Use `hcmFacade` |
| Cross-domain import (HCM → Finance) | Publish IIL event; Finance subscribes |
| Global mutable store outside `InMemoryHcmStore` | Extend store or repository |
| Skip rules engine for status transitions | Always use `*RulesEngine.assert*Transition` |
| Duplicate facade methods | Extend `HcmFoundationOperations` once |

---

*See [HCM Developer Guide](./HCM-Developer-Guide.md) for code examples.*

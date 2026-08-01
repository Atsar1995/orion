import type {
  IndexedEntityRecord,
  SearchIndexRecord,
  SearchableEntityRegistration,
  SearchableEntityType,
} from "@/types/search";

const NOW = "2026-07-01T00:00:00.000Z";
const ORG = "org-orania";

function registration(
  id: string,
  domainKey: string,
  entityType: SearchableEntityType,
  label: string,
  fields: string[],
): SearchableEntityRegistration {
  return {
    id,
    organizationId: ORG,
    domainKey,
    entityType,
    label,
    searchableFields: fields,
    facetFields: ["status", "category"],
    filterFields: ["ownerId", "status", "category", "tags"],
    active: true,
    registeredAt: NOW,
  };
}

function index(
  id: string,
  domainKey: string,
  entityType: SearchableEntityType,
  count: number,
): SearchIndexRecord {
  return {
    id,
    organizationId: ORG,
    domainKey,
    entityType,
    indexVersion: 1,
    status: "active",
    documentCount: count,
    lastIndexedAt: NOW,
    lastValidatedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

/** Seed search registrations, indexes, and sample entities (Mission P-010.5). */
export function seedSearchPlatform(organizationId: string): {
  registrations: SearchableEntityRegistration[];
  indexes: SearchIndexRecord[];
  entities: IndexedEntityRecord[];
} {
  const registrations = [
    registration("reg-doc", "platform", "document", "Documents", ["title", "content", "tags"]),
    registration("reg-user", "platform", "user", "Users", ["title", "content"]),
    registration("reg-invoice", "finance", "invoice", "Invoices", ["title", "content", "metadata"]),
    registration("reg-workflow", "platform", "workflow_instance", "Workflow Instances", ["title", "content", "status"]),
    registration("reg-guest", "hospitality", "guest", "Guests", ["title", "content"]),
  ].map((r) => ({ ...r, organizationId }));

  const indexes = [
    index("idx-doc", "platform", "document", 2),
    index("idx-user", "platform", "user", 1),
    index("idx-invoice", "finance", "invoice", 1),
    index("idx-workflow", "platform", "workflow_instance", 1),
    index("idx-guest", "hospitality", "guest", 1),
  ].map((i) => ({ ...i, organizationId }));

  const entities: IndexedEntityRecord[] = [
    {
      id: "ent-doc-1",
      organizationId,
      indexId: "idx-doc",
      domainKey: "platform",
      entityType: "document",
      entityId: "doc-contract-001",
      title: "Vendor Contract Q3 2026",
      content: "Master services agreement with Acme Supplies for procurement.",
      ownerId: "user-executive",
      status: "active",
      category: "contract",
      tags: ["contract", "vendor", "procurement"],
      metadata: { securityClassification: "confidential" },
      indexedAt: NOW,
      indexVersion: 1,
      deleted: false,
    },
    {
      id: "ent-doc-2",
      organizationId,
      indexId: "idx-doc",
      domainKey: "platform",
      entityType: "document",
      entityId: "doc-invoice-001",
      title: "Invoice INV-2026-0042",
      content: "Invoice for office supplies and maintenance services.",
      ownerId: "user-manager",
      status: "active",
      category: "invoice",
      tags: ["invoice", "finance"],
      metadata: { amount: "12500" },
      indexedAt: NOW,
      indexVersion: 1,
      deleted: false,
    },
    {
      id: "ent-user-1",
      organizationId,
      indexId: "idx-user",
      domainKey: "platform",
      entityType: "user",
      entityId: "user-executive",
      title: "Executive User",
      content: "Chief Executive Officer organization administrator",
      ownerId: "user-executive",
      status: "active",
      category: "employee",
      tags: ["executive", "leadership"],
      metadata: { role: "executive" },
      indexedAt: NOW,
      indexVersion: 1,
      deleted: false,
    },
    {
      id: "ent-invoice-1",
      organizationId,
      indexId: "idx-invoice",
      domainKey: "finance",
      entityType: "invoice",
      entityId: "inv-2026-0042",
      title: "Invoice INV-2026-0042",
      content: "Accounts payable invoice for vendor services",
      ownerId: "user-manager",
      status: "posted",
      category: "invoice",
      tags: ["finance", "payable"],
      metadata: { amount: "12500", currency: "ZAR" },
      indexedAt: NOW,
      indexVersion: 1,
      deleted: false,
    },
    {
      id: "ent-workflow-1",
      organizationId,
      indexId: "idx-workflow",
      domainKey: "platform",
      entityType: "workflow_instance",
      entityId: "wf-inst-001",
      title: "Finance Threshold Approval",
      content: "Pending approval for procurement request above threshold",
      ownerId: "user-manager",
      status: "pending_approval",
      category: "approval",
      tags: ["workflow", "approval"],
      metadata: { definitionId: "wf-def-finance-threshold" },
      indexedAt: NOW,
      indexVersion: 1,
      deleted: false,
    },
    {
      id: "ent-guest-1",
      organizationId,
      indexId: "idx-guest",
      domainKey: "hospitality",
      entityType: "guest",
      entityId: "guest-vip-001",
      title: "VIP Guest Arrival",
      content: "Premium suite reservation for corporate guest",
      ownerId: "user-manager",
      status: "confirmed",
      category: "guest",
      tags: ["vip", "reservation"],
      metadata: { room: "305" },
      indexedAt: NOW,
      indexVersion: 1,
      deleted: false,
    },
  ];

  return { registrations, indexes, entities };
}

export const SEED_ORG_ID = ORG;

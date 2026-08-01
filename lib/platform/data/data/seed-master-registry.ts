import type {
  CanonicalEntityRegistration,
  CanonicalEntityType,
  MasterEntityRecord,
} from "@/types/enterprise-data";

const NOW = "2026-07-01T00:00:00.000Z";

function typeReg(
  entityType: CanonicalEntityType,
  domainKey: string,
  label: string,
  owningService: string,
): CanonicalEntityRegistration {
  return {
    id: `reg-${entityType}`,
    entityType,
    domainKey,
    label,
    owningService,
    active: true,
    registeredAt: NOW,
  };
}

/** Seed canonical entity type registrations (Mission P-011.1). */
export function seedCanonicalEntityTypes(): CanonicalEntityRegistration[] {
  return [
    typeReg("organization", "platform", "Organization", "organization-platform"),
    typeReg("business_unit", "platform", "Business Unit", "organization-platform"),
    typeReg("branch", "platform", "Branch", "organization-platform"),
    typeReg("department", "platform", "Department", "organization-platform"),
    typeReg("team", "platform", "Team", "organization-platform"),
    typeReg("user", "platform", "User", "organization-platform"),
    typeReg("employee", "platform", "Employee", "organization-platform"),
    typeReg("customer", "commercial", "Customer", "crm-workspace"),
    typeReg("guest", "hospitality", "Guest", "hospitality-workspace"),
    typeReg("vendor", "commercial", "Vendor", "crm-workspace"),
    typeReg("supplier", "commercial", "Supplier", "crm-workspace"),
    typeReg("product", "commercial", "Product", "crm-workspace"),
    typeReg("service", "commercial", "Service", "crm-workspace"),
    typeReg("inventory_item", "commercial", "Inventory Item", "crm-workspace"),
    typeReg("asset", "finance", "Asset", "finance-workspace"),
    typeReg("financial_account", "finance", "Financial Account", "finance-workspace"),
    typeReg("currency", "finance", "Currency", "finance-workspace"),
    typeReg("tax_code", "finance", "Tax Code", "finance-workspace"),
    typeReg("location", "platform", "Location", "organization-platform"),
    typeReg("address", "platform", "Address", "organization-platform"),
    typeReg("document", "platform", "Document", "document-platform"),
    typeReg("workflow_definition", "platform", "Workflow Definition", "workflow-platform"),
    typeReg("notification_template", "platform", "Notification Template", "notification-platform"),
  ];
}

/** Seed sample master entities for org-orania. */
export function seedMasterEntities(organizationId: string): MasterEntityRecord[] {
  const entities: Array<Omit<MasterEntityRecord, "id" | "globalId">> = [
    {
      organizationId,
      entityType: "organization",
      businessKey: "orania",
      displayName: "Orania Enterprise",
      domainKey: "platform",
      status: "active",
      version: 1,
      createdAt: NOW,
      updatedAt: NOW,
      createdBy: "system",
      updatedBy: "system",
    },
    {
      organizationId,
      entityType: "department",
      businessKey: "dept-finance",
      displayName: "Finance Department",
      domainKey: "platform",
      status: "active",
      version: 1,
      ownerId: "user-executive",
      createdAt: NOW,
      updatedAt: NOW,
      createdBy: "system",
      updatedBy: "system",
    },
    {
      organizationId,
      entityType: "customer",
      businessKey: "cust-acme-001",
      displayName: "Acme Corporation",
      domainKey: "commercial",
      status: "active",
      version: 1,
      metadata: { segment: "enterprise" },
      createdAt: NOW,
      updatedAt: NOW,
      createdBy: "system",
      updatedBy: "system",
    },
    {
      organizationId,
      entityType: "vendor",
      businessKey: "vnd-supplies-001",
      displayName: "Office Supplies Co",
      domainKey: "commercial",
      status: "active",
      version: 1,
      createdAt: NOW,
      updatedAt: NOW,
      createdBy: "system",
      updatedBy: "system",
    },
    {
      organizationId,
      entityType: "financial_account",
      businessKey: "acct-1000",
      displayName: "Cash on Hand",
      domainKey: "finance",
      status: "active",
      version: 1,
      metadata: { accountType: "asset" },
      createdAt: NOW,
      updatedAt: NOW,
      createdBy: "system",
      updatedBy: "system",
    },
    {
      organizationId,
      entityType: "guest",
      businessKey: "guest-vip-001",
      displayName: "VIP Guest",
      domainKey: "hospitality",
      status: "active",
      version: 1,
      createdAt: NOW,
      updatedAt: NOW,
      createdBy: "system",
      updatedBy: "system",
    },
  ];

  return entities.map((entity, index) => ({
    ...entity,
    id: `md-000${index + 1}`,
    globalId: `gid-${organizationId}-${entity.entityType}-${entity.businessKey}`,
  }));
}

export const SEED_ORG_ID = "org-orania";

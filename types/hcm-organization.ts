/**
 * HCM Organization Structure types (Mission P-012.1).
 */

import type { DateRange } from "@/types/hcm-common";

export type OrgUnitType =
  | "organization"
  | "business_unit"
  | "division"
  | "department"
  | "team";

export type OrgUnitStatus = "active" | "inactive";

export type OrgUnitRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly unitType: OrgUnitType;
  readonly code: string;
  readonly name: string;
  readonly parentId?: string;
  readonly costCentreRef?: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly status: OrgUnitStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PositionStatus = "active" | "inactive";

export type PositionRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly orgUnitId: string;
  readonly code: string;
  readonly title: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly status: PositionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ReportingRelationshipType = "direct" | "dotted";

export type ReportingRelationshipRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly subordinatePositionId: string;
  readonly supervisorPositionId: string;
  readonly relationshipType: ReportingRelationshipType;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type OrganizationHierarchyNode = {
  readonly id: string;
  readonly unitType: OrgUnitType;
  readonly code: string;
  readonly name: string;
  readonly parentId?: string;
  readonly children: readonly OrganizationHierarchyNode[];
};

export type CreateOrgUnitInput = {
  readonly unitType: OrgUnitType;
  readonly code: string;
  readonly name: string;
  readonly parentId?: string;
  readonly costCentreRef?: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
};

export type CreatePositionInput = {
  readonly orgUnitId: string;
  readonly code: string;
  readonly title: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
};

export type CreateReportingRelationshipInput = {
  readonly subordinatePositionId: string;
  readonly supervisorPositionId: string;
  readonly relationshipType?: ReportingRelationshipType;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
};

export type OrgUnitInquiryQuery = {
  readonly unitType?: OrgUnitType;
  readonly parentId?: string;
  readonly status?: OrgUnitStatus;
  readonly asOfDate?: string;
};

export type PositionInquiryQuery = {
  readonly orgUnitId?: string;
  readonly status?: PositionStatus;
};

export type HierarchyValidationResult = {
  readonly valid: boolean;
  readonly cycles: readonly string[];
};

export type PublishHcmOrganizationEventInput = {
  readonly eventType:
    | "OrganizationCreated"
    | "OrganizationUpdated"
    | "DepartmentCreated"
    | "OrgUnitDeactivated"
    | "PositionCreated"
    | "PositionUpdated"
    | "HierarchyChanged"
    | "ReportingRelationshipChanged";
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

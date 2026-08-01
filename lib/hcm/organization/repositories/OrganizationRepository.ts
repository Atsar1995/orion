import type {
  CreateOrgUnitInput,
  CreatePositionInput,
  CreateReportingRelationshipInput,
  OrgUnitInquiryQuery,
  OrgUnitRecord,
  PositionInquiryQuery,
  PositionRecord,
  ReportingRelationshipRecord,
} from "@/types/hcm-organization";

/** Organization structure repository contract (P-012.1). */
export type OrganizationRepository = {
  readonly domain: "hcm";

  createOrgUnit(unit: OrgUnitRecord): OrgUnitRecord;
  updateOrgUnit(unit: OrgUnitRecord): OrgUnitRecord;
  findOrgUnit(organizationId: string, unitId: string): OrgUnitRecord | null;
  findOrgUnitByCode(organizationId: string, code: string): OrgUnitRecord | null;
  listOrgUnits(organizationId: string, query?: OrgUnitInquiryQuery): readonly OrgUnitRecord[];
};

/** Position repository contract (P-012.1). */
export type PositionRepository = {
  readonly domain: "hcm";

  createPosition(position: PositionRecord): PositionRecord;
  updatePosition(position: PositionRecord): PositionRecord;
  findPosition(organizationId: string, positionId: string): PositionRecord | null;
  findPositionByCode(organizationId: string, code: string): PositionRecord | null;
  listPositions(organizationId: string, query?: PositionInquiryQuery): readonly PositionRecord[];
};

/** Hierarchy and reporting repository contract (P-012.1). */
export type HierarchyRepository = {
  readonly domain: "hcm";

  createReportingRelationship(record: ReportingRelationshipRecord): ReportingRelationshipRecord;
  listReportingRelationships(organizationId: string, instanceId?: string): readonly ReportingRelationshipRecord[];
  listChildren(organizationId: string, parentId: string): readonly OrgUnitRecord[];
};

export type CreateOrgUnitPayload = CreateOrgUnitInput;
export type CreatePositionPayload = CreatePositionInput;
export type CreateReportingPayload = CreateReportingRelationshipInput;

import type { ServiceContext } from "@/types/services";
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
import {
  createOrgUnitId,
  createPositionId,
  createReportingRelationshipId,
} from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { OrganizationRulesEngine } from "@/lib/hcm/organization/OrganizationRulesEngine";
import type {
  HierarchyRepository,
  OrganizationRepository,
  PositionRepository,
} from "@/lib/hcm/organization/repositories/OrganizationRepository";

export class OrganizationService {
  private readonly rules = new OrganizationRulesEngine();

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly positionRepository: PositionRepository,
    private readonly hierarchyRepository: HierarchyRepository,
  ) {}

  createOrgUnit(input: CreateOrgUnitInput, context: ServiceContext): OrgUnitRecord {
    const organizationId = context.organizationId;
    this.rules.assertValidDateRange(input.effectiveFrom, input.effectiveTo);
    this.rules.assertNoDuplicateCode(
      this.organizationRepository.findOrgUnitByCode(organizationId, input.code),
    );

    if (input.parentId) {
      this.rules.assertActiveUnit(
        this.organizationRepository.findOrgUnit(organizationId, input.parentId),
      );
    }

    const now = nowIso();
    const unit: OrgUnitRecord = {
      id: createOrgUnitId(),
      organizationId,
      unitType: input.unitType,
      code: input.code,
      name: input.name,
      parentId: input.parentId,
      costCentreRef: input.costCentreRef,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    return this.organizationRepository.createOrgUnit(unit);
  }

  updateOrgUnit(
    unitId: string,
    input: Partial<CreateOrgUnitInput>,
    context: ServiceContext,
  ): OrgUnitRecord {
    const organizationId = context.organizationId;
    const existing = this.organizationRepository.findOrgUnit(organizationId, unitId);
    if (!existing) throw new Error("ORG_UNIT_NOT_FOUND");

    if (input.parentId !== undefined) {
      this.rules.assertNotSelfParent(unitId, input.parentId);
      if (input.parentId) {
        this.rules.assertActiveUnit(
          this.organizationRepository.findOrgUnit(organizationId, input.parentId),
        );
      }
    }

    const updated: OrgUnitRecord = {
      ...existing,
      name: input.name ?? existing.name,
      parentId: input.parentId ?? existing.parentId,
      costCentreRef: input.costCentreRef ?? existing.costCentreRef,
      effectiveTo: input.effectiveTo ?? existing.effectiveTo,
      updatedAt: nowIso(),
    };

    return this.organizationRepository.updateOrgUnit(updated);
  }

  deactivateOrgUnit(unitId: string, context: ServiceContext): OrgUnitRecord {
    const organizationId = context.organizationId;
    const existing = this.organizationRepository.findOrgUnit(organizationId, unitId);
    if (!existing) throw new Error("ORG_UNIT_NOT_FOUND");
    if (existing.status === "inactive") throw new Error("ORG_UNIT_ALREADY_INACTIVE");

    const children = this.hierarchyRepository.listChildren(organizationId, unitId);
    const activeChild = children.find((c) => c.status === "active");
    if (activeChild) throw new Error("ACTIVE_CHILDREN_EXIST");

    const updated: OrgUnitRecord = {
      ...existing,
      status: "inactive",
      updatedAt: nowIso(),
    };

    return this.organizationRepository.updateOrgUnit(updated);
  }

  createPosition(input: CreatePositionInput, context: ServiceContext): PositionRecord {
    const organizationId = context.organizationId;
    this.rules.assertValidDateRange(input.effectiveFrom, input.effectiveTo);
    this.rules.assertActiveUnit(
      this.organizationRepository.findOrgUnit(organizationId, input.orgUnitId),
    );
    this.rules.assertNoDuplicateCode(
      this.positionRepository.findPositionByCode(organizationId, input.code),
    );

    const now = nowIso();
    const position: PositionRecord = {
      id: createPositionId(),
      organizationId,
      orgUnitId: input.orgUnitId,
      code: input.code,
      title: input.title,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    return this.positionRepository.createPosition(position);
  }

  updatePosition(
    positionId: string,
    input: Partial<CreatePositionInput>,
    context: ServiceContext,
  ): PositionRecord {
    const organizationId = context.organizationId;
    const existing = this.positionRepository.findPosition(organizationId, positionId);
    if (!existing) throw new Error("POSITION_NOT_FOUND");

    if (input.orgUnitId) {
      this.rules.assertActiveUnit(
        this.organizationRepository.findOrgUnit(organizationId, input.orgUnitId),
      );
    }

    const updated: PositionRecord = {
      ...existing,
      orgUnitId: input.orgUnitId ?? existing.orgUnitId,
      title: input.title ?? existing.title,
      effectiveTo: input.effectiveTo ?? existing.effectiveTo,
      updatedAt: nowIso(),
    };

    return this.positionRepository.updatePosition(updated);
  }

  createReportingRelationship(
    input: CreateReportingRelationshipInput,
    context: ServiceContext,
  ): ReportingRelationshipRecord {
    const organizationId = context.organizationId;
    this.rules.assertValidDateRange(input.effectiveFrom, input.effectiveTo);

    const subordinate = this.positionRepository.findPosition(
      organizationId,
      input.subordinatePositionId,
    );
    const supervisor = this.positionRepository.findPosition(
      organizationId,
      input.supervisorPositionId,
    );
    if (!subordinate || !supervisor) throw new Error("POSITION_NOT_FOUND");
    if (input.subordinatePositionId === input.supervisorPositionId) {
      throw new Error("CIRCULAR_REPORTING");
    }

    const now = nowIso();
    const record: ReportingRelationshipRecord = {
      id: createReportingRelationshipId(),
      organizationId,
      subordinatePositionId: input.subordinatePositionId,
      supervisorPositionId: input.supervisorPositionId,
      relationshipType: input.relationshipType ?? "direct",
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      createdAt: now,
      updatedAt: now,
    };

    const existing = this.hierarchyRepository.listReportingRelationships(organizationId);
    this.rules.assertNoCircularReporting(existing, record);

    return this.hierarchyRepository.createReportingRelationship(record);
  }

  listOrgUnits(query: OrgUnitInquiryQuery | undefined, context: ServiceContext): readonly OrgUnitRecord[] {
    return this.organizationRepository.listOrgUnits(context.organizationId, query);
  }

  listPositions(
    query: PositionInquiryQuery | undefined,
    context: ServiceContext,
  ): readonly PositionRecord[] {
    return this.positionRepository.listPositions(context.organizationId, query);
  }

  listReportingRelationships(context: ServiceContext): readonly ReportingRelationshipRecord[] {
    return this.hierarchyRepository.listReportingRelationships(context.organizationId);
  }
}

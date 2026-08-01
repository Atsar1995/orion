import type {
  OrgUnitInquiryQuery,
  OrgUnitRecord,
  PositionInquiryQuery,
  PositionRecord,
  ReportingRelationshipRecord,
} from "@/types/hcm-organization";
import type {
  HierarchyRepository,
  OrganizationRepository,
  PositionRepository,
} from "@/lib/hcm/organization/repositories/OrganizationRepository";
import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";

function inEffectiveRange(record: { effectiveFrom: string; effectiveTo?: string }, asOfDate?: string): boolean {
  if (!asOfDate) return true;
  if (asOfDate < record.effectiveFrom) return false;
  if (record.effectiveTo && asOfDate > record.effectiveTo) return false;
  return true;
}

function matchesOrgUnitQuery(unit: OrgUnitRecord, query?: OrgUnitInquiryQuery): boolean {
  if (!query) return true;
  if (query.unitType && unit.unitType !== query.unitType) return false;
  if (query.parentId && unit.parentId !== query.parentId) return false;
  if (query.status && unit.status !== query.status) return false;
  if (query.asOfDate && !inEffectiveRange(unit, query.asOfDate)) return false;
  return true;
}

function matchesPositionQuery(position: PositionRecord, query?: PositionInquiryQuery): boolean {
  if (!query) return true;
  if (query.orgUnitId && position.orgUnitId !== query.orgUnitId) return false;
  if (query.status && position.status !== query.status) return false;
  return true;
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  createOrgUnit(unit: OrgUnitRecord): OrgUnitRecord {
    this.store.orgUnits.set(unit.id, unit);
    return unit;
  }

  updateOrgUnit(unit: OrgUnitRecord): OrgUnitRecord {
    this.store.orgUnits.set(unit.id, unit);
    return unit;
  }

  findOrgUnit(organizationId: string, unitId: string): OrgUnitRecord | null {
    const record = this.store.orgUnits.get(unitId);
    return record?.organizationId === organizationId ? record : null;
  }

  findOrgUnitByCode(organizationId: string, code: string): OrgUnitRecord | null {
    for (const record of this.store.orgUnits.values()) {
      if (record.organizationId === organizationId && record.code === code) {
        return record;
      }
    }
    return null;
  }

  listOrgUnits(organizationId: string, query?: OrgUnitInquiryQuery): readonly OrgUnitRecord[] {
    return [...this.store.orgUnits.values()]
      .filter((record) => record.organizationId === organizationId && matchesOrgUnitQuery(record, query))
      .sort((a, b) => a.code.localeCompare(b.code));
  }
}

export class InMemoryPositionRepository implements PositionRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  createPosition(position: PositionRecord): PositionRecord {
    this.store.positions.set(position.id, position);
    return position;
  }

  updatePosition(position: PositionRecord): PositionRecord {
    this.store.positions.set(position.id, position);
    return position;
  }

  findPosition(organizationId: string, positionId: string): PositionRecord | null {
    const record = this.store.positions.get(positionId);
    return record?.organizationId === organizationId ? record : null;
  }

  findPositionByCode(organizationId: string, code: string): PositionRecord | null {
    for (const record of this.store.positions.values()) {
      if (record.organizationId === organizationId && record.code === code) {
        return record;
      }
    }
    return null;
  }

  listPositions(organizationId: string, query?: PositionInquiryQuery): readonly PositionRecord[] {
    return [...this.store.positions.values()]
      .filter((record) => record.organizationId === organizationId && matchesPositionQuery(record, query))
      .sort((a, b) => a.code.localeCompare(b.code));
  }
}

export class InMemoryHierarchyRepository implements HierarchyRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  createReportingRelationship(record: ReportingRelationshipRecord): ReportingRelationshipRecord {
    this.store.reporting.set(record.id, record);
    return record;
  }

  listReportingRelationships(
    organizationId: string,
    _instanceId?: string,
  ): readonly ReportingRelationshipRecord[] {
    return [...this.store.reporting.values()]
      .filter((record) => record.organizationId === organizationId)
      .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  }

  listChildren(organizationId: string, parentId: string): readonly OrgUnitRecord[] {
    return [...this.store.orgUnits.values()].filter(
      (record) => record.organizationId === organizationId && record.parentId === parentId,
    );
  }
}

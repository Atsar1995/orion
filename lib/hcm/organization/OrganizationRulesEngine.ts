import type {
  OrgUnitRecord,
  ReportingRelationshipRecord,
} from "@/types/hcm-organization";
import { isValidDateRange } from "@/lib/hcm/common/time";

export class OrganizationRulesEngine {
  assertValidDateRange(from: string, to?: string): void {
    if (!isValidDateRange(from, to)) {
      throw new Error("INVALID_DATE_RANGE");
    }
  }

  assertActiveUnit(unit: OrgUnitRecord | null): void {
    if (!unit) throw new Error("ORG_UNIT_NOT_FOUND");
    if (unit.status !== "active") throw new Error("ORG_UNIT_NOT_ACTIVE");
  }

  assertNoDuplicateCode(existing: unknown): void {
    if (existing) throw new Error("DUPLICATE_ORG_CODE");
  }

  assertNotSelfParent(unitId: string, parentId?: string): void {
    if (parentId && parentId === unitId) {
      throw new Error("CIRCULAR_HIERARCHY");
    }
  }

  assertNoCircularReporting(
    relationships: readonly ReportingRelationshipRecord[],
    candidate: ReportingRelationshipRecord,
  ): void {
    const graph = new Map<string, string[]>();
    for (const rel of relationships) {
      if (rel.id === candidate.id) continue;
      const edges = graph.get(rel.subordinatePositionId) ?? [];
      graph.set(rel.subordinatePositionId, [...edges, rel.supervisorPositionId]);
    }
    const edges = graph.get(candidate.subordinatePositionId) ?? [];
    graph.set(candidate.subordinatePositionId, [...edges, candidate.supervisorPositionId]);

    if (this.hasCycle(candidate.subordinatePositionId, graph, new Set())) {
      throw new Error("CIRCULAR_REPORTING");
    }
  }

  private hasCycle(
    node: string,
    graph: Map<string, string[]>,
    visiting: Set<string>,
  ): boolean {
    if (visiting.has(node)) return true;
    visiting.add(node);
    for (const next of graph.get(node) ?? []) {
      if (this.hasCycle(next, graph, visiting)) return true;
    }
    visiting.delete(node);
    return false;
  }
}

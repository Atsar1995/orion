import type { ServiceContext } from "@/types/services";
import type { CreateRosterInput, RosterAssignment, RosterRecord, TimeSearchQuery } from "@/types/hcm-time";
import { createRosterId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { HCM_WORKFLOW_TEMPLATES } from "@/lib/hcm/constants";
import { publishHcmTimeEvent } from "@/lib/hcm/hcm-events";
import type { RosterRepository, ShiftRepository } from "@/lib/hcm/time/repositories/TimeRepository";
import { TimeRulesEngine } from "@/lib/hcm/time/TimeRulesEngine";

export class RosterService {
  private readonly rules = new TimeRulesEngine();

  constructor(
    private readonly rosterRepository: RosterRepository,
    private readonly shiftRepository: ShiftRepository,
  ) {}

  create(input: CreateRosterInput, context: ServiceContext): RosterRecord {
    const organizationId = context.organizationId;
    this.validateAssignments(organizationId, input.assignments);

    const now = nowIso();
    const roster: RosterRecord = {
      id: createRosterId(),
      organizationId,
      departmentId: input.departmentId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      status: "draft",
      assignments: input.assignments,
      createdAt: now,
      updatedAt: now,
    };

    return this.rosterRepository.create(roster);
  }

  publish(rosterId: string, context: ServiceContext): RosterRecord {
    const organizationId = context.organizationId;
    const roster = this.rosterRepository.findById(organizationId, rosterId);
    if (!roster) throw new Error("ROSTER_NOT_FOUND");
    if (roster.status === "published") throw new Error("ROSTER_ALREADY_PUBLISHED");

    const updated: RosterRecord = {
      ...roster,
      status: "published",
      publishedAt: nowIso(),
      updatedAt: nowIso(),
    };
    const saved = this.rosterRepository.update(updated);

    for (const assignment of saved.assignments) {
      publishHcmTimeEvent(
        {
          eventType: "ShiftAssigned",
          entityId: saved.id,
          employeeId: assignment.employeeId,
          payload: {
            shiftId: assignment.shiftId,
            rosterDate: assignment.rosterDate,
          },
        },
        context,
      );
    }

    return saved;
  }

  changeAssignment(
    rosterId: string,
    assignment: RosterAssignment,
    context: ServiceContext,
  ): RosterRecord {
    const organizationId = context.organizationId;
    const roster = this.rosterRepository.findById(organizationId, rosterId);
    if (!roster) throw new Error("ROSTER_NOT_FOUND");

    const otherAssignments = roster.assignments.filter(
      (item) =>
        !(item.employeeId === assignment.employeeId && item.rosterDate === assignment.rosterDate),
    );
    this.validateAssignments(organizationId, [...otherAssignments, assignment]);

    const updated: RosterRecord = {
      ...roster,
      assignments: [...otherAssignments, assignment],
      updatedAt: nowIso(),
    };
    const saved = this.rosterRepository.update(updated);

    publishHcmTimeEvent(
      {
        eventType: "ShiftChanged",
        entityId: saved.id,
        employeeId: assignment.employeeId,
        payload: {
          shiftId: assignment.shiftId,
          rosterDate: assignment.rosterDate,
          workflowTemplateKey: HCM_WORKFLOW_TEMPLATES.shiftChange,
        },
      },
      context,
    );

    return saved;
  }

  getById(rosterId: string, context: ServiceContext): RosterRecord | null {
    return this.rosterRepository.findById(context.organizationId, rosterId);
  }

  list(query: TimeSearchQuery | undefined, context: ServiceContext): readonly RosterRecord[] {
    return this.rosterRepository.list(context.organizationId, query);
  }

  private validateAssignments(organizationId: string, assignments: readonly RosterAssignment[]): void {
    const shiftPatterns = new Map(
      this.shiftRepository.list(organizationId).map((shift) => [shift.id, shift.pattern]),
    );

    const seen = new Map<string, RosterAssignment[]>();
    for (const assignment of assignments) {
      const key = `${assignment.employeeId}:${assignment.rosterDate}`;
      const existing = seen.get(key) ?? [];
      this.rules.assertShiftOverlap(existing, assignment, shiftPatterns);
      seen.set(key, [...existing, assignment]);
    }
  }
}

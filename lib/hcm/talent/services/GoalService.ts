import type { ServiceContext } from "@/types/services";
import type { CreateGoalInput, GoalRecord, ObjectiveRecord, TalentSearchQuery } from "@/types/hcm-talent";
import { createGoalId, createObjectiveId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { HCM_WORKFLOW_TEMPLATES } from "@/lib/hcm/constants";
import { publishHcmTalentEvent } from "@/lib/hcm/hcm-events";
import type { EmployeeRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type { PerformanceRepository } from "@/lib/hcm/talent/repositories/TalentRepository";

export class GoalService {
  constructor(
    private readonly performanceRepository: PerformanceRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  create(input: CreateGoalInput, context: ServiceContext): GoalRecord {
    const organizationId = context.organizationId;
    const employee = this.employeeRepository.findById(organizationId, input.employeeId);
    if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");

    const now = nowIso();
    const goal: GoalRecord = {
      id: createGoalId(),
      organizationId,
      employeeId: input.employeeId,
      managerId: input.managerId,
      title: input.title,
      description: input.description,
      status: "pending_approval",
      targetDate: input.targetDate,
      cycleCode: input.cycleCode,
      workflowInstanceId: `wf-${createGoalId()}`,
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId ?? "system",
    };

    const saved = this.performanceRepository.createGoal(goal);

    for (const obj of input.objectives ?? []) {
      this.performanceRepository.saveObjective({
        id: createObjectiveId(),
        organizationId,
        goalId: saved.id,
        title: obj.title,
        weight: obj.weight,
        progress: 0,
        completed: false,
        dueDate: obj.dueDate,
      });
    }

    publishHcmTalentEvent(
      {
        eventType: "GoalCreated",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: {
          workflowTemplateKey: HCM_WORKFLOW_TEMPLATES.goalApproval,
          workflowInstanceId: saved.workflowInstanceId ?? saved.id,
        },
      },
      context,
    );

    return saved;
  }

  approve(goalId: string, context: ServiceContext): GoalRecord {
    const goal = this.requireGoal(goalId, context, "pending_approval");
    const updated: GoalRecord = { ...goal, status: "active", updatedAt: nowIso() };
    return this.performanceRepository.updateGoal(updated);
  }

  complete(goalId: string, context: ServiceContext): GoalRecord {
    const goal = this.requireGoal(goalId, context, "active");
    const objectives = this.performanceRepository.listObjectives(context.organizationId, goalId);
    const allComplete = objectives.every((o) => o.completed || o.progress >= 100);
    if (objectives.length > 0 && !allComplete) throw new Error("OBJECTIVES_INCOMPLETE");

    const updated: GoalRecord = { ...goal, status: "completed", updatedAt: nowIso() };
    const saved = this.performanceRepository.updateGoal(updated);

    publishHcmTalentEvent(
      { eventType: "GoalCompleted", entityId: saved.id, employeeId: saved.employeeId },
      context,
    );

    return saved;
  }

  updateObjectiveProgress(
    objectiveId: string,
    progress: number,
    context: ServiceContext,
  ): ObjectiveRecord {
    const found = this.performanceRepository.findObjective(context.organizationId, objectiveId);
    if (!found) throw new Error("OBJECTIVE_NOT_FOUND");

    const updated: ObjectiveRecord = {
      ...found,
      progress: Math.min(100, Math.max(0, progress)),
      completed: progress >= 100,
    };
    return this.performanceRepository.saveObjective(updated);
  }

  search(query: TalentSearchQuery | undefined, context: ServiceContext): readonly GoalRecord[] {
    return this.performanceRepository.searchGoals(context.organizationId, query);
  }

  private requireGoal(
    goalId: string,
    context: ServiceContext,
    status: GoalRecord["status"],
  ): GoalRecord {
    const goal = this.performanceRepository.findGoal(context.organizationId, goalId);
    if (!goal) throw new Error("GOAL_NOT_FOUND");
    if (goal.status !== status) throw new Error("INVALID_GOAL_STATUS");
    return goal;
  }
}

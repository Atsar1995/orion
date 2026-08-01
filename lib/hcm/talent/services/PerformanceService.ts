import type { ServiceContext } from "@/types/services";
import type {
  CreateDevelopmentPlanInput,
  CreateGoalInput,
  CreatePerformanceReviewInput,
  DevelopmentPlanRecord,
  GoalRecord,
  PerformanceReviewRecord,
  ReviewRating,
  TalentSearchQuery,
} from "@/types/hcm-talent";
import { createDevelopmentPlanId, createReviewId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { HCM_WORKFLOW_TEMPLATES } from "@/lib/hcm/constants";
import { publishHcmTalentEvent } from "@/lib/hcm/hcm-events";
import type { EmployeeRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type { PerformanceRepository } from "@/lib/hcm/talent/repositories/TalentRepository";
import { CompetencyService } from "@/lib/hcm/talent/services/CompetencyService";
import { GoalService } from "@/lib/hcm/talent/services/GoalService";

/** Performance management facade (P-012.8). */
export class PerformanceService {
  readonly goals: GoalService;
  readonly competencies: CompetencyService;

  constructor(
    private readonly performanceRepository: PerformanceRepository,
    employeeRepository: EmployeeRepository,
    competencyService: CompetencyService,
  ) {
    this.goals = new GoalService(performanceRepository, employeeRepository);
    this.competencies = competencyService;
  }

  startReview(input: CreatePerformanceReviewInput, context: ServiceContext): PerformanceReviewRecord {
    const now = nowIso();
    const review: PerformanceReviewRecord = {
      id: createReviewId(),
      organizationId: context.organizationId,
      employeeId: input.employeeId,
      reviewerId: input.reviewerId,
      cycleCode: input.cycleCode,
      status: "in_progress",
      workflowInstanceId: `wf-${createReviewId()}`,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.performanceRepository.createReview(review);

    publishHcmTalentEvent(
      {
        eventType: "PerformanceReviewStarted",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: {
          cycleCode: saved.cycleCode,
          workflowTemplateKey: HCM_WORKFLOW_TEMPLATES.reviewApproval,
        },
      },
      context,
    );

    return saved;
  }

  completeReview(
    reviewId: string,
    rating: ReviewRating,
    context: ServiceContext,
  ): PerformanceReviewRecord {
    const review = this.performanceRepository.findReview(context.organizationId, reviewId);
    if (!review) throw new Error("REVIEW_NOT_FOUND");
    if (review.status !== "in_progress" && review.status !== "pending_approval") {
      throw new Error("INVALID_REVIEW_STATUS");
    }

    const now = nowIso();
    const updated: PerformanceReviewRecord = {
      ...review,
      status: "completed",
      overallRating: rating,
      completedAt: now,
      updatedAt: now,
    };
    const saved = this.performanceRepository.updateReview(updated);

    publishHcmTalentEvent(
      {
        eventType: "PerformanceReviewCompleted",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: { rating: String(rating.value), scaleCode: rating.scaleCode },
      },
      context,
    );

    return saved;
  }

  createDevelopmentPlan(input: CreateDevelopmentPlanInput, context: ServiceContext): DevelopmentPlanRecord {
    const now = nowIso();
    const plan: DevelopmentPlanRecord = {
      id: createDevelopmentPlanId(),
      organizationId: context.organizationId,
      employeeId: input.employeeId,
      title: input.title,
      status: "pending_approval",
      competencyIds: input.competencyIds,
      targetDate: input.targetDate,
      workflowInstanceId: `wf-${createDevelopmentPlanId()}`,
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId ?? "system",
    };

    const saved = this.performanceRepository.createDevelopmentPlan(plan);
    return saved;
  }

  approveDevelopmentPlan(planId: string, context: ServiceContext): DevelopmentPlanRecord {
    const plan = this.performanceRepository.findDevelopmentPlan(context.organizationId, planId);
    if (!plan) throw new Error("DEVELOPMENT_PLAN_NOT_FOUND");
    if (plan.status !== "pending_approval") throw new Error("INVALID_PLAN_STATUS");

    const updated: DevelopmentPlanRecord = {
      ...plan,
      status: "approved",
      updatedAt: nowIso(),
    };
    const saved = this.performanceRepository.updateDevelopmentPlan(updated);

    publishHcmTalentEvent(
      {
        eventType: "DevelopmentPlanApproved",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: { workflowTemplateKey: HCM_WORKFLOW_TEMPLATES.developmentPlanApproval },
      },
      context,
    );

    return saved;
  }

  createGoal(input: CreateGoalInput, context: ServiceContext): GoalRecord {
    return this.goals.create(input, context);
  }

  searchReviews(query: TalentSearchQuery | undefined, context: ServiceContext): readonly PerformanceReviewRecord[] {
    return this.performanceRepository.searchReviews(context.organizationId, query);
  }

  listDevelopmentPlans(
    query: TalentSearchQuery | undefined,
    context: ServiceContext,
  ): readonly DevelopmentPlanRecord[] {
    return this.performanceRepository.listDevelopmentPlans(context.organizationId, query);
  }
}

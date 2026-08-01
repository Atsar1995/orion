import type { ServiceContext } from "@/types/services";
import type {
  CareerPathRecord,
  CareerStage,
  CompetencyLevel,
  SuccessionPlanRecord,
  TalentProfileRecord,
  TalentSearchQuery,
} from "@/types/hcm-talent";
import { createCareerPathId, createSuccessionPlanId, createTalentProfileId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { publishHcmTalentEvent } from "@/lib/hcm/hcm-events";
import type { TalentRepository } from "@/lib/hcm/talent/repositories/TalentRepository";

export class SuccessionService {
  constructor(private readonly talentRepository: TalentRepository) {}

  updateSuccessionPlan(
    positionId: string,
    successorEmployeeIds: readonly string[],
    readinessLevel: CompetencyLevel,
    context: ServiceContext,
    incumbentEmployeeId?: string,
  ): SuccessionPlanRecord {
    const now = nowIso();
    const plan: SuccessionPlanRecord = {
      id: createSuccessionPlanId(),
      organizationId: context.organizationId,
      positionId,
      incumbentEmployeeId,
      successorEmployeeIds,
      readinessLevel,
      updatedAt: now,
      updatedBy: context.userId ?? "system",
    };

    const saved = this.talentRepository.saveSuccessionPlan(plan);

    publishHcmTalentEvent(
      {
        eventType: "SuccessionUpdated",
        entityId: saved.positionId,
        payload: {
          readinessLevel: saved.readinessLevel,
          successorCount: String(saved.successorEmployeeIds.length),
        },
      },
      context,
    );

    return saved;
  }

  listSuccessionPlans(context: ServiceContext): readonly SuccessionPlanRecord[] {
    return this.talentRepository.listSuccessionPlans(context.organizationId);
  }
}

/** Talent management facade (P-012.8). */
export class TalentService {
  readonly succession: SuccessionService;

  constructor(private readonly talentRepository: TalentRepository) {
    this.succession = new SuccessionService(talentRepository);
  }

  saveCareerPath(
    input: Omit<CareerPathRecord, "id" | "organizationId" | "active">,
    context: ServiceContext,
  ): CareerPathRecord {
    return this.talentRepository.saveCareerPath({
      ...input,
      id: createCareerPathId(),
      organizationId: context.organizationId,
      active: true,
    });
  }

  listCareerPaths(context: ServiceContext): readonly CareerPathRecord[] {
    return this.talentRepository.listCareerPaths(context.organizationId);
  }

  upsertTalentProfile(
    employeeId: string,
    input: {
      careerStage: CareerStage;
      talentPoolCodes?: readonly string[];
      readinessForPromotion?: boolean;
    },
    context: ServiceContext,
  ): TalentProfileRecord {
    const existing = this.talentRepository.findTalentProfile(context.organizationId, employeeId);
    const now = nowIso();

    const profile: TalentProfileRecord = {
      id: existing?.id ?? createTalentProfileId(),
      organizationId: context.organizationId,
      employeeId,
      careerStage: input.careerStage,
      talentPoolCodes: input.talentPoolCodes ?? existing?.talentPoolCodes ?? [],
      potentialRating: existing?.potentialRating,
      performanceRating: existing?.performanceRating,
      readinessForPromotion: input.readinessForPromotion ?? existing?.readinessForPromotion ?? false,
      updatedAt: now,
    };

    return this.talentRepository.saveTalentProfile(profile);
  }

  getTalentProfile(employeeId: string, context: ServiceContext): TalentProfileRecord | null {
    return this.talentRepository.findTalentProfile(context.organizationId, employeeId);
  }

  searchProfiles(
    query: TalentSearchQuery | undefined,
    context: ServiceContext,
  ): readonly TalentProfileRecord[] {
    return this.talentRepository.searchTalentProfiles(context.organizationId, query);
  }
}

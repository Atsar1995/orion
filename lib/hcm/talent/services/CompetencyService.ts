import type { ServiceContext } from "@/types/services";
import type {
  CompetencyAssessmentRecord,
  CompetencyLevel,
  CompetencyRecord,
} from "@/types/hcm-talent";
import { createCompetencyAssessmentId, createCompetencyId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import type { CompetencyRepository } from "@/lib/hcm/talent/repositories/TalentRepository";

export class CompetencyService {
  constructor(private readonly competencyRepository: CompetencyRepository) {}

  register(
    input: Omit<CompetencyRecord, "id" | "organizationId" | "active">,
    context: ServiceContext,
  ): CompetencyRecord {
    const existing = this.competencyRepository.findByCode(context.organizationId, input.code);
    if (existing) throw new Error("DUPLICATE_COMPETENCY_CODE");

    return this.competencyRepository.create({
      ...input,
      id: createCompetencyId(),
      organizationId: context.organizationId,
      active: true,
    });
  }

  list(frameworkCode: string | undefined, context: ServiceContext): readonly CompetencyRecord[] {
    return this.competencyRepository.list(context.organizationId, frameworkCode);
  }

  assess(
    employeeId: string,
    competencyId: string,
    level: CompetencyLevel,
    context: ServiceContext,
    notes?: string,
  ): CompetencyAssessmentRecord {
    const competency = this.competencyRepository.find(context.organizationId, competencyId);
    if (!competency) throw new Error("COMPETENCY_NOT_FOUND");

    return this.competencyRepository.saveAssessment({
      id: createCompetencyAssessmentId(),
      organizationId: context.organizationId,
      employeeId,
      competencyId,
      level,
      assessedBy: context.userId ?? "system",
      assessedAt: nowIso(),
      notes,
    });
  }

  listAssessments(employeeId: string, context: ServiceContext): readonly CompetencyAssessmentRecord[] {
    return this.competencyRepository.listAssessments(context.organizationId, employeeId);
  }
}

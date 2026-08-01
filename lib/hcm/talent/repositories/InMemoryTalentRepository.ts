import type {
  CareerPathRecord,
  CertificationRecord,
  CompetencyAssessmentRecord,
  CompetencyRecord,
  DevelopmentPlanRecord,
  EnrollmentRecord,
  GoalRecord,
  LearningProgramRecord,
  ObjectiveRecord,
  PerformanceReviewRecord,
  SuccessionPlanRecord,
  TalentProfileRecord,
  TalentSearchQuery,
  TrainingCourseRecord,
} from "@/types/hcm-talent";
import type {
  CertificationRepository,
  CompetencyRepository,
  LearningRepository,
  PerformanceRepository,
  TalentRepository,
} from "@/lib/hcm/talent/repositories/TalentRepository";
import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";

function paginate<T>(items: T[], query?: TalentSearchQuery): T[] {
  const page = query?.page ?? 1;
  const pageSize = query?.pageSize ?? 50;
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export class InMemoryPerformanceRepository implements PerformanceRepository {
  readonly domain = "hcm" as const;
  constructor(private readonly store: InMemoryHcmStore) {}

  createGoal(goal: GoalRecord): GoalRecord {
    this.store.goals.set(goal.id, goal);
    return goal;
  }
  updateGoal(goal: GoalRecord): GoalRecord {
    this.store.goals.set(goal.id, goal);
    return goal;
  }
  findGoal(organizationId: string, goalId: string): GoalRecord | null {
    const r = this.store.goals.get(goalId);
    return r?.organizationId === organizationId ? r : null;
  }
  searchGoals(organizationId: string, query?: TalentSearchQuery): readonly GoalRecord[] {
    const filtered = [...this.store.goals.values()].filter((g) => {
      if (g.organizationId !== organizationId) return false;
      if (query?.employeeId && g.employeeId !== query.employeeId) return false;
      if (query?.managerId && g.managerId !== query.managerId) return false;
      if (query?.status && g.status !== query.status) return false;
      return true;
    });
    return paginate(filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), query);
  }
  saveObjective(objective: ObjectiveRecord): ObjectiveRecord {
    this.store.objectives.set(objective.id, objective);
    return objective;
  }
  listObjectives(organizationId: string, goalId: string): readonly ObjectiveRecord[] {
    return [...this.store.objectives.values()].filter(
      (o) => o.organizationId === organizationId && o.goalId === goalId,
    );
  }
  findObjective(organizationId: string, objectiveId: string): ObjectiveRecord | null {
    const r = this.store.objectives.get(objectiveId);
    return r?.organizationId === organizationId ? r : null;
  }
  createReview(review: PerformanceReviewRecord): PerformanceReviewRecord {
    this.store.performanceReviews.set(review.id, review);
    return review;
  }
  updateReview(review: PerformanceReviewRecord): PerformanceReviewRecord {
    this.store.performanceReviews.set(review.id, review);
    return review;
  }
  findReview(organizationId: string, reviewId: string): PerformanceReviewRecord | null {
    const r = this.store.performanceReviews.get(reviewId);
    return r?.organizationId === organizationId ? r : null;
  }
  searchReviews(organizationId: string, query?: TalentSearchQuery): readonly PerformanceReviewRecord[] {
    return paginate(
      [...this.store.performanceReviews.values()].filter((r) => {
        if (r.organizationId !== organizationId) return false;
        if (query?.employeeId && r.employeeId !== query.employeeId) return false;
        if (query?.managerId && r.reviewerId !== query.managerId) return false;
        return true;
      }),
      query,
    );
  }
  createDevelopmentPlan(plan: DevelopmentPlanRecord): DevelopmentPlanRecord {
    this.store.developmentPlans.set(plan.id, plan);
    return plan;
  }
  updateDevelopmentPlan(plan: DevelopmentPlanRecord): DevelopmentPlanRecord {
    this.store.developmentPlans.set(plan.id, plan);
    return plan;
  }
  findDevelopmentPlan(organizationId: string, planId: string): DevelopmentPlanRecord | null {
    const r = this.store.developmentPlans.get(planId);
    return r?.organizationId === organizationId ? r : null;
  }
  listDevelopmentPlans(organizationId: string, query?: TalentSearchQuery): readonly DevelopmentPlanRecord[] {
    return paginate(
      [...this.store.developmentPlans.values()].filter((p) => {
        if (p.organizationId !== organizationId) return false;
        if (query?.employeeId && p.employeeId !== query.employeeId) return false;
        return true;
      }),
      query,
    );
  }
}

export class InMemoryLearningRepository implements LearningRepository {
  readonly domain = "hcm" as const;
  constructor(private readonly store: InMemoryHcmStore) {}

  createCourse(course: TrainingCourseRecord): TrainingCourseRecord {
    this.store.trainingCourses.set(course.id, course);
    return course;
  }
  findCourse(organizationId: string, courseId: string): TrainingCourseRecord | null {
    const r = this.store.trainingCourses.get(courseId);
    return r?.organizationId === organizationId ? r : null;
  }
  findCourseByCode(organizationId: string, code: string): TrainingCourseRecord | null {
    for (const r of this.store.trainingCourses.values()) {
      if (r.organizationId === organizationId && r.code === code) return r;
    }
    return null;
  }
  listCourses(organizationId: string): readonly TrainingCourseRecord[] {
    return [...this.store.trainingCourses.values()].filter((c) => c.organizationId === organizationId && c.active);
  }
  createProgram(program: LearningProgramRecord): LearningProgramRecord {
    this.store.learningPrograms.set(program.id, program);
    return program;
  }
  listPrograms(organizationId: string): readonly LearningProgramRecord[] {
    return [...this.store.learningPrograms.values()].filter((p) => p.organizationId === organizationId && p.active);
  }
  createEnrollment(enrollment: EnrollmentRecord): EnrollmentRecord {
    this.store.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  }
  updateEnrollment(enrollment: EnrollmentRecord): EnrollmentRecord {
    this.store.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  }
  findEnrollment(organizationId: string, enrollmentId: string): EnrollmentRecord | null {
    const r = this.store.enrollments.get(enrollmentId);
    return r?.organizationId === organizationId ? r : null;
  }
  searchEnrollments(organizationId: string, query?: TalentSearchQuery): readonly EnrollmentRecord[] {
    return paginate(
      [...this.store.enrollments.values()].filter((e) => {
        if (e.organizationId !== organizationId) return false;
        if (query?.employeeId && e.employeeId !== query.employeeId) return false;
        if (query?.courseId && e.courseId !== query.courseId) return false;
        if (query?.status && e.status !== query.status) return false;
        return true;
      }),
      query,
    );
  }
}

export class InMemoryCertificationRepository implements CertificationRepository {
  readonly domain = "hcm" as const;
  constructor(private readonly store: InMemoryHcmStore) {}

  create(certification: CertificationRecord): CertificationRecord {
    this.store.certifications.set(certification.id, certification);
    return certification;
  }
  update(certification: CertificationRecord): CertificationRecord {
    this.store.certifications.set(certification.id, certification);
    return certification;
  }
  find(organizationId: string, certificationId: string): CertificationRecord | null {
    const r = this.store.certifications.get(certificationId);
    return r?.organizationId === organizationId ? r : null;
  }
  search(organizationId: string, query?: TalentSearchQuery): readonly CertificationRecord[] {
    return paginate(
      [...this.store.certifications.values()].filter((c) => {
        if (c.organizationId !== organizationId) return false;
        if (query?.employeeId && c.employeeId !== query.employeeId) return false;
        if (query?.certificationCode && c.certificationCode !== query.certificationCode) return false;
        if (query?.status && c.status !== query.status) return false;
        return true;
      }),
      query,
    );
  }
}

export class InMemoryCompetencyRepository implements CompetencyRepository {
  readonly domain = "hcm" as const;
  constructor(private readonly store: InMemoryHcmStore) {}

  create(competency: CompetencyRecord): CompetencyRecord {
    this.store.competencies.set(competency.id, competency);
    return competency;
  }
  find(organizationId: string, competencyId: string): CompetencyRecord | null {
    const r = this.store.competencies.get(competencyId);
    return r?.organizationId === organizationId ? r : null;
  }
  findByCode(organizationId: string, code: string): CompetencyRecord | null {
    for (const r of this.store.competencies.values()) {
      if (r.organizationId === organizationId && r.code === code && r.active) return r;
    }
    return null;
  }
  list(organizationId: string, frameworkCode?: string): readonly CompetencyRecord[] {
    return [...this.store.competencies.values()].filter(
      (c) => c.organizationId === organizationId && c.active && (!frameworkCode || c.frameworkCode === frameworkCode),
    );
  }
  saveAssessment(assessment: CompetencyAssessmentRecord): CompetencyAssessmentRecord {
    this.store.competencyAssessments.set(assessment.id, assessment);
    return assessment;
  }
  listAssessments(organizationId: string, employeeId: string): readonly CompetencyAssessmentRecord[] {
    return [...this.store.competencyAssessments.values()].filter(
      (a) => a.organizationId === organizationId && a.employeeId === employeeId,
    );
  }
}

export class InMemoryTalentRepository implements TalentRepository {
  readonly domain = "hcm" as const;
  constructor(private readonly store: InMemoryHcmStore) {}

  saveCareerPath(path: CareerPathRecord): CareerPathRecord {
    this.store.careerPaths.set(path.id, path);
    return path;
  }
  listCareerPaths(organizationId: string): readonly CareerPathRecord[] {
    return [...this.store.careerPaths.values()].filter((p) => p.organizationId === organizationId && p.active);
  }
  findCareerPath(organizationId: string, pathId: string): CareerPathRecord | null {
    const r = this.store.careerPaths.get(pathId);
    return r?.organizationId === organizationId ? r : null;
  }
  saveSuccessionPlan(plan: SuccessionPlanRecord): SuccessionPlanRecord {
    this.store.successionPlans.set(plan.positionId, plan);
    return plan;
  }
  findSuccessionPlan(organizationId: string, positionId: string): SuccessionPlanRecord | null {
    const r = this.store.successionPlans.get(positionId);
    return r?.organizationId === organizationId ? r : null;
  }
  listSuccessionPlans(organizationId: string): readonly SuccessionPlanRecord[] {
    return [...this.store.successionPlans.values()].filter((p) => p.organizationId === organizationId);
  }
  saveTalentProfile(profile: TalentProfileRecord): TalentProfileRecord {
    this.store.talentProfiles.set(profile.employeeId, profile);
    return profile;
  }
  findTalentProfile(organizationId: string, employeeId: string): TalentProfileRecord | null {
    const r = this.store.talentProfiles.get(employeeId);
    return r?.organizationId === organizationId ? r : null;
  }
  searchTalentProfiles(organizationId: string, query?: TalentSearchQuery): readonly TalentProfileRecord[] {
    return paginate(
      [...this.store.talentProfiles.values()].filter((p) => {
        if (p.organizationId !== organizationId) return false;
        if (query?.employeeId && p.employeeId !== query.employeeId) return false;
        return true;
      }),
      query,
    );
  }
}

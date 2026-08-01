import type {
  CareerPathRecord,
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
import type { CertificationRecord } from "@/types/hcm-talent";

/** Performance repository contract (P-012.8). */
export type PerformanceRepository = {
  readonly domain: "hcm";
  createGoal(goal: GoalRecord): GoalRecord;
  updateGoal(goal: GoalRecord): GoalRecord;
  findGoal(organizationId: string, goalId: string): GoalRecord | null;
  searchGoals(organizationId: string, query?: TalentSearchQuery): readonly GoalRecord[];
  saveObjective(objective: ObjectiveRecord): ObjectiveRecord;
  listObjectives(organizationId: string, goalId: string): readonly ObjectiveRecord[];
  findObjective(organizationId: string, objectiveId: string): ObjectiveRecord | null;
  createReview(review: PerformanceReviewRecord): PerformanceReviewRecord;
  updateReview(review: PerformanceReviewRecord): PerformanceReviewRecord;
  findReview(organizationId: string, reviewId: string): PerformanceReviewRecord | null;
  searchReviews(organizationId: string, query?: TalentSearchQuery): readonly PerformanceReviewRecord[];
  createDevelopmentPlan(plan: DevelopmentPlanRecord): DevelopmentPlanRecord;
  updateDevelopmentPlan(plan: DevelopmentPlanRecord): DevelopmentPlanRecord;
  findDevelopmentPlan(organizationId: string, planId: string): DevelopmentPlanRecord | null;
  listDevelopmentPlans(organizationId: string, query?: TalentSearchQuery): readonly DevelopmentPlanRecord[];
};

/** Learning repository contract (P-012.8). */
export type LearningRepository = {
  readonly domain: "hcm";
  createCourse(course: TrainingCourseRecord): TrainingCourseRecord;
  findCourse(organizationId: string, courseId: string): TrainingCourseRecord | null;
  findCourseByCode(organizationId: string, code: string): TrainingCourseRecord | null;
  listCourses(organizationId: string): readonly TrainingCourseRecord[];
  createProgram(program: LearningProgramRecord): LearningProgramRecord;
  listPrograms(organizationId: string): readonly LearningProgramRecord[];
  createEnrollment(enrollment: EnrollmentRecord): EnrollmentRecord;
  updateEnrollment(enrollment: EnrollmentRecord): EnrollmentRecord;
  findEnrollment(organizationId: string, enrollmentId: string): EnrollmentRecord | null;
  searchEnrollments(organizationId: string, query?: TalentSearchQuery): readonly EnrollmentRecord[];
};

/** Certification repository contract (P-012.8). */
export type CertificationRepository = {
  readonly domain: "hcm";
  create(certification: CertificationRecord): CertificationRecord;
  update(certification: CertificationRecord): CertificationRecord;
  find(organizationId: string, certificationId: string): CertificationRecord | null;
  search(organizationId: string, query?: TalentSearchQuery): readonly CertificationRecord[];
};

/** Competency repository contract (P-012.8). */
export type CompetencyRepository = {
  readonly domain: "hcm";
  create(competency: CompetencyRecord): CompetencyRecord;
  find(organizationId: string, competencyId: string): CompetencyRecord | null;
  findByCode(organizationId: string, code: string): CompetencyRecord | null;
  list(organizationId: string, frameworkCode?: string): readonly CompetencyRecord[];
  saveAssessment(assessment: CompetencyAssessmentRecord): CompetencyAssessmentRecord;
  listAssessments(organizationId: string, employeeId: string): readonly CompetencyAssessmentRecord[];
};

/** Talent repository contract (P-012.8). */
export type TalentRepository = {
  readonly domain: "hcm";
  saveCareerPath(path: CareerPathRecord): CareerPathRecord;
  listCareerPaths(organizationId: string): readonly CareerPathRecord[];
  findCareerPath(organizationId: string, pathId: string): CareerPathRecord | null;
  saveSuccessionPlan(plan: SuccessionPlanRecord): SuccessionPlanRecord;
  findSuccessionPlan(organizationId: string, positionId: string): SuccessionPlanRecord | null;
  listSuccessionPlans(organizationId: string): readonly SuccessionPlanRecord[];
  saveTalentProfile(profile: TalentProfileRecord): TalentProfileRecord;
  findTalentProfile(organizationId: string, employeeId: string): TalentProfileRecord | null;
  searchTalentProfiles(organizationId: string, query?: TalentSearchQuery): readonly TalentProfileRecord[];
};

import type { ServiceContext } from "@/types/services";
import type {
  AssignTrainingInput,
  EnrollmentRecord,
  LearningProgramRecord,
  TalentSearchQuery,
  TrainingCourseRecord,
} from "@/types/hcm-talent";
import { createEnrollmentId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { HCM_WORKFLOW_TEMPLATES } from "@/lib/hcm/constants";
import { publishHcmTalentEvent } from "@/lib/hcm/hcm-events";
import type { EmployeeRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type { LearningRepository } from "@/lib/hcm/talent/repositories/TalentRepository";

export class LearningService {
  constructor(
    private readonly learningRepository: LearningRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  registerCourse(
    input: Omit<TrainingCourseRecord, "id" | "organizationId" | "active">,
    context: ServiceContext,
  ): TrainingCourseRecord {
    const existing = this.learningRepository.findCourseByCode(context.organizationId, input.code);
    if (existing) throw new Error("DUPLICATE_COURSE_CODE");

    return this.learningRepository.createCourse({
      ...input,
      id: `course-${input.code}`,
      organizationId: context.organizationId,
      active: true,
    });
  }

  assignTraining(input: AssignTrainingInput, context: ServiceContext): EnrollmentRecord {
    const organizationId = context.organizationId;
    const employee = this.employeeRepository.findById(organizationId, input.employeeId);
    if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");

    if (input.courseId) {
      const course = this.learningRepository.findCourse(organizationId, input.courseId);
      if (!course) throw new Error("COURSE_NOT_FOUND");
      this.assertPrerequisites(course, input.employeeId, organizationId);
    }

    if (input.programId) {
      const program = this.learningRepository.listPrograms(organizationId).find((p) => p.id === input.programId);
      if (!program) throw new Error("PROGRAM_NOT_FOUND");
    }

    const now = nowIso();
    const enrollment: EnrollmentRecord = {
      id: createEnrollmentId(),
      organizationId,
      employeeId: input.employeeId,
      courseId: input.courseId,
      programId: input.programId,
      status: "assigned",
      assignedAt: now,
      workflowInstanceId: `wf-${createEnrollmentId()}`,
      assignedBy: context.userId ?? "system",
    };

    const saved = this.learningRepository.createEnrollment(enrollment);

    publishHcmTalentEvent(
      {
        eventType: "TrainingAssigned",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: {
          courseId: saved.courseId ?? "",
          programId: saved.programId ?? "",
          workflowTemplateKey: HCM_WORKFLOW_TEMPLATES.trainingApproval,
        },
      },
      context,
    );

    return saved;
  }

  completeTraining(enrollmentId: string, context: ServiceContext): EnrollmentRecord {
    const enrollment = this.learningRepository.findEnrollment(context.organizationId, enrollmentId);
    if (!enrollment) throw new Error("ENROLLMENT_NOT_FOUND");
    if (enrollment.status === "completed") throw new Error("ALREADY_COMPLETED");

    const now = nowIso();
    const updated: EnrollmentRecord = {
      ...enrollment,
      status: "completed",
      completedAt: now,
    };
    const saved = this.learningRepository.updateEnrollment(updated);

    publishHcmTalentEvent(
      {
        eventType: "TrainingCompleted",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: { courseId: saved.courseId ?? "" },
      },
      context,
    );

    return saved;
  }

  listCourses(context: ServiceContext): readonly TrainingCourseRecord[] {
    return this.learningRepository.listCourses(context.organizationId);
  }

  listPrograms(context: ServiceContext): readonly LearningProgramRecord[] {
    return this.learningRepository.listPrograms(context.organizationId);
  }

  searchEnrollments(
    query: TalentSearchQuery | undefined,
    context: ServiceContext,
  ): readonly EnrollmentRecord[] {
    return this.learningRepository.searchEnrollments(context.organizationId, query);
  }

  private assertPrerequisites(
    course: TrainingCourseRecord,
    employeeId: string,
    organizationId: string,
  ): void {
    if (!course.prerequisiteCourseIds?.length) return;

    const completed = this.learningRepository
      .searchEnrollments(organizationId, { employeeId, status: "completed" })
      .map((e) => e.courseId);

    for (const prereqId of course.prerequisiteCourseIds) {
      if (!completed.includes(prereqId)) {
        throw new Error("PREREQUISITE_NOT_MET");
      }
    }
  }
}

import type { ServiceContext } from "@/types/services";
import type { CertificationRecord, IssueCertificationInput, TalentSearchQuery } from "@/types/hcm-talent";
import { createCertificationId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { HCM_WORKFLOW_TEMPLATES } from "@/lib/hcm/constants";
import { publishHcmTalentEvent } from "@/lib/hcm/hcm-events";
import type { EmployeeRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type { CertificationRepository } from "@/lib/hcm/talent/repositories/TalentRepository";

export class CertificationService {
  constructor(
    private readonly certificationRepository: CertificationRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  issue(input: IssueCertificationInput, context: ServiceContext): CertificationRecord {
    const organizationId = context.organizationId;
    const employee = this.employeeRepository.findById(organizationId, input.employeeId);
    if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");

    const now = nowIso();
    const certification: CertificationRecord = {
      id: createCertificationId(),
      organizationId,
      employeeId: input.employeeId,
      certificationCode: input.certificationCode,
      name: input.name,
      status: "active",
      issuedAt: now,
      expiresAt: input.expiresAt,
      courseId: input.courseId,
      workflowInstanceId: `wf-${createCertificationId()}`,
    };

    const saved = this.certificationRepository.create(certification);

    publishHcmTalentEvent(
      {
        eventType: "CertificationIssued",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: {
          certificationCode: saved.certificationCode,
          expiresAt: saved.expiresAt ?? "",
        },
      },
      context,
    );

    return saved;
  }

  checkExpiry(context: ServiceContext): readonly CertificationRecord[] {
    const today = new Date().toISOString().slice(0, 10);
    const expired: CertificationRecord[] = [];

    for (const cert of this.certificationRepository.search(context.organizationId, { status: "active" })) {
      if (cert.expiresAt && cert.expiresAt < today) {
        const updated: CertificationRecord = {
          ...cert,
          status: "expired",
        };
        const saved = this.certificationRepository.update(updated);
        expired.push(saved);

        publishHcmTalentEvent(
          {
            eventType: "CertificationExpired",
            entityId: saved.id,
            employeeId: saved.employeeId,
            payload: {
              certificationCode: saved.certificationCode,
              workflowTemplateKey: HCM_WORKFLOW_TEMPLATES.certificationRenewal,
            },
          },
          context,
        );
      }
    }

    return expired;
  }

  search(query: TalentSearchQuery | undefined, context: ServiceContext): readonly CertificationRecord[] {
    return this.certificationRepository.search(context.organizationId, query);
  }
}

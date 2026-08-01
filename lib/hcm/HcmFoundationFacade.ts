import { OrganizationService } from "@/lib/hcm/organization/services/OrganizationService";
import { EmployeeService } from "@/lib/hcm/employees/services/EmployeeService";
import { EmploymentService } from "@/lib/hcm/employment/services/EmploymentService";
import { RecruitmentService } from "@/lib/hcm/recruitment/services/RecruitmentService";
import { OnboardingService } from "@/lib/hcm/onboarding/services/OnboardingService";
import type { FoundationRepositories } from "@/lib/hcm/data/createFoundationRepositories";

/** Internal foundation wiring (P-012.1 – P-012.5). Not exported from public HCM API. */
export class HcmFoundationFacade {
  readonly organization: OrganizationService;
  readonly employee: EmployeeService;
  readonly employment: EmploymentService;
  readonly recruitment: RecruitmentService;
  readonly onboarding: OnboardingService;

  constructor(repositories: FoundationRepositories) {
    this.organization = new OrganizationService(
      repositories.organization,
      repositories.position,
      repositories.hierarchy,
    );
    this.employee = new EmployeeService(repositories.employee, repositories.employeeProfile);
    this.employment = new EmploymentService(
      repositories.employment,
      repositories.employmentHistory,
      repositories.assignment,
      repositories.employee,
    );
    this.recruitment = new RecruitmentService(
      repositories.recruitment,
      repositories.candidate,
      repositories.application,
      repositories.offer,
    );
    this.onboarding = new OnboardingService(
      repositories.onboarding,
      repositories.document,
      repositories.verification,
      repositories.provisioning,
      repositories.offer,
      repositories.candidate,
    );
  }
}

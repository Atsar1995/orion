import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import { InMemoryEmployeeRepository } from "@/lib/hcm/data/InMemoryEmployeeRepository";
import { InMemoryEmployeeProfileRepository } from "@/lib/hcm/employees/repositories/InMemoryEmployeeProfileRepository";
import {
  InMemoryAssignmentRepository,
  InMemoryEmploymentHistoryRepository,
  InMemoryEmploymentRepository,
} from "@/lib/hcm/employment/repositories/InMemoryEmploymentRepository";
import {
  InMemoryDocumentRepository,
  InMemoryOnboardingRepository,
  InMemoryProvisioningRepository,
  InMemoryVerificationRepository,
} from "@/lib/hcm/onboarding/repositories/InMemoryOnboardingRepository";
import {
  InMemoryHierarchyRepository,
  InMemoryOrganizationRepository,
  InMemoryPositionRepository,
} from "@/lib/hcm/organization/repositories/InMemoryOrganizationRepository";
import {
  InMemoryApplicationRepository,
  InMemoryCandidateRepository,
  InMemoryInterviewRepository,
  InMemoryOfferRepository,
  InMemoryRecruitmentRepository,
} from "@/lib/hcm/recruitment/repositories/InMemoryRecruitmentRepository";

/** Wires all P-012.1–P-012.5 in-memory repositories against a shared store. */
export function createFoundationRepositories(store: InMemoryHcmStore) {
  return {
    organization: new InMemoryOrganizationRepository(store),
    position: new InMemoryPositionRepository(store),
    hierarchy: new InMemoryHierarchyRepository(store),
    employee: new InMemoryEmployeeRepository(store),
    employeeProfile: new InMemoryEmployeeProfileRepository(store),
    employment: new InMemoryEmploymentRepository(store),
    employmentHistory: new InMemoryEmploymentHistoryRepository(store),
    assignment: new InMemoryAssignmentRepository(store),
    recruitment: new InMemoryRecruitmentRepository(store),
    candidate: new InMemoryCandidateRepository(store),
    application: new InMemoryApplicationRepository(store),
    offer: new InMemoryOfferRepository(store),
    interview: new InMemoryInterviewRepository(),
    onboarding: new InMemoryOnboardingRepository(store),
    document: new InMemoryDocumentRepository(store),
    verification: new InMemoryVerificationRepository(store),
    provisioning: new InMemoryProvisioningRepository(store),
  };
}

export type FoundationRepositories = ReturnType<typeof createFoundationRepositories>;

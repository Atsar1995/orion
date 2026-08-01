import { describe, expect, it, beforeEach } from "vitest";
import type { ServiceContext } from "@/types/services";
import type {
  OrgUnitRecord,
  PositionRecord,
  ReportingRelationshipRecord,
} from "@/types/hcm-organization";
import type { EmployeeRecord } from "@/types/hcm-employee";
import type {
  EmploymentAssignment,
  EmploymentHistoryRecord,
  EmploymentRecord,
} from "@/types/hcm-employment";
import type {
  ApplicationRecord,
  CandidateRecord,
  OfferRecord,
} from "@/types/hcm-recruitment";
import type {
  DocumentRequirementRecord,
  DocumentVerificationRecord,
  EmployeeDocumentRecord,
  OnboardingProcessRecord,
  OnboardingTaskRecord,
  ProvisioningTaskRecord,
} from "@/types/hcm-onboarding";
import { OrganizationService } from "@/lib/hcm/organization/services/OrganizationService";
import { EmployeeService } from "@/lib/hcm/employees/services/EmployeeService";
import { EmploymentService } from "@/lib/hcm/employment/services/EmploymentService";
import { RecruitmentService } from "@/lib/hcm/recruitment/services/RecruitmentService";
import { OnboardingService } from "@/lib/hcm/onboarding/services/OnboardingService";
import type {
  HierarchyRepository,
  OrganizationRepository,
  PositionRepository,
} from "@/lib/hcm/organization/repositories/OrganizationRepository";
import type {
  EmployeeProfileRepository,
  EmployeeRepository,
} from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type {
  AssignmentRepository,
  EmploymentHistoryRepository,
  EmploymentRepository,
} from "@/lib/hcm/employment/repositories/EmploymentRepository";
import type {
  ApplicationRepository,
  CandidateRepository,
  OfferRepository,
  RecruitmentRepository,
} from "@/lib/hcm/recruitment/repositories/RecruitmentRepository";
import type {
  DocumentRepository,
  OnboardingRepository,
  ProvisioningRepository,
  VerificationRepository,
} from "@/lib/hcm/onboarding/repositories/OnboardingRepository";

const ORG = "org-test";
const CONTEXT: ServiceContext = {
  organizationId: ORG,
  workspaceId: "ws-test",
  userId: "user-hr",
  role: "executive",
};

function createMockOrganizationRepos() {
  const orgUnits = new Map<string, OrgUnitRecord>();
  const positions = new Map<string, PositionRecord>();
  const relationships: ReportingRelationshipRecord[] = [];

  const organizationRepository: OrganizationRepository = {
    domain: "hcm",
    createOrgUnit: (u) => {
      orgUnits.set(u.id, u);
      return u;
    },
    updateOrgUnit: (u) => {
      orgUnits.set(u.id, u);
      return u;
    },
    findOrgUnit: (_, id) => orgUnits.get(id) ?? null,
    findOrgUnitByCode: (_, code) =>
      [...orgUnits.values()].find((u) => u.code === code) ?? null,
    listOrgUnits: () => [...orgUnits.values()],
  };

  const positionRepository: PositionRepository = {
    domain: "hcm",
    createPosition: (p) => {
      positions.set(p.id, p);
      return p;
    },
    updatePosition: (p) => {
      positions.set(p.id, p);
      return p;
    },
    findPosition: (_, id) => positions.get(id) ?? null,
    findPositionByCode: (_, code) =>
      [...positions.values()].find((p) => p.code === code) ?? null,
    listPositions: () => [...positions.values()],
  };

  const hierarchyRepository: HierarchyRepository = {
    domain: "hcm",
    createReportingRelationship: (r) => {
      relationships.push(r);
      return r;
    },
    listReportingRelationships: () => relationships,
    listChildren: (_, parentId) =>
      [...orgUnits.values()].filter((u) => u.parentId === parentId),
  };

  return { organizationRepository, positionRepository, hierarchyRepository, orgUnits, positions };
}

function createMockEmployeeRepos() {
  const employees = new Map<string, EmployeeRecord>();

  const employeeRepository: EmployeeRepository = {
    domain: "hcm",
    create: (e) => {
      employees.set(e.id, e);
      return e;
    },
    update: (e) => {
      employees.set(e.id, e);
      return e;
    },
    findById: (_, id) => employees.get(id) ?? null,
    findByEmployeeNumber: (_, num) =>
      [...employees.values()].find((e) => e.employeeNumber === num) ?? null,
    findByIdentityFingerprint: (_, fp) =>
      [...employees.values()].find(
        (e) =>
          `${e.identity.legalName.givenName}|${e.identity.legalName.familyName}::`.toLowerCase() ===
          fp.split("::")[0] + "::",
      ) ?? null,
    search: () => [...employees.values()],
    count: () => employees.size,
  };

  const profileRepository: EmployeeProfileRepository = {
    domain: "hcm",
    getProfile: (_, id) => employees.get(id) ?? null,
    saveProfile: (e) => {
      employees.set(e.id, e);
      return e;
    },
  };

  return { employeeRepository, profileRepository, employees };
}

function createMockEmploymentRepos() {
  const employments = new Map<string, EmploymentRecord>();
  const history: EmploymentHistoryRecord[] = [];
  const assignments: EmploymentAssignment[] = [];

  const employmentRepository: EmploymentRepository = {
    domain: "hcm",
    create: (e) => {
      employments.set(e.id, e);
      return e;
    },
    update: (e) => {
      employments.set(e.id, e);
      return e;
    },
    findById: (_, id) => employments.get(id) ?? null,
    findByEmploymentNumber: (_, num) =>
      [...employments.values()].find((e) => e.employmentNumber === num) ?? null,
    listByEmployee: (_, empId) =>
      [...employments.values()].filter((e) => e.employeeId === empId),
    listActivePrimary: (_, empId, legalEntityId) =>
      [...employments.values()].filter(
        (e) =>
          e.employeeId === empId &&
          e.legalEntityId === legalEntityId &&
          e.isPrimary &&
          e.status !== "terminated" &&
          e.status !== "retired" &&
          e.status !== "archived",
      ),
    search: () => [...employments.values()],
    count: () => employments.size,
  };

  const historyRepository: EmploymentHistoryRepository = {
    domain: "hcm",
    append: (entry) => {
      history.push(entry);
      return entry;
    },
    listByEmployment: (_, empId) => history.filter((h) => h.employmentId === empId),
  };

  const assignmentRepository: AssignmentRepository = {
    domain: "hcm",
    create: (a) => {
      assignments.push(a);
      return a;
    },
    update: (a) => a,
    listByEmployment: (_, empId) => assignments.filter((a) => a.employmentId === empId),
    findActiveByEmployment: (_, empId) => assignments.filter((a) => a.employmentId === empId),
  };

  return { employmentRepository, historyRepository, assignmentRepository, employments, history };
}

function createMockRecruitmentRepos() {
  const candidates = new Map<string, CandidateRecord>();
  const applications = new Map<string, ApplicationRecord>();
  const offers = new Map<string, OfferRecord>();

  const candidateRepository: CandidateRepository = {
    domain: "hcm",
    create: (c) => {
      candidates.set(c.id, c);
      return c;
    },
    update: (c) => {
      candidates.set(c.id, c);
      return c;
    },
    findById: (_, id) => candidates.get(id) ?? null,
    findByNumber: (_, num) =>
      [...candidates.values()].find((c) => c.candidateNumber === num) ?? null,
  };

  const applicationRepository: ApplicationRepository = {
    domain: "hcm",
    create: (a) => {
      applications.set(a.id, a);
      return a;
    },
    update: (a) => {
      applications.set(a.id, a);
      return a;
    },
    findById: (_, id) => applications.get(id) ?? null,
    listByCandidate: (_, candId) =>
      [...applications.values()].filter((a) => a.candidateId === candId),
  };

  const offerRepository: OfferRepository = {
    domain: "hcm",
    create: (o) => {
      offers.set(o.id, o);
      return o;
    },
    update: (o) => {
      offers.set(o.id, o);
      return o;
    },
    findById: (_, id) => offers.get(id) ?? null,
    listByCandidate: (_, candId) =>
      [...offers.values()].filter((o) => o.candidateId === candId),
  };

  const recruitmentRepository: RecruitmentRepository = {
    domain: "hcm",
    findCandidate: (_, id) => candidates.get(id) ?? null,
    findOffer: (_, id) => offers.get(id) ?? null,
    findApplication: (_, id) => applications.get(id) ?? null,
    listOffersByCandidate: (_, candId) =>
      [...offers.values()].filter((o) => o.candidateId === candId),
  };

  return {
    candidateRepository,
    applicationRepository,
    offerRepository,
    recruitmentRepository,
    candidates,
    applications,
    offers,
  };
}

function createMockOnboardingRepos() {
  const processes = new Map<string, OnboardingProcessRecord>();
  const tasks: OnboardingTaskRecord[] = [];
  const documents = new Map<string, EmployeeDocumentRecord>();
  const verifications = new Map<string, DocumentVerificationRecord>();
  const provisioning: ProvisioningTaskRecord[] = [];
  const requirements: DocumentRequirementRecord[] = [
    {
      id: "req-id",
      organizationId: ORG,
      documentType: "identity",
      categoryCode: "ID_PROOF",
      mandatory: true,
      verificationRequired: true,
      active: true,
    },
  ];

  const onboardingRepository: OnboardingRepository = {
    domain: "hcm",
    createProcess: (p) => {
      processes.set(p.id, p);
      return p;
    },
    updateProcess: (p) => {
      processes.set(p.id, p);
      return p;
    },
    findProcess: (_, id) => processes.get(id) ?? null,
    findProcessByCandidate: (_, candId) =>
      [...processes.values()].find((p) => p.candidateId === candId) ?? null,
    searchProcesses: () => [...processes.values()],
    countProcesses: () => processes.size,
    createTask: (t) => {
      tasks.push(t);
      return t;
    },
    updateTask: (t) => {
      const idx = tasks.findIndex((x) => x.id === t.id);
      if (idx >= 0) tasks[idx] = t;
      return t;
    },
    listTasks: (_, processId) => tasks.filter((t) => t.processId === processId),
    listRequirements: () => requirements,
  };

  const documentRepository: DocumentRepository = {
    domain: "hcm",
    create: (d) => {
      documents.set(d.id, d);
      return d;
    },
    update: (d) => {
      documents.set(d.id, d);
      return d;
    },
    findById: (_, id) => documents.get(id) ?? null,
    listByProcess: (_, processId) =>
      [...documents.values()].filter((d) => d.processId === processId),
    listByEmployee: () => [],
  };

  const verificationRepository: VerificationRepository = {
    domain: "hcm",
    save: (v) => {
      verifications.set(v.documentId, v);
      return v;
    },
    findByDocument: (_, docId) => verifications.get(docId) ?? null,
  };

  const provisioningRepository: ProvisioningRepository = {
    domain: "hcm",
    create: (t) => {
      provisioning.push(t);
      return t;
    },
    update: (t) => {
      const idx = provisioning.findIndex((x) => x.id === t.id);
      if (idx >= 0) provisioning[idx] = t;
      return t;
    },
    listByProcess: (_, processId) => provisioning.filter((t) => t.processId === processId),
  };

  return {
    onboardingRepository,
    documentRepository,
    verificationRepository,
    provisioningRepository,
    processes,
    tasks,
    documents,
    provisioning,
  };
}

describe("HCM Foundation Services (S-002.3)", () => {
  describe("OrganizationService", () => {
    let orgService: OrganizationService;
    let orgRepos: ReturnType<typeof createMockOrganizationRepos>;

    beforeEach(() => {
      orgRepos = createMockOrganizationRepos();
      orgService = new OrganizationService(
        orgRepos.organizationRepository,
        orgRepos.positionRepository,
        orgRepos.hierarchyRepository,
      );
    });

    it("creates org unit and position", () => {
      const unit = orgService.createOrgUnit(
        {
          unitType: "department",
          code: "ENG",
          name: "Engineering",
          effectiveFrom: "2026-01-01",
        },
        CONTEXT,
      );
      expect(unit.status).toBe("active");

      const position = orgService.createPosition(
        {
          orgUnitId: unit.id,
          code: "SE-1",
          title: "Software Engineer",
          effectiveFrom: "2026-01-01",
        },
        CONTEXT,
      );
      expect(position.orgUnitId).toBe(unit.id);
    });

    it("prevents circular reporting", () => {
      const unit = orgService.createOrgUnit(
        { unitType: "department", code: "HR", name: "HR", effectiveFrom: "2026-01-01" },
        CONTEXT,
      );
      const posA = orgService.createPosition(
        { orgUnitId: unit.id, code: "MGR", title: "Manager", effectiveFrom: "2026-01-01" },
        CONTEXT,
      );
      const posB = orgService.createPosition(
        { orgUnitId: unit.id, code: "STF", title: "Staff", effectiveFrom: "2026-01-01" },
        CONTEXT,
      );

      orgService.createReportingRelationship(
        {
          subordinatePositionId: posB.id,
          supervisorPositionId: posA.id,
          effectiveFrom: "2026-01-01",
        },
        CONTEXT,
      );

      expect(() =>
        orgService.createReportingRelationship(
          {
            subordinatePositionId: posA.id,
            supervisorPositionId: posB.id,
            effectiveFrom: "2026-01-01",
          },
          CONTEXT,
        ),
      ).toThrow("CIRCULAR_REPORTING");
    });

    it("deactivates org unit without active children", () => {
      const unit = orgService.createOrgUnit(
        { unitType: "department", code: "FIN", name: "Finance", effectiveFrom: "2026-01-01" },
        CONTEXT,
      );
      const deactivated = orgService.deactivateOrgUnit(unit.id, CONTEXT);
      expect(deactivated.status).toBe("inactive");
    });
  });

  describe("EmployeeService", () => {
    let employeeService: EmployeeService;

    beforeEach(() => {
      const repos = createMockEmployeeRepos();
      employeeService = new EmployeeService(repos.employeeRepository, repos.profileRepository);
    });

    it("creates and activates employee", () => {
      const employee = employeeService.create(
        {
          employeeNumber: "E001",
          identity: {
            legalName: { givenName: "Jane", familyName: "Doe" },
            governmentIdentifiers: [{ type: "passport", value: "P123" }],
          },
          effectiveFrom: "2026-01-01",
        },
        CONTEXT,
      );
      expect(employee.status).toBe("draft");

      const active = employeeService.activate(employee.id, CONTEXT);
      expect(active.status).toBe("active");
    });

    it("rejects duplicate employee number", () => {
      employeeService.create(
        {
          employeeNumber: "E002",
          identity: {
            legalName: { givenName: "John", familyName: "Smith" },
            governmentIdentifiers: [],
          },
          effectiveFrom: "2026-01-01",
        },
        CONTEXT,
      );

      expect(() =>
        employeeService.create(
          {
            employeeNumber: "E002",
            identity: {
              legalName: { givenName: "Other", familyName: "Person" },
              governmentIdentifiers: [],
            },
            effectiveFrom: "2026-01-01",
          },
          CONTEXT,
        ),
      ).toThrow("DUPLICATE_EMPLOYEE_NUMBER");
    });
  });

  describe("EmploymentService", () => {
    let employmentService: EmploymentService;
    let employeeRepos: ReturnType<typeof createMockEmployeeRepos>;
    let employmentRepos: ReturnType<typeof createMockEmploymentRepos>;

    beforeEach(() => {
      employeeRepos = createMockEmployeeRepos();
      employmentRepos = createMockEmploymentRepos();
      employmentService = new EmploymentService(
        employmentRepos.employmentRepository,
        employmentRepos.historyRepository,
        employmentRepos.assignmentRepository,
        employeeRepos.employeeRepository,
      );

      employeeRepos.employeeRepository.create({
        id: "emp-1",
        organizationId: ORG,
        employeeNumber: "E100",
        identity: {
          legalName: { givenName: "Alex", familyName: "Rivera" },
          governmentIdentifiers: [],
        },
        profile: {},
        contacts: [],
        emergencyContacts: [],
        status: "active",
        statusEffectiveFrom: "2026-01-01T00:00:00.000Z",
        effectiveFrom: "2026-01-01",
        version: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        createdBy: "system",
        updatedBy: "system",
      });
    });

    it("creates employment and records history", () => {
      const employment = employmentService.create(
        {
          employmentNumber: "EMP-100",
          employeeId: "emp-1",
          legalEntityId: "le-1",
          employmentType: "permanent",
          contractType: "full_time",
          contract: { startDate: "2026-01-01" },
          effectiveFrom: "2026-01-01",
        },
        CONTEXT,
      );
      expect(employment.status).toBe("draft");

      const history = employmentService.listHistory(employment.id, CONTEXT);
      expect(history).toHaveLength(1);
      expect(history[0]?.eventType).toBe("created");
    });

    it("transfers and promotes employment", () => {
      const employment = employmentService.create(
        {
          employmentNumber: "EMP-101",
          employeeId: "emp-1",
          legalEntityId: "le-1",
          employmentType: "permanent",
          contractType: "full_time",
          contract: { startDate: "2026-01-01" },
          effectiveFrom: "2026-01-01",
          departmentId: "dept-a",
        },
        CONTEXT,
      );
      employmentService.activate(employment.id, "2026-02-01", CONTEXT);

      const transferred = employmentService.transfer(
        {
          employmentId: employment.id,
          departmentId: "dept-b",
          effectiveFrom: "2026-03-01",
        },
        CONTEXT,
      );
      expect(transferred.departmentId).toBe("dept-b");

      const promoted = employmentService.promote(
        {
          employmentId: employment.id,
          jobGrade: "G5",
          effectiveFrom: "2026-04-01",
        },
        CONTEXT,
      );
      expect(promoted.jobGrade).toBe("G5");
    });

    it("terminates and rehires", () => {
      const employment = employmentService.create(
        {
          employmentNumber: "EMP-102",
          employeeId: "emp-1",
          legalEntityId: "le-1",
          employmentType: "permanent",
          contractType: "full_time",
          contract: { startDate: "2026-01-01" },
          effectiveFrom: "2026-01-01",
        },
        CONTEXT,
      );
      employmentService.activate(employment.id, "2026-02-01", CONTEXT);
      employmentService.terminate(
        {
          employmentId: employment.id,
          reason: { code: "RESIGN", description: "Resignation", voluntary: true },
          effectiveFrom: "2026-06-01",
        },
        CONTEXT,
      );

      const rehired = employmentService.rehire(
        {
          employeeId: "emp-1",
          employmentNumber: "EMP-103",
          legalEntityId: "le-1",
          employmentType: "permanent",
          contractType: "full_time",
          contract: { startDate: "2027-01-01" },
          effectiveFrom: "2027-01-01",
        },
        CONTEXT,
      );
      expect(rehired.status).toBe("active");
    });
  });

  describe("RecruitmentService", () => {
    let recruitmentService: RecruitmentService;

    beforeEach(() => {
      const repos = createMockRecruitmentRepos();
      recruitmentService = new RecruitmentService(
        repos.recruitmentRepository,
        repos.candidateRepository,
        repos.applicationRepository,
        repos.offerRepository,
      );
    });

    it("runs candidate through hire lifecycle", () => {
      const candidate = recruitmentService.registerCandidate(
        {
          candidateNumber: "C001",
          legalName: { givenName: "Sam", familyName: "Lee" },
          email: "sam@example.com",
          source: "direct",
        },
        CONTEXT,
      );
      recruitmentService.activateCandidate(candidate.id, CONTEXT);

      const application = recruitmentService.createApplication(
        { candidateId: candidate.id, recruitmentRequestId: "req-1" },
        CONTEXT,
      );
      recruitmentService.submitApplication(application.id, CONTEXT);
      recruitmentService.startScreening(application.id, CONTEXT);
      recruitmentService.scheduleInterview({ applicationId: application.id }, CONTEXT);

      const offer = recruitmentService.createOffer(
        {
          candidateId: candidate.id,
          applicationId: application.id,
          joiningDate: "2026-08-01",
        },
        CONTEXT,
      );
      recruitmentService.submitOfferForApproval(offer.id, CONTEXT);
      const accepted = recruitmentService.acceptOffer(offer.id, CONTEXT);

      expect(accepted.status).toBe("accepted");
      const updatedCandidate = recruitmentService.getCandidate(candidate.id, CONTEXT);
      expect(updatedCandidate?.status).toBe("hired");
    });
  });

  describe("OnboardingService", () => {
    let onboardingService: OnboardingService;
    let recruitmentRepos: ReturnType<typeof createMockRecruitmentRepos>;
    let onboardingRepos: ReturnType<typeof createMockOnboardingRepos>;

    beforeEach(() => {
      recruitmentRepos = createMockRecruitmentRepos();
      onboardingRepos = createMockOnboardingRepos();
      onboardingService = new OnboardingService(
        onboardingRepos.onboardingRepository,
        onboardingRepos.documentRepository,
        onboardingRepos.verificationRepository,
        onboardingRepos.provisioningRepository,
        recruitmentRepos.offerRepository,
        recruitmentRepos.candidateRepository,
      );

      recruitmentRepos.candidateRepository.create({
        id: "cand-1",
        organizationId: ORG,
        candidateNumber: "C100",
        legalName: { givenName: "Pat", familyName: "Kim" },
        email: "pat@example.com",
        status: "hired",
        source: "direct",
        skills: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });
      recruitmentRepos.offerRepository.create({
        id: "offer-1",
        organizationId: ORG,
        candidateId: "cand-1",
        applicationId: "app-1",
        status: "accepted",
        joiningDate: "2026-08-01",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      });
    });

    it("starts onboarding with tasks and provisioning", () => {
      const process = onboardingService.startProcess(
        { candidateId: "cand-1", offerId: "offer-1", joiningDate: "2026-08-01" },
        CONTEXT,
      );
      expect(process.status).toBe("pre_joining");
      expect(onboardingRepos.tasks.length).toBeGreaterThan(0);
      expect(onboardingRepos.provisioning.length).toBeGreaterThan(0);
    });

    it("determines activation readiness", () => {
      const process = onboardingService.startProcess(
        { candidateId: "cand-1", offerId: "offer-1", joiningDate: "2026-08-01" },
        CONTEXT,
      );
      onboardingService.advanceToInProgress(process.id, CONTEXT);

      for (const task of onboardingRepos.tasks.filter((t) => t.processId === process.id)) {
        onboardingService.completeTask(process.id, task.taskCode, CONTEXT);
      }
      for (const prov of onboardingRepos.provisioning.filter((t) => t.processId === process.id)) {
        onboardingService.completeProvisioningTask(process.id, prov.provisioningType, CONTEXT);
      }

      const doc = onboardingService.uploadDocument(
        {
          processId: process.id,
          documentType: "identity",
          categoryCode: "ID_PROOF",
          title: "Passport",
          documentRef: "ref-1",
        },
        CONTEXT,
      );
      onboardingService.verifyDocument({ documentId: doc.id, approved: true }, CONTEXT);

      expect(onboardingService.determineActivationReadiness(process.id, CONTEXT)).toBe(true);
    });
  });
});

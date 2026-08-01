import type { ServiceContext } from "@/types/services";
import type {
  ApplicationRecord,
  ApplicationStatus,
  CandidateRecord,
  CandidateStatus,
  OfferRecord,
  OfferStatus,
} from "@/types/hcm-recruitment";
import {
  createApplicationId,
  createCandidateId,
  createOfferId,
} from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { RecruitmentRulesEngine } from "@/lib/hcm/recruitment/RecruitmentRulesEngine";
import type {
  ApplicationRepository,
  CandidateRepository,
  OfferRepository,
  RecruitmentRepository,
} from "@/lib/hcm/recruitment/repositories/RecruitmentRepository";

export type RegisterCandidateInput = {
  readonly candidateNumber: string;
  readonly legalName: CandidateRecord["legalName"];
  readonly email: string;
  readonly source: CandidateRecord["source"];
  readonly skills?: readonly string[];
};

export type CreateApplicationInput = {
  readonly candidateId: string;
  readonly recruitmentRequestId: string;
  readonly positionId?: string;
};

export type CreateOfferInput = {
  readonly candidateId: string;
  readonly applicationId: string;
  readonly positionId?: string;
  readonly departmentId?: string;
  readonly joiningDate: string;
};

export type ScheduleInterviewInput = {
  readonly applicationId: string;
};

export class RecruitmentService {
  private readonly rules = new RecruitmentRulesEngine();

  constructor(
    private readonly recruitmentRepository: RecruitmentRepository,
    private readonly candidateRepository: CandidateRepository,
    private readonly applicationRepository: ApplicationRepository,
    private readonly offerRepository: OfferRepository,
  ) {}

  registerCandidate(input: RegisterCandidateInput, context: ServiceContext): CandidateRecord {
    const organizationId = context.organizationId;
    this.rules.assertValidEmail(input.email);
    this.rules.assertValidName(input.legalName.givenName, input.legalName.familyName);

    const duplicate = this.candidateRepository.findByNumber(
      organizationId,
      input.candidateNumber,
    );
    if (duplicate) throw new Error("DUPLICATE_CANDIDATE_NUMBER");

    const now = nowIso();
    const candidate: CandidateRecord = {
      id: createCandidateId(),
      organizationId,
      candidateNumber: input.candidateNumber,
      legalName: input.legalName,
      email: input.email,
      status: "registered",
      source: input.source,
      skills: input.skills ?? [],
      createdAt: now,
      updatedAt: now,
    };

    return this.candidateRepository.create(candidate);
  }

  activateCandidate(candidateId: string, context: ServiceContext): CandidateRecord {
    return this.transitionCandidate(candidateId, "active", context);
  }

  withdrawCandidate(candidateId: string, context: ServiceContext): CandidateRecord {
    return this.transitionCandidate(candidateId, "withdrawn", context);
  }

  createApplication(input: CreateApplicationInput, context: ServiceContext): ApplicationRecord {
    const organizationId = context.organizationId;
    const candidate = this.candidateRepository.findById(organizationId, input.candidateId);
    if (!candidate) throw new Error("CANDIDATE_NOT_FOUND");
    if (candidate.status === "withdrawn" || candidate.status === "archived") {
      throw new Error("CANDIDATE_NOT_ELIGIBLE");
    }

    const now = nowIso();
    const application: ApplicationRecord = {
      id: createApplicationId(),
      organizationId,
      candidateId: input.candidateId,
      recruitmentRequestId: input.recruitmentRequestId,
      positionId: input.positionId,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    return this.applicationRepository.create(application);
  }

  submitApplication(applicationId: string, context: ServiceContext): ApplicationRecord {
    return this.transitionApplication(applicationId, "submitted", context);
  }

  startScreening(applicationId: string, context: ServiceContext): ApplicationRecord {
    return this.transitionApplication(applicationId, "screening", context);
  }

  scheduleInterview(input: ScheduleInterviewInput, context: ServiceContext): ApplicationRecord {
    const organizationId = context.organizationId;
    const application = this.applicationRepository.findById(
      organizationId,
      input.applicationId,
    );
    if (!application) throw new Error("APPLICATION_NOT_FOUND");

    this.rules.assertApplicationTransition(application.status, "interviewing");
    return this.transitionApplication(input.applicationId, "interviewing", context);
  }

  completeInterview(applicationId: string, context: ServiceContext): ApplicationRecord {
    const organizationId = context.organizationId;
    const application = this.applicationRepository.findById(organizationId, applicationId);
    if (!application) throw new Error("APPLICATION_NOT_FOUND");
    if (application.status !== "interviewing") {
      throw new Error("APPLICATION_NOT_INTERVIEWING");
    }
    return application;
  }

  rejectApplication(applicationId: string, context: ServiceContext): ApplicationRecord {
    return this.transitionApplication(applicationId, "rejected", context);
  }

  withdrawApplication(applicationId: string, context: ServiceContext): ApplicationRecord {
    return this.transitionApplication(applicationId, "withdrawn", context);
  }

  createOffer(input: CreateOfferInput, context: ServiceContext): OfferRecord {
    const organizationId = context.organizationId;
    const application = this.applicationRepository.findById(
      organizationId,
      input.applicationId,
    );
    if (!application) throw new Error("APPLICATION_NOT_FOUND");
    if (application.candidateId !== input.candidateId) {
      throw new Error("CANDIDATE_APPLICATION_MISMATCH");
    }

    const now = nowIso();
    const offer: OfferRecord = {
      id: createOfferId(),
      organizationId,
      candidateId: input.candidateId,
      applicationId: input.applicationId,
      positionId: input.positionId,
      departmentId: input.departmentId,
      status: "draft",
      joiningDate: input.joiningDate,
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.offerRepository.create(offer);
    this.transitionApplication(input.applicationId, "offered", context);
    return saved;
  }

  submitOfferForApproval(offerId: string, context: ServiceContext): OfferRecord {
    return this.transitionOffer(offerId, "pending_approval", context);
  }

  acceptOffer(offerId: string, context: ServiceContext): OfferRecord {
    const organizationId = context.organizationId;
    const offer = this.requireOffer(organizationId, offerId);
    const saved = this.transitionOffer(offerId, "accepted", context);

    this.transitionApplication(offer.applicationId, "hired", context);
    this.transitionCandidate(offer.candidateId, "hired", context);
    return saved;
  }

  rejectOffer(offerId: string, context: ServiceContext): OfferRecord {
    return this.transitionOffer(offerId, "rejected", context);
  }

  withdrawOffer(offerId: string, context: ServiceContext): OfferRecord {
    return this.transitionOffer(offerId, "withdrawn", context);
  }

  getCandidate(candidateId: string, context: ServiceContext): CandidateRecord | null {
    return this.candidateRepository.findById(context.organizationId, candidateId);
  }

  getApplication(applicationId: string, context: ServiceContext): ApplicationRecord | null {
    return this.applicationRepository.findById(context.organizationId, applicationId);
  }

  getOffer(offerId: string, context: ServiceContext): OfferRecord | null {
    return this.offerRepository.findById(context.organizationId, offerId);
  }

  listApplicationsByCandidate(
    candidateId: string,
    context: ServiceContext,
  ): readonly ApplicationRecord[] {
    return this.applicationRepository.listByCandidate(context.organizationId, candidateId);
  }

  private transitionCandidate(
    candidateId: string,
    targetStatus: CandidateStatus,
    context: ServiceContext,
  ): CandidateRecord {
    const organizationId = context.organizationId;
    const existing = this.candidateRepository.findById(organizationId, candidateId);
    if (!existing) throw new Error("CANDIDATE_NOT_FOUND");

    this.rules.assertCandidateTransition(existing.status, targetStatus);

    const updated: CandidateRecord = {
      ...existing,
      status: targetStatus,
      updatedAt: nowIso(),
    };

    return this.candidateRepository.update(updated);
  }

  private transitionApplication(
    applicationId: string,
    targetStatus: ApplicationStatus,
    context: ServiceContext,
  ): ApplicationRecord {
    const organizationId = context.organizationId;
    const existing = this.applicationRepository.findById(organizationId, applicationId);
    if (!existing) throw new Error("APPLICATION_NOT_FOUND");

    this.rules.assertApplicationTransition(existing.status, targetStatus);

    const updated: ApplicationRecord = {
      ...existing,
      status: targetStatus,
      updatedAt: nowIso(),
    };

    return this.applicationRepository.update(updated);
  }

  private transitionOffer(
    offerId: string,
    targetStatus: OfferStatus,
    context: ServiceContext,
  ): OfferRecord {
    const organizationId = context.organizationId;
    const existing = this.requireOffer(organizationId, offerId);
    this.rules.assertOfferTransition(existing.status, targetStatus);

    const updated: OfferRecord = {
      ...existing,
      status: targetStatus,
      updatedAt: nowIso(),
    };

    return this.offerRepository.update(updated);
  }

  private requireOffer(organizationId: string, offerId: string): OfferRecord {
    const offer =
      this.offerRepository.findById(organizationId, offerId) ??
      this.recruitmentRepository.findOffer(organizationId, offerId);
    if (!offer) throw new Error("OFFER_NOT_FOUND");
    return offer;
  }
}

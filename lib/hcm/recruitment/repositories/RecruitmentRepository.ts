import type {
  ApplicationRecord,
  CandidateRecord,
  OfferRecord,
} from "@/types/hcm-recruitment";

/** Recruitment repository contract (P-012.4). */
export type RecruitmentRepository = {
  readonly domain: "hcm";
  findCandidate(organizationId: string, candidateId: string): CandidateRecord | null;
  findOffer(organizationId: string, offerId: string): OfferRecord | null;
  findApplication(organizationId: string, applicationId: string): ApplicationRecord | null;
  listOffersByCandidate(organizationId: string, candidateId: string): readonly OfferRecord[];
};

/** Candidate repository contract (P-012.4). */
export type CandidateRepository = {
  readonly domain: "hcm";
  create(candidate: CandidateRecord): CandidateRecord;
  update(candidate: CandidateRecord): CandidateRecord;
  findById(organizationId: string, candidateId: string): CandidateRecord | null;
  findByNumber(organizationId: string, candidateNumber: string): CandidateRecord | null;
};

/** Application repository contract (P-012.4). */
export type ApplicationRepository = {
  readonly domain: "hcm";
  create(application: ApplicationRecord): ApplicationRecord;
  update(application: ApplicationRecord): ApplicationRecord;
  findById(organizationId: string, applicationId: string): ApplicationRecord | null;
  listByCandidate(organizationId: string, candidateId: string): readonly ApplicationRecord[];
};

/** Offer repository contract (P-012.4). */
export type OfferRepository = {
  readonly domain: "hcm";
  create(offer: OfferRecord): OfferRecord;
  update(offer: OfferRecord): OfferRecord;
  findById(organizationId: string, offerId: string): OfferRecord | null;
  listByCandidate(organizationId: string, candidateId: string): readonly OfferRecord[];
};

/** Interview repository contract (P-012.4) — reserved for future expansion. */
export type InterviewRepository = {
  readonly domain: "hcm";
};

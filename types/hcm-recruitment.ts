/**
 * HCM Recruitment types (Mission P-012.4) — minimal surface for onboarding prerequisites.
 */

import type { PersonName } from "@/types/hcm-common";

export type CandidateNumber = string;

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "screening"
  | "interviewing"
  | "offered"
  | "hired"
  | "rejected"
  | "withdrawn";

export type OfferStatus = "draft" | "pending_approval" | "accepted" | "rejected" | "withdrawn";

export type CandidateStatus = "registered" | "active" | "hired" | "withdrawn" | "archived";

export type RecruitmentSource = "direct" | "referral" | "agency" | "job_board" | "internal";

export type CandidateRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly candidateNumber: CandidateNumber;
  readonly legalName: PersonName;
  readonly email: string;
  readonly status: CandidateStatus;
  readonly source: RecruitmentSource;
  readonly skills: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type OfferRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly candidateId: string;
  readonly applicationId: string;
  readonly positionId?: string;
  readonly departmentId?: string;
  readonly status: OfferStatus;
  readonly joiningDate: string;
  readonly workflowInstanceId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ApplicationRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly candidateId: string;
  readonly recruitmentRequestId: string;
  readonly positionId?: string;
  readonly status: ApplicationStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PublishHcmRecruitmentEventInput = {
  readonly eventType:
    | "CandidateRegistered"
    | "CandidateCreated"
    | "ApplicationSubmitted"
    | "InterviewScheduled"
    | "OfferCreated"
    | "OfferAccepted"
    | "CandidateHired";
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

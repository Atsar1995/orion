import type {
  ApplicationStatus,
  CandidateStatus,
  OfferStatus,
} from "@/types/hcm-recruitment";

const CANDIDATE_TRANSITIONS: Record<CandidateStatus, readonly CandidateStatus[]> = {
  registered: ["active", "withdrawn", "archived"],
  active: ["hired", "withdrawn", "archived"],
  hired: ["archived"],
  withdrawn: ["archived"],
  archived: [],
};

const APPLICATION_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  draft: ["submitted", "withdrawn"],
  submitted: ["screening", "rejected", "withdrawn"],
  screening: ["interviewing", "rejected", "withdrawn"],
  interviewing: ["offered", "rejected", "withdrawn"],
  offered: ["hired", "rejected", "withdrawn"],
  hired: [],
  rejected: [],
  withdrawn: [],
};

const OFFER_TRANSITIONS: Record<OfferStatus, readonly OfferStatus[]> = {
  draft: ["pending_approval", "withdrawn"],
  pending_approval: ["accepted", "rejected", "withdrawn"],
  accepted: [],
  rejected: [],
  withdrawn: [],
};

export class RecruitmentRulesEngine {
  assertCandidateTransition(from: CandidateStatus, to: CandidateStatus): void {
    if (from === to) return;
    if (!CANDIDATE_TRANSITIONS[from].includes(to)) {
      throw new Error("INVALID_CANDIDATE_STATUS_TRANSITION");
    }
  }

  assertApplicationTransition(from: ApplicationStatus, to: ApplicationStatus): void {
    if (from === to) return;
    if (!APPLICATION_TRANSITIONS[from].includes(to)) {
      throw new Error("INVALID_APPLICATION_STATUS_TRANSITION");
    }
  }

  assertOfferTransition(from: OfferStatus, to: OfferStatus): void {
    if (from === to) return;
    if (!OFFER_TRANSITIONS[from].includes(to)) {
      throw new Error("INVALID_OFFER_STATUS_TRANSITION");
    }
  }

  assertValidEmail(email: string): void {
    if (!email.trim() || !email.includes("@")) {
      throw new Error("INVALID_CANDIDATE_EMAIL");
    }
  }

  assertValidName(givenName: string, familyName: string): void {
    if (!givenName.trim() || !familyName.trim()) {
      throw new Error("INVALID_CANDIDATE_NAME");
    }
  }
}

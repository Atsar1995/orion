import type {
  ApplicationRecord,
  CandidateRecord,
  OfferRecord,
} from "@/types/hcm-recruitment";
import type {
  ApplicationRepository,
  CandidateRepository,
  InterviewRepository,
  OfferRepository,
  RecruitmentRepository,
} from "@/lib/hcm/recruitment/repositories/RecruitmentRepository";
import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";

export class InMemoryRecruitmentRepository implements RecruitmentRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  findCandidate(organizationId: string, candidateId: string): CandidateRecord | null {
    const record = this.store.candidates.get(candidateId);
    return record?.organizationId === organizationId ? record : null;
  }

  findOffer(organizationId: string, offerId: string): OfferRecord | null {
    const record = this.store.offers.get(offerId);
    return record?.organizationId === organizationId ? record : null;
  }

  findApplication(organizationId: string, applicationId: string): ApplicationRecord | null {
    const record = this.store.applications.get(applicationId);
    return record?.organizationId === organizationId ? record : null;
  }

  listOffersByCandidate(organizationId: string, candidateId: string): readonly OfferRecord[] {
    return [...this.store.offers.values()]
      .filter((record) => record.organizationId === organizationId && record.candidateId === candidateId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export class InMemoryCandidateRepository implements CandidateRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(candidate: CandidateRecord): CandidateRecord {
    this.store.candidates.set(candidate.id, candidate);
    return candidate;
  }

  update(candidate: CandidateRecord): CandidateRecord {
    this.store.candidates.set(candidate.id, candidate);
    return candidate;
  }

  findById(organizationId: string, candidateId: string): CandidateRecord | null {
    const record = this.store.candidates.get(candidateId);
    return record?.organizationId === organizationId ? record : null;
  }

  findByNumber(organizationId: string, candidateNumber: string): CandidateRecord | null {
    for (const record of this.store.candidates.values()) {
      if (record.organizationId === organizationId && record.candidateNumber === candidateNumber) {
        return record;
      }
    }
    return null;
  }
}

export class InMemoryApplicationRepository implements ApplicationRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(application: ApplicationRecord): ApplicationRecord {
    this.store.applications.set(application.id, application);
    return application;
  }

  update(application: ApplicationRecord): ApplicationRecord {
    this.store.applications.set(application.id, application);
    return application;
  }

  findById(organizationId: string, applicationId: string): ApplicationRecord | null {
    const record = this.store.applications.get(applicationId);
    return record?.organizationId === organizationId ? record : null;
  }

  listByCandidate(organizationId: string, candidateId: string): readonly ApplicationRecord[] {
    return [...this.store.applications.values()]
      .filter((record) => record.organizationId === organizationId && record.candidateId === candidateId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export class InMemoryOfferRepository implements OfferRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(offer: OfferRecord): OfferRecord {
    this.store.offers.set(offer.id, offer);
    return offer;
  }

  update(offer: OfferRecord): OfferRecord {
    this.store.offers.set(offer.id, offer);
    return offer;
  }

  findById(organizationId: string, offerId: string): OfferRecord | null {
    const record = this.store.offers.get(offerId);
    return record?.organizationId === organizationId ? record : null;
  }

  listByCandidate(organizationId: string, candidateId: string): readonly OfferRecord[] {
    return [...this.store.offers.values()]
      .filter((record) => record.organizationId === organizationId && record.candidateId === candidateId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

/** Reserved stub — satisfies interface contract for future interview persistence. */
export class InMemoryInterviewRepository implements InterviewRepository {
  readonly domain = "hcm" as const;
}

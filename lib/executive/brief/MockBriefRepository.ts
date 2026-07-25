import { buildMockMorningBriefView } from "@/lib/executive/brief/mock-brief-data";
import type { BriefRepository } from "@/lib/executive/brief/BriefRepository";
import type { BriefView } from "@/types/executive";

type MockBriefRepositoryOptions = {
  brief?: BriefView;
  shouldFail?: boolean;
  delayMs?: number;
};

/** Mock repository for Sprint 6 — swap for OrchestratorBriefRepository in Sprint 9+. */
export class MockBriefRepository implements BriefRepository {
  private readonly brief: BriefView;
  private readonly shouldFail: boolean;
  private readonly delayMs: number;

  constructor(options: MockBriefRepositoryOptions = {}) {
    this.brief = options.brief ?? buildMockMorningBriefView();
    this.shouldFail = options.shouldFail ?? false;
    this.delayMs = options.delayMs ?? 0;
  }

  async getBriefView(): Promise<BriefView> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    if (this.shouldFail) {
      throw new Error("Morning Executive Brief is temporarily unavailable.");
    }

    return this.brief;
  }
}

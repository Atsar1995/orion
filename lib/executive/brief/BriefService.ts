import type { BriefRepository } from "@/lib/executive/brief/BriefRepository";
import { mapDashboardSnapshotToBriefView } from "@/lib/executive/brief/map-dashboard-to-brief";
import { MockBriefRepository } from "@/lib/executive/brief/MockBriefRepository";
import { getDashboardSnapshot } from "@/lib/orchestrator/Orchestrator";
import type { BriefView } from "@/types/executive";

/** Future live repository — orchestrator-fed, no direct provider coupling in UI. */
export class OrchestratorBriefRepository implements BriefRepository {
  async getBriefView(): Promise<BriefView> {
    const snapshot = await getDashboardSnapshot();
    return mapDashboardSnapshotToBriefView(snapshot);
  }
}

export class BriefService {
  constructor(private readonly repository: BriefRepository) {}

  async getMorningBrief(): Promise<BriefView> {
    return this.repository.getBriefView();
  }
}

export function createBriefService(repository?: BriefRepository): BriefService {
  return new BriefService(repository ?? new MockBriefRepository());
}

/** Default EC-001 service — mock repository until live integration (Sprint 9+). */
export const briefService = createBriefService();

export async function getMorningExecutiveBrief(): Promise<BriefView> {
  return briefService.getMorningBrief();
}

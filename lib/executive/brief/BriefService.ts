import type { BriefRepository } from "@/lib/executive/brief/BriefRepository";
import { mapDashboardSnapshotToBriefView } from "@/lib/executive/brief/map-dashboard-to-brief";
import { mapIntelligenceBusToBriefView } from "@/lib/executive/brief/map-intelligence-bus-to-brief";
import { getDashboardSnapshot } from "@/lib/orchestrator/Orchestrator";
import type { BriefView } from "@/types/executive";

/** Future live repository — orchestrator-fed, no direct provider coupling in UI. */
export class OrchestratorBriefRepository implements BriefRepository {
  async getBriefView(): Promise<BriefView> {
    const snapshot = await getDashboardSnapshot();
    return mapDashboardSnapshotToBriefView(snapshot);
  }
}

/** Live repository — Intelligence Bus with CRM and Finance executive providers (Mission 16A.7). */
export class IntelligenceBusBriefRepository implements BriefRepository {
  async getBriefView(executiveName?: string): Promise<BriefView> {
    return mapIntelligenceBusToBriefView(executiveName);
  }
}

export class BriefService {
  constructor(private readonly repository: BriefRepository) {}

  async getMorningBrief(executiveName?: string): Promise<BriefView> {
    return this.repository.getBriefView(executiveName);
  }
}

export function createBriefService(repository?: BriefRepository): BriefService {
  return new BriefService(repository ?? new IntelligenceBusBriefRepository());
}

/** Default EC-001 service — Intelligence Bus with CRM executive contribution. */
export const briefService = createBriefService();

export async function getMorningExecutiveBrief(executiveName?: string): Promise<BriefView> {
  return briefService.getMorningBrief(executiveName);
}

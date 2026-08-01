export type { BriefRepository } from "@/lib/executive/brief/BriefRepository";
export {
  BriefService,
  IntelligenceBusBriefRepository,
  OrchestratorBriefRepository,
  briefService,
  createBriefService,
  getMorningExecutiveBrief,
} from "@/lib/executive/brief/BriefService";
export { mapDashboardSnapshotToBriefView } from "@/lib/executive/brief/map-dashboard-to-brief";
export { mapIntelligenceBusToBriefView } from "@/lib/executive/brief/map-intelligence-bus-to-brief";
export { composeExecutiveBriefV1 } from "@/lib/executive/brief/compose-executive-brief-v1";
export {
  MOCK_MORNING_BRIEF_VIEW,
  buildMockMorningBriefView,
} from "@/lib/executive/brief/mock-brief-data";
export { MockBriefRepository } from "@/lib/executive/brief/MockBriefRepository";

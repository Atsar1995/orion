export type { BriefRepository } from "@/lib/executive/brief/BriefRepository";
export {
  BriefService,
  OrchestratorBriefRepository,
  briefService,
  createBriefService,
  getMorningExecutiveBrief,
} from "@/lib/executive/brief/BriefService";
export { mapDashboardSnapshotToBriefView } from "@/lib/executive/brief/map-dashboard-to-brief";
export {
  MOCK_MORNING_BRIEF_VIEW,
  buildMockMorningBriefView,
} from "@/lib/executive/brief/mock-brief-data";
export { MockBriefRepository } from "@/lib/executive/brief/MockBriefRepository";

import { describe, expect, it } from "vitest";
import {
  BriefService,
  MockBriefRepository,
  OrchestratorBriefRepository,
  createBriefService,
  mapDashboardSnapshotToBriefView,
} from "@/lib/executive/brief";
import { mockDashboardSnapshot } from "../../fixtures/dashboard-snapshot";
import { mockBriefView } from "../../fixtures/brief-view";

describe("BriefService", () => {
  it("returns mock morning brief from default service", async () => {
    const service = createBriefService(new MockBriefRepository({ brief: mockBriefView }));
    const brief = await service.getMorningBrief();

    expect(brief.id).toBe(mockBriefView.id);
    expect(brief.greeting.executiveName).toBeTruthy();
    expect(brief.businessHealth.score).toBeGreaterThan(0);
    expect(brief.recommendations.length).toBeGreaterThan(0);
  });

  it("propagates repository failures", async () => {
    const service = new BriefService(new MockBriefRepository({ shouldFail: true }));

    await expect(service.getMorningBrief()).rejects.toThrow(
      "Morning Executive Brief is temporarily unavailable.",
    );
  });
});

describe("mapDashboardSnapshotToBriefView", () => {
  it("maps orchestrator snapshot into EC-001 brief view", () => {
    const brief = mapDashboardSnapshotToBriefView(mockDashboardSnapshot);

    expect(brief.businessHealth.score).toBe(mockDashboardSnapshot.businessHealth.score);
    expect(brief.criticalAlerts).toHaveLength(
      mockDashboardSnapshot.alertPanel.critical.length,
    );
    expect(brief.recommendations[0]?.title).toBe(
      mockDashboardSnapshot.recommendations[0]?.title,
    );
    expect(brief.priorities[0]?.title).toBe(mockDashboardSnapshot.tasks[0]?.title);
  });
});

describe("OrchestratorBriefRepository", () => {
  it("implements BriefRepository contract", () => {
    expect(new OrchestratorBriefRepository().getBriefView).toBeTypeOf("function");
  });
});

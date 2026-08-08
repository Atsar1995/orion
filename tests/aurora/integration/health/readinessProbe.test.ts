import { describe, expect, it } from "vitest";
import { createTestAuroraWiring } from "@/lib/aurora/wiring/createTestAuroraWiring";
import { runAuroraReadinessProbes } from "@/lib/aurora/platform/registerAuroraReadinessProbe";

describe("Aurora readiness probe", () => {
  it("registers aurora.platform probe during wiring", async () => {
    createTestAuroraWiring();
    const probes = await runAuroraReadinessProbes();
    expect(probes.some((probe) => probe.name === "aurora.platform")).toBe(true);
  });
});

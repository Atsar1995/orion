import { describe, expect, it } from "vitest";
import {
  buildHealthReport,
  createErrorResult,
  createProviderHealth,
  createSuccessResult,
} from "@/lib/providers/ProviderHealth";
import { CRMProvider } from "@/lib/providers/MockProvider";

describe("ProviderHealth helpers", () => {
  it("creates provider health with status and timestamp", () => {
    const health = createProviderHealth("connected", true, "Operational");

    expect(health.status).toBe("connected");
    expect(health.healthy).toBe(true);
    expect(health.message).toBe("Operational");
    expect(health.lastCheckedAt).toBeTruthy();
  });

  it("creates success and error result envelopes", () => {
    const success = createSuccessResult("crm", { connected: true });
    const error = createErrorResult("crm", "Failed");

    expect(success.success).toBe(true);
    expect(success.providerId).toBe("crm");
    expect(error.success).toBe(false);
    expect(error.error).toBe("Failed");
  });

  it("builds aggregated health report for providers", async () => {
    const provider = new CRMProvider();
    await provider.connect();

    const report = await buildHealthReport([provider]);

    expect(report.total).toBe(1);
    expect(report.healthy).toBe(1);
    expect(report.providers[0]?.id).toBe("crm");
  });
});

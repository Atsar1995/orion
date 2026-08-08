import { describe, expect, it } from "vitest";
import {
  AuroraRuntimeConfiguration,
  validateAuroraConfig,
} from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";

describe("AuroraRuntimeConfiguration", () => {
  it("loads test configuration", () => {
    const config = AuroraRuntimeConfiguration.forTest();
    expect(config.environment).toBe("test");
    expect(config.enabled).toBe(true);
  });

  it("requires redis when enabled in production", () => {
    const result = validateAuroraConfig({
      ...AuroraRuntimeConfiguration.forTest(),
      environment: "production",
      enabled: true,
      redisUrl: "",
    });
    expect(result.valid).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  describeGA4Config,
  isGoogleAnalyticsConfigured,
  loadGA4Config,
  validateGA4Config,
} from "@/lib/providers/google-analytics/GA4Config";
import { ga4EnvVars, testGA4Config } from "@/tests/fixtures/ga4";

describe("GA4Config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects when all required GA4 env vars are present", () => {
    for (const [key, value] of Object.entries(ga4EnvVars)) {
      vi.stubEnv(key, value);
    }

    expect(isGoogleAnalyticsConfigured()).toBe(true);
  });

  it("detects missing GA4 env vars", () => {
    vi.stubEnv("GOOGLE_ANALYTICS_CLIENT_ID", "client");

    expect(isGoogleAnalyticsConfigured()).toBe(false);
  });

  it("validates a complete GA4 configuration", () => {
    for (const [key, value] of Object.entries(ga4EnvVars)) {
      vi.stubEnv(key, value);
    }

    const validation = validateGA4Config();

    expect(validation.valid).toBe(true);
    expect(validation.config).toMatchObject({
      clientId: testGA4Config.clientId,
      propertyId: testGA4Config.propertyId,
    });
  });

  it("reports missing env keys during validation", () => {
    const validation = validateGA4Config();

    expect(validation.valid).toBe(false);
    expect(validation.missing).toContain("GOOGLE_ANALYTICS_CLIENT_ID");
  });

  it("rejects non-numeric property IDs", () => {
    for (const [key, value] of Object.entries(ga4EnvVars)) {
      vi.stubEnv(key, value);
    }
    vi.stubEnv("GOOGLE_ANALYTICS_PROPERTY_ID", "property-abc");

    const validation = validateGA4Config();

    expect(validation.valid).toBe(false);
    expect(validation.missing[0]).toContain("numeric");
  });

  it("loads GA4 config from env and throws when invalid", () => {
    for (const [key, value] of Object.entries(ga4EnvVars)) {
      vi.stubEnv(key, value);
    }

    expect(loadGA4Config()).toMatchObject({ propertyId: testGA4Config.propertyId });
    expect(() => loadGA4Config()).not.toThrow();

    vi.unstubAllEnvs();
    expect(() => loadGA4Config()).toThrow(/GA4 configuration invalid/);
  });

  it("uses numeric overrides and falls back for invalid optional values", () => {
    for (const [key, value] of Object.entries(ga4EnvVars)) {
      vi.stubEnv(key, value);
    }
    vi.stubEnv("GOOGLE_ANALYTICS_CACHE_TTL_MS", "120000");
    vi.stubEnv("GOOGLE_ANALYTICS_MAX_RETRIES", "not-a-number");
    vi.stubEnv("GOOGLE_ANALYTICS_REQUEST_TIMEOUT_MS", "0");

    const config = loadGA4Config();

    expect(config.cacheTtlMs).toBe(120_000);
    expect(config.maxRetries).toBe(3);
    expect(config.requestTimeoutMs).toBe(30_000);
  });

  it("describes config without exposing secrets", () => {
    const summary = describeGA4Config(testGA4Config);

    expect(summary).toContain("property=123456789");
    expect(summary).not.toContain(testGA4Config.clientSecret);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GA4Cache } from "@/lib/providers/google-analytics/GA4Cache";
import { createTestSnapshot, testGA4Config } from "@/tests/fixtures/ga4";

describe("GA4Cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and retrieves values before TTL expiry", () => {
    const cache = new GA4Cache(60_000);

    cache.set("key", "value");
    vi.advanceTimersByTime(30_000);

    expect(cache.get<string>("key")).toBe("value");
  });

  it("expires values after TTL", () => {
    const cache = new GA4Cache(1_000);

    cache.set("key", "value");
    vi.advanceTimersByTime(1_001);

    expect(cache.get<string>("key")).toBeUndefined();
  });

  it("invalidates a single key or the entire cache", () => {
    const cache = new GA4Cache(60_000);
    cache.set("one", 1);
    cache.set("two", 2);

    cache.invalidate("one");
    expect(cache.get("one")).toBeUndefined();
    expect(cache.get("two")).toBe(2);

    cache.invalidate();
    expect(cache.get("two")).toBeUndefined();
  });

  it("stores GA4 snapshots by property ID", () => {
    const cache = new GA4Cache(60_000);
    const snapshot = createTestSnapshot();

    cache.setSnapshot(testGA4Config.propertyId, snapshot);

    expect(cache.snapshotKey(testGA4Config.propertyId)).toBe(
      `ga4:snapshot:${testGA4Config.propertyId}`,
    );
    expect(cache.getSnapshot(testGA4Config.propertyId)).toEqual(snapshot);
  });

  it("supports custom TTL per entry", () => {
    const cache = new GA4Cache(60_000);

    cache.set("short-lived", "value", 500);
    vi.advanceTimersByTime(501);

    expect(cache.get("short-lived")).toBeUndefined();
  });
});

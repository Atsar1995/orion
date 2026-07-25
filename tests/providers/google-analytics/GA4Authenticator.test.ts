import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GA4Authenticator } from "@/lib/providers/google-analytics/GA4Authenticator";
import { createOAuthTokenResponse, testGA4Config } from "@/tests/fixtures/ga4";

describe("GA4Authenticator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("refreshes an OAuth access token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOAuthTokenResponse("fresh-token"));
    vi.stubGlobal("fetch", fetchMock);
    const authenticator = new GA4Authenticator(testGA4Config);

    await expect(authenticator.getAccessToken()).resolves.toBe("fresh-token");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://oauth2.googleapis.com/token",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("reuses cached tokens until near expiry", async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOAuthTokenResponse("cached-token"));
    vi.stubGlobal("fetch", fetchMock);
    const authenticator = new GA4Authenticator(testGA4Config);

    await authenticator.getAccessToken();
    vi.advanceTimersByTime(30_000);
    await authenticator.getAccessToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes again after invalidating the cached token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createOAuthTokenResponse("first-token"))
      .mockResolvedValueOnce(createOAuthTokenResponse("second-token"));
    vi.stubGlobal("fetch", fetchMock);
    const authenticator = new GA4Authenticator(testGA4Config);

    await authenticator.getAccessToken();
    authenticator.invalidateToken();
    await expect(authenticator.refreshAccessToken()).resolves.toBe("second-token");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws when OAuth refresh fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("invalid_grant", { status: 400 })),
    );
    const authenticator = new GA4Authenticator(testGA4Config);

    await expect(authenticator.refreshAccessToken()).rejects.toThrow(/OAuth token refresh failed/);
  });

  it("throws when OAuth response omits access_token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ expires_in: 3600 }), { status: 200 })),
    );
    const authenticator = new GA4Authenticator(testGA4Config);

    await expect(authenticator.refreshAccessToken()).rejects.toThrow(/no access_token/);
  });
});

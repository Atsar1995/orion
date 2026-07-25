import type { GA4Config, GA4OAuthTokenResponse } from "@/types/google-analytics";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

/** OAuth2 authenticator for the GA4 Data API using refresh-token flow. */
export class GA4Authenticator {
  private cachedToken: CachedToken | null = null;

  constructor(private readonly config: GA4Config) {}

  async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - 60_000) {
      return this.cachedToken.accessToken;
    }

    return this.refreshAccessToken();
  }

  async refreshAccessToken(): Promise<string> {
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: this.config.refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(this.config.requestTimeoutMs),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`GA4 OAuth token refresh failed (${response.status}): ${detail}`);
    }

    const payload = (await response.json()) as GA4OAuthTokenResponse;

    if (!payload.access_token) {
      throw new Error("GA4 OAuth token refresh returned no access_token");
    }

    this.cachedToken = {
      accessToken: payload.access_token,
      expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
    };

    return payload.access_token;
  }

  invalidateToken(): void {
    this.cachedToken = null;
  }
}

import type { GA4Config, GA4ConfigValidation } from "@/types/google-analytics";

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

const REQUIRED_ENV_KEYS = [
  "GOOGLE_ANALYTICS_CLIENT_ID",
  "GOOGLE_ANALYTICS_CLIENT_SECRET",
  "GOOGLE_ANALYTICS_REFRESH_TOKEN",
  "GOOGLE_ANALYTICS_PROPERTY_ID",
] as const;

function readEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function readPositiveInt(key: string, fallback: number): number {
  const raw = readEnv(key);
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Returns true when all required GA4 credentials are present in the environment. */
export function isGoogleAnalyticsConfigured(): boolean {
  return REQUIRED_ENV_KEYS.every((key) => Boolean(readEnv(key)));
}

/** Loads GA4 configuration from environment variables. Throws when required values are missing. */
export function loadGA4Config(): GA4Config {
  const validation = validateGA4Config();

  if (!validation.valid || !validation.config) {
    throw new Error(
      `GA4 configuration invalid — missing: ${validation.missing.join(", ") || "unknown"}`,
    );
  }

  return validation.config;
}

/** Validates GA4 environment configuration without throwing. */
export function validateGA4Config(): GA4ConfigValidation {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !readEnv(key));

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  const clientId = readEnv("GOOGLE_ANALYTICS_CLIENT_ID")!;
  const clientSecret = readEnv("GOOGLE_ANALYTICS_CLIENT_SECRET")!;
  const refreshToken = readEnv("GOOGLE_ANALYTICS_REFRESH_TOKEN")!;
  const propertyId = readEnv("GOOGLE_ANALYTICS_PROPERTY_ID")!;

  if (!/^\d+$/.test(propertyId)) {
    return {
      valid: false,
      missing: ["GOOGLE_ANALYTICS_PROPERTY_ID (must be numeric GA4 property ID)"],
    };
  }

  return {
    valid: true,
    missing: [],
    config: {
      clientId,
      clientSecret,
      refreshToken,
      propertyId,
      cacheTtlMs: readPositiveInt("GOOGLE_ANALYTICS_CACHE_TTL_MS", DEFAULT_CACHE_TTL_MS),
      maxRetries: readPositiveInt("GOOGLE_ANALYTICS_MAX_RETRIES", DEFAULT_MAX_RETRIES),
      requestTimeoutMs: readPositiveInt(
        "GOOGLE_ANALYTICS_REQUEST_TIMEOUT_MS",
        DEFAULT_REQUEST_TIMEOUT_MS,
      ),
    },
  };
}

/** Redacted config summary safe for logs and health messages. */
export function describeGA4Config(config: GA4Config): string {
  return `property=${config.propertyId}, cacheTtlMs=${config.cacheTtlMs}, maxRetries=${config.maxRetries}`;
}

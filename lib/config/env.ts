/**
 * ORION environment configuration validation (Mission S1D).
 * Validates required and recommended variables at startup.
 */

export type EnvValidationIssue = {
  readonly key: string;
  readonly level: "error" | "warning";
  readonly message: string;
};

export type EnvValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly EnvValidationIssue[];
  readonly nodeEnv: string;
  readonly isProduction: boolean;
};

function readEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

/** Validates ORION environment variables for the current runtime. */
export function validateEnvironment(): EnvValidationResult {
  const issues: EnvValidationIssue[] = [];
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const isProduction = nodeEnv === "production";

  const sessionSecret = readEnv("ORION_SESSION_SECRET");
  const demoPassword = readEnv("ORION_DEMO_PASSWORD");

  if (isProduction && !sessionSecret) {
    issues.push({
      key: "ORION_SESSION_SECRET",
      level: "error",
      message: "Required in production. Set a strong random secret.",
    });
  }

  if (
    isProduction &&
    sessionSecret &&
    sessionSecret === "orion-dev-session-secret-change-in-production"
  ) {
    issues.push({
      key: "ORION_SESSION_SECRET",
      level: "error",
      message: "Default development secret must not be used in production.",
    });
  }

  if (isProduction && demoPassword) {
    issues.push({
      key: "ORION_DEMO_PASSWORD",
      level: "warning",
      message: "Demo password is set in production — disable for commercial deployment.",
    });
  }

  if (!readEnv("ORION_SESSION_SECRET") && !isProduction) {
    issues.push({
      key: "ORION_SESSION_SECRET",
      level: "warning",
      message: "Using development default. Set ORION_SESSION_SECRET before production.",
    });
  }

  return {
    valid: !issues.some((issue) => issue.level === "error"),
    issues,
    nodeEnv,
    isProduction,
  };
}

/** Returns validated session secret or development fallback. */
export function getValidatedSessionSecret(): string {
  return readEnv("ORION_SESSION_SECRET") ?? "orion-dev-session-secret-change-in-production";
}

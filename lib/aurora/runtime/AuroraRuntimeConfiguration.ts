import {
  AURORA_BOOT_TIMEOUT_MS,
  AURORA_DEFAULT_MAX_AGENT_TOKENS,
  AURORA_SHUTDOWN_DRAIN_MS,
} from "@/lib/aurora/constants";
import type { BootPhase } from "@/types/aurora-platform";
import type { ConfigValidationResult } from "@/types/aurora-platform";
import type { EventBus } from "@/lib/platform/events/EventBus";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

export type AuroraEnvironment = "development" | "test" | "staging" | "production";

export type ShutdownDrainTimeouts = {
  readonly publish: number;
  readonly agent: number;
  readonly queue: number;
};

export interface AuroraRuntimeConfiguration {
  readonly enabled: boolean;
  readonly redisUrl: string;
  readonly storageBucket?: string;
  readonly aiProvider: string;
  readonly maxAgentTokensPerTenantDay: number;
  readonly bootPhaseTimeouts: Readonly<Record<BootPhase, number>>;
  readonly shutdownDrainTimeouts: ShutdownDrainTimeouts;
  readonly featureFlags: Readonly<Record<string, boolean>>;
  readonly logLevel: "error" | "warn" | "info" | "debug";
  readonly environment: AuroraEnvironment;
  readonly tracingEnabled: boolean;
}

export interface AuroraWiringConfig extends AuroraRuntimeConfiguration {
  readonly platformStore?: PlatformStore;
  readonly eventBus?: EventBus;
  readonly skipWorkers?: boolean;
  readonly skipExternalConnections?: boolean;
}

function readBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  return value === "true" || value === "1";
}

function readNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function resolveEnvironment(): AuroraEnvironment {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (nodeEnv === "test") {
    return "test";
  }
  if (nodeEnv === "production") {
    return "production";
  }
  if (process.env.AURORA_ENVIRONMENT === "staging") {
    return "staging";
  }
  return "development";
}

function defaultBootPhaseTimeouts(): Readonly<Record<BootPhase, number>> {
  const perPhase = Math.floor(AURORA_BOOT_TIMEOUT_MS / 11);
  return {
    0: perPhase,
    1: perPhase,
    2: perPhase,
    3: perPhase,
    4: perPhase,
    5: perPhase,
    6: perPhase,
    7: perPhase,
    8: perPhase,
    9: perPhase,
    10: perPhase,
  };
}

export function validateAuroraConfig(
  config: AuroraRuntimeConfiguration,
): ConfigValidationResult {
  const errors: string[] = [];

  if (config.enabled && !config.redisUrl && config.environment !== "test") {
    errors.push("AURORA_REDIS_URL required when AURORA_ENABLED=true");
  }

  if (
    config.enabled &&
    config.environment === "production" &&
    !config.storageBucket
  ) {
    errors.push("AURORA_STORAGE_BUCKET required in production");
  }

  return { valid: errors.length === 0, errors };
}

export const AuroraRuntimeConfiguration = {
  fromEnvironment(): AuroraRuntimeConfiguration {
    const environment = resolveEnvironment();
    return {
      enabled: readBoolean(process.env.AURORA_ENABLED, false),
      redisUrl: process.env.AURORA_REDIS_URL ?? "",
      storageBucket: process.env.AURORA_STORAGE_BUCKET,
      aiProvider: process.env.AURORA_AI_PROVIDER ?? "orion-default",
      maxAgentTokensPerTenantDay: readNumber(
        process.env.AURORA_MAX_AGENT_TOKENS,
        AURORA_DEFAULT_MAX_AGENT_TOKENS,
      ),
      bootPhaseTimeouts: defaultBootPhaseTimeouts(),
      shutdownDrainTimeouts: {
        publish: readNumber(process.env.AURORA_SHUTDOWN_DRAIN_MS, AURORA_SHUTDOWN_DRAIN_MS),
        agent: 15_000,
        queue: readNumber(process.env.AURORA_SHUTDOWN_DRAIN_MS, AURORA_SHUTDOWN_DRAIN_MS),
      },
      featureFlags: {
        "aurora.agents.enabled": readBoolean(process.env.AURORA_AGENTS_ENABLED, true),
        "aurora.publish.enabled": readBoolean(process.env.AURORA_PUBLISH_ENABLED, true),
      },
      logLevel: (process.env.AURORA_LOG_LEVEL as AuroraRuntimeConfiguration["logLevel"]) ?? "info",
      environment,
      tracingEnabled: readBoolean(process.env.AURORA_TRACING_ENABLED, false),
    };
  },

  forTest(overrides: Partial<AuroraRuntimeConfiguration> = {}): AuroraRuntimeConfiguration {
    return {
      enabled: true,
      redisUrl: "",
      aiProvider: "test",
      maxAgentTokensPerTenantDay: AURORA_DEFAULT_MAX_AGENT_TOKENS,
      bootPhaseTimeouts: defaultBootPhaseTimeouts(),
      shutdownDrainTimeouts: {
        publish: 1_000,
        agent: 1_000,
        queue: 1_000,
      },
      featureFlags: {},
      logLevel: "error",
      environment: "test",
      tracingEnabled: false,
      ...overrides,
    };
  },
};

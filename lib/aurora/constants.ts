/** Aurora platform constants (ES-AURORA-005 §8.6). */

export const AURORA_MODULE_KEY = "aurora";
export const AURORA_IIL_SERVICE_ID = "aurora.platform";
export const AURORA_API_PREFIX = "/api/aurora";
export const AURORA_UI_PREFIX = "/aurora";
export const AURORA_DEFAULT_LOCALE = "en-US";
export const AURORA_DEFAULT_TIMEZONE = "UTC";
export const AURORA_BOOT_TIMEOUT_MS = 12_000;
export const AURORA_SHUTDOWN_DRAIN_MS = 30_000;
export const AURORA_MAX_BRANDS_STARTER = 1;
export const AURORA_MAX_BRANDS_PROFESSIONAL = 5;
export const AURORA_FOUNDATION_VERSION = "A-007";
export const AURORA_PLATFORM_VERSION = "0.1.0-dp";

export const AURORA_DEFAULT_MAX_AGENT_TOKENS = 50_000;

export const AURORA_BOOT_PHASE_NAMES: Readonly<Record<number, string>> = {
  0: "ORION Platform Ready",
  1: "Configuration Load",
  2: "Infrastructure Connect",
  3: "Persistence Layer",
  4: "Knowledge & Memory",
  5: "Core Services",
  6: "Domain Modules",
  7: "Agent Runtime",
  8: "Execution Infra",
  9: "Facade & Integration",
  10: "Verification",
};

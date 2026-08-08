/**
 * Aurora public API surface (ES-AURORA-005 ER-1).
 * Import only from `@/lib/aurora`.
 */

export { AuroraFacade } from "./AuroraFacade";
export { createAuroraWiring, type AuroraWiring } from "./createAuroraWiring";
export { createTestAuroraWiring } from "./wiring/createTestAuroraWiring";
export { initializeAuroraModule } from "./runtime/initializeAuroraModule";
export type { AuroraRuntimeContext } from "./runtime/AuroraRuntimeContext";
export type { AuroraHealthReport, PlatformLifecycleState } from "./types";
export { AuroraError } from "./errors/AuroraError";
export { AURORA_MODULE_KEY, AURORA_IIL_SERVICE_ID } from "./constants";

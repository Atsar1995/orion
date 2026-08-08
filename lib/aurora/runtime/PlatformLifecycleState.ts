/** Aurora platform lifecycle states (A-005 · ES-AURORA-005). */

export type PlatformLifecycleState =
  | "created"
  | "initializing"
  | "ready"
  | "degraded"
  | "draining"
  | "shutdown"
  | "failed";

export const ACTIVE_LIFECYCLE_STATES: readonly PlatformLifecycleState[] = [
  "ready",
  "degraded",
] as const;

export function isActiveLifecycleState(state: PlatformLifecycleState): boolean {
  return ACTIVE_LIFECYCLE_STATES.includes(state);
}

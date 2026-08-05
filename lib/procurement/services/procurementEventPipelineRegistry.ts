/** Procurement event pipeline registry (Mission P-010.3 · P-010.6). */

export type ProcurementEventPipelineRegistryState = {
  readonly initialized: boolean;
  readonly canonicalPublisherReady: boolean;
  readonly backingOrganizationIds: () => readonly string[];
};

let registry: ProcurementEventPipelineRegistryState | null = null;

/** Registers the active Procurement event pipeline foundation state. */
export function setProcurementEventPipelineRegistry(
  state: ProcurementEventPipelineRegistryState,
): void {
  registry = state;
}

/** Returns the active Procurement event pipeline foundation state. */
export function getProcurementEventPipelineRegistry(): ProcurementEventPipelineRegistryState {
  if (!registry) {
    throw new Error("Procurement event pipeline registry is not initialized");
  }

  return registry;
}

/** Clears registry state — test isolation only. */
export function resetProcurementEventPipelineRegistryForTests(): void {
  registry = null;
}

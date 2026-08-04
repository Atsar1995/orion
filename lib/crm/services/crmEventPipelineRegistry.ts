/** CRM event pipeline registry placeholder (Mission P-008.9 · ADR-014 follow-up). */

export type CrmEventPipelineRegistryState = {
  readonly initialized: boolean;
  readonly backingOrganizationIds: () => readonly string[];
};

let registry: CrmEventPipelineRegistryState | null = null;

/** Registers the active CRM event pipeline foundation state. */
export function setCrmEventPipelineRegistry(state: CrmEventPipelineRegistryState): void {
  registry = state;
}

/** Returns the active CRM event pipeline foundation state. */
export function getCrmEventPipelineRegistry(): CrmEventPipelineRegistryState {
  if (!registry) {
    throw new Error("CRM event pipeline registry is not initialized");
  }

  return registry;
}

/** Clears registry state — test isolation only. */
export function resetCrmEventPipelineRegistryForTests(): void {
  registry = null;
}

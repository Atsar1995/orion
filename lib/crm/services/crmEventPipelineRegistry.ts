/** CRM event pipeline registry (Mission P-008.9 · P-008.14). */

export type CrmEventPipelineRegistryState = {
  readonly initialized: boolean;
  readonly canonicalPublisherReady: boolean;
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

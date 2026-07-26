/** Feature capability category for executive platform modules. */
export type PlatformFeatureCategory =
  | "executive"
  | "workspace"
  | "integration"
  | "intelligence"
  | "platform";

/** Metadata describing a registerable platform feature. */
export type PlatformFeatureDefinition = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: PlatformFeatureCategory;
  readonly enabledByDefault: boolean;
  readonly routeHref?: string;
};

/**
 * EP-001 feature registry contract.
 *
 * Registers platform capabilities without embedding business logic.
 */
export interface FeatureRegistry {
  register(definition: PlatformFeatureDefinition): void;
  get(id: string): PlatformFeatureDefinition | undefined;
  list(): readonly PlatformFeatureDefinition[];
  listByCategory(category: PlatformFeatureCategory): readonly PlatformFeatureDefinition[];
}

/** In-memory feature registry scaffold for EP-001 — metadata only. */
export class InMemoryFeatureRegistry implements FeatureRegistry {
  private readonly features = new Map<string, PlatformFeatureDefinition>();

  register(definition: PlatformFeatureDefinition): void {
    this.features.set(definition.id, definition);
  }

  get(id: string): PlatformFeatureDefinition | undefined {
    return this.features.get(id);
  }

  list(): readonly PlatformFeatureDefinition[] {
    return [...this.features.values()].sort((left, right) => left.name.localeCompare(right.name));
  }

  listByCategory(category: PlatformFeatureCategory): readonly PlatformFeatureDefinition[] {
    return this.list().filter((feature) => feature.category === category);
  }
}

export const defaultFeatureRegistry = new InMemoryFeatureRegistry();

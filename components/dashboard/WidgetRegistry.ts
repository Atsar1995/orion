/** Widget layout variant for dashboard composition. */
export type WidgetVariant = "default" | "premium";

/** Metadata for a registered dashboard widget slot. */
export type WidgetDefinition = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly variant?: WidgetVariant;
  readonly order: number;
};

/** Registry for dashboard widget definitions — metadata only, no business logic. */
export class WidgetRegistry {
  private readonly widgets = new Map<string, WidgetDefinition>();

  register(definition: WidgetDefinition): void {
    this.widgets.set(definition.id, definition);
  }

  get(id: string): WidgetDefinition | undefined {
    return this.widgets.get(id);
  }

  list(): readonly WidgetDefinition[] {
    return [...this.widgets.values()].sort((left, right) => left.order - right.order);
  }

  has(id: string): boolean {
    return this.widgets.has(id);
  }
}

export const defaultWidgetRegistry = new WidgetRegistry();

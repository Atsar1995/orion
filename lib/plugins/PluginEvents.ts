import type { PluginContextLogger, PluginEvent } from "@/types/plugins";

type PluginEventHandler = (event: PluginEvent) => void | Promise<void>;

/** In-process plugin event bus — integrates with platform events in future. */
export class PluginEventBus {
  private readonly handlers = new Map<string, Set<PluginEventHandler>>();
  private readonly log: PluginEvent[] = [];
  private readonly maxLogSize = 200;

  subscribe(eventType: string, handler: PluginEventHandler): () => void {
    const set = this.handlers.get(eventType) ?? new Set<PluginEventHandler>();
    set.add(handler);
    this.handlers.set(eventType, set);

    return () => {
      set.delete(handler);
    };
  }

  async publish<TPayload extends Record<string, unknown>>(
    event: Omit<PluginEvent<TPayload>, "id" | "timestamp">,
  ): Promise<void> {
    const envelope: PluginEvent<TPayload> = {
      ...event,
      id: `pevt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };

    this.log.unshift(envelope);
    if (this.log.length > this.maxLogSize) {
      this.log.pop();
    }

    const handlers = [
      ...(this.handlers.get(event.type) ?? []),
      ...(this.handlers.get("*") ?? []),
    ];

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(envelope);
        } catch (error) {
          console.error("[PluginEventBus] handler failed", event.type, error);
        }
      }),
    );
  }

  getRecentEvents(limit = 50): PluginEvent[] {
    return this.log.slice(0, limit);
  }

  createLogger(pluginId: string): PluginContextLogger {
    return {
      info: (message, meta) => {
        void this.publish({
          type: "plugin.log.info",
          pluginId,
          payload: { message, ...(meta ?? {}) },
        });
      },
      warn: (message, meta) => {
        void this.publish({
          type: "plugin.log.warn",
          pluginId,
          payload: { message, ...(meta ?? {}) },
        });
      },
      error: (message, meta) => {
        void this.publish({
          type: "plugin.log.error",
          pluginId,
          payload: { message, ...(meta ?? {}) },
        });
      },
    };
  }
}

export const pluginEventBus = new PluginEventBus();

/** Standard plugin lifecycle event types. */
export const PLUGIN_LIFECYCLE_EVENTS = {
  INSTALLED: "plugin.lifecycle.installed",
  ENABLED: "plugin.lifecycle.enabled",
  DISABLED: "plugin.lifecycle.disabled",
  UPDATED: "plugin.lifecycle.updated",
  UNLOADED: "plugin.lifecycle.unloaded",
  ERROR: "plugin.lifecycle.error",
} as const;

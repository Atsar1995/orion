export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogCategory =
  | "service"
  | "api"
  | "validation"
  | "exception"
  | "data"
  | "cache";

export type PlatformLogEntry = {
  readonly id: string;
  readonly level: LogLevel;
  readonly category: LogCategory;
  readonly message: string;
  readonly timestamp: string;
  readonly source?: string;
  readonly metadata?: Record<string, string>;
};

type LogInput = Omit<PlatformLogEntry, "id" | "timestamp">;

/** Centralized platform logger for service, API, and data failures (Mission S1C). */
class PlatformLoggerStore {
  private readonly entries: PlatformLogEntry[] = [];
  private readonly maxEntries = 500;
  private sequence = 0;

  log(input: LogInput): PlatformLogEntry {
    const entry: PlatformLogEntry = {
      ...input,
      id: `log-${++this.sequence}`,
      timestamp: new Date().toISOString(),
    };

    this.entries.unshift(entry);

    if (this.entries.length > this.maxEntries) {
      this.entries.length = this.maxEntries;
    }

    if (process.env.NODE_ENV !== "test") {
      const prefix = `[ORION:${input.category}]`;
      const payload = input.source ? `${prefix} [${input.source}] ${input.message}` : `${prefix} ${input.message}`;

      switch (input.level) {
        case "error":
          console.error(payload);
          break;
        case "warn":
          console.warn(payload);
          break;
        default:
          console.info(payload);
      }
    }

    return entry;
  }

  serviceFailure(message: string, source: string, metadata?: Record<string, string>): void {
    this.log({ level: "error", category: "service", message, source, metadata });
  }

  apiFailure(message: string, source: string, metadata?: Record<string, string>): void {
    this.log({ level: "error", category: "api", message, source, metadata });
  }

  validationFailure(message: string, source: string, metadata?: Record<string, string>): void {
    this.log({ level: "warn", category: "validation", message, source, metadata });
  }

  unexpectedException(message: string, source: string, metadata?: Record<string, string>): void {
    this.log({ level: "error", category: "exception", message, source, metadata });
  }

  dataEvent(message: string, source: string, metadata?: Record<string, string>): void {
    this.log({ level: "info", category: "data", message, source, metadata });
  }

  getRecent(limit = 50): readonly PlatformLogEntry[] {
    return this.entries.slice(0, limit);
  }

  clear(): void {
    this.entries.length = 0;
  }
}

export const platformLogger = new PlatformLoggerStore();

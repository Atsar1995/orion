import type { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";

export type LogMeta = Readonly<Record<string, unknown>>;

export interface AuroraLogger {
  error(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  debug(message: string, meta?: LogMeta): void;
  child(bindings: LogMeta): AuroraLogger;
}

const LEVELS = ["error", "warn", "info", "debug"] as const;

function shouldLog(configLevel: AuroraRuntimeConfiguration["logLevel"], level: typeof LEVELS[number]): boolean {
  return LEVELS.indexOf(level) <= LEVELS.indexOf(configLevel);
}

function sanitize(meta?: LogMeta): LogMeta | undefined {
  if (!meta) {
    return undefined;
  }
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (/secret|password|token|credential/i.test(key)) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

class JsonAuroraLogger implements AuroraLogger {
  constructor(
    private readonly config: AuroraRuntimeConfiguration,
    private readonly bindings: LogMeta = {},
  ) {}

  private write(level: typeof LEVELS[number], message: string, meta?: LogMeta): void {
    if (!shouldLog(this.config.logLevel, level)) {
      return;
    }
    if (this.config.environment === "test") {
      return;
    }
    const payload = {
      level,
      message,
      service: "aurora.platform",
      timestamp: new Date().toISOString(),
      ...this.bindings,
      ...sanitize(meta),
    };
    console.log(JSON.stringify(payload));
  }

  error(message: string, meta?: LogMeta): void {
    this.write("error", message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.write("warn", message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.write("info", message, meta);
  }

  debug(message: string, meta?: LogMeta): void {
    this.write("debug", message, meta);
  }

  child(bindings: LogMeta): AuroraLogger {
    return new JsonAuroraLogger(this.config, { ...this.bindings, ...bindings });
  }
}

export class AuroraLoggingService {
  constructor(private readonly config: AuroraRuntimeConfiguration) {}

  createLogger(bindings: LogMeta = {}): AuroraLogger {
    return new JsonAuroraLogger(this.config, bindings);
  }
}

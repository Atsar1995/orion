/** IIL transport configuration (ADR-013 · P-009.16). */

export enum IILTransportProvider {
  InMemory = "memory",
  Durable = "durable",
}

export type IILConfiguration = {
  readonly provider: IILTransportProvider;
};

const IIL_TRANSPORT_ENV = "ORION_IIL_TRANSPORT";

function readEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function isProductionRuntime(): boolean {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (nodeEnv !== "production") return false;
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return true;
}

function parseProvider(raw: string | undefined): IILTransportProvider {
  switch (raw?.toLowerCase()) {
    case IILTransportProvider.Durable:
    case "postgres":
      return IILTransportProvider.Durable;
    case IILTransportProvider.InMemory:
    case "in_memory":
    case "in-memory":
      return IILTransportProvider.InMemory;
    default:
      return IILTransportProvider.InMemory;
  }
}

/** Loads IIL transport configuration from environment. */
export function loadIILConfiguration(): IILConfiguration {
  const provider = parseProvider(readEnv(IIL_TRANSPORT_ENV));

  if (isProductionRuntime() && provider === IILTransportProvider.InMemory) {
    throw new Error(
      "ORION_IIL_TRANSPORT=memory is not permitted in production. Use 'durable' per ADR-013.",
    );
  }

  return { provider };
}

export const DEFAULT_IIL_CONFIGURATION: IILConfiguration = {
  provider: IILTransportProvider.InMemory,
};

import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { HealthStatus } from "@/types/aurora-platform";

export type ConnectorCapability = string;

export type ConnectorCredentials = Readonly<Record<string, string>>;

export type ConnectedConnector = {
  readonly providerId: string;
  readonly connectedAt: string;
};

export interface AuroraConnector {
  readonly providerId: string;
  readonly displayName: string;
  readonly phase: 1 | 2 | 3;
  connect(ctx: AuroraRuntimeContext, credentials: ConnectorCredentials): Promise<void>;
  disconnect(ctx: AuroraRuntimeContext): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
  getCapabilities(): readonly ConnectorCapability[];
}

export interface ConnectorRegistry {
  register(connector: AuroraConnector): void;
  get(providerId: string): AuroraConnector | undefined;
  list(): readonly AuroraConnector[];
  listConnected(ctx: AuroraRuntimeContext): Promise<readonly ConnectedConnector[]>;
  healthCheckAll(): Promise<Readonly<Record<string, HealthStatus>>>;
  shutdown(): Promise<void>;
}

export class DefaultConnectorRegistry implements ConnectorRegistry {
  private readonly connectors = new Map<string, AuroraConnector>();
  private readonly connected = new Map<string, ConnectedConnector>();

  register(connector: AuroraConnector): void {
    this.connectors.set(connector.providerId, connector);
  }

  get(providerId: string): AuroraConnector | undefined {
    return this.connectors.get(providerId);
  }

  list(): readonly AuroraConnector[] {
    return [...this.connectors.values()];
  }

  async listConnected(): Promise<readonly ConnectedConnector[]> {
    return [...this.connected.values()];
  }

  async healthCheckAll(): Promise<Readonly<Record<string, HealthStatus>>> {
    const results: Record<string, HealthStatus> = {};
    for (const connector of this.connectors.values()) {
      results[connector.providerId] = await connector.healthCheck();
    }
    return results;
  }

  async shutdown(): Promise<void> {
    this.connected.clear();
  }
}

import {
  buildHealthReport,
  createProviderHealth,
  createSuccessResult,
} from "@/lib/providers/ProviderHealth";
import type {
  Provider,
  ProviderCapability,
  ProviderConfig,
  ProviderConnection,
  ProviderHealth,
  ProviderResult,
} from "@/types/providers";

/** Abstract base for ORION integration providers (ES-060). */
export abstract class BaseProvider implements Provider {
  abstract readonly id: string;
  abstract readonly name: string;
  readonly config: ProviderConfig;

  protected connection: ProviderConnection = { connected: false };
  protected health: ProviderHealth = createProviderHealth("disconnected", false);

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract getCapabilities(): ProviderCapability[];

  async connect(): Promise<ProviderResult<ProviderConnection>> {
    this.connection = {
      connected: true,
      connectedAt: new Date().toISOString(),
    };
    this.health = createProviderHealth("connected", true, `${this.name} connected`);
    return createSuccessResult(this.id, this.connection);
  }

  async disconnect(): Promise<ProviderResult<void>> {
    this.connection = { connected: false };
    this.health = createProviderHealth("disconnected", false);
    return createSuccessResult(this.id, undefined);
  }

  async healthCheck(): Promise<ProviderResult<ProviderHealth>> {
    if (!this.connection.connected) {
      this.health = createProviderHealth("disconnected", false, "Provider not connected");
      return createSuccessResult(this.id, this.health);
    }

    this.health = createProviderHealth("connected", true, `${this.name} operational`);
    return createSuccessResult(this.id, this.health);
  }

  async sync(): Promise<ProviderResult<void>> {
    if (!this.connection.connected) {
      await this.connect();
    }

    this.connection.lastSyncAt = new Date().toISOString();
    this.health = createProviderHealth("connected", true, `${this.name} synced`);
    return createSuccessResult(this.id, undefined);
  }

  async refresh(): Promise<ProviderResult<void>> {
    return this.sync();
  }

  protected ensureConnected(): void {
    if (!this.connection.connected) {
      throw new Error(`Provider ${this.id} is not connected`);
    }
  }
}

export { buildHealthReport };

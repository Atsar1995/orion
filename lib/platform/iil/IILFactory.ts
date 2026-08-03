import {
  DEFAULT_IIL_CONFIGURATION,
  IILTransportProvider,
  loadIILConfiguration,
  type IILConfiguration,
} from "@/lib/platform/iil/IILConfiguration";
import {
  InMemoryDurableTransport,
  InMemoryDurableTransportBacking,
} from "@/lib/platform/iil/InMemoryDurableTransport";
import { PostgresDurableTransport } from "@/lib/platform/iil/PostgresDurableTransport";
import type { DurableTransportAdapter } from "@/lib/platform/iil/DurableTransportAdapter";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";
import { getDefaultPlatformStore } from "@/lib/platform/store/PlatformStoreFactory";

/** Constructs durable IIL transport from configuration. */
export class IILFactory {
  static create(
    configuration: IILConfiguration = DEFAULT_IIL_CONFIGURATION,
    options?: {
      connection?: DatabaseConnection;
      backing?: InMemoryDurableTransportBacking;
    },
  ): DurableTransportAdapter {
    if (configuration.provider === IILTransportProvider.Durable) {
      if (!options?.connection) {
        throw new Error("IIL_DURABLE_CONNECTION_REQUIRED");
      }
      return new PostgresDurableTransport(options.connection);
    }

    return new InMemoryDurableTransport({ backing: options?.backing });
  }

  static createFromEnvironment(platformStore: PlatformStore = getDefaultPlatformStore()): DurableTransportAdapter {
    const configuration = loadIILConfiguration();

    if (configuration.provider === IILTransportProvider.Durable) {
      const connection = platformStore.getDatabaseConnection?.();
      if (!connection) {
        throw new Error("IIL_DURABLE_CONNECTION_REQUIRED");
      }
      return new PostgresDurableTransport(connection);
    }

    return new InMemoryDurableTransport();
  }
}

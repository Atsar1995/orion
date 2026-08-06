/**
 * In-memory PlatformStore — development, CI, and tests (Mission P-015.4 · ADR-007).
 */

import {
  defaultHcmStore,
  type InMemoryHcmStore,
} from "@/lib/hcm/data/InMemoryHcmStore";
import { createCrmStore } from "@/lib/crm/persistence/createCrmStore";
import type { CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
import { createProcurementStore } from "@/lib/procurement/persistence/createProcurementStore";
import type { ProcurementStoreBacking } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import { createFinanceStore } from "@/lib/finance/persistence/createFinanceStore";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { HcmStoreBacking } from "@/lib/platform/store/HcmStoreBacking";
import type {
  PlatformStore,
  PlatformStoreLifecycleState,
  PlatformStoreMigrationReadiness,
} from "@/lib/platform/store/PlatformStore";
import { createPlatformStoreHealthReport } from "@/lib/platform/store/PlatformStoreHealth";
import type { PlatformStoreHealthReport } from "@/lib/platform/store/PlatformStoreHealth";
import {
  DEFAULT_STORE_CONFIGURATION,
  StoreProvider,
  type StoreConfiguration,
} from "@/lib/platform/store/StoreConfiguration";
import {
  NoOpTransactionManager,
  type TransactionManager,
} from "@/lib/persistence/services/shared";

export type InMemoryPlatformStoreOptions = {
  readonly configuration?: StoreConfiguration;
  readonly hcmStore?: InMemoryHcmStore;
  readonly financeStore?: FinanceStoreBacking;
  readonly crmStore?: CrmStoreBacking;
  readonly procurementStore?: ProcurementStoreBacking;
  readonly transactionManager?: TransactionManager;
};

/** In-memory platform store with shared HCM backing for backward compatibility. */
export class InMemoryPlatformStore implements PlatformStore {
  readonly provider = StoreProvider.InMemory;
  readonly configuration: StoreConfiguration;

  private readonly hcmStore: InMemoryHcmStore;
  private readonly financeStore: FinanceStoreBacking;
  private readonly crmStore: CrmStoreBacking;
  private readonly procurementStore: ProcurementStoreBacking;
  private readonly transactionManager: TransactionManager;
  private lifecycle: PlatformStoreLifecycleState = "created";

  constructor(options: InMemoryPlatformStoreOptions = {}) {
    this.configuration = options.configuration ?? DEFAULT_STORE_CONFIGURATION;
    this.hcmStore = options.hcmStore ?? defaultHcmStore;
    this.financeStore = options.financeStore ?? createFinanceStore();
    this.crmStore = options.crmStore ?? createCrmStore();
    this.procurementStore = options.procurementStore ?? createProcurementStore();
    this.transactionManager = options.transactionManager ?? new NoOpTransactionManager();
    this.lifecycle = "initialized";
  }

  async initialize(): Promise<void> {
    if (this.lifecycle === "shutdown") {
      this.lifecycle = "initialized";
      return;
    }

    this.lifecycle = "initialized";
  }

  async shutdown(): Promise<void> {
    this.lifecycle = "shutdown";
  }

  isInitialized(): boolean {
    return this.lifecycle === "initialized";
  }

  getLifecycleState(): PlatformStoreLifecycleState {
    return this.lifecycle;
  }

  getTransactionManager(): TransactionManager {
    return this.transactionManager;
  }

  getHcmBacking(): HcmStoreBacking {
    return this.hcmStore;
  }

  getFinanceBacking(): FinanceStoreBacking {
    return this.financeStore;
  }

  getCrmBacking(): CrmStoreBacking {
    return this.crmStore;
  }

  getProcurementBacking(): ProcurementStoreBacking {
    return this.procurementStore;
  }

  getHealth(): PlatformStoreHealthReport {
    if (this.lifecycle === "shutdown") {
      return createPlatformStoreHealthReport({
        provider: this.provider,
        status: "unhealthy",
        initialized: false,
        message: "Platform store has been shut down.",
        migrationReady: true,
      });
    }

    if (this.lifecycle !== "initialized") {
      return createPlatformStoreHealthReport({
        provider: this.provider,
        status: "not_initialized",
        initialized: false,
        message: "Platform store not initialized.",
        migrationReady: true,
      });
    }

    return createPlatformStoreHealthReport({
      provider: this.provider,
      status: "healthy",
      initialized: true,
      message: "In-memory platform store operational.",
      migrationReady: true,
      details: {
        hcmBacking: "InMemoryHcmStore",
        financeBacking: "FinanceStoreBacking",
        crmBacking: "CrmStoreBacking",
        procurementBacking: "ProcurementStoreBacking",
      },
    });
  }

  async checkHealth(): Promise<PlatformStoreHealthReport> {
    return this.getHealth();
  }

  getMigrationReadiness(): PlatformStoreMigrationReadiness {
    return {
      ready: true,
      provider: this.provider,
      message: "In-memory store requires no schema migrations.",
    };
  }
}

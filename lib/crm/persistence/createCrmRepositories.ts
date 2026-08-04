import type { AgreementsRepository } from "@/lib/crm/repositories/AgreementsRepository";
import type { CommercialIntelligenceRepository } from "@/lib/crm/repositories/CommercialIntelligenceRepository";
import type { CommercialRepository } from "@/lib/crm/repositories/CommercialRepository";
import type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";
import type { CustomerIntelligenceRepository } from "@/lib/crm/repositories/CustomerIntelligenceRepository";
import type { ExecutiveDashboardRepository } from "@/lib/crm/repositories/ExecutiveDashboardRepository";
import {
  InMemoryCrmRepository,
  defaultCrmRepository,
} from "@/lib/crm/repositories/InMemoryCrmRepository";
import type { PartyRepository } from "@/lib/crm/repositories/PartyRepository";
import type { CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
import { seedCrmStore } from "@/lib/crm/persistence/createCrmStore";

/** CRM repository bundle wired to a shared store backing. */
export type CrmRepositories = {
  readonly crm: CrmRepository;
  readonly party: PartyRepository;
  readonly commercial: CommercialRepository;
  readonly agreements: AgreementsRepository;
  readonly commercialIntelligence: CommercialIntelligenceRepository;
  readonly customerIntelligence: CustomerIntelligenceRepository;
  readonly executiveDashboard: ExecutiveDashboardRepository;
};

export type CreateCrmRepositoriesOptions = {
  readonly repository?: InMemoryCrmRepository;
};

/**
 * Creates CRM repositories against a shared PlatformStore backing.
 * Repository interfaces are unchanged — placeholder data remains in InMemoryCrmRepository (TD-002).
 */
export function createCrmRepositories(
  store: CrmStoreBacking,
  options?: CreateCrmRepositoriesOptions,
): CrmRepositories {
  seedCrmStore(store);

  const repository = options?.repository ?? defaultCrmRepository;

  return {
    crm: repository,
    party: repository,
    commercial: repository,
    agreements: repository,
    commercialIntelligence: repository,
    customerIntelligence: repository,
    executiveDashboard: repository,
  };
}

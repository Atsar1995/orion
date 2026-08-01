import type {
  CanonicalEntityRegistration,
  CanonicalEntityType,
  MasterEntityDiscoveryQuery,
  MasterEntityRecord,
  RegistryQuery,
} from "@/types/enterprise-data";

/** Master entity repository contract (Mission P-011.1). */
export type MasterEntityRepository = {
  readonly domain: string;

  registerEntityType(registration: CanonicalEntityRegistration): CanonicalEntityRegistration;
  findEntityType(entityType: CanonicalEntityType): CanonicalEntityRegistration | null;
  listEntityTypes(query?: RegistryQuery): readonly CanonicalEntityRegistration[];

  create(entity: MasterEntityRecord): MasterEntityRecord;
  update(entity: MasterEntityRecord): MasterEntityRecord;
  findById(organizationId: string, entityId: string): MasterEntityRecord | null;
  findByBusinessKey(
    organizationId: string,
    entityType: CanonicalEntityType,
    businessKey: string,
  ): MasterEntityRecord | null;
  findByGlobalId(globalId: string): MasterEntityRecord | null;
  list(organizationId: string, query?: MasterEntityDiscoveryQuery): readonly MasterEntityRecord[];
  findDuplicateFingerprint(organizationId: string, fingerprint: string): MasterEntityRecord | null;
  count(organizationId: string, query?: MasterEntityDiscoveryQuery): number;
};

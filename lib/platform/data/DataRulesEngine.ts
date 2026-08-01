import type {
  CanonicalEntityType,
  MasterEntityStatus,
  RegisterMasterEntityInput,
  UpdateMasterEntityInput,
} from "@/types/enterprise-data";
import type { ServiceContext } from "@/types/services";

export type RegistryValidationError = {
  readonly code: string;
  readonly message: string;
};

const ACTIVE_STATUSES: readonly MasterEntityStatus[] = ["draft", "active", "inactive"];

/** Master data registry validation (Mission P-011.1). */
export class DataRulesEngine {
  validateOrganizationAccess(
    record: { readonly organizationId: string },
    context: ServiceContext,
  ): RegistryValidationError | null {
    if (record.organizationId !== context.organizationId && context.role !== "super_admin") {
      return { code: "ORGANIZATION_ISOLATION", message: "Organization access denied." };
    }
    return null;
  }

  validateRegistration(input: RegisterMasterEntityInput): RegistryValidationError[] {
    const errors: RegistryValidationError[] = [];
    if (!input.businessKey.trim()) errors.push({ code: "INVALID_BUSINESS_KEY", message: "Business key is required." });
    if (!input.displayName.trim()) errors.push({ code: "INVALID_DISPLAY_NAME", message: "Display name is required." });
    if (!input.domainKey.trim()) errors.push({ code: "INVALID_DOMAIN", message: "Domain key is required." });
    return errors;
  }

  validateUpdate(input: UpdateMasterEntityInput): RegistryValidationError[] {
    const errors: RegistryValidationError[] = [];
    if (!input.entityId.trim()) errors.push({ code: "INVALID_ENTITY_ID", message: "Entity id is required." });
    if (input.displayName !== undefined && !input.displayName.trim()) {
      errors.push({ code: "INVALID_DISPLAY_NAME", message: "Display name cannot be empty." });
    }
    return errors;
  }

  validateEntityTypeRegistered(entityType: CanonicalEntityType, registered: boolean): RegistryValidationError | null {
    if (!registered) {
      return { code: "UNREGISTERED_ENTITY_TYPE", message: `Entity type not registered: ${entityType}` };
    }
    return null;
  }

  validateLifecycleTransition(from: MasterEntityStatus, to: MasterEntityStatus): RegistryValidationError | null {
    const allowed: Partial<Record<MasterEntityStatus, readonly MasterEntityStatus[]>> = {
      draft: ["active", "deleted"],
      active: ["inactive", "archived", "deleted"],
      inactive: ["active", "archived", "deleted"],
      archived: ["active"],
      deleted: [],
    };
    const transitions = allowed[from];
    if (!transitions?.includes(to)) {
      return { code: "INVALID_LIFECYCLE", message: `Cannot transition from ${from} to ${to}.` };
    }
    return null;
  }

  buildFingerprint(organizationId: string, entityType: CanonicalEntityType, businessKey: string): string {
    return `${organizationId}|${entityType}|${businessKey}`;
  }

  validateImmutableIdentity(
    existingBusinessKey: string,
    newBusinessKey?: string,
  ): RegistryValidationError | null {
    if (newBusinessKey !== undefined && newBusinessKey !== existingBusinessKey) {
      return { code: "IMMUTABLE_BUSINESS_KEY", message: "Business key cannot be changed after registration." };
    }
    return null;
  }
}

export const dataRulesEngine = new DataRulesEngine();

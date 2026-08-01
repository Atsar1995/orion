import type {
  ValidationRegistryQuery,
  ValidationRuleGroup,
  ValidationRuleRecord,
} from "@/types/enterprise-data-validation";
import type { ValidationRepository } from "@/lib/platform/data/repositories/ValidationRepository";
import type { ServiceContext } from "@/types/services";

export type ValidationRegistryStats = {
  readonly organizationId: string;
  readonly ruleGroups: number;
  readonly activeRules: number;
  readonly activePolicies: number;
  readonly reportsGenerated: number;
};

/** Validation registry queries (Mission P-011.4). */
export class ValidationRegistryService {
  constructor(private readonly repository: ValidationRepository) {}

  listRuleGroups(context: ServiceContext): readonly ValidationRuleGroup[] {
    return this.repository.listRuleGroups(context.organizationId);
  }

  listRules(query: ValidationRegistryQuery = {}): readonly ValidationRuleRecord[] {
    return this.repository.listRules(query);
  }

  getStats(context: ServiceContext): ValidationRegistryStats {
    const groups = this.repository.listRuleGroups(context.organizationId);
    const rules = this.repository.listRules();
    const policies = this.repository.listPolicies(context.organizationId);
    const reports = this.repository.listReports(context.organizationId, 1000);

    return {
      organizationId: context.organizationId,
      ruleGroups: groups.length,
      activeRules: rules.filter((r) => r.active).length,
      activePolicies: policies.length,
      reportsGenerated: reports.length,
    };
  }
}

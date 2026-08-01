import type {
  ValidationPolicyRecord,
  ValidationRegistryQuery,
  ValidationReport,
  ValidationRuleGroup,
  ValidationRuleRecord,
} from "@/types/enterprise-data-validation";

/** Internal validation registry persistence (Mission P-011.4). */
export type ValidationRepository = {
  readonly domain: "platform";

  listRuleGroups(organizationId?: string): readonly ValidationRuleGroup[];
  findRuleGroup(id: string): ValidationRuleGroup | null;
  saveRuleGroup(group: ValidationRuleGroup): ValidationRuleGroup;

  listRules(query?: ValidationRegistryQuery): readonly ValidationRuleRecord[];
  findRule(id: string): ValidationRuleRecord | null;
  saveRule(rule: ValidationRuleRecord): ValidationRuleRecord;

  listPolicies(organizationId?: string): readonly ValidationPolicyRecord[];
  findPolicy(id: string): ValidationPolicyRecord | null;
  savePolicy(policy: ValidationPolicyRecord): ValidationPolicyRecord;

  saveReport(report: ValidationReport): ValidationReport;
  findReport(organizationId: string, reportId: string): ValidationReport | null;
  listReports(organizationId: string, limit?: number): readonly ValidationReport[];
};

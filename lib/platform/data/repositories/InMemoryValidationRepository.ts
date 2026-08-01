import { randomUUID } from "crypto";
import type {
  ValidationPolicyRecord,
  ValidationRegistryQuery,
  ValidationReport,
  ValidationRuleGroup,
  ValidationRuleRecord,
} from "@/types/enterprise-data-validation";
import type { ValidationRepository } from "@/lib/platform/data/repositories/ValidationRepository";
import {
  seedValidationPolicies,
  seedValidationRuleGroups,
  seedValidationRules,
} from "@/lib/platform/data/data/seed-validation-registry";

/** In-memory validation registry (Mission P-011.4). */
export class InMemoryValidationRepository implements ValidationRepository {
  readonly domain = "platform" as const;

  private readonly ruleGroups = new Map<string, ValidationRuleGroup>();
  private readonly rules = new Map<string, ValidationRuleRecord>();
  private readonly policies = new Map<string, ValidationPolicyRecord>();
  private readonly reports = new Map<string, ValidationReport>();

  constructor() {
    for (const group of seedValidationRuleGroups()) {
      this.ruleGroups.set(group.id, group);
    }
    for (const rule of seedValidationRules()) {
      this.rules.set(rule.id, rule);
    }
    for (const policy of seedValidationPolicies()) {
      this.policies.set(policy.id, policy);
    }
  }

  listRuleGroups(organizationId?: string): readonly ValidationRuleGroup[] {
    return [...this.ruleGroups.values()]
      .filter((g) => g.active && (!organizationId || !g.organizationId || g.organizationId === organizationId))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  findRuleGroup(id: string): ValidationRuleGroup | null {
    return this.ruleGroups.get(id) ?? null;
  }

  saveRuleGroup(group: ValidationRuleGroup): ValidationRuleGroup {
    this.ruleGroups.set(group.id, group);
    return group;
  }

  listRules(query: ValidationRegistryQuery = {}): readonly ValidationRuleRecord[] {
    let results = [...this.rules.values()];
    if (query.entityType) results = results.filter((r) => !r.entityType || r.entityType === query.entityType);
    if (query.domainKey) results = results.filter((r) => !r.domainKey || r.domainKey === query.domainKey);
    if (query.stage) results = results.filter((r) => r.stage === query.stage);
    if (!query.includeInactive) results = results.filter((r) => r.active);
    return results.sort((a, b) => a.priority - b.priority);
  }

  findRule(id: string): ValidationRuleRecord | null {
    return this.rules.get(id) ?? null;
  }

  saveRule(rule: ValidationRuleRecord): ValidationRuleRecord {
    this.rules.set(rule.id, rule);
    return rule;
  }

  listPolicies(organizationId?: string): readonly ValidationPolicyRecord[] {
    return [...this.policies.values()]
      .filter(
        (p) =>
          p.active &&
          (!organizationId ||
            p.scope === "global" ||
            !p.organizationId ||
            p.organizationId === organizationId),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  findPolicy(id: string): ValidationPolicyRecord | null {
    return this.policies.get(id) ?? null;
  }

  savePolicy(policy: ValidationPolicyRecord): ValidationPolicyRecord {
    this.policies.set(policy.id, policy);
    return policy;
  }

  saveReport(report: ValidationReport): ValidationReport {
    this.reports.set(report.id, report);
    return report;
  }

  findReport(organizationId: string, reportId: string): ValidationReport | null {
    const report = this.reports.get(reportId);
    if (!report || report.organizationId !== organizationId) return null;
    return report;
  }

  listReports(organizationId: string, limit = 50): readonly ValidationReport[] {
    return [...this.reports.values()]
      .filter((r) => r.organizationId === organizationId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}

export const defaultValidationRepository = new InMemoryValidationRepository();

export function createValidationReportId(): string {
  return `vrpt-${randomUUID()}`;
}

export function createValidationRuleId(): string {
  return `vrule-${randomUUID()}`;
}

export function createValidationPolicyId(): string {
  return `vpolicy-${randomUUID()}`;
}

export function createValidationRuleGroupId(): string {
  return `vgrp-${randomUUID()}`;
}

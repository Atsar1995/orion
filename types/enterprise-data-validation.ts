/**
 * Enterprise Data Validation Framework types (Mission P-011.4).
 * Organization-scoped validation pipeline, rules, policies, and reporting.
 */

import type { CanonicalEntityType } from "@/types/enterprise-data";

/** Supported validation rule categories. */
export type ValidationRuleType =
  | "required_field"
  | "data_type"
  | "length_constraint"
  | "precision_rule"
  | "range_rule"
  | "format_rule"
  | "reference_integrity"
  | "organization_scope"
  | "relationship_integrity"
  | "duplicate_detection"
  | "metadata_compliance"
  | "canonical_model_compliance"
  | "custom";

/** Pipeline stage identifiers. */
export type ValidationStage =
  | "input"
  | "metadata"
  | "canonical_model"
  | "reference"
  | "organization"
  | "cross_entity"
  | "governance"
  | "publication";

/** Overall validation outcome. */
export type ValidationOutcome = "passed" | "warning" | "failed" | "skipped" | "informational";

export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationPolicyScope = "global" | "organization" | "domain" | "entity" | "attribute";

export type ValidationOperation = "create" | "update" | "import" | "merge";

/** Registered validation rule group. */
export type ValidationRuleGroup = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly organizationId?: string;
  readonly domainKey?: string;
  readonly entityType?: CanonicalEntityType;
  readonly active: boolean;
  readonly createdAt: string;
};

/** Governed validation rule definition. */
export type ValidationRuleRecord = {
  readonly id: string;
  readonly ruleGroupId: string;
  readonly organizationId?: string;
  readonly ruleType: ValidationRuleType;
  readonly entityType?: CanonicalEntityType;
  readonly attributeName?: string;
  readonly domainKey?: string;
  readonly stage: ValidationStage;
  readonly code: string;
  readonly message: string;
  readonly config?: Readonly<Record<string, string>>;
  readonly active: boolean;
  readonly priority: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Validation policy binding rules to scope. */
export type ValidationPolicyRecord = {
  readonly id: string;
  readonly scope: ValidationPolicyScope;
  readonly organizationId?: string;
  readonly domainKey?: string;
  readonly entityType?: CanonicalEntityType;
  readonly attributeName?: string;
  readonly name: string;
  readonly description: string;
  readonly ruleGroupIds: readonly string[];
  readonly continueOnWarning: boolean;
  readonly active: boolean;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly severity: ValidationSeverity;
  readonly stage: ValidationStage;
  readonly ruleId?: string;
};

export type ValidationTraceEntry = {
  readonly stage: ValidationStage;
  readonly outcome: ValidationOutcome;
  readonly durationMs: number;
  readonly issueCount: number;
};

/** Persisted validation report. */
export type ValidationReport = {
  readonly id: string;
  readonly organizationId: string;
  readonly entityType?: CanonicalEntityType;
  readonly entityId?: string;
  readonly domainKey?: string;
  readonly operation: ValidationOperation;
  readonly passed: boolean;
  readonly overallOutcome: ValidationOutcome;
  readonly issues: readonly ValidationIssue[];
  readonly trace: readonly ValidationTraceEntry[];
  readonly policyId?: string;
  readonly correlationId: string;
  readonly createdAt: string;
};

export type ValidateEntityInput = {
  readonly entityType: CanonicalEntityType;
  readonly entityId?: string;
  readonly domainKey: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly operation: ValidationOperation;
  readonly policyId?: string;
  readonly continueOnWarning?: boolean;
  readonly correlationId?: string;
};

export type RegisterValidationRuleInput = {
  readonly ruleGroupId: string;
  readonly ruleType: ValidationRuleType;
  readonly stage: ValidationStage;
  readonly code: string;
  readonly message: string;
  readonly entityType?: CanonicalEntityType;
  readonly attributeName?: string;
  readonly domainKey?: string;
  readonly config?: Readonly<Record<string, string>>;
  readonly priority?: number;
};

export type RegisterValidationPolicyInput = {
  readonly scope: ValidationPolicyScope;
  readonly name: string;
  readonly description: string;
  readonly ruleGroupIds: readonly string[];
  readonly domainKey?: string;
  readonly entityType?: CanonicalEntityType;
  readonly attributeName?: string;
  readonly continueOnWarning?: boolean;
};

export type ValidationRegistryQuery = {
  readonly entityType?: CanonicalEntityType;
  readonly domainKey?: string;
  readonly stage?: ValidationStage;
  readonly includeInactive?: boolean;
};

/** Outbound validation events (Mission P-011.4). */
export type ValidationEventType =
  | "ValidationPassed"
  | "ValidationFailed"
  | "ValidationWarning"
  | "ValidationReportGenerated";

/** Inbound validation events. */
export type ValidationInboundEventType = "ValidationRequested";

export type PublishValidationEventInput = {
  readonly eventType: ValidationEventType;
  readonly reportId: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

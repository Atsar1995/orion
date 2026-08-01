import type {
  ValidationPolicyRecord,
  ValidationRuleGroup,
  ValidationRuleRecord,
} from "@/types/enterprise-data-validation";

const NOW = "2026-07-23T00:00:00.000Z";

/** Seed validation rule groups (Mission P-011.4). */
export function seedValidationRuleGroups(): readonly ValidationRuleGroup[] {
  return [
    {
      id: "vgrp-global-core",
      name: "Global Core Validation",
      description: "Platform-wide required field and identity rules.",
      active: true,
      createdAt: NOW,
    },
    {
      id: "vgrp-org-orania",
      name: "Orania Organization Policies",
      description: "Organization-specific validation for org-orania.",
      organizationId: "org-orania",
      active: true,
      createdAt: NOW,
    },
    {
      id: "vgrp-domain-commercial",
      name: "Commercial Domain Rules",
      description: "Cross-entity validation for commercial entities.",
      domainKey: "commercial",
      active: true,
      createdAt: NOW,
    },
  ];
}

/** Seed validation rules (Mission P-011.4). */
export function seedValidationRules(): readonly ValidationRuleRecord[] {
  return [
    {
      id: "vrule-req-business-key",
      ruleGroupId: "vgrp-global-core",
      ruleType: "required_field",
      stage: "input",
      code: "INP_REQUIRED_BUSINESS_KEY",
      message: "Business key is required.",
      attributeName: "businessKey",
      active: true,
      priority: 10,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "vrule-req-display-name",
      ruleGroupId: "vgrp-global-core",
      ruleType: "required_field",
      stage: "input",
      code: "INP_REQUIRED_DISPLAY_NAME",
      message: "Display name is required.",
      attributeName: "displayName",
      active: true,
      priority: 20,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "vrule-canonical-type",
      ruleGroupId: "vgrp-global-core",
      ruleType: "canonical_model_compliance",
      stage: "canonical_model",
      code: "CAN_REGISTERED_ENTITY_TYPE",
      message: "Entity type must be registered in the master data registry.",
      active: true,
      priority: 30,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "vrule-org-scope",
      ruleGroupId: "vgrp-global-core",
      ruleType: "organization_scope",
      stage: "organization",
      code: "ORG_SCOPE_REQUIRED",
      message: "Organization scope must match the request context.",
      active: true,
      priority: 40,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "vrule-dup-detection",
      ruleGroupId: "vgrp-global-core",
      ruleType: "duplicate_detection",
      stage: "cross_entity",
      code: "DUP_BUSINESS_KEY",
      message: "Duplicate business key detected for this entity type.",
      active: true,
      priority: 50,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "vrule-customer-domain",
      ruleGroupId: "vgrp-domain-commercial",
      ruleType: "custom",
      stage: "governance",
      entityType: "customer",
      domainKey: "commercial",
      code: "GOV_CUSTOMER_DOMAIN",
      message: "Customer entities must belong to the commercial domain.",
      config: { requiredDomainKey: "commercial" },
      active: true,
      priority: 60,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "vrule-org-display-length",
      ruleGroupId: "vgrp-org-orania",
      organizationId: "org-orania",
      ruleType: "length_constraint",
      stage: "input",
      code: "INP_DISPLAY_NAME_LENGTH",
      message: "Display name must not exceed 200 characters.",
      attributeName: "displayName",
      config: { maxLength: "200" },
      active: true,
      priority: 15,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];
}

/** Seed validation policies (Mission P-011.4). */
export function seedValidationPolicies(): readonly ValidationPolicyRecord[] {
  return [
    {
      id: "vpolicy-global-default",
      scope: "global",
      name: "Global Default Validation Policy",
      description: "Default platform validation for all master entity operations.",
      ruleGroupIds: ["vgrp-global-core"],
      continueOnWarning: false,
      active: true,
      version: 1,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "vpolicy-org-orania",
      scope: "organization",
      organizationId: "org-orania",
      name: "Orania Organization Policy",
      description: "Organization validation including commercial domain rules.",
      ruleGroupIds: ["vgrp-global-core", "vgrp-org-orania", "vgrp-domain-commercial"],
      continueOnWarning: false,
      active: true,
      version: 1,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];
}

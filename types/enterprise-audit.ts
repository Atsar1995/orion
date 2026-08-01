/**
 * Enterprise Audit & Compliance Framework types (Mission P-010.6).
 * Immutable, organization-scoped audit and governance records.
 */

/** Conceptual audit action types. */
export type AuditActionType =
  | "entity_created"
  | "entity_updated"
  | "entity_deleted"
  | "login"
  | "logout"
  | "permission_granted"
  | "permission_revoked"
  | "workflow_completed"
  | "document_accessed"
  | "financial_posting"
  | "configuration_changed"
  | "system_configuration_updated"
  | "custom";

/** Risk classification for audit records. */
export type AuditRiskClassification = "low" | "medium" | "high" | "critical";

/** Compliance category labels. */
export type ComplianceCategory =
  | "security"
  | "financial"
  | "operational"
  | "governance"
  | "privacy"
  | "custom";

/** Outbound compliance platform events. */
export type ComplianceEventType =
  | "AuditRecorded"
  | "ComplianceViolationDetected"
  | "RetentionExpired"
  | "AuditExportGenerated";

/** Inbound events consumed by the compliance platform. */
export type ComplianceInboundEventType =
  | "EntityCreated"
  | "EntityUpdated"
  | "EntityDeleted"
  | "WorkflowCompleted"
  | "NotificationSent"
  | "DocumentUpdated"
  | "JournalPosted";

/** Immutable enterprise audit record. */
export type EnterpriseAuditRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly domainKey: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly action: AuditActionType;
  readonly userId: string;
  readonly timestamp: string;
  readonly previousState?: string;
  readonly currentState?: string;
  readonly sourceService: string;
  readonly correlationId: string;
  readonly ipAddress?: string;
  readonly clientInfo?: string;
  readonly riskClassification: AuditRiskClassification;
  readonly integrityHash: string;
};

export type EntityChangeRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly domainKey: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly field: string;
  readonly previousValue?: string;
  readonly currentValue?: string;
  readonly changedBy: string;
  readonly changedAt: string;
  readonly correlationId: string;
};

export type SecurityEventRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly eventType: string;
  readonly userId?: string;
  readonly severity: AuditRiskClassification;
  readonly detail: string;
  readonly sourceService: string;
  readonly timestamp: string;
  readonly correlationId: string;
};

export type ComplianceEventRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly category: ComplianceCategory;
  readonly policyReference: string;
  readonly evidenceReference?: string;
  readonly description: string;
  readonly violation: boolean;
  readonly recordedAt: string;
  readonly recordedBy: string;
  readonly correlationId: string;
};

export type RetentionPolicyRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly domainKey: string;
  readonly entityType: string;
  readonly retentionDays: number;
  readonly archiveAfterDays?: number;
  readonly active: boolean;
  readonly updatedAt: string;
};

export type ComplianceExceptionRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly category: ComplianceCategory;
  readonly policyReference: string;
  readonly reason: string;
  readonly approvedBy: string;
  readonly expiresAt?: string;
  readonly recordedAt: string;
};

export type RecordAuditInput = {
  readonly domainKey: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly action: AuditActionType;
  readonly previousState?: string;
  readonly currentState?: string;
  readonly sourceService: string;
  readonly correlationId?: string;
  readonly ipAddress?: string;
  readonly clientInfo?: string;
  readonly riskClassification?: AuditRiskClassification;
};

export type AuditSearchQuery = {
  readonly domainKey?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly userId?: string;
  readonly action?: AuditActionType;
  readonly riskClassification?: AuditRiskClassification;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly correlationId?: string;
  readonly page?: number;
  readonly pageSize?: number;
};

export type AuditSearchResult = {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly records: readonly EnterpriseAuditRecord[];
};

export type ComplianceDashboardModel = {
  readonly organizationId: string;
  readonly totalAuditRecords: number;
  readonly violationsDetected: number;
  readonly securityEvents: number;
  readonly retentionPolicies: number;
  readonly exceptionsActive: number;
  readonly recentViolations: readonly ComplianceEventRecord[];
  readonly riskBreakdown: Readonly<Record<AuditRiskClassification, number>>;
};

export type AuditReportingDashboardModel = {
  readonly organizationId: string;
  readonly periodLabel: string;
  readonly totalEvents: number;
  readonly byDomain: Readonly<Record<string, number>>;
  readonly byAction: Readonly<Record<string, number>>;
  readonly byRisk: Readonly<Record<AuditRiskClassification, number>>;
  readonly topUsers: readonly { readonly userId: string; readonly count: number }[];
};

export type AuditExportRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly exportedBy: string;
  readonly recordCount: number;
  readonly format: "json" | "csv";
  readonly exportedAt: string;
  readonly correlationId: string;
};

export type PublishComplianceEventInput = {
  readonly eventType: ComplianceEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

import type {
  NotificationTemplateRecord,
  OrganizationNotificationPolicyRecord,
  UserNotificationPreferenceRecord,
} from "@/types/notification";

const NOW = "2026-07-01T00:00:00.000Z";

/** Seed system notification templates (Mission P-010.3). */
export function seedSystemTemplates(): NotificationTemplateRecord[] {
  return [
    {
      id: "tpl-system-approval-request",
      scope: "system",
      key: "approval.request",
      name: "Approval Request",
      notificationType: "approval_request",
      defaultChannel: "in_app",
      subjectTemplate: "Approval required: {{entityType}}",
      bodyTemplate: "You have a pending approval for {{entityType}} ({{entityId}}).",
      language: "en",
      version: 1,
      active: true,
      variables: ["entityType", "entityId"],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "tpl-system-approval-outcome",
      scope: "system",
      key: "approval.outcome",
      name: "Approval Outcome",
      notificationType: "approval_outcome",
      defaultChannel: "in_app",
      subjectTemplate: "Approval {{outcome}}: {{entityType}}",
      bodyTemplate: "Your request for {{entityType}} ({{entityId}}) was {{outcome}}.",
      language: "en",
      version: 1,
      active: true,
      variables: ["entityType", "entityId", "outcome"],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "tpl-system-workflow-complete",
      scope: "system",
      key: "workflow.completed",
      name: "Workflow Completed",
      notificationType: "success",
      defaultChannel: "in_app",
      subjectTemplate: "Workflow completed: {{workflowName}}",
      bodyTemplate: "Workflow {{workflowName}} for {{entityId}} has completed.",
      language: "en",
      version: 1,
      active: true,
      variables: ["workflowName", "entityId"],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "tpl-system-executive-alert",
      scope: "system",
      key: "executive.alert",
      name: "Executive Alert",
      notificationType: "system_alert",
      defaultChannel: "in_app",
      subjectTemplate: "Executive Alert: {{title}}",
      bodyTemplate: "{{message}}",
      language: "en",
      version: 1,
      active: true,
      variables: ["title", "message"],
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "tpl-system-security-alert",
      scope: "system",
      key: "security.alert",
      name: "Security Alert",
      notificationType: "security_alert",
      defaultChannel: "email",
      subjectTemplate: "Security Alert: {{title}}",
      bodyTemplate: "{{message}}",
      language: "en",
      version: 1,
      active: true,
      variables: ["title", "message"],
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];
}

export function seedOrganizationPolicy(organizationId: string): OrganizationNotificationPolicyRecord {
  return {
    id: `policy-${organizationId}`,
    organizationId,
    allowedChannels: ["email", "sms", "whatsapp", "push", "in_app", "web"],
    mandatoryTypes: ["security_alert", "approval_request"],
    defaultLanguage: "en",
    maxRetries: 3,
    retryDelayMinutes: 15,
    updatedAt: NOW,
  };
}

export function seedUserPreference(
  organizationId: string,
  userId: string,
): UserNotificationPreferenceRecord {
  return {
    id: `pref-${userId}`,
    organizationId,
    userId,
    enabledChannels: ["in_app", "email", "push"],
    disabledTypes: [],
    language: "en",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    digestEnabled: false,
    priorityOverrides: { security_alert: "email" },
    updatedAt: NOW,
  };
}

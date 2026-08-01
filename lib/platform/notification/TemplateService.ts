import { randomUUID } from "crypto";
import type {
  CreateTemplateInput,
  NotificationTemplateRecord,
  NotificationTemplateVersionRecord,
} from "@/types/notification";
import type { NotificationRepository } from "@/lib/platform/notification/repositories/NotificationRepository";
import type { ServiceContext } from "@/types/services";
import { notificationRulesEngine } from "@/lib/platform/notification/NotificationRulesEngine";

function nowIso(): string {
  return new Date().toISOString();
}

/** Template management with versioning (Mission P-010.3). */
export class TemplateService {
  constructor(private readonly repository: NotificationRepository) {}

  list(context: ServiceContext): readonly NotificationTemplateRecord[] {
    return this.repository.listTemplates(context.organizationId);
  }

  get(templateId: string, context: ServiceContext): NotificationTemplateRecord | null {
    return this.repository.findTemplate(context.organizationId, templateId);
  }

  getByKey(key: string, context: ServiceContext, language = "en"): NotificationTemplateRecord | null {
    return this.repository.findTemplateByKey(context.organizationId, key, language);
  }

  create(input: CreateTemplateInput, context: ServiceContext): NotificationTemplateRecord {
    const errors = notificationRulesEngine.validateTemplate(input);
    if (errors.length > 0) {
      throw new Error(errors[0].code);
    }

    const scope = input.scope ?? "organization";
    const variables =
      input.variables ?? notificationRulesEngine.extractVariables(`${input.subjectTemplate} ${input.bodyTemplate}`);

    const template: NotificationTemplateRecord = {
      id: `tpl-${randomUUID()}`,
      organizationId: scope === "organization" ? context.organizationId : undefined,
      scope,
      key: input.key,
      name: input.name,
      notificationType: input.notificationType,
      defaultChannel: input.defaultChannel,
      subjectTemplate: input.subjectTemplate,
      bodyTemplate: input.bodyTemplate,
      language: input.language ?? "en",
      version: 1,
      active: true,
      variables,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    this.repository.createTemplate(template);
    this.recordVersion(template, context);
    return template;
  }

  update(
    templateId: string,
    input: Partial<CreateTemplateInput>,
    context: ServiceContext,
  ): NotificationTemplateRecord {
    const existing = this.get(templateId, context);
    if (!existing) throw new Error("TEMPLATE_NOT_FOUND");
    if (existing.scope === "system" && context.role !== "super_admin") {
      throw new Error("PERMISSION_DENIED");
    }

    const merged: CreateTemplateInput = {
      key: input.key ?? existing.key,
      name: input.name ?? existing.name,
      notificationType: input.notificationType ?? existing.notificationType,
      defaultChannel: input.defaultChannel ?? existing.defaultChannel,
      subjectTemplate: input.subjectTemplate ?? existing.subjectTemplate,
      bodyTemplate: input.bodyTemplate ?? existing.bodyTemplate,
      language: input.language ?? existing.language,
      variables: input.variables ?? [...existing.variables],
      scope: existing.scope,
    };

    const errors = notificationRulesEngine.validateTemplate(merged);
    if (errors.length > 0) throw new Error(errors[0].code);

    const updated: NotificationTemplateRecord = {
      ...existing,
      ...merged,
      version: existing.version + 1,
      variables: merged.variables ?? [...existing.variables],
      updatedAt: nowIso(),
    };

    this.repository.updateTemplate(updated);
    this.recordVersion(updated, context);
    return updated;
  }

  getVersionHistory(templateId: string, context: ServiceContext): readonly NotificationTemplateVersionRecord[] {
    const template = this.get(templateId, context);
    if (!template) return [];
    return this.repository.listTemplateVersions(templateId);
  }

  render(
    template: NotificationTemplateRecord,
    variables: Readonly<Record<string, string>>,
  ): { subject: string; body: string } {
    return {
      subject: notificationRulesEngine.renderTemplate(template.subjectTemplate, variables),
      body: notificationRulesEngine.renderTemplate(template.bodyTemplate, variables),
    };
  }

  private recordVersion(template: NotificationTemplateRecord, context: ServiceContext): void {
    this.repository.createTemplateVersion({
      id: `tplv-${randomUUID()}`,
      templateId: template.id,
      organizationId: template.organizationId,
      version: template.version,
      subjectTemplate: template.subjectTemplate,
      bodyTemplate: template.bodyTemplate,
      language: template.language,
      createdAt: template.updatedAt,
      createdBy: context.userId ?? "system",
    });
  }
}

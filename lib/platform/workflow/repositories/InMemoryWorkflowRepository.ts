import type {
  ApprovalTaskRecord,
  WorkflowDefinitionRecord,
  WorkflowHistoryRecord,
  WorkflowInquiryQuery,
  WorkflowInstanceRecord,
} from "@/types/workflow";
import type { WorkflowRepository } from "@/lib/platform/workflow/repositories/WorkflowRepository";
import { seedWorkflowDefinitions } from "@/lib/platform/workflow/data/seed-workflows";

/** In-memory workflow repository (Mission P-010.2). */
export class InMemoryWorkflowRepository implements WorkflowRepository {
  readonly domain = "platform" as const;

  private readonly definitions = new Map<string, WorkflowDefinitionRecord>();
  private readonly instances = new Map<string, WorkflowInstanceRecord>();
  private readonly tasks = new Map<string, ApprovalTaskRecord[]>();
  private readonly history = new Map<string, WorkflowHistoryRecord[]>();

  constructor(seedOrganizationId = "org-orania") {
    for (const definition of seedWorkflowDefinitions(seedOrganizationId)) {
      this.definitions.set(definition.id, definition);
    }
  }

  createDefinition(definition: WorkflowDefinitionRecord): WorkflowDefinitionRecord {
    this.definitions.set(definition.id, definition);
    return definition;
  }

  findDefinition(organizationId: string, definitionId: string): WorkflowDefinitionRecord | null {
    const record = this.definitions.get(definitionId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  listDefinitions(organizationId: string): readonly WorkflowDefinitionRecord[] {
    return [...this.definitions.values()].filter((def) => def.organizationId === organizationId);
  }

  createInstance(instance: WorkflowInstanceRecord): WorkflowInstanceRecord {
    this.instances.set(instance.id, instance);
    return instance;
  }

  updateInstance(instance: WorkflowInstanceRecord): WorkflowInstanceRecord {
    this.instances.set(instance.id, instance);
    return instance;
  }

  findInstance(organizationId: string, instanceId: string): WorkflowInstanceRecord | null {
    const record = this.instances.get(instanceId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  listInstances(organizationId: string, query?: WorkflowInquiryQuery): readonly WorkflowInstanceRecord[] {
    let results = [...this.instances.values()].filter((inst) => inst.organizationId === organizationId);

    if (query?.status) {
      results = results.filter((inst) => inst.status === query.status);
    }
    if (query?.domainKey) {
      results = results.filter((inst) => inst.domainKey === query.domainKey);
    }
    if (query?.entityType) {
      results = results.filter((inst) => inst.entityType === query.entityType);
    }

    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  createApprovalTask(task: ApprovalTaskRecord): ApprovalTaskRecord {
    const bucket = this.tasks.get(task.instanceId) ?? [];
    bucket.push(task);
    this.tasks.set(task.instanceId, bucket);
    return task;
  }

  updateApprovalTask(task: ApprovalTaskRecord): ApprovalTaskRecord {
    const bucket = this.tasks.get(task.instanceId) ?? [];
    const index = bucket.findIndex((entry) => entry.id === task.id);
    if (index >= 0) {
      bucket[index] = task;
    } else {
      bucket.push(task);
    }
    this.tasks.set(task.instanceId, bucket);
    return task;
  }

  listApprovalTasks(organizationId: string, instanceId: string): readonly ApprovalTaskRecord[] {
    const instance = this.findInstance(organizationId, instanceId);
    if (!instance) return [];
    return this.tasks.get(instanceId) ?? [];
  }

  findApprovalTask(organizationId: string, taskId: string): ApprovalTaskRecord | null {
    for (const bucket of this.tasks.values()) {
      const task = bucket.find((entry) => entry.id === taskId);
      if (task && task.organizationId === organizationId) return task;
    }
    return null;
  }

  recordHistory(entry: WorkflowHistoryRecord): WorkflowHistoryRecord {
    const bucket = this.history.get(entry.instanceId) ?? [];
    bucket.push(entry);
    this.history.set(entry.instanceId, bucket);
    return entry;
  }

  listHistory(organizationId: string, instanceId: string): readonly WorkflowHistoryRecord[] {
    const instance = this.findInstance(organizationId, instanceId);
    if (!instance) return [];
    return (this.history.get(instanceId) ?? []).filter((entry) => entry.organizationId === organizationId);
  }
}

export const defaultWorkflowRepository = new InMemoryWorkflowRepository();

import type {
  ApprovalTaskRecord,
  WorkflowDefinitionRecord,
  WorkflowHistoryRecord,
  WorkflowInquiryQuery,
  WorkflowInstanceRecord,
} from "@/types/workflow";
/** Workflow repository contract (Mission P-010.2). */
export type WorkflowRepository = {
  readonly domain: string;

  createDefinition(definition: WorkflowDefinitionRecord): WorkflowDefinitionRecord;
  findDefinition(organizationId: string, definitionId: string): WorkflowDefinitionRecord | null;
  listDefinitions(organizationId: string): readonly WorkflowDefinitionRecord[];

  createInstance(instance: WorkflowInstanceRecord): WorkflowInstanceRecord;
  updateInstance(instance: WorkflowInstanceRecord): WorkflowInstanceRecord;
  findInstance(organizationId: string, instanceId: string): WorkflowInstanceRecord | null;
  listInstances(organizationId: string, query?: WorkflowInquiryQuery): readonly WorkflowInstanceRecord[];

  createApprovalTask(task: ApprovalTaskRecord): ApprovalTaskRecord;
  updateApprovalTask(task: ApprovalTaskRecord): ApprovalTaskRecord;
  listApprovalTasks(organizationId: string, instanceId: string): readonly ApprovalTaskRecord[];
  findApprovalTask(organizationId: string, taskId: string): ApprovalTaskRecord | null;

  recordHistory(entry: WorkflowHistoryRecord): WorkflowHistoryRecord;
  listHistory(organizationId: string, instanceId: string): readonly WorkflowHistoryRecord[];
};

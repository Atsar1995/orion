import { AURORA_ERR_0501, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { HealthStatus } from "@/types/aurora-platform";

export type WorkflowId = string;
export type ExecutionId = string;

export type WorkflowDefinition = {
  readonly name: string;
  readonly steps: readonly string[];
};

export type WorkflowExecution = {
  readonly id: ExecutionId;
  readonly workflowId: WorkflowId;
  readonly status: "pending" | "running" | "completed" | "failed";
};

export interface WorkflowEngine {
  createWorkflow(ctx: AuroraRuntimeContext, def: WorkflowDefinition): Promise<WorkflowId>;
  trigger(ctx: AuroraRuntimeContext, workflowId: WorkflowId, payload: unknown): Promise<ExecutionId>;
  getExecution(ctx: AuroraRuntimeContext, executionId: ExecutionId): Promise<WorkflowExecution | null>;
  healthCheck(): Promise<HealthStatus>;
}

/** A-007 stub — full implementation deferred to A-015. */
export class WorkflowEngineStub implements WorkflowEngine {
  async createWorkflow(): Promise<WorkflowId> {
    throw new AuroraError(AURORA_ERR_0501, "WorkflowEngine not implemented.", 501);
  }

  async trigger(): Promise<ExecutionId> {
    throw new AuroraError(AURORA_ERR_0501, "WorkflowEngine not implemented.", 501);
  }

  async getExecution(): Promise<WorkflowExecution | null> {
    throw new AuroraError(AURORA_ERR_0501, "WorkflowEngine not implemented.", 501);
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      status: "degraded",
      message: "WorkflowEngine stub — not implemented.",
      checkedAt: new Date().toISOString(),
    };
  }
}

import type { ExecutionContext } from "@/types/orchestrator";

export function createExecutionContext(executionId: string): ExecutionContext {
  return {
    executionId,
    startedAt: new Date().toISOString(),
    contributions: [],
    normalizedContributions: [],
    metrics: null,
    brief: null,
    dailyBrief: null,
    recommendations: [],
    recommendationBundle: null,
    alertPanel: null,
    businessHealth: null,
    trends: [],
    tasks: [],
    snapshot: null,
    errors: [],
    warnings: [],
    stageResults: [],
  };
}

export function recordStageResult(
  context: ExecutionContext,
  result: ExecutionContext["stageResults"][number],
): void {
  context.stageResults.push(result);

  if (result.error) {
    context.errors.push(result.error);
  }

  if (result.warnings) {
    context.warnings.push(...result.warnings);
  }
}

export function addWarning(context: ExecutionContext, message: string): void {
  context.warnings.push(message);
}

export function addError(
  context: ExecutionContext,
  stageId: string,
  message: string,
  recoverable: boolean,
): void {
  context.errors.push({
    stageId,
    message,
    timestamp: new Date().toISOString(),
    recoverable,
  });
}

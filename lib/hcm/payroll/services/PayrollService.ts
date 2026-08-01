import type { ServiceContext } from "@/types/services";
import type {
  PayrollAdjustmentRecord,
  PayrollComponentRecord,
  PayrollEntryRecord,
  PayrollResultRecord,
  PayrollRunRecord,
  PayrollSearchQuery,
  StartPayrollRunInput,
} from "@/types/hcm-payroll";
import { createPayrollRunId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { publishHcmPayrollEvent } from "@/lib/hcm/hcm-events";
import type { PayrollRepository, PayrollRunRepository } from "@/lib/hcm/payroll/repositories/PayrollRepository";

export class PayrollService {
  constructor(
    private readonly payrollRepository: PayrollRepository,
    private readonly runRepository: PayrollRunRepository,
  ) {}

  startRun(input: StartPayrollRunInput, context: ServiceContext): PayrollRunRecord {
    const organizationId = context.organizationId;
    const period = this.payrollRepository.findPeriod(organizationId, input.periodId);
    if (!period) throw new Error("PAYROLL_PERIOD_NOT_FOUND");
    if (period.status !== "open" && period.status !== "review") {
      throw new Error("INVALID_PERIOD_STATUS");
    }

    const calendar = this.payrollRepository.findCalendar(organizationId, period.calendarId);
    const currency = input.currency ?? calendar?.currency ?? "INR";
    const now = nowIso();

    const run: PayrollRunRecord = {
      id: createPayrollRunId(),
      organizationId,
      periodId: input.periodId,
      runNumber: this.runRepository.nextRunNumber(organizationId, input.periodId),
      status: "started",
      currency,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId ?? "system",
    };

    const saved = this.runRepository.create(run);

    publishHcmPayrollEvent(
      {
        eventType: "PayrollRunStarted",
        entityId: saved.id,
        payload: { periodId: saved.periodId, runNumber: String(saved.runNumber) },
      },
      context,
    );

    return saved;
  }

  review(runId: string, context: ServiceContext): PayrollRunRecord {
    const run = this.requireRun(runId, context, "calculated");
    const updated: PayrollRunRecord = { ...run, status: "review", updatedAt: nowIso() };
    const saved = this.runRepository.update(updated);

    publishHcmPayrollEvent(
      { eventType: "PayrollReviewed", entityId: saved.id, payload: { periodId: saved.periodId } },
      context,
    );

    return saved;
  }

  approve(runId: string, context: ServiceContext): PayrollRunRecord {
    const run = this.requireRun(runId, context, "review");
    const now = nowIso();
    const updated: PayrollRunRecord = {
      ...run,
      status: "approved",
      approvedAt: now,
      updatedAt: now,
    };
    const saved = this.runRepository.update(updated);

    publishHcmPayrollEvent(
      { eventType: "PayrollApproved", entityId: saved.id, payload: { periodId: saved.periodId } },
      context,
    );

    return saved;
  }

  finalize(runId: string, context: ServiceContext): PayrollRunRecord {
    const run = this.requireRun(runId, context, "approved");
    const now = nowIso();
    const updated: PayrollRunRecord = {
      ...run,
      status: "finalized",
      finalizedAt: now,
      updatedAt: now,
    };
    const saved = this.runRepository.update(updated);

    const period = this.payrollRepository.findPeriod(context.organizationId, run.periodId);
    if (period) {
      this.payrollRepository.savePeriod({ ...period, status: "finalized", closedAt: now, updatedAt: now });
    }

    publishHcmPayrollEvent(
      { eventType: "PayrollFinalized", entityId: saved.id, payload: { periodId: saved.periodId } },
      context,
    );

    return saved;
  }

  reverse(runId: string, context: ServiceContext): PayrollRunRecord {
    const run = this.requireRun(runId, context, "finalized");
    const now = nowIso();
    const updated: PayrollRunRecord = {
      ...run,
      status: "reversed",
      reversedAt: now,
      updatedAt: now,
    };
    const saved = this.runRepository.update(updated);

    publishHcmPayrollEvent(
      { eventType: "PayrollReversed", entityId: saved.id, payload: { periodId: saved.periodId } },
      context,
    );

    return saved;
  }

  getRun(runId: string, context: ServiceContext): PayrollRunRecord | null {
    return this.runRepository.findById(context.organizationId, runId);
  }

  listRuns(query: PayrollSearchQuery | undefined, context: ServiceContext): readonly PayrollRunRecord[] {
    return this.runRepository.list(context.organizationId, query);
  }

  listEntries(
    runId: string,
    query: PayrollSearchQuery | undefined,
    context: ServiceContext,
  ): readonly PayrollEntryRecord[] {
    return this.runRepository.listEntries(context.organizationId, runId, query);
  }

  getResult(runId: string, context: ServiceContext): PayrollResultRecord | null {
    return this.payrollRepository.findResult(context.organizationId, runId);
  }

  private requireRun(
    runId: string,
    context: ServiceContext,
    expectedStatus: PayrollRunRecord["status"],
  ): PayrollRunRecord {
    const run = this.runRepository.findById(context.organizationId, runId);
    if (!run) throw new Error("PAYROLL_RUN_NOT_FOUND");
    if (run.status !== expectedStatus) throw new Error("INVALID_RUN_STATUS");
    return run;
  }
}

export type { PayrollComponentRecord, PayrollAdjustmentRecord };

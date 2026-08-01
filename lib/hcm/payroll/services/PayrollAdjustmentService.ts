import type { ServiceContext } from "@/types/services";
import type {
  CreatePayrollAdjustmentInput,
  PayrollAdjustmentRecord,
  PayrollComponentRecord,
} from "@/types/hcm-payroll";
import { createPayrollAdjustmentId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import type {
  PayrollComponentRepository,
  PayrollRepository,
  PayrollRunRepository,
} from "@/lib/hcm/payroll/repositories/PayrollRepository";

export class PayrollAdjustmentService {
  constructor(
    private readonly payrollRepository: PayrollRepository,
    private readonly runRepository: PayrollRunRepository,
    private readonly componentRepository: PayrollComponentRepository,
  ) {}

  create(input: CreatePayrollAdjustmentInput, context: ServiceContext): PayrollAdjustmentRecord {
    const organizationId = context.organizationId;
    const run = this.runRepository.findById(organizationId, input.runId);
    if (!run) throw new Error("PAYROLL_RUN_NOT_FOUND");
    if (run.status === "finalized" || run.status === "reversed") {
      throw new Error("INVALID_RUN_STATUS");
    }

    const component = this.componentRepository.findByCode(organizationId, input.componentCode);
    if (!component) throw new Error("PAYROLL_COMPONENT_NOT_FOUND");

    const now = nowIso();
    const adjustment: PayrollAdjustmentRecord = {
      id: createPayrollAdjustmentId(),
      organizationId,
      runId: input.runId,
      employeeId: input.employeeId,
      componentCode: input.componentCode,
      componentType: input.componentType,
      amount: input.amount,
      retroactive: input.retroactive ?? false,
      effectiveDate: input.effectiveDate,
      reason: input.reason,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId ?? "system",
    };

    return this.payrollRepository.saveAdjustment(adjustment);
  }

  apply(adjustmentId: string, context: ServiceContext): PayrollAdjustmentRecord {
    const organizationId = context.organizationId;
    const adjustment = this.payrollRepository.findAdjustment(organizationId, adjustmentId);
    if (!adjustment) throw new Error("ADJUSTMENT_NOT_FOUND");
    if (adjustment.status !== "pending") throw new Error("INVALID_ADJUSTMENT_STATUS");

    const updated: PayrollAdjustmentRecord = {
      ...adjustment,
      status: "applied",
      updatedAt: nowIso(),
    };
    return this.payrollRepository.saveAdjustment(updated);
  }

  list(runId: string | undefined, context: ServiceContext): readonly PayrollAdjustmentRecord[] {
    return this.payrollRepository.listAdjustments(context.organizationId, runId);
  }

  registerComponent(
    input: Omit<PayrollComponentRecord, "id" | "organizationId" | "active">,
    context: ServiceContext,
  ): PayrollComponentRecord {
    const existing = this.componentRepository.findByCode(context.organizationId, input.code);
    if (existing) throw new Error("DUPLICATE_COMPONENT_CODE");

    return this.componentRepository.create({
      ...input,
      id: `pcomp-${input.code}`,
      organizationId: context.organizationId,
      active: true,
    });
  }
}

import type { ServiceContext } from "@/types/services";
import type { CreateShiftInput, WorkShiftRecord } from "@/types/hcm-time";
import { createShiftId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import type { ShiftRepository } from "@/lib/hcm/time/repositories/TimeRepository";

export class ShiftService {
  constructor(private readonly shiftRepository: ShiftRepository) {}

  create(input: CreateShiftInput, context: ServiceContext): WorkShiftRecord {
    const organizationId = context.organizationId;
    const existing = this.shiftRepository.findByCode(organizationId, input.code);
    if (existing) throw new Error("DUPLICATE_SHIFT_CODE");

    const now = nowIso();
    const shift: WorkShiftRecord = {
      id: createShiftId(),
      organizationId,
      code: input.code,
      name: input.name,
      pattern: input.pattern,
      departmentId: input.departmentId,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    return this.shiftRepository.create(shift);
  }

  update(shiftId: string, input: Partial<CreateShiftInput>, context: ServiceContext): WorkShiftRecord {
    const organizationId = context.organizationId;
    const existing = this.shiftRepository.findById(organizationId, shiftId);
    if (!existing) throw new Error("SHIFT_NOT_FOUND");

    const updated: WorkShiftRecord = {
      ...existing,
      code: input.code ?? existing.code,
      name: input.name ?? existing.name,
      pattern: input.pattern ?? existing.pattern,
      departmentId: input.departmentId ?? existing.departmentId,
      updatedAt: nowIso(),
    };

    return this.shiftRepository.update(updated);
  }

  getById(shiftId: string, context: ServiceContext): WorkShiftRecord | null {
    return this.shiftRepository.findById(context.organizationId, shiftId);
  }

  list(departmentId: string | undefined, context: ServiceContext): readonly WorkShiftRecord[] {
    return this.shiftRepository.list(context.organizationId, departmentId);
  }
}

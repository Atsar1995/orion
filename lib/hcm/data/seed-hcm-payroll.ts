import type { PayrollCalendarRecord, PayrollComponentRecord } from "@/types/hcm-payroll";
import { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import { HCM_SEED_ORG_ID } from "@/lib/hcm/data/seed-hcm-time";

export const SEED_PAYROLL_CALENDAR: PayrollCalendarRecord = {
  id: "pcal-orania-monthly",
  organizationId: HCM_SEED_ORG_ID,
  code: "MONTHLY-INR",
  name: "Monthly Payroll (INR)",
  frequency: "monthly",
  currency: "INR",
  weekStartsOn: "monday",
  active: true,
};

export const SEED_PAYROLL_COMPONENTS: PayrollComponentRecord[] = [
  {
    id: "pcomp-base-salary",
    organizationId: HCM_SEED_ORG_ID,
    code: "BASE_SALARY",
    name: "Base Salary",
    componentType: "earning",
    calculationBasis: "metadata_formula",
    metadata: { formulaKey: "base_salary" },
    active: true,
  },
  {
    id: "pcomp-attendance-bonus",
    organizationId: HCM_SEED_ORG_ID,
    code: "ATTENDANCE_BONUS",
    name: "Attendance Bonus",
    componentType: "earning",
    calculationBasis: "attendance_days",
    rate: 500,
    active: true,
  },
  {
    id: "pcomp-leave-deduction",
    organizationId: HCM_SEED_ORG_ID,
    code: "LEAVE_DEDUCTION",
    name: "Unpaid Leave Deduction",
    componentType: "deduction",
    calculationBasis: "leave_days",
    rate: 1000,
    active: true,
  },
  {
    id: "pcomp-health-benefit",
    organizationId: HCM_SEED_ORG_ID,
    code: "HEALTH_BENEFIT",
    name: "Health Benefit",
    componentType: "benefit",
    calculationBasis: "fixed",
    defaultAmount: { value: 1500, currency: "INR" },
    active: true,
  },
];

export function seedHcmPayrollData(store: InMemoryHcmStore, organizationId = HCM_SEED_ORG_ID): void {
  if (SEED_PAYROLL_CALENDAR.organizationId === organizationId) {
    store.payrollCalendars.set(SEED_PAYROLL_CALENDAR.id, SEED_PAYROLL_CALENDAR);
  }
  for (const component of SEED_PAYROLL_COMPONENTS) {
    if (component.organizationId === organizationId) {
      store.payrollComponents.set(component.id, component);
    }
  }
}

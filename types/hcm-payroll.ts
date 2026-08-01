/**
 * HCM Payroll Foundation types (Mission P-012.7).
 * Country-specific statutory rules are OUT OF SCOPE — configured via metadata/extensions.
 */

export type PayrollFrequency = "weekly" | "biweekly" | "semi_monthly" | "monthly";

export type CurrencyAmount = {
  readonly value: number;
  readonly currency: string;
};

export type PayrollStatus =
  | "draft"
  | "open"
  | "calculating"
  | "review"
  | "approved"
  | "finalized"
  | "reversed";

export type PayrollRunStatus =
  | "draft"
  | "started"
  | "calculated"
  | "review"
  | "approved"
  | "finalized"
  | "reversed";

export type PayrollComponentType = "earning" | "deduction" | "benefit" | "reimbursement";

export type CalculationBasis =
  | "fixed"
  | "percentage"
  | "hourly"
  | "attendance_days"
  | "leave_days"
  | "overtime_hours"
  | "metadata_formula";

export type PayrollCalendarRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly name: string;
  readonly frequency: PayrollFrequency;
  readonly currency: string;
  readonly weekStartsOn?: "monday" | "sunday";
  readonly active: boolean;
};

export type PayrollPeriodRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly calendarId: string;
  readonly periodCode: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly payDate: string;
  readonly status: PayrollStatus;
  readonly openedAt?: string;
  readonly closedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PayrollComponentRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly name: string;
  readonly componentType: PayrollComponentType;
  readonly calculationBasis: CalculationBasis;
  readonly defaultAmount?: CurrencyAmount;
  readonly rate?: number;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly active: boolean;
};

export type EarningComponentRecord = PayrollComponentRecord & {
  readonly componentType: "earning" | "reimbursement";
};

export type DeductionComponentRecord = PayrollComponentRecord & {
  readonly componentType: "deduction";
};

export type BenefitComponentRecord = PayrollComponentRecord & {
  readonly componentType: "benefit";
};

export type PayrollRunRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly periodId: string;
  readonly runNumber: number;
  readonly status: PayrollRunStatus;
  readonly currency: string;
  readonly startedAt?: string;
  readonly calculatedAt?: string;
  readonly approvedAt?: string;
  readonly finalizedAt?: string;
  readonly reversedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

export type PayrollEntryLine = {
  readonly componentCode: string;
  readonly componentType: PayrollComponentType;
  readonly calculationBasis: CalculationBasis;
  readonly quantity?: number;
  readonly rate?: number;
  readonly amount: CurrencyAmount;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type PayrollEntryRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly runId: string;
  readonly employeeId: string;
  readonly employmentId: string;
  readonly departmentId?: string;
  readonly lines: readonly PayrollEntryLine[];
  readonly grossPay: CurrencyAmount;
  readonly totalDeductions: CurrencyAmount;
  readonly netPay: CurrencyAmount;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PayrollAdjustmentRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly runId: string;
  readonly employeeId: string;
  readonly componentCode: string;
  readonly componentType: PayrollComponentType;
  readonly amount: CurrencyAmount;
  readonly retroactive: boolean;
  readonly effectiveDate: string;
  readonly reason?: string;
  readonly status: "pending" | "applied" | "reversed";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

export type PayrollResultRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly runId: string;
  readonly periodId: string;
  readonly totalGross: CurrencyAmount;
  readonly totalDeductions: CurrencyAmount;
  readonly totalNet: CurrencyAmount;
  readonly employeeCount: number;
  readonly status: PayrollRunStatus;
  readonly calculatedAt: string;
};

export type PayrollSearchQuery = {
  readonly periodId?: string;
  readonly employeeId?: string;
  readonly departmentId?: string;
  readonly status?: PayrollRunStatus | PayrollStatus;
  readonly runId?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly page?: number;
  readonly pageSize?: number;
};

export type CreatePayrollCalendarInput = {
  readonly code: string;
  readonly name: string;
  readonly frequency: PayrollFrequency;
  readonly currency: string;
  readonly weekStartsOn?: "monday" | "sunday";
};

export type OpenPayrollPeriodInput = {
  readonly calendarId: string;
  readonly periodCode: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly payDate: string;
};

export type StartPayrollRunInput = {
  readonly periodId: string;
  readonly currency?: string;
};

export type CreatePayrollAdjustmentInput = {
  readonly runId: string;
  readonly employeeId: string;
  readonly componentCode: string;
  readonly componentType: PayrollComponentType;
  readonly amount: CurrencyAmount;
  readonly retroactive?: boolean;
  readonly effectiveDate: string;
  readonly reason?: string;
};

export type PayrollCalculationInput = {
  readonly runId: string;
  readonly employeeIds?: readonly string[];
};

export type PublishHcmPayrollEventInput = {
  readonly eventType:
    | "PayrollPeriodOpened"
    | "PayrollRunStarted"
    | "PayrollCalculated"
    | "PayrollReviewed"
    | "PayrollApproved"
    | "PayrollFinalized"
    | "PayrollReversed";
  readonly entityId: string;
  readonly employeeId?: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

/** Integration input contract — consumed from time & employment modules. */
export type PayrollIntegrationInputs = {
  readonly employeeId: string;
  readonly employmentId: string;
  readonly departmentId?: string;
  readonly baseSalary: CurrencyAmount;
  readonly attendanceDays: number;
  readonly leaveDays: number;
  readonly overtimeHours: number;
  readonly payGradeRef?: string;
};

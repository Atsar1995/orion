/**
 * Finance Domain — fiscal period types (Mission P-009.1 · P-009.5).
 * @see docs/Finance/Blueprints/D-009_Enterprise_Ledger_Principles.md
 */

/** Accounting period lifecycle states (P-009.5). */
export type FiscalPeriodState =
  | "future"
  | "open"
  | "soft_closed"
  | "hard_closed"
  | "year_closed"
  | "archived";

/** Fiscal year lifecycle states. */
export type FiscalYearState = "open" | "year_closed" | "archived";

/** Organization fiscal calendar configuration. */
export type FiscalCalendarRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly fiscalYearStartMonth: number;
  readonly periodsPerYear: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Fiscal year aggregate. */
export type FiscalYearRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly calendarId: string;
  readonly fiscalYear: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly state: FiscalYearState;
};

/** Fiscal accounting period — authoritative period record. */
export type FiscalPeriodRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly calendarId: string;
  readonly fiscalYearId: string;
  readonly name: string;
  readonly fiscalYear: number;
  readonly periodNumber: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly state: FiscalPeriodState;
  readonly reopenedAt?: string;
  readonly reopenedBy?: string;
};

/** Period-produced event types (D-008 extension). */
export type PeriodEventType =
  | "PeriodOpened"
  | "PeriodSoftClosed"
  | "PeriodHardClosed"
  | "YearClosed"
  | "PeriodReopened"
  | "PeriodValidationFailed";

export type PublishPeriodEventInput = {
  readonly eventType: PeriodEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

export type PeriodReopenInput = {
  readonly periodId: string;
  readonly reason: string;
  readonly authorizationReference: string;
};

export type PeriodInquiryQuery = {
  readonly fiscalYear?: number;
  readonly state?: FiscalPeriodState;
};

/** Reference passed to validation for period checks. */
export type AccountingPeriodReference = {
  readonly periodId: string;
  readonly transactionDate?: string;
};

/** Returns true when standard postings are permitted. */
export function isPeriodPostingAllowed(state: FiscalPeriodState): boolean {
  return state === "open";
}

/** Returns true when authorized adjustments may be recorded (framework). */
export function isPeriodAdjustmentAllowed(state: FiscalPeriodState): boolean {
  return state === "open" || state === "soft_closed";
}

/** Returns true when reversals are permitted (framework). */
export function isPeriodReversalAllowed(state: FiscalPeriodState): boolean {
  return state === "open" || state === "soft_closed";
}

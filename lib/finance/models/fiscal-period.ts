import type { FiscalCalendarRecord, FiscalPeriodRecord, FiscalPeriodState, FiscalYearRecord } from "@/types/finance-period";

export type FiscalPeriodListItem = {
  readonly id: string;
  readonly name: string;
  readonly fiscalYear: number;
  readonly periodNumber: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly state: FiscalPeriodState;
  readonly postingAllowed: boolean;
};

export type FiscalPeriodDetailView = FiscalPeriodRecord & {
  readonly postingAllowed: boolean;
  readonly adjustmentAllowed: boolean;
  readonly reversalAllowed: boolean;
};

export type FiscalCalendarView = {
  readonly calendar: FiscalCalendarRecord;
  readonly fiscalYears: readonly FiscalYearRecord[];
  readonly periods: readonly FiscalPeriodListItem[];
};

export type PeriodInquiryView = {
  readonly periods: readonly FiscalPeriodListItem[];
  readonly currentPeriodId: string | null;
  readonly openPeriodCount: number;
};

export type PeriodValidationResult = {
  readonly passed: boolean;
  readonly issues: readonly { code: string; message: string; field?: string }[];
};

export type PeriodTransitionResult = {
  readonly period: FiscalPeriodRecord;
  readonly previousState: FiscalPeriodState;
  readonly newState: FiscalPeriodState;
};

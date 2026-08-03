import { PeriodRulesEngine } from "@/lib/finance/fiscal-period/PeriodRulesEngine";
import { publishPeriodEvent } from "@/lib/finance/fiscal-period/period-events";
import type {
  FiscalCalendarView,
  FiscalPeriodDetailView,
  FiscalPeriodListItem,
  PeriodInquiryView,
  PeriodTransitionResult,
  PeriodValidationResult,
} from "@/lib/finance/models/fiscal-period";
import type { PeriodRepository } from "@/lib/finance/repositories/PeriodRepository";
import type {
  FiscalPeriodRecord,
  FiscalYearRecord,
  PeriodInquiryQuery,
  PeriodReopenInput,
} from "@/types/finance-period";
import type { ServiceContext } from "@/types/services";

function todayIso(): string {
  return new Date().toISOString();
}

function mapListItem(period: FiscalPeriodRecord, rules: PeriodRulesEngine): FiscalPeriodListItem {
  const flags = rules.mapPeriodFlags(period.state);
  return {
    id: period.id,
    name: period.name,
    fiscalYear: period.fiscalYear,
    periodNumber: period.periodNumber,
    startDate: period.startDate,
    endDate: period.endDate,
    state: period.state,
    postingAllowed: flags.postingAllowed,
  };
}

/** Fiscal Period Management service (Mission P-009.5). */
export class FiscalPeriodService {
  readonly rules: PeriodRulesEngine;

  constructor(private readonly periodRepository: PeriodRepository) {
    this.rules = new PeriodRulesEngine(periodRepository);
  }

  getCalendar(context: ServiceContext): FiscalCalendarView | null {
    const calendar = this.periodRepository.getCalendar(context.organizationId);
    if (!calendar) return null;

    const fiscalYears = this.periodRepository.listFiscalYears(context.organizationId);
    const periods = this.periodRepository
      .list(context.organizationId)
      .map((period) => mapListItem(period, this.rules));

    return { calendar, fiscalYears, periods };
  }

  getPeriod(periodId: string, context: ServiceContext): FiscalPeriodDetailView | null {
    const period = this.periodRepository.findById(context.organizationId, periodId);
    if (!period) return null;

    const flags = this.rules.mapPeriodFlags(period.state);
    return { ...period, ...flags };
  }

  getFiscalYear(fiscalYear: number, context: ServiceContext): FiscalYearRecord | null {
    return this.periodRepository.getFiscalYear(context.organizationId, fiscalYear);
  }

  getCurrentPeriod(context: ServiceContext): FiscalPeriodRecord | null {
    return this.periodRepository.getCurrentPeriod(context.organizationId);
  }

  findPeriodByDate(date: string, context: ServiceContext): FiscalPeriodRecord | null {
    return this.periodRepository.findByDate(context.organizationId, date);
  }

  listPeriods(context: ServiceContext): readonly FiscalPeriodListItem[] {
    return this.periodRepository
      .list(context.organizationId)
      .map((period) => mapListItem(period, this.rules));
  }

  inquiry(query: PeriodInquiryQuery, context: ServiceContext): PeriodInquiryView {
    let periods = this.periodRepository.list(context.organizationId);

    if (query.fiscalYear !== undefined) {
      periods = periods.filter((period) => period.fiscalYear === query.fiscalYear);
    }

    if (query.state !== undefined) {
      periods = periods.filter((period) => period.state === query.state);
    }

    const items = periods.map((period) => mapListItem(period, this.rules));
    const current = this.periodRepository.getCurrentPeriod(context.organizationId);

    return {
      periods: items,
      currentPeriodId: current?.id ?? null,
      openPeriodCount: items.filter((item) => item.state === "open").length,
    };
  }

  validateCalendar(fiscalYear: number, context: ServiceContext): PeriodValidationResult {
    const issues = this.rules.validateCalendarIntegrity(context.organizationId, fiscalYear);

    if (issues.length > 0) {
      publishPeriodEvent(
        {
          eventType: "PeriodValidationFailed",
          entityType: "fiscal_calendar",
          entityId: String(fiscalYear),
          payload: { code: issues[0]?.code ?? "VALIDATION_FAILED" },
        },
        context,
      );
    }

    return { passed: issues.length === 0, issues };
  }

  validatePosting(periodId: string, context: ServiceContext): PeriodValidationResult {
    const issues = this.rules.validatePosting(context.organizationId, periodId);

    if (issues.length > 0) {
      publishPeriodEvent(
        {
          eventType: "PeriodValidationFailed",
          entityType: "accounting_period",
          entityId: periodId,
          payload: { code: issues[0]?.code ?? "POSTING_NOT_ALLOWED" },
        },
        context,
      );
    }

    return { passed: issues.length === 0, issues };
  }

  openPeriod(periodId: string, context: ServiceContext): PeriodTransitionResult {
    const issues = this.rules.validateOpenPeriod(context.organizationId, periodId);
    if (issues.length > 0) {
      throw new Error(issues[0]?.code ?? "PERIOD_OPEN_FAILED");
    }

    const existing = this.periodRepository.findById(context.organizationId, periodId);
    if (!existing) throw new Error("PERIOD_NOT_FOUND");

    const updated = this.periodRepository.updateState(context.organizationId, periodId, "open");

    publishPeriodEvent(
      {
        eventType: "PeriodOpened",
        entityType: "accounting_period",
        entityId: periodId,
        payload: { fiscalYear: String(updated.fiscalYear) },
      },
      context,
    );

    return { period: updated, previousState: existing.state, newState: "open" };
  }

  softClosePeriod(periodId: string, context: ServiceContext): PeriodTransitionResult {
    const issues = this.rules.validateSoftClose(context.organizationId, periodId);
    if (issues.length > 0) {
      throw new Error(issues[0]?.code ?? "SOFT_CLOSE_FAILED");
    }

    const existing = this.periodRepository.findById(context.organizationId, periodId);
    if (!existing) throw new Error("PERIOD_NOT_FOUND");

    const updated = this.periodRepository.updateState(context.organizationId, periodId, "soft_closed");

    publishPeriodEvent(
      {
        eventType: "PeriodSoftClosed",
        entityType: "accounting_period",
        entityId: periodId,
      },
      context,
    );

    return { period: updated, previousState: existing.state, newState: "soft_closed" };
  }

  hardClosePeriod(periodId: string, context: ServiceContext): PeriodTransitionResult {
    const issues = this.rules.validateHardClose(context.organizationId, periodId);
    if (issues.length > 0) {
      throw new Error(issues[0]?.code ?? "HARD_CLOSE_FAILED");
    }

    const existing = this.periodRepository.findById(context.organizationId, periodId);
    if (!existing) throw new Error("PERIOD_NOT_FOUND");

    const updated = this.periodRepository.updateState(context.organizationId, periodId, "hard_closed");

    publishPeriodEvent(
      {
        eventType: "PeriodHardClosed",
        entityType: "accounting_period",
        entityId: periodId,
      },
      context,
    );

    return { period: updated, previousState: existing.state, newState: "hard_closed" };
  }

  closeYear(fiscalYear: number, context: ServiceContext): FiscalYearRecord {
    const issues = this.rules.validateYearClose(context.organizationId, fiscalYear);
    if (issues.length > 0) {
      publishPeriodEvent(
        {
          eventType: "PeriodValidationFailed",
          entityType: "fiscal_year",
          entityId: String(fiscalYear),
          payload: { code: issues[0]?.code ?? "YEAR_CLOSE_FAILED" },
        },
        context,
      );
      throw new Error(issues[0]?.code ?? "YEAR_CLOSE_FAILED");
    }

    const periods = this.periodRepository.listByYear(context.organizationId, fiscalYear);
    for (const period of periods) {
      this.periodRepository.updateState(context.organizationId, period.id, "year_closed");
    }

    const year = this.periodRepository.updateFiscalYearState(context.organizationId, fiscalYear, "year_closed");

    publishPeriodEvent(
      {
        eventType: "YearClosed",
        entityType: "fiscal_year",
        entityId: year.id,
        payload: { fiscalYear: String(fiscalYear) },
      },
      context,
    );

    return year;
  }

  reopenPeriod(input: PeriodReopenInput, context: ServiceContext): PeriodTransitionResult {
    const issues = this.rules.validateReopen(input, context);
    if (issues.length > 0) {
      throw new Error(issues[0]?.code ?? "REOPEN_FAILED");
    }

    const existing = this.periodRepository.findById(context.organizationId, input.periodId);
    if (!existing) throw new Error("PERIOD_NOT_FOUND");

    const updated = this.periodRepository.updatePeriod(context.organizationId, {
      ...existing,
      state: "open",
      reopenedAt: todayIso(),
      reopenedBy: context.userId,
    });

    publishPeriodEvent(
      {
        eventType: "PeriodReopened",
        entityType: "accounting_period",
        entityId: input.periodId,
        payload: {
          authorizationReference: input.authorizationReference,
          reason: input.reason,
        },
      },
      context,
    );

    return { period: updated, previousState: existing.state, newState: "open" };
  }

  /** Consumes journal lifecycle events for period governance (P-009.4 integration). */
  consumeJournalEvent(
    event: {
      readonly eventType: "JournalPosted" | "JournalReversed" | "JournalApproved";
      readonly periodId: string;
      readonly journalId: string;
    },
    context: ServiceContext,
  ): { consumed: boolean; periodId: string } {
    const validation = this.validatePosting(event.periodId, context);

    if (event.eventType === "JournalApproved" || event.eventType === "JournalPosted") {
      if (!validation.passed && event.eventType === "JournalPosted") {
        throw new Error(validation.issues[0]?.code ?? "PERIOD_NOT_OPEN");
      }
    }

    void context;
    void event.journalId;
    return { consumed: true, periodId: event.periodId };
  }
}

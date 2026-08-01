import { describe, expect, it } from "vitest";
import { financeFiscalPeriodService, financeService } from "@/lib/finance";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Fiscal Period operations (P-009.5)", () => {
  it("returns fiscal calendar with twelve periods", () => {
    const calendar = financeFiscalPeriodService.getCalendar(CONTEXT);

    expect(calendar).not.toBeNull();
    expect(calendar?.calendar.name).toBe("Orania Standard Calendar");
    expect(calendar?.periods.length).toBe(12);
    expect(calendar?.fiscalYears.length).toBe(1);
  });

  it("identifies current open period as latest open month", () => {
    const current = financeFiscalPeriodService.getCurrentPeriod(CONTEXT);
    expect(current?.id).toBe("period-2026-08");
    expect(current?.state).toBe("open");
  });

  it("finds period by transaction date", () => {
    const period = financeFiscalPeriodService.findPeriodByDate("2026-07-15", CONTEXT);
    expect(period?.id).toBe("period-2026-07");
  });

  it("validates calendar integrity for 2026", () => {
    const result = financeFiscalPeriodService.validateCalendar(2026, CONTEXT);
    expect(result.passed).toBe(true);
  });

  it("allows posting only in open periods", () => {
    expect(financeFiscalPeriodService.validatePosting("period-2026-07", CONTEXT).passed).toBe(true);
    expect(financeFiscalPeriodService.validatePosting("period-2026-06", CONTEXT).passed).toBe(false);
    expect(financeFiscalPeriodService.validatePosting("period-2026-09", CONTEXT).passed).toBe(false);
  });

  it("opens a future period", () => {
    const result = financeFiscalPeriodService.openPeriod("period-2026-10", CONTEXT);
    expect(result.newState).toBe("open");
    expect(result.previousState).toBe("future");
  });

  it("soft closes an open period", () => {
    financeFiscalPeriodService.openPeriod("period-2026-11", CONTEXT);
    const result = financeFiscalPeriodService.softClosePeriod("period-2026-11", CONTEXT);
    expect(result.newState).toBe("soft_closed");
  });

  it("hard closes a soft-closed period", () => {
    financeFiscalPeriodService.openPeriod("period-2026-12", CONTEXT);
    financeFiscalPeriodService.softClosePeriod("period-2026-12", CONTEXT);
    const result = financeFiscalPeriodService.hardClosePeriod("period-2026-12", CONTEXT);
    expect(result.newState).toBe("hard_closed");
  });

  it("reopens a hard-closed period with authorization", () => {
    const result = financeFiscalPeriodService.reopenPeriod(
      {
        periodId: "period-2026-01",
        reason: "Audit adjustment required",
        authorizationReference: "AUTH-2026-001",
      },
      CONTEXT,
    );

    expect(result.newState).toBe("open");
    expect(result.period.reopenedBy).toBe("user-executive");
  });

  it("rejects reopen without executive authorization", () => {
    const staffContext: ServiceContext = { ...CONTEXT, role: "staff", userId: "user-staff" };

    expect(() =>
      financeFiscalPeriodService.reopenPeriod(
        {
          periodId: "period-2026-05",
          reason: "Unauthorized attempt",
          authorizationReference: "AUTH-BAD",
        },
        staffContext,
      ),
    ).toThrow("UNAUTHORIZED_REOPEN");
  });

  it("consumes journal posted events against period rules", () => {
    const result = financeFiscalPeriodService.consumeJournalEvent(
      { eventType: "JournalApproved", periodId: "period-2026-08", journalId: "jrnl-001" },
      CONTEXT,
    );

    expect(result.consumed).toBe(true);
  });

  it("marks domain ready for event pipeline", () => {
    const status = financeService.getDomainStatus();
    expect(status.fiscalPeriodImplemented).toBe(true);
    expect(status.readyForEventPipeline).toBe(true);
  });
});

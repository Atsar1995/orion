import type { ServiceContext, ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

/** Journal service contract — implementation P-009.2+. */
export type JournalService = {
  composeJournal(
    context: ServiceContext,
    correlationId: string,
  ): ServiceResult<{ journalId: string }>;
};

export class StubJournalService implements JournalService {
  composeJournal(
    _context: ServiceContext,
    _correlationId: string,
  ): ServiceResult<{ journalId: string }> {
    return {
      success: false,
      error: {
        code: ServiceErrorCode.NotImplemented,
        message: "Journal processing not implemented until P-009.2",
      },
    };
  }
}

export const stubJournalService = new StubJournalService();

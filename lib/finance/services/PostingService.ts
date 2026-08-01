import type { ServiceContext, ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

/** Posting service contract — implementation P-009.2+. */
export type PostingService = {
  postJournal(context: ServiceContext, journalId: string): ServiceResult<{ posted: boolean }>;
};

export class StubPostingService implements PostingService {
  postJournal(
    _context: ServiceContext,
    _journalId: string,
  ): ServiceResult<{ posted: boolean }> {
    return {
      success: false,
      error: {
        code: ServiceErrorCode.NotImplemented,
        message: "Posting not implemented until P-009.2",
      },
    };
  }
}

export const stubPostingService = new StubPostingService();

import {
  buildDailyExecutiveBrief,
  buildExecutiveBriefForDashboard,
} from "@/lib/intelligence/brief/ExecutiveBriefEngine";
import type { DailyExecutiveBrief } from "@/types/brief";
import type { ExecutiveBrief } from "@/types/intelligence";

/** Executive Brief service — Brief Engine (ES-028) via Provider Framework. */
export const executiveBriefService = {
  async getExecutiveBrief(): Promise<ExecutiveBrief> {
    return buildExecutiveBriefForDashboard();
  },

  async getDailyExecutiveBrief(templateId?: string): Promise<DailyExecutiveBrief> {
    return buildDailyExecutiveBrief(templateId);
  },
};

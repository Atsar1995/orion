import type { BriefView } from "@/types/executive";

/** Repository contract for EC-001 Morning Executive Brief data. */
export interface BriefRepository {
  getBriefView(): Promise<BriefView>;
}

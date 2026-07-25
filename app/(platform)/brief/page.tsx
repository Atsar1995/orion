import { BriefPageContent } from "@/components/executive/BriefPageContent";
import { getMorningExecutiveBrief } from "@/lib/executive/brief";

export const dynamic = "force-dynamic";

/** EC-001 Morning Executive Brief — production vertical slice (Sprint 6). */
export default async function MorningExecutiveBriefPage() {
  const brief = await getMorningExecutiveBrief();

  return <BriefPageContent brief={brief} />;
}

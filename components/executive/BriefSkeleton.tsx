import { BriefLayout } from "@/components/executive/BriefLayout";
import { BriefQuickNav } from "@/components/executive/BriefQuickNav";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_GRID_2_COL,
} from "@/lib/constants";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-orion-md border border-white/[0.06] bg-white/[0.04] ${className ?? ""}`}
    />
  );
}

/** Loading skeleton for EC-001 Morning Executive Brief. */
export function BriefSkeleton() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <BriefLayout>
        <div className={WORKSPACE_HEADER_BLOCK_CLASS}>
          <SkeletonBlock className="h-5 w-64 max-w-full" />
          <SkeletonBlock className="mt-2 h-8 w-96 max-w-full" />
          <SkeletonBlock className="mt-2 h-4 w-72 max-w-full" />
        </div>

        <BriefQuickNav />

        <LoadingState label="Preparing your Morning Executive Brief..." />

        <section className={WORKSPACE_SECTION_CLASS}>
          <SkeletonBlock className="h-24" />
          <div className={WORKSPACE_GRID_2_COL}>
            <SkeletonBlock className="h-56" />
            <SkeletonBlock className="h-56" />
          </div>
          <SkeletonBlock className="h-44" />
          <SkeletonBlock className="h-32" />
        </section>
      </BriefLayout>
    </div>
  );
}

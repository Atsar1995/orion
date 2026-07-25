import { BriefLayout } from "@/components/executive/BriefLayout";
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
          <SkeletonBlock className="h-5 w-48" />
          <SkeletonBlock className="mt-3 h-10 w-72 max-w-full" />
          <SkeletonBlock className="mt-2 h-4 w-56" />
        </div>

        <LoadingState label="Preparing your Morning Executive Brief..." />

        <section className={WORKSPACE_SECTION_CLASS}>
          <div className={WORKSPACE_GRID_2_COL}>
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-64" />
          </div>
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-36" />
        </section>
      </BriefLayout>
    </div>
  );
}

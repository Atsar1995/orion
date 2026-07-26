import { Widget, WidgetBody, WidgetGrid, WidgetGridItem } from "@/components/dashboard";
import {
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_GROUP_CLASS,
} from "@/lib/constants";

function DashboardWidgetSkeleton() {
  return (
    <Widget>
      <WidgetBody className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded-orion-md bg-white/[0.06]" />
        <div className="h-8 w-20 animate-pulse rounded-orion-md bg-white/[0.05]" />
        <div className="h-12 animate-pulse rounded-orion-md bg-white/[0.04]" />
      </WidgetBody>
    </Widget>
  );
}

/** EP-002 executive dashboard loading state. */
export default function ExecutiveDashboardLoading() {
  return (
    <div className={WORKSPACE_PAGE_CLASS} aria-busy="true" aria-live="polite">
      <div className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <div className="h-5 w-48 animate-pulse rounded-orion-md bg-white/[0.06]" />
        <div className="mt-3 h-10 w-72 animate-pulse rounded-orion-md bg-white/[0.06]" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded-orion-md bg-white/[0.04]" />
      </div>

      <section className={WORKSPACE_SECTION_GROUP_CLASS}>
        <WidgetGrid columns={3}>
          <WidgetGridItem span="third">
            <DashboardWidgetSkeleton />
          </WidgetGridItem>
          <WidgetGridItem span="third">
            <DashboardWidgetSkeleton />
          </WidgetGridItem>
          <WidgetGridItem span="third">
            <DashboardWidgetSkeleton />
          </WidgetGridItem>
        </WidgetGrid>
      </section>

      <section className={WORKSPACE_SECTION_GROUP_CLASS}>
        <WidgetGrid columns={1}>
          <WidgetGridItem span="full">
            <DashboardWidgetSkeleton />
          </WidgetGridItem>
        </WidgetGrid>
      </section>
    </div>
  );
}

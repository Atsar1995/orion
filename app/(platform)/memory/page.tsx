import { Card } from "@/components/ui/Card";
import { memoryService } from "@/lib/executive/memory";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { decisionService } from "@/lib/decisions";
import {
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_TITLE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

/** Executive Memory Platform workspace (Mission P-004). */
export default async function ExecutiveMemoryPage() {
  const { context, executiveName } = await getDecisionServiceContext();
  const decisions = decisionService.searchDecisions({}, context);
  const learning = decisionService.getExecutiveLearning(context, executiveName);

  memoryService.syncFromDecisions(decisions, context, learning);

  const analytics = memoryService.getAnalytics(context, decisions);
  const timeline = memoryService.getTimeline(context);
  const patterns = memoryService.getPatterns(context, decisions, learning);
  const recent = memoryService.searchMemories({}, context).slice(0, 8);

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className="space-y-2 border-b border-white/[0.06] pb-5">
        <h1 className={WORKSPACE_TITLE_CLASS}>Executive Memory</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          Organizational intelligence — connected knowledge across every workspace and decision.
        </p>
      </header>

      <section className={WORKSPACE_SECTION_CLASS}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card title="Total Knowledge">
            <p className="text-3xl font-semibold text-orion-text">{analytics.totalMemories}</p>
          </Card>
          <Card title="Relationship Density">
            <p className="text-3xl font-semibold text-orion-text">{analytics.relationshipDensity}%</p>
          </Card>
          <Card title="Decision Recall">
            <p className="text-3xl font-semibold text-orion-text">{analytics.decisionRecallRate}%</p>
          </Card>
          <Card title="Learning Rate">
            <p className="text-3xl font-semibold text-orion-text">{analytics.learningRate}%</p>
          </Card>
        </div>

        <Card title="Recent Organizational Memory">
          <ul className="space-y-3">
            {recent.map(({ entry }) => (
              <li
                key={entry.id}
                id={entry.id}
                className="rounded-orion-md border border-orion-border/60 px-3 py-3"
              >
                <p className="text-[10px] font-medium tracking-wide text-orion-gold/70 uppercase">
                  {entry.category.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm font-medium text-orion-text">{entry.title}</p>
                <p className="mt-1 text-xs font-light text-orion-muted">{entry.summary}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Executive Timeline">
          <ul className="space-y-2">
            {timeline.slice(0, 10).map((entry) => (
              <li key={entry.id} className="text-sm font-light text-orion-muted">
                <span className="text-orion-text/85">{entry.title}</span>
                <span className="mx-2">·</span>
                {entry.workspace}
                <span className="mx-2">·</span>
                {new Date(entry.timestamp).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recognized Patterns">
          <ul className="space-y-3">
            {patterns.slice(0, 5).map((pattern) => (
              <li key={pattern.id} className="rounded-orion-md border border-orion-border/50 px-3 py-2">
                <p className="text-sm font-medium text-orion-text">{pattern.title}</p>
                <p className="mt-1 text-xs font-light text-orion-muted">{pattern.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

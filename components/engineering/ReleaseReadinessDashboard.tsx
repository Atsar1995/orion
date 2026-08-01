import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { readinessAssessmentService } from "@/lib/observability";
import type { ReadinessScore } from "@/lib/observability";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_FIELD_ROW_CLASS,
  WORKSPACE_GRID_2_COL,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: ReadinessScore["status"] }) {
  const tone =
    status === "pass"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : status === "warn"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
        : "border-red-400/30 bg-red-400/10 text-red-200";

  return (
    <span className={cn("rounded-orion-sm border px-2 py-0.5 text-[10px] font-medium uppercase", tone)}>
      {status}
    </span>
  );
}

/** Internal executive readiness dashboard (Mission S1D). */
export function ReleaseReadinessDashboard() {
  const report = readinessAssessmentService.assess();

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <h1 className={WORKSPACE_TITLE_CLASS}>Release Readiness</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          Production quality assessment for ORION platform deployment.
        </p>
      </header>

      <Card title="Overall readiness">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-4xl font-semibold text-orion-text">{report.overallScore}/100</p>
            <p className="text-sm text-orion-muted">
              {report.releaseReady ? "Conditional release ready" : "Stabilization required"}
            </p>
          </div>
          <Link
            href="/api/health/readiness"
            className="text-sm font-medium text-orion-gold hover:text-orion-gold-light"
          >
            View JSON report →
          </Link>
        </div>
      </Card>

      <div className={WORKSPACE_GRID_2_COL}>
        {report.scores.map((score) => (
          <Card key={score.category} title={score.label}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-3xl font-semibold text-orion-text">{score.score}</p>
                <StatusBadge status={score.status} />
              </div>
              <p className="text-sm font-light text-orion-muted">{score.detail}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Verification gates">
          <dl className={WORKSPACE_FIELD_LIST_CLASS}>
            {Object.entries(report.verification).map(([key, value]) => (
              <div key={key} className={WORKSPACE_FIELD_ROW_CLASS}>
                <dt className="text-sm capitalize text-orion-muted">{key}</dt>
                <dd className="text-sm text-orion-text">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Tracked technical debt">
          <ul className="space-y-2">
            {report.technicalDebt.map((item) => (
              <li key={item} className="text-sm font-light text-orion-muted">
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className={WORKSPACE_SUBTITLE_CLASS}>
        Generated {new Date(report.generatedAt).toLocaleString()} · Health endpoint:{" "}
        <Link href="/api/health" className="text-orion-gold/80 hover:text-orion-gold">
          /api/health
        </Link>
      </p>
    </div>
  );
}

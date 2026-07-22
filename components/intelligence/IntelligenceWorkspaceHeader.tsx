import {
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Intelligence Workspace executive header with title, subtitle, and date. */
export function IntelligenceWorkspaceHeader() {
  return (
    <header className="space-y-4">
      <div className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <h1 className={WORKSPACE_TITLE_CLASS}>ORION Intelligence</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          AI-powered executive insights, recommendations, and operational
          awareness.
        </p>
        <p className={WORKSPACE_SUBTITLE_CLASS}>{formatTodayDate()}</p>
      </div>
    </header>
  );
}

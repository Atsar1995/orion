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
      <div className="space-y-2 border-b border-white/[0.06] pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          ORION Intelligence
        </h1>
        <p className="text-sm font-light text-white/45">
          AI-powered executive insights, recommendations, and operational
          awareness.
        </p>
        <p className="text-sm font-light text-white/45">{formatTodayDate()}</p>
      </div>
    </header>
  );
}

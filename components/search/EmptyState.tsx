import { EmptyState as UiEmptyState } from "@/components/ui/EmptyState";
import { EMPTY_STATE_SUGGESTIONS } from "@/lib/search/search-data";

export function EmptyState() {
  return (
    <div className="space-y-4 px-4 py-6">
      <UiEmptyState
        title="Start typing..."
        description="Search navigation, commands, reports, and settings across ORION."
        className="items-start text-left sm:items-start sm:text-left"
      />
      <div>
        <p className="mb-2 px-1 text-[11px] font-medium tracking-[0.08em] text-white/35 uppercase">
          Suggestions
        </p>
        <ul className="flex flex-wrap gap-2">
          {EMPTY_STATE_SUGGESTIONS.map((suggestion) => (
            <li
              key={suggestion}
              className="rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-light text-white/55"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

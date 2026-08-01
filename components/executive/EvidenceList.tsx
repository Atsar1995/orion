import type { ExecutiveEvidence } from "@/types/executive";

type EvidenceListProps = {
  evidence: readonly ExecutiveEvidence[];
  compact?: boolean;
};

/** Traceable evidence list for recommendations and AI summaries. */
export function EvidenceList({ evidence, compact = false }: EvidenceListProps) {
  if (evidence.length === 0) {
    return null;
  }

  return (
    <ul className={compact ? "flex flex-wrap gap-2" : "space-y-2"}>
      {evidence.map((item) => (
        <li
          key={item.id}
          className={
            compact
              ? "rounded-full border border-orion-border bg-orion-surface px-3 py-1 text-xs font-light text-orion-muted"
              : "rounded-orion-md border border-orion-border bg-orion-surface px-3 py-2"
          }
        >
          {compact ? (
            <span>
              {item.source}
              {item.value ? ` · ${item.value}` : ""}
            </span>
          ) : (
            <>
              <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                {item.source} · {item.type}
              </p>
              <p className="mt-1 text-sm font-light text-orion-text/85">
                {item.label}
                {item.value ? ` · ${item.value}` : ""}
              </p>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

import type { SearchItem } from "@/lib/search/search-types";
import { cn } from "@/lib/utils";

type SearchResultItemProps = {
  item: SearchItem;
  isActive: boolean;
  onSelect: (item: SearchItem) => void;
  onHover: () => void;
  id: string;
};

export function SearchResultItem({
  item,
  isActive,
  onSelect,
  onHover,
  id,
}: SearchResultItemProps) {
  return (
    <button
      type="button"
      id={id}
      role="option"
      aria-selected={isActive}
      onMouseEnter={onHover}
      onClick={() => onSelect(item)}
      className={cn(
        "flex w-full items-start gap-3 rounded-orion-md px-3 py-2.5 text-left transition-colors duration-[var(--orion-duration-fast)]",
        isActive
          ? "bg-orion-gold/10 text-white"
          : "text-white/80 hover:bg-white/[0.04]",
      )}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-orion-sm border border-white/[0.08] bg-white/[0.03] text-xs text-white/50">
        {item.favorite ? "⭐" : item.label.charAt(0)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white/90">
          {item.label}
        </span>
        {item.description ? (
          <span className="mt-0.5 block truncate text-xs font-light text-white/45">
            {item.description}
          </span>
        ) : null}
      </span>
    </button>
  );
}

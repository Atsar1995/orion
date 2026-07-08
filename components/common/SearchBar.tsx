import { SearchIcon } from "@/components/common/icons";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  placeholder = "Search ORION...",
  className,
}: SearchBarProps) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">Search</span>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/30" />
      <input
        type="search"
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pr-4 pl-10 text-sm font-light text-white placeholder:text-white/30 transition-colors duration-200 outline-none focus:border-orion-gold/30 focus:bg-white/[0.06]"
      />
    </label>
  );
}

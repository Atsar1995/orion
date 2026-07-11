import type { ChangeEvent } from "react";
import { SearchIcon } from "@/components/common/icons";
import { cn } from "@/lib/utils";

type SearchBoxProps = {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
};

export function SearchBox({
  placeholder = "Search ORION...",
  className,
  value,
  onChange,
  onValueChange,
  id,
  name,
}: SearchBoxProps) {
  const isControlled = onChange !== undefined || onValueChange !== undefined;

  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">Search</span>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/30" />
      <input
        type="search"
        id={id}
        name={name}
        placeholder={placeholder}
        {...(value !== undefined ? { value } : {})}
        {...(isControlled
          ? {
              onChange: (event: ChangeEvent<HTMLInputElement>) => {
                onValueChange?.(event);
                onChange?.(event.target.value);
              },
            }
          : {})}
        className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.04] py-2.5 pr-4 pl-10 text-sm font-light text-white placeholder:text-white/30 transition-colors duration-[var(--orion-duration-normal)] outline-none focus:border-orion-gold/30 focus:bg-white/[0.06]"
      />
    </label>
  );
}

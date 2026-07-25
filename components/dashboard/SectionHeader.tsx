import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

/** Section heading for Executive Dashboard layout zones (ES-022). */
export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-[var(--orion-space-2)] border-b border-orion-border pb-[var(--orion-space-4)] sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-[length:var(--orion-text-heading-lg)] font-semibold tracking-[var(--orion-tracking-tight)] text-orion-text">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm font-light text-orion-muted">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

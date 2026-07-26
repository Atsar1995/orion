import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WidgetHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/** Widget title region with optional action slot. */
export function WidgetHeader({ title, description, action, className }: WidgetHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4", className)}>
      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-sm font-medium text-white/90">{title}</h3>
        {description ? <p className="text-xs font-light text-white/45">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

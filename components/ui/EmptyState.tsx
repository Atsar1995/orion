import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-start gap-2 py-2 text-center sm:items-center sm:text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-1 text-white/30" aria-hidden>
          {icon}
        </div>
      ) : null}
      {title ? (
        <p className="text-sm font-medium text-white/70">{title}</p>
      ) : null}
      <p className="text-sm leading-relaxed font-light text-white/50">
        {description}
      </p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

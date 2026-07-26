import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WidgetFooterProps = {
  children: ReactNode;
  className?: string;
};

/** Widget footer region for actions or metadata. */
export function WidgetFooter({ children, className }: WidgetFooterProps) {
  return (
    <div className={cn("border-t border-white/[0.06] px-5 py-3 text-xs text-white/45", className)}>
      {children}
    </div>
  );
}

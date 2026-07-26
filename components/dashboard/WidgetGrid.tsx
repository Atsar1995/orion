import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WidgetGridColumns = 1 | 2 | 3 | 4;

type WidgetGridProps = {
  children: ReactNode;
  columns?: WidgetGridColumns;
  className?: string;
};

const COLUMN_CLASS: Record<WidgetGridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

/** Responsive widget grid for executive dashboard layouts. */
export function WidgetGrid({ children, columns = 2, className }: WidgetGridProps) {
  return (
    <div className={cn("grid gap-[var(--orion-space-4)]", COLUMN_CLASS[columns], className)}>
      {children}
    </div>
  );
}

type WidgetGridItemProps = {
  children: ReactNode;
  className?: string;
  span?: "full" | "half" | "third";
};

/** Grid placement helper for dashboard widgets. */
export function WidgetGridItem({ children, className, span = "full" }: WidgetGridItemProps) {
  const spanClass =
    span === "half" || span === "third" ? "col-span-1" : "col-span-full";

  return <div className={cn(spanClass, className)}>{children}</div>;
}

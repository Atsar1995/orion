import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardGridColumns = 1 | 2 | 3 | 4;

type DashboardGridProps = {
  children: ReactNode;
  columns?: DashboardGridColumns;
  className?: string;
  /** Wider first cell for executive score + KPI row */
  variant?: "default" | "metrics";
};

const COLUMN_CLASS: Record<DashboardGridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

/** Responsive dashboard widget grid — ES-022 layout foundation. */
export function DashboardGrid({
  children,
  columns = 2,
  className,
  variant = "default",
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-[var(--orion-space-4)]",
        variant === "metrics"
          ? "grid-cols-1 lg:grid-cols-6 xl:grid-cols-12"
          : COLUMN_CLASS[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}

type DashboardGridItemProps = {
  children: ReactNode;
  className?: string;
  span?: "full" | "half" | "third" | "score" | "metric";
};

/** Grid item with optional span for metrics layout. */
export function DashboardGridItem({
  children,
  className,
  span = "full",
}: DashboardGridItemProps) {
  const spanClass =
    span === "score"
      ? "lg:col-span-6 xl:col-span-4"
      : span === "metric"
        ? "lg:col-span-3 xl:col-span-2"
        : span === "half"
          ? "md:col-span-1 xl:col-span-2"
          : span === "third"
            ? "xl:col-span-4"
            : "col-span-full";

  return <div className={cn(spanClass, className)}>{children}</div>;
}

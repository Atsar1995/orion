import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_CAPTION_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type HospitalityDataTableProps<T> = {
  title: string;
  caption?: string;
  columns: readonly Column<T>[];
  rows: readonly T[];
  emptyMessage?: string;
  getRowKey: (row: T) => string;
};

/** Accessible data table for hospitality workspace sub-pages (Mission P-007). */
export function HospitalityDataTable<T>({
  title,
  caption,
  columns,
  rows,
  emptyMessage = "No records found.",
  getRowKey,
}: HospitalityDataTableProps<T>) {
  return (
    <Card title={title}>
      {caption ? <p className={`mb-4 ${WORKSPACE_CAPTION_CLASS}`}>{caption}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-3 py-2 text-[10px] font-medium tracking-wide text-orion-muted uppercase",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-sm font-light text-white/45"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("px-3 py-3 font-light text-white/70", column.className)}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

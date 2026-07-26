import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WidgetBodyProps = {
  children: ReactNode;
  className?: string;
};

/** Widget content region. */
export function WidgetBody({ children, className }: WidgetBodyProps) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

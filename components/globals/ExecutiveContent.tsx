import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ExecutiveContentProps = {
  children: ReactNode;
  className?: string;
  /** Accessible label for the primary page region. */
  ariaLabel?: string;
};

/** Primary content region for executive platform pages. */
export function ExecutiveContent({
  children,
  className,
  ariaLabel = "Executive workspace content",
}: ExecutiveContentProps) {
  return (
    <main
      aria-label={ariaLabel}
      className={cn("flex-1 px-6 py-6 md:px-8 md:py-8", className)}
    >
      {children}
    </main>
  );
}

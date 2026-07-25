import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BriefLayoutProps = {
  children: ReactNode;
  className?: string;
};

/** EC-001 page shell — responsive spacing and max-width for executive scanning. */
export function BriefLayout({ children, className }: BriefLayoutProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-6", className)}>
      {children}
    </div>
  );
}

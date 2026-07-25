import type { ReactNode } from "react";
import { WORKSPACE_PAGE_CLASS, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CommandCenterLayoutProps = {
  children: ReactNode;
  className?: string;
};

/** Responsive shell for the Executive Command Center. */
export function CommandCenterLayout({ children, className }: CommandCenterLayoutProps) {
  return (
    <div className={cn(WORKSPACE_PAGE_CLASS, className)}>
      <section aria-label="Executive Command Center" className={WORKSPACE_SECTION_CLASS}>
        {children}
      </section>
    </div>
  );
}

import type { ReactNode } from "react";
import { CommandPaletteProvider } from "@/components/layout/CommandPaletteProvider";
import { ExecutiveShellProvider } from "@/components/layout/ExecutiveShellProvider";
import { ExecutiveKeyboardShortcuts } from "@/components/executive/ExecutiveKeyboardShortcuts";
import { ExecutiveContent } from "@/components/globals/ExecutiveContent";
import { ExecutiveFooter } from "@/components/globals/ExecutiveFooter";
import { ExecutiveHeader } from "@/components/globals/ExecutiveHeader";
import { ExecutiveSidebar } from "@/components/globals/ExecutiveSidebar";
import type { BreadcrumbItem } from "@/lib/navigation";

type ExecutiveLayoutProps = {
  children: ReactNode;
  breadcrumbs?: readonly BreadcrumbItem[];
  contentAriaLabel?: string;
};

/** Foundational executive platform shell for all ORION module surfaces. */
export function ExecutiveLayout({
  children,
  breadcrumbs,
  contentAriaLabel,
}: ExecutiveLayoutProps) {
  return (
    <ExecutiveShellProvider>
      <CommandPaletteProvider>
        <ExecutiveKeyboardShortcuts />
        <div className="relative min-h-screen bg-orion-navy font-sans text-white">
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(212,175,55,0.06),transparent_55%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(255,255,255,0.02),transparent_60%)]"
          />

          <ExecutiveSidebar />

          <div className="relative flex min-h-screen flex-col md:pl-64">
            <ExecutiveHeader breadcrumbs={breadcrumbs} />
            <ExecutiveContent ariaLabel={contentAriaLabel}>{children}</ExecutiveContent>
            <ExecutiveFooter />
          </div>
        </div>
      </CommandPaletteProvider>
    </ExecutiveShellProvider>
  );
}

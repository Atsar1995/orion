"use client";

import Link from "next/link";
import { Button } from "@/components/common/Button";
import { BellIcon } from "@/components/common/icons";
import { CommandPaletteTrigger } from "@/components/search/CommandPaletteTrigger";
import { ProfileMenu } from "@/components/auth/ProfileMenu";
import { useExecutiveShell } from "@/components/layout/ExecutiveShellProvider";
import { ORION_FOCUS_RING_CLASS } from "@/lib/constants";
import type { BreadcrumbItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type ExecutiveHeaderProps = {
  breadcrumbs?: readonly BreadcrumbItem[];
  className?: string;
};

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

/** Executive platform header — restrained chrome for focused workspace content. */
export function ExecutiveHeader({ breadcrumbs = [], className }: ExecutiveHeaderProps) {
  const { toggleSidebar } = useExecutiveShell();

  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--orion-z-header)] border-b border-orion-border bg-orion-navy/85 px-4 py-3 backdrop-blur-xl md:px-8",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-6">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-orion-md border border-orion-border bg-orion-surface/60 text-orion-muted transition-colors hover:text-orion-text md:hidden",
              ORION_FOCUS_RING_CLASS,
            )}
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <CommandPaletteTrigger className="min-w-0 flex-1 md:min-w-[240px] md:max-w-md lg:min-w-[320px]" />

          {breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-orion-muted">
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <li key={item.href} className="flex items-center gap-2">
                      {index > 0 ? (
                        <span aria-hidden="true" className="text-orion-muted/50">
                          /
                        </span>
                      ) : null}
                      {isLast ? (
                        <span
                          aria-current="page"
                          className="truncate font-medium text-orion-text/85"
                        >
                          {item.label}
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "truncate transition-colors hover:text-orion-text/85",
                            ORION_FOCUS_RING_CLASS,
                          )}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="icon" aria-label="Notifications" className="hidden sm:inline-flex">
            <BellIcon className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orion-gold" aria-hidden />
          </Button>

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkspaceNavItem } from "@/lib/workspace-nav";
import { isWorkspaceNavActive } from "@/lib/workspace-nav";
import { cn } from "@/lib/utils";

type WorkspaceSubNavProps = {
  items: WorkspaceNavItem[];
  basePath: string;
  ariaLabel: string;
};

/** Shared horizontal sub-navigation for Business Workspaces. */
export function WorkspaceSubNav({
  items,
  basePath,
  ariaLabel,
}: WorkspaceSubNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={ariaLabel}
      className="overflow-x-auto border-b border-white/[0.06] pb-px"
    >
      <ul className="flex min-w-max gap-1">
        {items.map((item) => {
          const isActive = isWorkspaceNavActive(pathname, item.href, basePath);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-t-orion-md px-3 py-2 text-sm font-light transition-all duration-200",
                  isActive
                    ? "border border-b-0 border-orion-gold/20 bg-orion-gold/10 text-white"
                    : "border border-transparent text-white/50 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-white/85",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { WorkspaceNavItem } from "@/lib/workspace-nav";
import { isWorkspaceNavActive } from "@/lib/workspace-nav";
import { ORION_FOCUS_RING_CLASS } from "@/lib/constants";
import {
  getExecutivePreferences,
  setExecutivePreferences,
} from "@/lib/executive/personalization";
import { cn } from "@/lib/utils";

type WorkspaceSubNavProps = {
  items: WorkspaceNavItem[];
  basePath: string;
  ariaLabel: string;
  primaryItemCount?: number;
  preferenceKey?: "financeNavExpanded";
};

/** Shared horizontal sub-navigation for Business Workspaces. */
export function WorkspaceSubNav({
  items,
  basePath,
  ariaLabel,
  primaryItemCount,
  preferenceKey,
}: WorkspaceSubNavProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(() =>
    preferenceKey ? getExecutivePreferences()[preferenceKey] : false,
  );

  const hasPrimarySplit =
    primaryItemCount !== undefined && primaryItemCount > 0 && primaryItemCount < items.length;
  const activeItemOutsidePrimary =
    hasPrimarySplit &&
    items.slice(primaryItemCount).some((item) =>
      isWorkspaceNavActive(pathname, item.href, basePath),
    );
  const showAll = expanded || activeItemOutsidePrimary;
  const visibleItems = hasPrimarySplit && !showAll ? items.slice(0, primaryItemCount) : items;

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);

    if (preferenceKey) {
      setExecutivePreferences({ [preferenceKey]: next });
    }
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="overflow-x-auto border-b border-white/[0.06] pb-px"
    >
      <ul className="flex min-w-max items-center gap-1">
        {visibleItems.map((item) => {
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

        {hasPrimarySplit ? (
          <li>
            <button
              type="button"
              aria-expanded={showAll}
              onClick={toggleExpanded}
              className={cn(
                "inline-flex rounded-t-orion-md border border-transparent px-3 py-2 text-sm font-medium text-orion-gold/80 transition-colors hover:text-orion-gold",
                ORION_FOCUS_RING_CLASS,
              )}
            >
              {showAll ? "Fewer" : "More"}
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

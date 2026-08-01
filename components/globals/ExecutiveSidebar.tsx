"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIconGlyph } from "@/components/common/icons";
import { OrionLogo } from "@/components/common/OrionLogo";
import { useExecutiveShell } from "@/components/layout/ExecutiveShellProvider";
import { defaultNavigationRegistry } from "@/lib/navigation";
import type { NavigationItem } from "@/lib/navigation";
import { ORION_FOCUS_RING_CLASS, WORKSPACE_CAPTION_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function SidebarLink({
  item,
  onNavigate,
}: {
  item: NavigationItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    item.href === "/brief"
      ? pathname === "/brief" || pathname === "/"
      : pathname.startsWith(item.href);
  const isComingSoon = item.availability === "coming-soon";

  if (isComingSoon) {
    return (
      <div
        aria-disabled="true"
        className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-light text-orion-muted/50"
      >
        <NavIconGlyph name={item.icon} className="h-4 w-4 shrink-0 opacity-50" />
        <span className="truncate">{item.label}</span>
        <span className="ml-auto shrink-0 rounded-orion-sm border border-orion-border px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-orion-muted uppercase">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-light transition-colors duration-[var(--orion-duration-normal)]",
        ORION_FOCUS_RING_CLASS,
        isActive
          ? "border-orion-gold/20 bg-orion-gold/10 text-orion-text shadow-[inset_2px_0_0_var(--orion-gold)]"
          : "border-transparent text-orion-muted hover:border-orion-border hover:bg-orion-surface hover:text-orion-text/90",
      )}
    >
      <NavIconGlyph
        name={item.icon}
        className={cn(
          "h-4 w-4 shrink-0 transition-colors duration-[var(--orion-duration-normal)]",
          isActive ? "text-orion-gold" : "text-orion-muted/70 group-hover:text-orion-muted",
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SidebarSection({
  label,
  items,
  onNavigate,
}: {
  label?: string;
  items: readonly NavigationItem[];
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-1">
      {label ? <p className={cn("px-3 pb-1", WORKSPACE_CAPTION_CLASS)}>{label}</p> : null}
      {items.map((item) => (
        <SidebarLink key={item.href} item={item} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

/** Executive platform sidebar — calm, confident navigation for daily orientation. */
export function ExecutiveSidebar() {
  const sections = defaultNavigationRegistry.getSections();
  const { sidebarOpen, closeSidebar } = useExecutiveShell();

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeSidebar}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-orion-border bg-orion-navy-deep/95 backdrop-blur-xl transition-transform duration-[var(--orion-duration-normal)] md:z-30 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-orion-border px-5 py-5">
          <OrionLogo />
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-orion-text">ORION</p>
            <p className="truncate text-[11px] leading-snug font-light text-orion-muted">
              Executive Operating System
            </p>
          </div>
        </div>

        <nav
          aria-label="Executive platform navigation"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        >
          {sections.map((section) => (
            <SidebarSection
              key={section.id}
              label={section.label}
              items={section.items}
              onNavigate={closeSidebar}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

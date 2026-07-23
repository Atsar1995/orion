"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIconGlyph } from "@/components/common/icons";
import { OrionLogo } from "@/components/common/OrionLogo";
import {
  executiveNav,
  moduleNav,
  primaryNav,
  utilityNav,
  type NavItem,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-light transition-all duration-200",
        isActive
          ? "border border-orion-gold/20 bg-orion-gold/10 text-white shadow-[inset_0_1px_0_rgba(212,175,55,0.15)]"
          : "border border-transparent text-white/55 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-white/90",
      )}
    >
      <NavIconGlyph
        name={item.icon}
        className={cn(
          "h-4 w-4 shrink-0 transition-colors duration-200",
          isActive
            ? "text-orion-gold"
            : "text-white/35 group-hover:text-white/60",
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function NavSection({
  label,
  items,
}: {
  label?: string;
  items: NavItem[];
}) {
  return (
    <div className="space-y-1">
      {label ? (
        <p className="px-3 pb-1 text-[10px] font-medium tracking-[0.18em] text-white/25 uppercase">
          {label}
        </p>
      ) : null}
      {items.map((item) => (
        <NavLink key={item.href} item={item} />
      ))}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/[0.06] bg-orion-navy-deep/95 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-5">
        <OrionLogo />
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-tight text-white">
            ORION
          </p>
          <p className="truncate text-[11px] leading-snug font-light text-white/45">
            AI Business Operating System
          </p>
        </div>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5"
      >
        <NavSection label="Executive" items={executiveNav} />
        <NavSection label="Platform" items={primaryNav} />
        <NavSection label="Modules" items={moduleNav} />
        <div className="mt-auto">
          <NavSection items={utilityNav} />
        </div>
      </nav>
    </aside>
  );
}

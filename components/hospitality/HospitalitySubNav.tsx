"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HOSPITALITY_NAV } from "@/lib/hospitality/nav";
import { cn } from "@/lib/utils";

/** Hospitality workspace sub-navigation (Mission P-007). */
export function HospitalitySubNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Hospitality workspace" className="overflow-x-auto border-b border-white/[0.06] pb-1">
      <ul className="flex min-w-max gap-1">
        {HOSPITALITY_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/hospitality" && pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "inline-flex rounded-orion-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-orion-gold/15 text-orion-gold"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white/90",
                )}
                aria-current={active ? "page" : undefined}
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

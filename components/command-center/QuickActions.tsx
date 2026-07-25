"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_ACTIONS = [
  { label: "View Reports", href: "/finance/reports" },
] as const;

/** Command Center quick actions — refresh and navigation (presentation only). */
export function QuickActions() {
  const router = useRouter();

  return (
    <Card title="Quick Actions">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => router.refresh()} aria-label="Refresh intelligence">
          Refresh Intelligence
        </Button>
        <QuickActionButton label="Generate Brief" onClick={() => router.refresh()} />
        <QuickActionButton label="Run Health Check" onClick={() => router.refresh()} />
        <QuickActionButton label="Sync Providers" onClick={() => router.refresh()} />
        {NAV_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "inline-flex items-center rounded-orion-md transition-all duration-[var(--orion-duration-normal)]",
              QUICK_ACTION_BUTTON_CLASSNAME,
            )}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}

function QuickActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-orion-md transition-all duration-[var(--orion-duration-normal)]",
        QUICK_ACTION_BUTTON_CLASSNAME,
      )}
    >
      {label}
    </button>
  );
}

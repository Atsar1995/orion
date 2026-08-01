"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import type { ExecutiveRecommendationAction } from "@/types/executive";
import { cn } from "@/lib/utils";

type ExecutiveActionBarProps = {
  actions: ExecutiveRecommendationAction[];
  actionHref?: string;
  onAction?: (action: ExecutiveRecommendationAction) => void;
};

const ACTION_LABELS: Record<ExecutiveRecommendationAction, string> = {
  act: "Accept",
  delegate: "Delegate",
  defer: "Defer",
  reject: "Reject",
  complete: "Mark Complete",
  snooze: "Defer",
  explain: "Why am I seeing this?",
};

/** Executive action bar — every action updates EDI (Mission P-002). */
export function ExecutiveActionBar({ actions, actionHref, onAction }: ExecutiveActionBarProps) {
  const primaryActions = actions.filter((action) => action !== "explain");

  return (
    <div className="flex flex-wrap gap-2">
      {primaryActions.map((action) =>
        action === "act" && actionHref ? (
          <Link
            key={action}
            href={actionHref}
            data-brief-act-href={actionHref}
            className={cn(
              "inline-flex items-center justify-center rounded-orion-md px-4 py-2 text-sm font-medium transition-colors",
              "border border-orion-gold/30 bg-orion-gold/15 text-orion-text hover:bg-orion-gold/25",
            )}
          >
            {ACTION_LABELS[action]}
          </Link>
        ) : action === "act" ? (
          <Button key={action} type="button" onClick={() => onAction?.(action)}>
            {ACTION_LABELS[action]}
          </Button>
        ) : (
          <button
            key={action}
            type="button"
            className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-4 py-2")}
            onClick={() => onAction?.(action)}
          >
            {ACTION_LABELS[action]}
          </button>
        ),
      )}
      {actions.includes("explain") ? (
        <button
          type="button"
          className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-4 py-2")}
          onClick={() => onAction?.("explain")}
        >
          {ACTION_LABELS.explain}
        </button>
      ) : null}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import type { ExecutiveRecommendationAction } from "@/types/executive";
import { cn } from "@/lib/utils";

type ExecutiveActionBarProps = {
  actions: ExecutiveRecommendationAction[];
  onAction?: (action: ExecutiveRecommendationAction) => void;
};

const ACTION_LABELS: Record<ExecutiveRecommendationAction, string> = {
  act: "Act Now",
  delegate: "Delegate",
  snooze: "Snooze",
  explain: "Why am I seeing this?",
};

/** Quick action bar for EC-001 recommendations. */
export function ExecutiveActionBar({ actions, onAction }: ExecutiveActionBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) =>
        action === "act" ? (
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
    </div>
  );
}

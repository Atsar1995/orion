import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import { HOSPITALITY_QUICK_ACTIONS } from "@/lib/hospitality-data";

type QuickActionsProps = {
  actions?: readonly { label: string; href?: string }[];
};

/** Quick action links for the Hospitality Workspace. */
export function QuickActions({
  actions = HOSPITALITY_QUICK_ACTIONS.map((action) => ({ label: action.label })),
}: QuickActionsProps) {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-wrap gap-2.5">
        {actions.map((action) =>
          action.href ? (
            <Link key={action.label} href={action.href} className={QUICK_ACTION_BUTTON_CLASSNAME}>
              {action.label}
            </Link>
          ) : (
            <span key={action.label} className={QUICK_ACTION_BUTTON_CLASSNAME}>
              {action.label}
            </span>
          ),
        )}
      </div>
    </Card>
  );
}

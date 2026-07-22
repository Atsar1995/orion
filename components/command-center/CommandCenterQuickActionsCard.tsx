import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { COMMAND_CENTER_QUICK_ACTIONS } from "@/lib/command-center-data";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";

/** Quick navigation and actions for the Executive Command Center. */
export function CommandCenterQuickActionsCard() {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-wrap gap-2.5">
        {COMMAND_CENTER_QUICK_ACTIONS.map((action) =>
          "href" in action && action.href ? (
            <Link key={action.label} href={action.href}>
              <Button className={QUICK_ACTION_BUTTON_CLASSNAME}>
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button key={action.label} className={QUICK_ACTION_BUTTON_CLASSNAME}>
              {action.label}
            </Button>
          ),
        )}
      </div>
    </Card>
  );
}

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";

const PLACEHOLDER_ACTIONS = ["Open Docs", "Release Notes", "Architecture"] as const;

/** Static quick action buttons for the Engineering Workspace. */
export function EngineeringQuickActionsCard() {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-wrap gap-2.5">
        {PLACEHOLDER_ACTIONS.map((action) => (
          <Button key={action} className={QUICK_ACTION_BUTTON_CLASSNAME}>
            {action}
          </Button>
        ))}
        <Link href="/">
          <Button className={QUICK_ACTION_BUTTON_CLASSNAME}>
            Mission Control
          </Button>
        </Link>
      </div>
    </Card>
  );
}

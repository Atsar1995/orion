import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import { MARKETING_QUICK_ACTIONS } from "@/lib/marketing-data";

/** Static quick action buttons for the Marketing Workspace. */
export function QuickActions() {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-wrap gap-2.5">
        {MARKETING_QUICK_ACTIONS.map((action) =>
          "href" in action && action.href ? (
            <Link key={action.label} href={action.href}>
              <Button className={QUICK_ACTION_BUTTON_CLASSNAME}>{action.label}</Button>
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

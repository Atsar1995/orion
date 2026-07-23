import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import { ADVISOR_QUICK_ACTIONS } from "@/lib/advisor-data";

const EXECUTIVE_QUICK_ACTION_CLASSNAME = `${QUICK_ACTION_BUTTON_CLASSNAME} px-5 py-3 text-base`;

/** Large executive quick action buttons. */
export function QuickActionsCard() {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-wrap gap-3">
        {ADVISOR_QUICK_ACTIONS.map((action) =>
          "href" in action && action.href ? (
            <Link key={action.label} href={action.href}>
              <Button className={EXECUTIVE_QUICK_ACTION_CLASSNAME}>{action.label}</Button>
            </Link>
          ) : (
            <Button key={action.label} className={EXECUTIVE_QUICK_ACTION_CLASSNAME}>
              {action.label}
            </Button>
          ),
        )}
      </div>
    </Card>
  );
}

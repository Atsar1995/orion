import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";

const QUICK_ACTIONS = [
  { label: "Engineering", href: "/engineering" },
  { label: "ORANIA" },
  { label: "ATSAR" },
  { label: "Marketing" },
  { label: "Release Notes" },
] as const;

/** Static quick action buttons for the Command Center. */
export function QuickActionsCard() {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-wrap gap-2.5">
        {QUICK_ACTIONS.map((action) =>
          "href" in action && action.href ? (
            <Link key={action.label} href={action.href}>
              <Button className={QUICK_ACTION_BUTTON_CLASSNAME}>
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button
              key={action.label}
              className={QUICK_ACTION_BUTTON_CLASSNAME}
            >
              {action.label}
            </Button>
          ),
        )}
      </div>
    </Card>
  );
}

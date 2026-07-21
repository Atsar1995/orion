import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CONFIGURATION_QUICK_ACTIONS } from "@/lib/configuration-data";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";

/** Static quick action buttons for the Configuration Workspace. */
export function ConfigurationQuickActionsCard() {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-wrap gap-2.5">
        {CONFIGURATION_QUICK_ACTIONS.map((action) => (
          <Button key={action} className={QUICK_ACTION_BUTTON_CLASSNAME}>
            {action}
          </Button>
        ))}
      </div>
    </Card>
  );
}

import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/ui/Card";
import type { NotificationSetting } from "@/lib/configuration-data";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_FIELD_ROW_CLASS,
} from "@/lib/constants";

type NotificationSettingsCardProps = {
  settings: NotificationSetting[];
};

/** Placeholder notification preferences with static toggle indicators. */
export function NotificationSettingsCard({
  settings,
}: NotificationSettingsCardProps) {
  return (
    <Card title="Notifications">
      <ul className={WORKSPACE_FIELD_LIST_CLASS}>
        {settings.map((setting) => (
          <li key={setting.label} className={WORKSPACE_FIELD_ROW_CLASS}>
            <span className="text-sm font-light text-white/55">
              {setting.label}
            </span>
            <Badge className="normal-case tracking-normal">
              {setting.enabled ? "On" : "Off"}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}

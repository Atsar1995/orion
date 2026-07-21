import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/ui/Card";
import type { NotificationSetting } from "@/lib/configuration-data";

type NotificationSettingsCardProps = {
  settings: NotificationSetting[];
};

/** Placeholder notification preferences with static toggle indicators. */
export function NotificationSettingsCard({
  settings,
}: NotificationSettingsCardProps) {
  return (
    <Card title="Notifications">
      <ul className="space-y-3">
        {settings.map((setting) => (
          <li
            key={setting.label}
            className="flex items-center justify-between gap-4 border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0"
          >
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

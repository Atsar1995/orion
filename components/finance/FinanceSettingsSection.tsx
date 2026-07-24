import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_ROW_CLASS, WORKSPACE_GRID_2_COL } from "@/lib/constants";
import {
  FINANCE_ALERT_SETTINGS,
  FINANCE_GENERAL_SETTINGS,
} from "@/lib/finance-data";

function SettingsCard({
  title,
  fields,
}: {
  title: string;
  fields: { label: string; value: string }[];
}) {
  return (
    <Card title={title}>
      <dl className="space-y-3">
        {fields.map((field) => (
          <div key={field.label} className={WORKSPACE_FIELD_ROW_CLASS}>
            <dt className="text-sm font-light text-white/50">{field.label}</dt>
            <dd className="text-sm font-medium text-white/85">{field.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/** Finance settings workspace section. */
export function FinanceSettingsSection() {
  return (
    <div className={WORKSPACE_GRID_2_COL}>
      <SettingsCard title="General" fields={FINANCE_GENERAL_SETTINGS} />
      <SettingsCard title="Alerts" fields={FINANCE_ALERT_SETTINGS} />
    </div>
  );
}

import { Card } from "@/components/ui/Card";
import { SettingsFieldList } from "@/components/configuration/SettingsFieldList";
import type { ConfigurationField } from "@/lib/configuration-data";

type ConfigurationSectionCardProps = {
  title: string;
  fields: ConfigurationField[];
};

/** Configuration section card with read-only placeholder fields. */
export function ConfigurationSectionCard({
  title,
  fields,
}: ConfigurationSectionCardProps) {
  return (
    <Card title={title}>
      <SettingsFieldList fields={fields} />
    </Card>
  );
}

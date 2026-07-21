import type { ConfigurationField } from "@/lib/configuration-data";

type SettingsFieldListProps = {
  fields: ConfigurationField[];
};

/** Read-only settings field list for configuration sections. */
export function SettingsFieldList({ fields }: SettingsFieldListProps) {
  return (
    <ul className="space-y-3">
      {fields.map((field) => (
        <li
          key={field.label}
          className="flex items-center justify-between gap-4 border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0"
        >
          <span className="text-sm font-light text-white/55">{field.label}</span>
          <span className="text-right text-sm font-medium text-white/80">
            {field.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

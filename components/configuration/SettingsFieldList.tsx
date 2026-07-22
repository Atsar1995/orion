import type { ConfigurationField } from "@/lib/configuration-data";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_FIELD_ROW_CLASS,
} from "@/lib/constants";

type SettingsFieldListProps = {
  fields: ConfigurationField[];
};

/** Read-only settings field list for configuration sections. */
export function SettingsFieldList({ fields }: SettingsFieldListProps) {
  return (
    <ul className={WORKSPACE_FIELD_LIST_CLASS}>
      {fields.map((field) => (
        <li key={field.label} className={WORKSPACE_FIELD_ROW_CLASS}>
          <span className="text-sm font-light text-white/55">{field.label}</span>
          <span className="text-right text-sm font-medium text-white/80">
            {field.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

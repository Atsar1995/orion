import { ConfigurationQuickActionsCard } from "@/components/configuration/ConfigurationQuickActionsCard";
import { ConfigurationSectionCard } from "@/components/configuration/ConfigurationSectionCard";
import { ConfigurationWorkspaceHeader } from "@/components/configuration/ConfigurationWorkspaceHeader";
import { IntegrationCard } from "@/components/configuration/IntegrationCard";
import { NotificationSettingsCard } from "@/components/configuration/NotificationSettingsCard";
import { Divider } from "@/components/ui/Divider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  WORKSPACE_GRID_2_COL,
  WORKSPACE_GRID_INTEGRATIONS_COL,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_SECTION_GROUP_CLASS,
} from "@/lib/constants";
import {
  AI_PREFERENCE_FIELDS,
  APPEARANCE_FIELDS,
  FOUNDER_PROFILE_FIELDS,
  INTEGRATION_PROVIDERS,
  NOTIFICATION_SETTINGS,
  ORGANIZATION_FIELDS,
} from "@/lib/configuration-data";

export default function ConfigurationWorkspacePage() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <ConfigurationWorkspaceHeader />

      <section aria-label="Configuration Workspace" className={WORKSPACE_SECTION_CLASS}>
        <div className={WORKSPACE_GRID_2_COL}>
          <ConfigurationSectionCard
            title="Organization Information"
            fields={ORGANIZATION_FIELDS}
          />
          <ConfigurationSectionCard
            title="Founder Profile"
            fields={FOUNDER_PROFILE_FIELDS}
          />
        </div>

        <div className={WORKSPACE_GRID_2_COL}>
          <ConfigurationSectionCard title="Appearance" fields={APPEARANCE_FIELDS} />
          <NotificationSettingsCard settings={NOTIFICATION_SETTINGS} />
        </div>

        <ConfigurationSectionCard
          title="AI Preferences"
          fields={AI_PREFERENCE_FIELDS}
        />

        <Divider />

        <div className={WORKSPACE_SECTION_GROUP_CLASS}>
          <SectionHeader
            title="Integrations"
            subtitle="Connect third-party services to extend ORION capabilities."
          />
          <div className={WORKSPACE_GRID_INTEGRATIONS_COL}>
            {INTEGRATION_PROVIDERS.map((provider) => (
              <IntegrationCard key={provider.name} name={provider.name} />
            ))}
          </div>
        </div>

        <ConfigurationQuickActionsCard />
      </section>
    </div>
  );
}

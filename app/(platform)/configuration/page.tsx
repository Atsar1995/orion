import { ConfigurationQuickActionsCard } from "@/components/configuration/ConfigurationQuickActionsCard";
import { ConfigurationSectionCard } from "@/components/configuration/ConfigurationSectionCard";
import { ConfigurationWorkspaceHeader } from "@/components/configuration/ConfigurationWorkspaceHeader";
import { IntegrationCard } from "@/components/configuration/IntegrationCard";
import { NotificationSettingsCard } from "@/components/configuration/NotificationSettingsCard";
import { Divider } from "@/components/ui/Divider";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
    <div className="space-y-8">
      <ConfigurationWorkspaceHeader />

      <section aria-label="Configuration Workspace" className="space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ConfigurationSectionCard
            title="Organization Information"
            fields={ORGANIZATION_FIELDS}
          />
          <ConfigurationSectionCard
            title="Founder Profile"
            fields={FOUNDER_PROFILE_FIELDS}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ConfigurationSectionCard title="Appearance" fields={APPEARANCE_FIELDS} />
          <NotificationSettingsCard settings={NOTIFICATION_SETTINGS} />
        </div>

        <ConfigurationSectionCard
          title="AI Preferences"
          fields={AI_PREFERENCE_FIELDS}
        />

        <Divider />

        <div className="space-y-4">
          <SectionHeader
            title="Integrations"
            subtitle="Connect third-party services to extend ORION capabilities."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

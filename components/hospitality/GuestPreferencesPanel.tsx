import type { GuestPreference, GuestConsent } from "@/types/hospitality-guest";
import { WORKSPACE_FIELD_LIST_CLASS } from "@/lib/constants";

type GuestPreferencesPanelProps = {
  readonly preferences: readonly GuestPreference[];
  readonly dietaryPreferences: readonly string[];
  readonly consents: readonly GuestConsent[];
  readonly accessibilityRequirements: readonly string[];
};

/** Guest preferences and consent summary (Mission P-007.3). */
export function GuestPreferencesPanel({
  preferences,
  dietaryPreferences,
  consents,
  accessibilityRequirements,
}: GuestPreferencesPanelProps) {
  return (
    <div className="space-y-4">
      {preferences.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs uppercase tracking-wide text-white/40">Preferences</h4>
          <ul className={WORKSPACE_FIELD_LIST_CLASS}>
            {preferences.map((pref, index) => (
              <li key={`${pref.category}-${index}`} className="text-sm text-white/70">
                <span className="text-white/45">{pref.category}: </span>
                {pref.value}
              </li>
            ))}
          </ul>
        </div>
      )}
      {dietaryPreferences.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs uppercase tracking-wide text-white/40">Dietary</h4>
          <p className="text-sm text-white/70">{dietaryPreferences.join(", ")}</p>
        </div>
      )}
      {accessibilityRequirements.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs uppercase tracking-wide text-white/40">Accessibility</h4>
          <p className="text-sm text-white/70">{accessibilityRequirements.join(", ")}</p>
        </div>
      )}
      {consents.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs uppercase tracking-wide text-white/40">Consent</h4>
          <ul className={WORKSPACE_FIELD_LIST_CLASS}>
            {consents.map((consent) => (
              <li key={consent.type} className="flex justify-between text-sm text-white/70">
                <span>{consent.type.replaceAll("_", " ")}</span>
                <span className={consent.status === "granted" ? "text-emerald-400/80" : "text-amber-400/80"}>
                  {consent.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PermissionViewer } from "@/components/integrations/PermissionViewer";
import { formatAuthType } from "@/components/integrations/ProviderStatusCard";
import { connectWithWizardAction } from "@/lib/integrations/integration-actions";
import type {
  ConnectionWizardMode,
  IntegrationProviderRecord,
} from "@/lib/integrations/types";
import { cn } from "@/lib/utils";

type ConnectionWizardProps = {
  open: boolean;
  onClose: () => void;
  provider: IntegrationProviderRecord;
  onComplete: (message: string) => void;
};

const AUTH_MODES: Array<{ id: ConnectionWizardMode; label: string; description: string }> = [
  {
    id: "oauth2",
    label: "OAuth 2.0",
    description: "Authorize via Google, Microsoft, or other OAuth providers.",
  },
  {
    id: "api-key",
    label: "API Key",
    description: "Connect using a provider-issued API key.",
  },
  {
    id: "service-account",
    label: "Service Account",
    description: "Use a JSON service account for server-to-server access.",
  },
  {
    id: "manual",
    label: "Manual Configuration",
    description: "Use environment variables or admin-managed credentials.",
  },
];

/** Generic multi-step wizard for connecting providers. */
export function ConnectionWizard({ open, onClose, provider, onComplete }: ConnectionWizardProps) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<ConnectionWizardMode>(provider.authType);
  const [apiKey, setApiKey] = useState("");
  const [serviceAccountEmail, setServiceAccountEmail] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return null;
  }

  function resetAndClose() {
    setStep(1);
    setApiKey("");
    setServiceAccountEmail("");
    setManualNotes("");
    onClose();
  }

  function handleFinish() {
    startTransition(async () => {
      const result = await connectWithWizardAction(provider.id, mode);
      onComplete(result.message);
      resetAndClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close connection wizard"
        className="absolute inset-0 bg-orion-navy/80 backdrop-blur-sm"
        onClick={resetAndClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connection-wizard-title"
        className="relative z-10 w-full max-w-lg rounded-orion-lg border border-white/[0.08] bg-orion-navy p-6 shadow-[var(--orion-shadow-lg)]"
      >
        <header className="mb-5 space-y-1 border-b border-white/[0.06] pb-4">
          <p className="text-[11px] font-medium tracking-[0.18em] text-orion-gold uppercase">
            Connection Wizard · Step {step} of 3
          </p>
          <h2 id="connection-wizard-title" className="text-xl font-semibold text-white">
            Connect {provider.name}
          </h2>
          <p className="text-sm font-light text-white/45">
            Configure authentication and review permissions before connecting.
          </p>
        </header>

        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/75">Choose authentication method</p>
            {AUTH_MODES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setMode(entry.id)}
                className={cn(
                  "w-full rounded-orion-md border px-4 py-3 text-left transition-colors",
                  mode === entry.id
                    ? "border-orion-gold/30 bg-orion-gold/10"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.12]",
                )}
              >
                <p className="text-sm font-medium text-white/85">{entry.label}</p>
                <p className="mt-1 text-xs font-light text-white/45">{entry.description}</p>
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-white/75">
              {formatAuthType(mode)} credentials
            </p>

            {mode === "oauth2" ? (
              <div className="rounded-orion-md border border-white/[0.08] bg-white/[0.03] p-4 text-sm font-light text-white/60">
                {provider.id === "google-analytics" ? (
                  <p>
                    Set `GOOGLE_ANALYTICS_CLIENT_ID`, `GOOGLE_ANALYTICS_CLIENT_SECRET`,
                    `GOOGLE_ANALYTICS_REFRESH_TOKEN`, and `GOOGLE_ANALYTICS_PROPERTY_ID` in your
                    environment, then finish the wizard and click Connect.
                  </p>
                ) : (
                  <p>
                    OAuth authorization will redirect to the provider consent screen. Complete
                    authorization in your deployment environment before connecting.
                  </p>
                )}
              </div>
            ) : null}

            {mode === "api-key" ? (
              <Input
                label="API Key"
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Enter provider API key"
              />
            ) : null}

            {mode === "service-account" ? (
              <Input
                label="Service Account Email"
                value={serviceAccountEmail}
                onChange={(event) => setServiceAccountEmail(event.target.value)}
                placeholder="service-account@project.iam.gserviceaccount.com"
              />
            ) : null}

            {mode === "manual" ? (
              <Input
                label="Configuration Notes"
                value={manualNotes}
                onChange={(event) => setManualNotes(event.target.value)}
                placeholder="Describe manual credential setup"
              />
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="rounded-orion-md border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white/60">
              <p>
                Provider: <span className="text-white/85">{provider.name}</span>
              </p>
              <p className="mt-1">
                Auth: <span className="text-white/85">{formatAuthType(mode)}</span>
              </p>
              <p className="mt-1">
                Type: <span className="text-white/85">{provider.providerType}</span>
              </p>
            </div>
            <PermissionViewer permissions={provider.permissions} />
          </div>
        ) : null}

        <footer className="mt-6 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <button
            type="button"
            onClick={step === 1 ? resetAndClose : () => setStep(step - 1)}
            className="text-sm font-medium text-white/50 hover:text-white/75"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <div className="flex gap-2">
            {step < 3 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Continue
              </Button>
            ) : (
              <Button type="button" disabled={isPending} onClick={handleFinish}>
                {isPending ? "Connecting..." : "Finish & Connect"}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

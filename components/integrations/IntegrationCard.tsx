"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConnectionHealth } from "@/components/integrations/ConnectionHealth";
import { ConnectionWizard } from "@/components/integrations/ConnectionWizard";
import { CredentialStatus } from "@/components/integrations/CredentialStatus";
import { PermissionViewer } from "@/components/integrations/PermissionViewer";
import { ProviderMetrics } from "@/components/integrations/ProviderMetrics";
import {
  formatAuthType,
  formatIntegrationTimestamp,
  formatProviderType,
  ProviderStatusCard,
} from "@/components/integrations/ProviderStatusCard";
import { SyncHistory } from "@/components/integrations/SyncHistory";
import {
  connectProviderAction,
  disconnectProviderAction,
  healthCheckProviderAction,
  reconnectProviderAction,
  refreshProviderAction,
  setProviderEnabledAction,
  syncProviderAction,
} from "@/lib/integrations/integration-actions";
import type {
  IntegrationLogEntry,
  IntegrationProviderRecord,
  IntegrationSyncEvent,
} from "@/lib/integrations/types";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type IntegrationCardProps = {
  provider: IntegrationProviderRecord;
  syncHistory: IntegrationSyncEvent[];
  logs: IntegrationLogEntry[];
};

type DetailPanel = "metrics" | "permissions" | "history" | "logs" | null;

/** Provider connection card with lifecycle actions for the Integration Center. */
export function IntegrationCard({ provider, syncHistory, logs }: IntegrationCardProps) {
  const [panel, setPanel] = useState<DetailPanel>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isPlugin = provider.providerType === "plugin";
  const providerLogs = logs.filter((entry) => entry.providerId === provider.id);

  function runAction(action: () => Promise<{ success: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.message);
    });
  }

  return (
    <>
      <Card
        title={provider.name}
        variant={provider.health.healthy ? "default" : "premium"}
        action={<ProviderStatusCard status={provider.status} healthy={provider.health.healthy} />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] tracking-wide text-white/35 uppercase">Last Sync</p>
              <p className="mt-1 font-light text-white/70">
                {formatIntegrationTimestamp(provider.lastSync)}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-wide text-white/35 uppercase">Workspace</p>
              <p className="mt-1 font-light text-white/70">{provider.workspace ?? "Platform"}</p>
            </div>
          </div>

          <ConnectionHealth health={provider.health} />
          <CredentialStatus
            status={provider.credentialStatus}
            authType={formatAuthType(provider.authType)}
            tokenExpiresAt={provider.tokenExpiresAt}
          />

          <div className="flex flex-wrap gap-2">
            {!isPlugin ? (
              <>
                <button
                  type="button"
                  disabled={isPending || provider.status === "connected"}
                  onClick={() => runAction(() => connectProviderAction(provider.id))}
                  className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
                >
                  Connect
                </button>
                <button
                  type="button"
                  disabled={isPending || provider.status === "disconnected"}
                  onClick={() => runAction(() => disconnectProviderAction(provider.id))}
                  className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
                >
                  Disconnect
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction(() => reconnectProviderAction(provider.id))}
                  className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
                >
                  Reconnect
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction(() => refreshProviderAction(provider.id))}
                  className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
                >
                  Refresh
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction(() => syncProviderAction(provider.id))}
                  className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
                >
                  Sync
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction(() => healthCheckProviderAction(provider.id))}
                  className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
                >
                  Health Check
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(() => setProviderEnabledAction(provider.id, !provider.enabled))
                  }
                  className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
                >
                  {provider.enabled ? "Disable" : "Enable"}
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={() => setPanel(panel === "metrics" ? null : "metrics")}
              className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
            >
              View Metrics
            </button>
            <button
              type="button"
              onClick={() => setPanel(panel === "permissions" ? null : "permissions")}
              className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
            >
              Permissions
            </button>
            <button
              type="button"
              onClick={() => setPanel(panel === "history" ? null : "history")}
              className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
            >
              Sync History
            </button>
            <button
              type="button"
              onClick={() => setPanel(panel === "logs" ? null : "logs")}
              className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
            >
              View Logs
            </button>
            {!isPlugin ? (
              <button
                type="button"
                onClick={() => setWizardOpen(true)}
                className={cn(QUICK_ACTION_BUTTON_CLASSNAME, "rounded-orion-md px-3 py-1.5 text-xs")}
              >
                Configuration
              </button>
            ) : (
              <Button variant="primary" className="px-3 py-1.5 text-xs">
                Install Plugin
              </Button>
            )}
          </div>

          {message ? <p className="text-xs text-white/50">{message}</p> : null}

          {panel === "metrics" ? (
            <ProviderMetrics
              capabilities={provider.capabilities}
              version={provider.version}
              providerType={formatProviderType(provider.providerType)}
            />
          ) : null}

          {panel === "permissions" ? (
            <PermissionViewer permissions={provider.permissions} />
          ) : null}

          {panel === "history" ? (
            <SyncHistory events={syncHistory} providerId={provider.id} />
          ) : null}

          {panel === "logs" ? (
            <ul className="space-y-2">
              {providerLogs.length > 0 ? (
                providerLogs.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs text-white/55"
                  >
                    <span className="uppercase text-white/30">{entry.level}</span> · {entry.message}
                  </li>
                ))
              ) : (
                <li className="text-sm font-light text-white/45">No logs for this provider yet.</li>
              )}
            </ul>
          ) : null}
        </div>
      </Card>

      <ConnectionWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        provider={provider}
        onComplete={(resultMessage) => {
          setMessage(resultMessage);
          setWizardOpen(false);
        }}
      />
    </>
  );
}

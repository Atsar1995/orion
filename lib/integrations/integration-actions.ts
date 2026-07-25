"use server";

import { revalidatePath } from "next/cache";
import { integrationHistoryStore } from "@/lib/integrations/sync-history";
import { providerManager } from "@/lib/providers/ProviderManager";

type ActionResult = {
  success: boolean;
  message: string;
};

function getProviderOrError(providerId: string): { provider: import("@/types/providers").Provider } | { error: string } {
  const provider = providerManager.getProvider(providerId);

  if (!provider) {
    return { error: `Provider not found: ${providerId}` };
  }

  return { provider };
}

function recordAction(
  providerId: string,
  providerName: string,
  action: "connect" | "disconnect" | "sync" | "refresh" | "health-check" | "reconnect",
  success: boolean,
  message: string,
): ActionResult {
  integrationHistoryStore.recordSync({
    providerId,
    providerName,
    action,
    success,
    message,
  });

  revalidatePath("/integrations");

  return { success, message };
}

export async function connectProviderAction(providerId: string): Promise<ActionResult> {
  const resolved = getProviderOrError(providerId);
  if ("error" in resolved) {
    return { success: false, message: resolved.error };
  }

  const result = await resolved.provider.connect();
  return recordAction(
    providerId,
    resolved.provider.name,
    "connect",
    result.success,
    result.success ? "Connected successfully" : (result.error ?? "Connect failed"),
  );
}

export async function disconnectProviderAction(providerId: string): Promise<ActionResult> {
  const resolved = getProviderOrError(providerId);
  if ("error" in resolved) {
    return { success: false, message: resolved.error };
  }

  const result = await resolved.provider.disconnect();
  return recordAction(
    providerId,
    resolved.provider.name,
    "disconnect",
    result.success,
    result.success ? "Disconnected successfully" : (result.error ?? "Disconnect failed"),
  );
}

export async function reconnectProviderAction(providerId: string): Promise<ActionResult> {
  const resolved = getProviderOrError(providerId);
  if ("error" in resolved) {
    return { success: false, message: resolved.error };
  }

  await resolved.provider.disconnect();
  const result = await resolved.provider.connect();

  return recordAction(
    providerId,
    resolved.provider.name,
    "reconnect",
    result.success,
    result.success ? "Reconnected successfully" : (result.error ?? "Reconnect failed"),
  );
}

export async function refreshProviderAction(providerId: string): Promise<ActionResult> {
  const resolved = getProviderOrError(providerId);
  if ("error" in resolved) {
    return { success: false, message: resolved.error };
  }

  const result = await resolved.provider.refresh();
  return recordAction(
    providerId,
    resolved.provider.name,
    "refresh",
    result.success,
    result.success ? "Refresh completed" : (result.error ?? "Refresh failed"),
  );
}

export async function syncProviderAction(providerId: string): Promise<ActionResult> {
  const resolved = getProviderOrError(providerId);
  if ("error" in resolved) {
    return { success: false, message: resolved.error };
  }

  const result = await resolved.provider.sync();
  return recordAction(
    providerId,
    resolved.provider.name,
    "sync",
    result.success,
    result.success ? "Sync completed" : (result.error ?? "Sync failed"),
  );
}

export async function healthCheckProviderAction(providerId: string): Promise<ActionResult> {
  const resolved = getProviderOrError(providerId);
  if ("error" in resolved) {
    return { success: false, message: resolved.error };
  }

  const result = await resolved.provider.healthCheck();
  return recordAction(
    providerId,
    resolved.provider.name,
    "health-check",
    result.success,
    result.data?.message ?? result.error ?? "Health check completed",
  );
}

export async function setProviderEnabledAction(
  providerId: string,
  enabled: boolean,
): Promise<ActionResult> {
  const resolved = getProviderOrError(providerId);
  if ("error" in resolved) {
    return { success: false, message: resolved.error };
  }

  resolved.provider.config.enabled = enabled;

  integrationHistoryStore.recordLog({
    providerId,
    level: "info",
    message: enabled ? "Provider enabled" : "Provider disabled",
  });

  revalidatePath("/integrations");

  return {
    success: true,
    message: enabled ? "Provider enabled" : "Provider disabled",
  };
}

export async function connectWithWizardAction(
  providerId: string,
  authType: "oauth2" | "api-key" | "service-account" | "manual",
): Promise<ActionResult> {
  integrationHistoryStore.recordLog({
    providerId,
    level: "info",
    message: `Connection wizard started (${authType})`,
  });

  if (authType === "oauth2" && providerId === "google-analytics") {
    return {
      success: false,
      message:
        "Configure GOOGLE_ANALYTICS_* environment variables, then use Connect to activate GA4.",
    };
  }

  return connectProviderAction(providerId);
}

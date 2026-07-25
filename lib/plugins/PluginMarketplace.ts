import { pluginManager } from "@/lib/plugins/PluginManager";
import type { MarketplaceListing, PluginManifest } from "@/types/plugins";
import { ORION_PLATFORM_VERSION } from "@/types/plugins";

const SAMPLE_MANIFESTS: PluginManifest[] = [
  {
    metadata: {
      id: "orion-sample-command-panel",
      name: "Executive KPI Panel",
      version: "1.0.0",
      description: "Sample executive panel extension for the Command Center.",
      author: "ORION Platform",
      category: "analytics",
      tags: ["command-center", "kpi", "sample"],
      license: "ORION-Internal",
    },
    orionVersion: ORION_PLATFORM_VERSION,
    entryModule: "@orion/plugin-sample/command-center-panel",
    permissions: [
      { scope: "dashboard-widgets", reason: "Render executive panel widgets" },
      { scope: "providers", reason: "Read provider metrics for KPI display" },
    ],
    dependencies: [],
    extensionPoints: ["executive-panel", "dashboard-widget"],
    marketplaceId: "mp-orion-sample-command-panel",
  },
  {
    metadata: {
      id: "orion-finance-connector",
      name: "Finance Connector Pro",
      version: "2.1.0",
      description: "Advanced finance provider integration with cash-flow analytics.",
      author: "ORION Labs",
      category: "finance",
      tags: ["finance", "provider", "integration"],
      license: "Commercial",
    },
    orionVersion: ORION_PLATFORM_VERSION,
    entryModule: "@orion/marketplace/finance-connector",
    permissions: [
      { scope: "providers", reason: "Register finance provider integration" },
      { scope: "external-apis", reason: "Connect to external finance APIs" },
      { scope: "storage", reason: "Cache sync state" },
    ],
    dependencies: [],
    extensionPoints: ["provider-integration", "report", "background-job"],
    marketplaceId: "mp-orion-finance-connector",
    signature: "sha256:demo-not-verified",
  },
  {
    metadata: {
      id: "orion-ai-insights",
      name: "AI Insights Assistant",
      version: "0.9.0",
      description: "Explainable AI skill for executive recommendations.",
      author: "ORION Intelligence",
      category: "ai",
      tags: ["ai", "recommendations", "explainability"],
      license: "ORION-Internal",
    },
    orionVersion: ORION_PLATFORM_VERSION,
    entryModule: "@orion/marketplace/ai-insights",
    permissions: [
      { scope: "ai", reason: "Run AI inference for executive insights" },
      { scope: "user-data", reason: "Access anonymized executive context" },
      { scope: "notifications", reason: "Deliver insight notifications" },
    ],
    dependencies: [],
    extensionPoints: ["ai-skill", "executive-panel"],
    marketplaceId: "mp-orion-ai-insights",
  },
];

function toListing(manifest: PluginManifest, rating: number, installCount: number): MarketplaceListing {
  return {
    manifest,
    rating,
    ratingCount: Math.max(1, Math.round(installCount / 10)),
    installCount,
    latestVersion: manifest.metadata.version,
  };
}

/** Marketplace catalog model — installed, available, ratings, categories, updates (Sprint 5). */
export class PluginMarketplace {
  private available: MarketplaceListing[] = SAMPLE_MANIFESTS.map((manifest, index) =>
    toListing(manifest, 4.5 - index * 0.2, 120 - index * 30),
  );

  listAvailable(category?: string): MarketplaceListing[] {
    if (!category) {
      return [...this.available];
    }

    return this.available.filter((item) => item.manifest.metadata.category === category);
  }

  listInstalled() {
    return pluginManager.getInstalledPlugins();
  }

  getCatalog() {
    return pluginManager.buildMarketplaceCatalog(this.available);
  }

  async installFromMarketplace(marketplaceId: string) {
    const listing = this.available.find(
      (item) => item.manifest.marketplaceId === marketplaceId,
    );

    if (!listing) {
      throw new Error(`Marketplace listing not found: ${marketplaceId}`);
    }

    if (!pluginManager.discover([listing.manifest]).discovered.length) {
      throw new Error(`Listing incompatible with platform: ${marketplaceId}`);
    }

    const installResult = await pluginManager.install(listing.manifest);

    if (!installResult.success) {
      throw new Error(installResult.error ?? "Marketplace install failed");
    }

    return installResult;
  }

  checkForUpdates(pluginId: string): MarketplaceListing | undefined {
    const installed = pluginManager.getInstalledPlugins().find(
      (plugin) => plugin.manifest.metadata.id === pluginId,
    );

    if (!installed) {
      return undefined;
    }

    const listing = this.available.find(
      (item) => item.manifest.metadata.id === pluginId,
    );

    if (!listing) {
      return undefined;
    }

    const updateAvailable =
      listing.latestVersion !== installed.manifest.metadata.version;

    return updateAvailable ? { ...listing, updateAvailable: true } : undefined;
  }

  publishListing(listing: MarketplaceListing): void {
    const index = this.available.findIndex(
      (item) => item.manifest.metadata.id === listing.manifest.metadata.id,
    );

    if (index >= 0) {
      this.available[index] = listing;
      return;
    }

    this.available.push(listing);
  }

  rateListing(marketplaceId: string, rating: number): MarketplaceListing | undefined {
    const listing = this.available.find(
      (item) => item.manifest.marketplaceId === marketplaceId,
    );

    if (!listing) {
      return undefined;
    }

    const nextCount = listing.ratingCount + 1;
    const nextRating = (listing.rating * listing.ratingCount + rating) / nextCount;
    listing.rating = Math.round(nextRating * 10) / 10;
    listing.ratingCount = nextCount;
    return listing;
  }
}

export const pluginMarketplace = new PluginMarketplace();

/** Seeds the sample Command Center panel plugin if not already installed. */
export async function ensureSampleCommandCenterPlugin(): Promise<void> {
  const sample = SAMPLE_MANIFESTS[0]!;

  if (pluginManager.getPlugin(sample.metadata.id)) {
    return;
  }

  if (!pluginManager.discover([sample]).discovered.length) {
    return;
  }

  const result = await pluginManager.install(sample);

  if (result.success && result.data) {
    await pluginManager.enable(sample.metadata.id);
  }
}

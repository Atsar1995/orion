import type {
  Plugin,
  PluginDiscoveryResult,
  PluginManifest,
} from "@/types/plugins";
import { validatePluginManifest } from "@/lib/plugins/PluginManifest";

export type PluginModuleFactory = (manifest: PluginManifest) => Plugin | Promise<Plugin>;

/** Loads plugin modules from manifests — in-process factory registry (Sprint 5). */
export class PluginLoader {
  private readonly factories = new Map<string, PluginModuleFactory>();

  registerFactory(entryModule: string, factory: PluginModuleFactory): void {
    this.factories.set(entryModule, factory);
  }

  discover(manifests: PluginManifest[]): PluginDiscoveryResult {
    const discovered: PluginManifest[] = [];
    const rejected: PluginDiscoveryResult["rejected"] = [];

    for (const manifest of manifests) {
      const report = validatePluginManifest(manifest);

      if (!report.compatible) {
        rejected.push({ manifest, errors: report.errors });
        continue;
      }

      discovered.push(manifest);
    }

    return { discovered, rejected };
  }

  async load(manifest: PluginManifest): Promise<Plugin> {
    const report = validatePluginManifest(manifest);

    if (!report.compatible) {
      throw new Error(`Invalid plugin manifest ${manifest.metadata.id}: ${report.errors.join("; ")}`);
    }

    const factory = this.factories.get(manifest.entryModule);

    if (!factory) {
      throw new Error(
        `No loader factory registered for entry module: ${manifest.entryModule}`,
      );
    }

    const plugin = await factory(manifest);

    if (plugin.manifest.metadata.id !== manifest.metadata.id) {
      throw new Error(
        `Plugin module id mismatch: expected ${manifest.metadata.id}, got ${plugin.manifest.metadata.id}`,
      );
    }

    return plugin;
  }

  hasFactory(entryModule: string): boolean {
    return this.factories.has(entryModule);
  }
}

export const pluginLoader = new PluginLoader();

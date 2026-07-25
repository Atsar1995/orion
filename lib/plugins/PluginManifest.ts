import type {
  PluginCompatibilityReport,
  PluginManifest,
  PluginMetadata,
} from "@/types/plugins";
import { ORION_PLATFORM_VERSION } from "@/types/plugins";

const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[a-z0-9.]+)?$/i;

/** Validates plugin manifest structure and platform compatibility. */
export function validatePluginManifest(manifest: PluginManifest): PluginCompatibilityReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest.metadata?.id) {
    errors.push("metadata.id is required");
  }

  if (!manifest.metadata?.name) {
    errors.push("metadata.name is required");
  }

  if (!manifest.metadata?.version || !SEMVER_PATTERN.test(manifest.metadata.version)) {
    errors.push("metadata.version must be valid semver");
  }

  if (!manifest.metadata?.author) {
    errors.push("metadata.author is required");
  }

  if (!manifest.metadata?.description) {
    errors.push("metadata.description is required");
  }

  if (!manifest.entryModule) {
    errors.push("entryModule is required");
  }

  if (!manifest.orionVersion) {
    errors.push("orionVersion is required");
  } else if (!isVersionCompatible(manifest.orionVersion, ORION_PLATFORM_VERSION)) {
    errors.push(
      `Plugin requires ORION ${manifest.orionVersion}; platform is ${ORION_PLATFORM_VERSION}`,
    );
  }

  if (!Array.isArray(manifest.permissions)) {
    errors.push("permissions must be an array");
  }

  if (!Array.isArray(manifest.dependencies)) {
    errors.push("dependencies must be an array");
  }

  if (!Array.isArray(manifest.extensionPoints) || manifest.extensionPoints.length === 0) {
    warnings.push("extensionPoints is empty — plugin registers no extensions");
  }

  if (!manifest.signature) {
    warnings.push("manifest.signature missing — marketplace trust not verified");
  }

  return {
    compatible: errors.length === 0,
    errors,
    warnings,
  };
}

export function createPluginManifest(
  metadata: PluginMetadata,
  partial: Omit<PluginManifest, "metadata">,
): PluginManifest {
  return {
    metadata,
    ...partial,
  };
}

function parseVersion(version: string): [number, number, number] {
  const [major, minor, patch] = version.split("-")[0]?.split(".").map(Number) ?? [0, 0, 0];
  return [major ?? 0, minor ?? 0, patch ?? 0];
}

/** Checks whether plugin orionVersion is compatible with the running platform (same major). */
export function isVersionCompatible(required: string, platform: string): boolean {
  const [reqMajor] = parseVersion(required);
  const [platMajor] = parseVersion(platform);
  return reqMajor === platMajor;
}

/** Compare semver: returns -1, 0, or 1. */
export function compareSemver(a: string, b: string): number {
  const av = parseVersion(a);
  const bv = parseVersion(b);

  for (let i = 0; i < 3; i += 1) {
    if (av[i]! > bv[i]!) {
      return 1;
    }

    if (av[i]! < bv[i]!) {
      return -1;
    }
  }

  return 0;
}

/** Validates dependency version range (supports ^x.y.z prefix). */
export function satisfiesVersionRange(version: string, range: string): boolean {
  if (range.startsWith("^")) {
    const required = range.slice(1);
    const [reqMajor] = parseVersion(required);
    const [verMajor, verMinor, verPatch] = parseVersion(version);
    const [, reqMinor, reqPatch] = parseVersion(required);

    if (verMajor !== reqMajor) {
      return false;
    }

    if (verMinor > reqMinor!) {
      return true;
    }

    if (verMinor === reqMinor && verPatch >= reqPatch!) {
      return true;
    }

    return false;
  }

  return compareSemver(version, range) >= 0;
}

import type { AuroraHealthStatusService } from "@/lib/aurora/platform/services/AuroraHealthStatusService";

type ReadinessProbe = {
  readonly name: string;
  check: () => Promise<{ status: "healthy" | "degraded" | "unhealthy"; message: string }>;
};

const probes: ReadinessProbe[] = [];

export function registerAuroraReadinessProbe(
  healthService: AuroraHealthStatusService,
): void {
  if (probes.some((probe) => probe.name === "aurora.platform")) {
    return;
  }

  probes.push({
    name: "aurora.platform",
    check: async () => {
      const report = await healthService.getPlatformHealth();
      return {
        status:
          report.lifecycle === "ready"
            ? "healthy"
            : report.lifecycle === "degraded"
              ? "degraded"
              : "unhealthy",
        message: report.degradedReasons.join("; ") || "Aurora platform operational",
      };
    },
  });
}

export async function runAuroraReadinessProbes(): Promise<
  ReadonlyArray<{ name: string; status: string; message: string }>
> {
  const results = [];
  for (const probe of probes) {
    const result = await probe.check();
    results.push({ name: probe.name, ...result });
  }
  return results;
}

export function resetAuroraReadinessProbesForTests(): void {
  probes.length = 0;
}

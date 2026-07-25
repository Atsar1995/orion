import type { EngineRegistration, EngineStatus } from "@/types/orchestrator";

const engines = new Map<string, EngineRegistration>();

const DEFAULT_ENGINES: EngineRegistration[] = [
  {
    id: "provider-framework",
    name: "Provider Framework",
    version: "1.0.0",
    status: "ready",
    description: "ES-060 integration provider lifecycle and data collection",
  },
  {
    id: "executive-brief-engine",
    name: "Executive Brief Engine",
    version: "1.0.0",
    status: "ready",
    description: "ES-028 daily executive brief generation",
  },
  {
    id: "recommendation-engine",
    name: "Recommendation Engine",
    version: "1.0.0",
    status: "ready",
    description: "ES-029 actionable executive recommendations",
  },
  {
    id: "alert-engine",
    name: "Alert Engine",
    version: "1.0.0",
    status: "ready",
    description: "ES-030 event-driven alerting",
  },
  {
    id: "business-health-service",
    name: "Business Health Service",
    version: "1.0.0",
    status: "ready",
    description: "ES-032 platform health scoring",
  },
  {
    id: "trend-service",
    name: "Trend Service",
    version: "1.0.0",
    status: "ready",
    description: "ES-031 executive trend aggregation",
  },
];

for (const engine of DEFAULT_ENGINES) {
  engines.set(engine.id, engine);
}

/** Registry of intelligence engines coordinated by the orchestrator. */
export class EngineRegistry {
  register(engine: EngineRegistration): void {
    engines.set(engine.id, engine);
  }

  get(id: string): EngineRegistration | undefined {
    return engines.get(id);
  }

  list(): EngineRegistration[] {
    return Array.from(engines.values());
  }

  setStatus(id: string, status: EngineStatus): void {
    const engine = engines.get(id);

    if (engine) {
      engines.set(id, { ...engine, status });
    }
  }
}

export const engineRegistry = new EngineRegistry();

export function listRegisteredEngines(): EngineRegistration[] {
  return engineRegistry.list();
}

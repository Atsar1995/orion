import {
  BusinessHealthEngine,
  type BusinessHealthEngineOptions,
  type BusinessHealthEngineResult,
  type ProviderCalculationInput,
} from "@/lib/business-health/engine/BusinessHealthEngine";
import type { HealthScore } from "@/lib/business-health/models/HealthScore";
import type { KPI } from "@/lib/business-health/models/KPI";
import type { KPISignalNormalizer } from "@/lib/business-health/normalizers";

/** Facade service for calculating executive Business Health Scores. */
export class HealthScoreService {
  private readonly engine: BusinessHealthEngine;

  constructor(options: BusinessHealthEngineOptions = {}) {
    this.engine = new BusinessHealthEngine(options);
  }

  calculateFromKPIs(kpis: KPI[]): BusinessHealthEngineResult {
    return this.engine.calculate(kpis);
  }

  calculateFromProvider<TRaw>(
    normalizer: KPISignalNormalizer<TRaw>,
    raw: TRaw,
  ): BusinessHealthEngineResult {
    return this.engine.calculateFromNormalizer(normalizer, raw);
  }

  calculateFromProviders(
    providers: ProviderCalculationInput[],
  ): BusinessHealthEngineResult {
    return this.engine.calculateFromProviders(providers);
  }

  /** Returns the latest health score or undefined when calculation fails gracefully. */
  tryCalculateFromKPIs(kpis: KPI[]): HealthScore | undefined {
    const result = this.calculateFromKPIs(kpis);
    return result.success ? result.data : undefined;
  }
}

export const defaultHealthScoreService = new HealthScoreService();

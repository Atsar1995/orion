import type { KPICategoryId, KPI } from "@/lib/business-health/models/KPI";

export type KPIRegistryErrorCode =
  | "DUPLICATE_KPI"
  | "MISSING_KPI"
  | "INVALID_CATEGORY"
  | "INVALID_WEIGHT";

export type KPIRegistryError = {
  code: KPIRegistryErrorCode;
  message: string;
  kpiId?: string;
};

export type KPIRegistryResult<T> =
  | { success: true; data: T }
  | { success: false; error: KPIRegistryError };

const VALID_CATEGORIES: ReadonlySet<KPICategoryId> = new Set([
  "revenue",
  "marketing",
  "customer",
  "operations",
  "finance",
  "hospitality",
]);

/** Single source of truth for normalized KPI signals. */
export class KPIRegistry {
  private readonly kpis = new Map<string, KPI>();

  register(kpi: KPI): KPIRegistryResult<KPI> {
    if (this.kpis.has(kpi.id)) {
      return {
        success: false,
        error: {
          code: "DUPLICATE_KPI",
          message: `KPI '${kpi.id}' is already registered`,
          kpiId: kpi.id,
        },
      };
    }

    const categoryError = this.validateCategory(kpi.category);
    if (categoryError) {
      return { success: false, error: categoryError };
    }

    const weightError = this.validateWeight(kpi.weight, kpi.id);
    if (weightError) {
      return { success: false, error: weightError };
    }

    this.kpis.set(kpi.id, kpi);
    return { success: true, data: kpi };
  }

  registerMany(kpis: KPI[]): KPIRegistryResult<KPI[]> {
    const registered: KPI[] = [];

    for (const kpi of kpis) {
      const result = this.register(kpi);
      if (!result.success) {
        return result;
      }
      registered.push(result.data);
    }

    return { success: true, data: registered };
  }

  remove(kpiId: string): KPIRegistryResult<void> {
    if (!this.kpis.has(kpiId)) {
      return {
        success: false,
        error: {
          code: "MISSING_KPI",
          message: `KPI '${kpiId}' was not found`,
          kpiId,
        },
      };
    }

    this.kpis.delete(kpiId);
    return { success: true, data: undefined };
  }

  lookup(kpiId: string): KPI | undefined {
    return this.kpis.get(kpiId);
  }

  /** Alias for lookup — returns a KPI by identifier. */
  getKPI(kpiId: string): KPI | undefined {
    return this.lookup(kpiId);
  }

  getAll(): KPI[] {
    return [...this.kpis.values()];
  }

  getByCategory(category: KPICategoryId): KPI[] {
    return this.getAll().filter((kpi) => kpi.category === category);
  }

  clear(): void {
    this.kpis.clear();
  }

  size(): number {
    return this.kpis.size;
  }

  validateCategoryAssignment(category: string): KPIRegistryResult<KPICategoryId> {
    const categoryError = this.validateCategory(category);
    if (categoryError) {
      return { success: false, error: categoryError };
    }

    return { success: true, data: category as KPICategoryId };
  }

  private validateCategory(category: string): KPIRegistryError | undefined {
    if (!VALID_CATEGORIES.has(category as KPICategoryId)) {
      return {
        code: "INVALID_CATEGORY",
        message: `Category '${category}' is not supported`,
      };
    }

    return undefined;
  }

  private validateWeight(weight: number, kpiId: string): KPIRegistryError | undefined {
    if (!Number.isFinite(weight) || weight <= 0) {
      return {
        code: "INVALID_WEIGHT",
        message: `KPI '${kpiId}' has invalid weight '${weight}'`,
        kpiId,
      };
    }

    return undefined;
  }
}

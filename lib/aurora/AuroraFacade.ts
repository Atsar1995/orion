import type { BrandService } from "@/lib/aurora/admin/services/BrandService";
import type { TenantService } from "@/lib/aurora/admin/services/TenantService";
import { AURORA_ERR_0501, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { ConfigurationService } from "@/lib/aurora/platform/services/ConfigurationService";
import type { AuroraHealthStatusService } from "@/lib/aurora/platform/services/AuroraHealthStatusService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import { withBrand } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type {
  Brand,
  CreateBrandInput,
  CreateTenantInput,
  Tenant,
  UpdateBrandInput,
  UpdateTenantInput,
} from "@/types/aurora-admin";
import type { AuroraHealthReport, HealthStatus } from "@/types/aurora-platform";

export type AdminOperations = {
  createTenant(ctx: AuroraRuntimeContext, input: CreateTenantInput): Promise<Tenant>;
  getTenant(ctx: AuroraRuntimeContext, tenantId: string): Promise<Tenant | null>;
  updateTenant(ctx: AuroraRuntimeContext, tenantId: string, input: UpdateTenantInput): Promise<Tenant>;
  listTenants(ctx: AuroraRuntimeContext): Promise<readonly Tenant[]>;
  createBrand(ctx: AuroraRuntimeContext, input: CreateBrandInput): Promise<Brand>;
  getBrand(ctx: AuroraRuntimeContext, brandId: string): Promise<Brand | null>;
  updateBrand(ctx: AuroraRuntimeContext, brandId: string, input: UpdateBrandInput): Promise<Brand>;
  listBrands(ctx: AuroraRuntimeContext, tenantId: string): Promise<readonly Brand[]>;
  switchBrand(ctx: AuroraRuntimeContext, brandId: string): AuroraRuntimeContext;
};

export type AuroraHealthOperations = {
  getPlatformHealth(): Promise<AuroraHealthReport>;
  getModuleHealth(moduleKey: string): Promise<HealthStatus>;
  getLifecycleState(): PlatformLifecycleState;
};

export type ConfigurationOperations = {
  getTenantConfig(ctx: AuroraRuntimeContext): ReturnType<ConfigurationService["getTenantConfig"]>;
  getFeatureFlags(ctx: AuroraRuntimeContext): ReturnType<ConfigurationService["getFeatureFlags"]>;
};

type StubOperations = Record<string, never>;

export type AuroraFacadeDependencies = {
  readonly tenantService: TenantService;
  readonly brandService: BrandService;
  readonly configurationService: ConfigurationService;
  readonly healthService: AuroraHealthStatusService;
  readonly getLifecycleState: () => PlatformLifecycleState;
};

function createNotImplementedStub<T extends object>(moduleName: string): T {
  return new Proxy({} as T, {
    get() {
      throw new AuroraError(AURORA_ERR_0501, `${moduleName} not implemented.`, 501);
    },
  });
}

export class AuroraFacade {
  readonly admin: AdminOperations;
  readonly health: AuroraHealthOperations;
  readonly config: ConfigurationOperations;
  readonly content = createNotImplementedStub<StubOperations>("Content");
  readonly creative = createNotImplementedStub<StubOperations>("Creative");
  readonly seo = createNotImplementedStub<StubOperations>("SEO");
  readonly social = createNotImplementedStub<StubOperations>("Social");
  readonly ads = createNotImplementedStub<StubOperations>("Ads");
  readonly email = createNotImplementedStub<StubOperations>("Email");
  readonly analytics = createNotImplementedStub<StubOperations>("Analytics");
  readonly knowledge = createNotImplementedStub<StubOperations>("Knowledge");
  readonly planner = createNotImplementedStub<StubOperations>("Planner");
  readonly agents = createNotImplementedStub<StubOperations>("Agents");
  readonly publish = createNotImplementedStub<StubOperations>("Publish");
  readonly approval = createNotImplementedStub<StubOperations>("Approval");

  constructor(deps: AuroraFacadeDependencies) {
    this.admin = {
      createTenant: (ctx, input) => deps.tenantService.createTenant(ctx, input),
      getTenant: (ctx, tenantId) => deps.tenantService.getTenant(ctx, tenantId),
      updateTenant: (ctx, tenantId, input) => deps.tenantService.updateTenant(ctx, tenantId, input),
      listTenants: (ctx) => deps.tenantService.listTenants(ctx),
      createBrand: (ctx, input) => deps.brandService.createBrand(ctx, input),
      getBrand: (ctx, brandId) => deps.brandService.getBrand(ctx, brandId),
      updateBrand: (ctx, brandId, input) => deps.brandService.updateBrand(ctx, brandId, input),
      listBrands: (ctx, tenantId) => deps.brandService.listBrands(ctx, tenantId),
      switchBrand: (ctx, brandId) => deps.brandService.switchBrand(ctx, brandId),
    };

    this.health = {
      getPlatformHealth: () => deps.healthService.getPlatformHealth(),
      getModuleHealth: (moduleKey) => deps.healthService.getModuleHealth(moduleKey),
      getLifecycleState: () => deps.getLifecycleState(),
    };

    this.config = {
      getTenantConfig: (ctx) => deps.configurationService.getTenantConfig(ctx),
      getFeatureFlags: (ctx) => deps.configurationService.getFeatureFlags(ctx),
    };
  }
}

export { withBrand };

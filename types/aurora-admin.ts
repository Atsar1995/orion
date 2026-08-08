/** Aurora admin domain types (WP-A001 · ES-AURORA-005 · WP-A002). */

export type CommercialTier = "starter" | "professional" | "agency" | "enterprise";

export type TenantStatus = "provisioning" | "active" | "suspended";

export type BusinessEntityStatus = "active" | "archived";

export type BrandStatus = "active" | "archived";

export type Tenant = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly tier: CommercialTier;
  readonly status: TenantStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type BusinessEntity = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly slug: string;
  readonly status: BusinessEntityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type Brand = {
  readonly id: string;
  readonly tenantId: string;
  readonly businessId: string;
  readonly name: string;
  readonly slug: string;
  readonly locale: string;
  readonly timezone: string;
  readonly status: BrandStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateTenantInput = {
  readonly name: string;
  readonly slug: string;
  readonly tier?: CommercialTier;
  readonly status?: TenantStatus;
};

export type UpdateTenantInput = {
  readonly name?: string;
  readonly slug?: string;
  readonly tier?: CommercialTier;
  readonly status?: TenantStatus;
};

export type CreateBusinessEntityInput = {
  readonly tenantId: string;
  readonly name: string;
  readonly slug: string;
};

export type UpdateBusinessEntityInput = {
  readonly name?: string;
  readonly slug?: string;
  readonly status?: BusinessEntityStatus;
};

export type CreateBrandInput = {
  readonly tenantId: string;
  readonly businessId: string;
  readonly name: string;
  readonly slug: string;
  readonly locale?: string;
  readonly timezone?: string;
};

export type UpdateBrandInput = {
  readonly name?: string;
  readonly slug?: string;
  readonly locale?: string;
  readonly timezone?: string;
  readonly status?: BrandStatus;
};

export type ProvisionTenantInput = {
  readonly orionOrganizationId: string;
  readonly name: string;
  readonly tier: CommercialTier;
  readonly defaultBrandName: string;
  readonly slug?: string;
  readonly adminUserId?: string;
};

export type TenantProvisionResult = {
  readonly tenant: Tenant;
  readonly defaultBusiness: BusinessEntity;
  readonly defaultBrand: Brand;
};

export type TenantConfig = {
  readonly tenantId: string;
  readonly tier: CommercialTier;
  readonly approvalPolicy: Readonly<Record<string, unknown>>;
  readonly tokenBudget: number;
  readonly featureOverrides: Readonly<Record<string, boolean>>;
  readonly limits: Readonly<Record<string, number>>;
};

export type TierLimits = {
  readonly maxBrands: number;
  readonly maxStorageMb: number;
  readonly dailyAgentTokens: number;
};

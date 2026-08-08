import type { BusinessEntityRepository } from "@/lib/aurora/admin/repositories/BusinessEntityRepository";
import type { BrandRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import {
  AURORA_ERR_0403,
  AURORA_ERR_0404,
  AuroraError,
} from "@/lib/aurora/errors/AuroraError";
import type { Brand, BusinessEntity } from "@/types/aurora-admin";

/** Validates tenant ↔ business ↔ brand hierarchy (ES-AURORA-006 §3). */
export async function assertActiveBusinessInTenant(
  businessRepository: BusinessEntityRepository,
  tenantId: string,
  businessId: string,
): Promise<BusinessEntity> {
  const business = await businessRepository.getById(tenantId, businessId);
  if (!business) {
    throw new AuroraError(AURORA_ERR_0404, "Business entity not found.", 404);
  }
  if (business.status !== "active") {
    throw new AuroraError(AURORA_ERR_0403, "Business entity is not active.", 403, {
      businessId,
      status: business.status,
    });
  }
  return business;
}

export async function assertBrandBelongsToBusiness(
  brandRepository: BrandRepository,
  tenantId: string,
  businessId: string,
  brandId: string,
): Promise<Brand> {
  const brand = await brandRepository.getById(tenantId, brandId);
  if (!brand) {
    throw new AuroraError(AURORA_ERR_0404, "Brand not found.", 404);
  }
  if (brand.businessId !== businessId) {
    throw new AuroraError(AURORA_ERR_0403, "Brand does not belong to business.", 403);
  }
  return brand;
}

export async function assertBrandCreateHierarchy(
  businessRepository: BusinessEntityRepository,
  tenantId: string,
  businessId: string,
): Promise<BusinessEntity> {
  return assertActiveBusinessInTenant(businessRepository, tenantId, businessId);
}

export async function assertBrandMutationHierarchy(
  businessRepository: BusinessEntityRepository,
  brandRepository: BrandRepository,
  tenantId: string,
  brandId: string,
): Promise<Brand> {
  const brand = await brandRepository.getById(tenantId, brandId);
  if (!brand) {
    throw new AuroraError(AURORA_ERR_0404, "Brand not found.", 404);
  }
  await assertActiveBusinessInTenant(businessRepository, tenantId, brand.businessId);
  return brand;
}

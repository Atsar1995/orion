/**
 * Supplier Management domain types (Mission P-010.7).
 */

import type { ProcurementScopedRecord } from "@/lib/procurement/types/procurement-core";

export type VendorStatus =
  | "draft"
  | "pending_qualification"
  | "qualified"
  | "active"
  | "inactive";

/** Organization-scoped vendor (supplier) master record. */
export type VendorRecord = ProcurementScopedRecord & {
  readonly vendorCode: string;
  readonly displayName: string;
  readonly legalName?: string;
  readonly status: VendorStatus;
  readonly email?: string;
  readonly phone?: string;
  readonly country?: string;
  readonly taxId?: string;
  readonly qualifiedAt?: string;
  readonly qualifiedBy?: string;
};

export type CreateSupplierInput = {
  readonly vendorCode: string;
  readonly displayName: string;
  readonly legalName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly country?: string;
  readonly taxId?: string;
};

export type UpdateSupplierInput = {
  readonly displayName?: string;
  readonly legalName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly country?: string;
  readonly taxId?: string;
};

export type SupplierListFilter = {
  readonly status?: VendorStatus;
  readonly query?: string;
};

export type SupplierListView = {
  readonly total: number;
  readonly items: readonly VendorRecord[];
};

/** Vendor contact linked to a supplier. */
export type VendorContactRecord = ProcurementScopedRecord & {
  readonly vendorId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly role?: string;
  readonly isPrimary?: boolean;
};

export type CreateVendorContactInput = {
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly role?: string;
  readonly isPrimary?: boolean;
};

export type UpdateVendorContactInput = {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly role?: string;
  readonly isPrimary?: boolean;
};

/** Vendor performance scorecard snapshot. */
export type VendorScorecardRecord = ProcurementScopedRecord & {
  readonly vendorId: string;
  readonly period: string;
  readonly deliveryScore?: string;
  readonly qualityScore?: string;
  readonly costScore?: string;
  readonly overallScore?: string;
  readonly notes?: string;
};

export type CreateVendorScorecardInput = {
  readonly period: string;
  readonly deliveryScore?: string;
  readonly qualityScore?: string;
  readonly costScore?: string;
  readonly overallScore?: string;
  readonly notes?: string;
};

export type UpdateVendorScorecardInput = {
  readonly deliveryScore?: string;
  readonly qualityScore?: string;
  readonly costScore?: string;
  readonly overallScore?: string;
  readonly notes?: string;
};

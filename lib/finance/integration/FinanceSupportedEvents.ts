import {
  CRM_FINANCE_EVENT_TYPES,
  HCM_FINANCE_EVENT_TYPES,
  type CrmFinanceEventType,
  type FinanceInboundEventType,
  type HcmFinanceEventType,
} from "@/lib/finance/integration/FinanceEventMapper";

/** Canonical inbound event types consumed by Finance (ADR-014 · P-009.9 · P-009.19). */
export const FINANCE_INBOUND_EVENT_TYPES = [
  ...HCM_FINANCE_EVENT_TYPES,
  ...CRM_FINANCE_EVENT_TYPES,
] as const;

export type { CrmFinanceEventType, FinanceInboundEventType, HcmFinanceEventType };

export { CRM_FINANCE_EVENT_TYPES, HCM_FINANCE_EVENT_TYPES };

/** Returns true when the canonical type is a supported Finance inbound CRM event. */
export function isSupportedCrmFinanceEventType(
  canonicalEventType: string | undefined,
): canonicalEventType is CrmFinanceEventType {
  return (
    canonicalEventType !== undefined &&
    (CRM_FINANCE_EVENT_TYPES as readonly string[]).includes(canonicalEventType)
  );
}

/** Returns true when the canonical type is a supported Finance inbound HCM event. */
export function isSupportedHcmFinanceEventType(
  canonicalEventType: string | undefined,
): canonicalEventType is HcmFinanceEventType {
  return (
    canonicalEventType !== undefined &&
    (HCM_FINANCE_EVENT_TYPES as readonly string[]).includes(canonicalEventType)
  );
}

/** Returns true for unsupported `crm.*` canonical types (graceful rejection target). */
export function isUnsupportedCrmCanonicalEventType(canonicalEventType: string | undefined): boolean {
  return (
    canonicalEventType !== undefined &&
    canonicalEventType.startsWith("crm.") &&
    !isSupportedCrmFinanceEventType(canonicalEventType)
  );
}

import {
  HCM_CANONICAL_FINANCE_OUTBOUND_EVENTS,
  HCM_EMPLOYEE_OUTBOUND_EVENTS,
  HCM_EMPLOYMENT_OUTBOUND_EVENTS,
  HCM_ONBOARDING_OUTBOUND_EVENTS,
  HCM_ORGANIZATION_OUTBOUND_EVENTS,
  HCM_PAYROLL_OUTBOUND_EVENTS,
  HCM_RECRUITMENT_OUTBOUND_EVENTS,
  HCM_TALENT_OUTBOUND_EVENTS,
  HCM_TIME_OUTBOUND_EVENTS,
} from "@/lib/hcm/hcm-events";

export const HCM_ALL_OUTBOUND_EVENTS = [
  ...HCM_CANONICAL_FINANCE_OUTBOUND_EVENTS,
  ...HCM_ORGANIZATION_OUTBOUND_EVENTS,
  ...HCM_EMPLOYEE_OUTBOUND_EVENTS,
  ...HCM_EMPLOYMENT_OUTBOUND_EVENTS,
  ...HCM_RECRUITMENT_OUTBOUND_EVENTS,
  ...HCM_ONBOARDING_OUTBOUND_EVENTS,
  ...HCM_TIME_OUTBOUND_EVENTS,
  ...HCM_PAYROLL_OUTBOUND_EVENTS,
  ...HCM_TALENT_OUTBOUND_EVENTS,
] as const;

export type HcmOutboundEventType = (typeof HCM_ALL_OUTBOUND_EVENTS)[number];

/** Ensures the HCM event catalogue contains no duplicate identifiers. */
export function assertUniqueHcmEventCatalog(events: readonly string[] = HCM_ALL_OUTBOUND_EVENTS): void {
  const seen = new Set<string>();
  for (const eventType of events) {
    if (seen.has(eventType)) {
      throw new Error(`DUPLICATE_HCM_EVENT:${eventType}`);
    }
    seen.add(eventType);
  }
}

assertUniqueHcmEventCatalog();

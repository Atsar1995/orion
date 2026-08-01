/**
 * HCM shared value objects and types (P-012.x).
 */

export type PersonName = {
  readonly givenName: string;
  readonly familyName: string;
  readonly middleName?: string;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly preferredName?: string;
};

export type EmailAddress = {
  readonly value: string;
  readonly type: "work" | "personal" | "other";
  readonly primary?: boolean;
};

export type PhoneNumber = {
  readonly value: string;
  readonly type: "mobile" | "work" | "home" | "other";
  readonly primary?: boolean;
};

export type PostalAddress = {
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly region?: string;
  readonly postalCode: string;
  readonly countryCode: string;
};

export type GovernmentIdentifier = {
  readonly type: string;
  readonly value: string;
  readonly countryCode?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type DateRange = {
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
};

export type HcmAuditEntry = {
  readonly id: string;
  readonly organizationId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly action: string;
  readonly actorId: string;
  readonly timestamp: string;
  readonly details?: Readonly<Record<string, string>>;
};

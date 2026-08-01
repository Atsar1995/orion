/**
 * ORION Hospitality — Guest Intelligence & Relationship Platform (Mission P-007.3).
 * Canonical guest model shared across Hospitality and future CRM workspaces.
 */

import type { LoyaltyTier } from "@/types/hospitality";

export type CommunicationChannel = "email" | "phone" | "sms" | "whatsapp" | "postal";

export type ConsentType = "marketing" | "data_processing" | "profiling" | "third_party_sharing";

export type ConsentStatus = "granted" | "denied" | "withdrawn" | "pending";

export type GuestTimelineEntryType =
  | "reservation"
  | "stay"
  | "cancellation"
  | "no_show"
  | "feedback"
  | "complaint"
  | "compliment"
  | "service_recovery"
  | "call"
  | "email"
  | "message"
  | "note"
  | "task"
  | "document"
  | "special_occasion"
  | "preference_change"
  | "consent_change"
  | "merge";

export type RelationshipType =
  | "family"
  | "companion"
  | "corporate"
  | "travel_agent"
  | "membership"
  | "referral";

export type GuestContact = {
  readonly email?: string;
  readonly phone?: string;
  readonly mobile?: string;
  readonly address?: string;
  readonly city?: string;
  readonly country?: string;
};

export type GuestIdentity = {
  readonly passportNumber?: string;
  readonly passportExpiry?: string;
  readonly visaNumber?: string;
  readonly visaExpiry?: string;
  readonly nationalId?: string;
  readonly nationalIdType?: string;
  readonly dateOfBirth?: string;
  readonly gender?: string;
};

export type GuestConsent = {
  readonly type: ConsentType;
  readonly status: ConsentStatus;
  readonly grantedAt?: string;
  readonly withdrawnAt?: string;
  readonly channel?: CommunicationChannel;
};

export type GuestDocument = {
  readonly id: string;
  readonly type: string;
  readonly reference: string;
  readonly issuedAt?: string;
  readonly expiresAt?: string;
  readonly url?: string;
};

export type GuestPreference = {
  readonly category: string;
  readonly value: string;
  readonly source?: string;
  readonly updatedAt: string;
};

export type GuestRelationship = {
  readonly id: string;
  readonly type: RelationshipType;
  readonly relatedGuestId?: string;
  readonly relatedName: string;
  readonly company?: string;
  readonly role?: string;
  readonly notes?: string;
};

export type GuestCommunication = {
  readonly id: string;
  readonly channel: CommunicationChannel;
  readonly direction: "inbound" | "outbound";
  readonly subject?: string;
  readonly summary: string;
  readonly occurredAt: string;
  readonly actorName?: string;
};

export type GuestTag = {
  readonly id: string;
  readonly label: string;
  readonly color?: string;
};

export type GuestTimelineEntry = {
  readonly id: string;
  readonly guestId: string;
  readonly type: GuestTimelineEntryType;
  readonly title: string;
  readonly summary: string;
  readonly occurredAt: string;
  readonly relatedEntityId?: string;
  readonly metadata?: Record<string, string | number | boolean>;
};

/** Canonical guest record — independent of reservations. */
export type GuestRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly fullName: string;
  readonly preferredName?: string;
  readonly photographUrl?: string;
  readonly contact: GuestContact;
  readonly nationality?: string;
  readonly languages: readonly string[];
  readonly identity?: GuestIdentity;
  readonly loyaltyTier: LoyaltyTier;
  readonly loyaltyNumber?: string;
  readonly preferredCurrency: string;
  readonly preferredChannel: CommunicationChannel;
  readonly consents: readonly GuestConsent[];
  readonly accessibilityRequirements: readonly string[];
  readonly dietaryPreferences: readonly string[];
  readonly emergencyContact?: { readonly name: string; readonly phone: string; readonly relationship?: string };
  readonly preferences: readonly GuestPreference[];
  readonly relationships: readonly GuestRelationship[];
  readonly documents: readonly GuestDocument[];
  readonly communications: readonly GuestCommunication[];
  readonly tags: readonly GuestTag[];
  readonly isVip: boolean;
  readonly company?: string;
  readonly stayCount: number;
  readonly totalSpend: number;
  readonly satisfactionScore?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type GuestSearchFilter = {
  readonly query?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly passport?: string;
  readonly loyaltyNumber?: string;
  readonly company?: string;
  readonly reservationNumber?: string;
  readonly loyaltyTier?: LoyaltyTier;
  readonly isVip?: boolean;
  readonly tag?: string;
};

export type CreateGuestInput = {
  readonly fullName: string;
  readonly preferredName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly nationality?: string;
  readonly languages?: readonly string[];
  readonly loyaltyTier?: LoyaltyTier;
  readonly preferredCurrency?: string;
  readonly preferredChannel?: CommunicationChannel;
  readonly company?: string;
  readonly isVip?: boolean;
  readonly dietaryPreferences?: readonly string[];
  readonly accessibilityRequirements?: readonly string[];
};

export type ModifyGuestInput = Partial<
  Omit<CreateGuestInput, "fullName"> & { readonly fullName?: string; readonly photographUrl?: string }
>;

export type MergeGuestsInput = {
  readonly primaryGuestId: string;
  readonly duplicateGuestId: string;
};

export type GuestBriefSignals = {
  readonly vipArrivals: number;
  readonly repeatGuests: number;
  readonly highValueGuests: number;
  readonly serviceRecoveryAlerts: readonly string[];
  readonly satisfactionTrend: string;
  readonly guestRetentionOpportunity: string;
};

export type PublishGuestEngineEventInput = {
  readonly eventType:
    | "GuestCreated"
    | "GuestUpdated"
    | "GuestMerged"
    | "PreferenceUpdated"
    | "ConsentUpdated"
    | "VipFlagged";
  readonly guestId: string;
  readonly actorId: string;
  readonly actorName?: string;
  readonly payload?: Record<string, unknown>;
};

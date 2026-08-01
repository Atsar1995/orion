import type { GuestProfile } from "@/types/hospitality";
import type { GuestRecord } from "@/types/hospitality-guest";

/** Maps canonical GuestRecord to legacy GuestProfile for backward compatibility. */
export function toLegacyGuestProfile(record: GuestRecord): GuestProfile {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.fullName,
    email: record.contact.email ?? "",
    phone: record.contact.phone ?? record.contact.mobile ?? "",
    nationality: record.nationality ?? "",
    loyaltyTier: record.loyaltyTier,
    preferences: record.preferences.map((entry) => entry.value),
    specialRequests: record.preferences
      .filter((entry) => entry.category === "special_request")
      .map((entry) => entry.value),
    stayCount: record.stayCount,
    totalSpend: record.totalSpend,
    documents: record.documents.map((doc) => ({ type: doc.type, reference: doc.reference })),
  };
}

/** Maps legacy GuestProfile to minimal GuestRecord shape (for create shim). */
export function fromLegacyGuestProfile(profile: GuestProfile, now: string): GuestRecord {
  const isVip = profile.loyaltyTier === "vip" || profile.loyaltyTier === "platinum";
  return {
    id: profile.id,
    organizationId: profile.organizationId,
    fullName: profile.name,
    contact: { email: profile.email, phone: profile.phone, mobile: profile.phone },
    nationality: profile.nationality,
    languages: ["English"],
    loyaltyTier: profile.loyaltyTier,
    preferredCurrency: "INR",
    preferredChannel: "email",
    consents: [{ type: "data_processing", status: "granted", grantedAt: now }],
    accessibilityRequirements: [],
    dietaryPreferences: [],
    preferences: profile.preferences.map((value) => ({
      category: "general",
      value,
      updatedAt: now,
    })),
    relationships: [],
    documents: profile.documents.map((doc, index) => ({
      id: `doc-${profile.id}-${index}`,
      type: doc.type,
      reference: doc.reference,
    })),
    communications: [],
    tags: isVip ? [{ id: `tag-${profile.id}-vip`, label: "VIP" }] : [],
    isVip,
    stayCount: profile.stayCount,
    totalSpend: profile.totalSpend,
    createdAt: now,
    updatedAt: now,
  };
}

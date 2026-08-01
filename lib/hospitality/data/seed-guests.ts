import { SEED_GUESTS } from "@/lib/hospitality/data/seed-hospitality";
import type {
  GuestCommunication,
  GuestConsent,
  GuestPreference,
  GuestRecord,
  GuestRelationship,
  GuestTimelineEntry,
} from "@/types/hospitality-guest";

const NOW = "2026-07-30T09:00:00.000Z";

function mapLegacyToRecord(guest: (typeof SEED_GUESTS)[number]): GuestRecord {
  const isVip = guest.loyaltyTier === "vip" || guest.loyaltyTier === "platinum";
  const passport = guest.documents.find((doc) => doc.type === "passport");

  return {
    id: guest.id,
    organizationId: guest.organizationId,
    fullName: guest.name,
    preferredName: guest.name.split(" ")[0],
    contact: {
      email: guest.email,
      phone: guest.phone,
      mobile: guest.phone,
      country: guest.nationality,
    },
    nationality: guest.nationality,
    languages: guest.nationality === "India" ? ["English", "Hindi"] : ["English"],
    identity: passport
      ? { passportNumber: passport.reference, nationalId: guest.documents.find((d) => d.type === "aadhaar")?.reference }
      : undefined,
    loyaltyTier: guest.loyaltyTier,
    loyaltyNumber: `LOY-${guest.id.replace("guest-", "").toUpperCase()}`,
    preferredCurrency: "INR",
    preferredChannel: "email",
    consents: [
      { type: "marketing", status: isVip ? "granted" : "pending", grantedAt: isVip ? NOW : undefined },
      { type: "data_processing", status: "granted", grantedAt: NOW },
    ],
    accessibilityRequirements: [],
    dietaryPreferences: guest.preferences.filter((p) => p.toLowerCase().includes("vegetarian") || p.toLowerCase().includes("breakfast")),
    emergencyContact:
      guest.id === "guest-mehta"
        ? { name: "Anita Mehta", phone: "+91 98765 00000", relationship: "Spouse" }
        : undefined,
    preferences: [
      ...guest.preferences.map((value, index) => ({
        category: "general",
        value,
        source: "reservation",
        updatedAt: NOW,
      })),
      ...guest.specialRequests.map((value) => ({
        category: "special_request",
        value,
        source: "reservation",
        updatedAt: NOW,
      })),
    ],
    relationships:
      guest.id === "guest-mehta"
        ? [
            {
              id: "rel-mehta-1",
              type: "family",
              relatedName: "Anita Mehta",
              role: "Spouse",
            },
            {
              id: "rel-mehta-2",
              type: "travel_agent",
              relatedName: "Heritage Travel Co.",
              company: "Heritage Travel Co.",
            },
          ]
        : guest.id === "guest-kapoor"
          ? [
              {
                id: "rel-kapoor-1",
                type: "corporate",
                relatedName: "Kapoor Industries",
                company: "Kapoor Industries",
                role: "Executive Account",
              },
            ]
          : [],
    documents: guest.documents.map((doc, index) => ({
      id: `doc-${guest.id}-${index}`,
      type: doc.type,
      reference: doc.reference,
    })),
    communications: buildCommunications(guest.id),
    tags: isVip ? [{ id: `tag-${guest.id}-vip`, label: "VIP" }] : [],
    isVip,
    company: guest.id === "guest-kapoor" ? "Kapoor Industries" : guest.id === "guest-wilson" ? "Wilson Consulting Ltd" : undefined,
    stayCount: guest.stayCount,
    totalSpend: guest.totalSpend,
    satisfactionScore: guest.id === "guest-nair" ? 72 : guest.loyaltyTier === "vip" ? 94 : 85,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function buildCommunications(guestId: string): GuestCommunication[] {
  const base: GuestCommunication[] = [
    {
      id: `comm-${guestId}-1`,
      channel: "email",
      direction: "outbound",
      subject: "Welcome to ORANIA Heritage Resort",
      summary: "Pre-arrival welcome email sent with property guide.",
      occurredAt: "2026-07-28T10:00:00.000Z",
      actorName: "Front Office",
    },
  ];

  if (guestId === "guest-mehta") {
    base.push({
      id: `comm-${guestId}-2`,
      channel: "phone",
      direction: "inbound",
      summary: "Guest requested late checkout and anniversary setup confirmation.",
      occurredAt: "2026-07-29T14:30:00.000Z",
      actorName: "Concierge",
    });
  }

  if (guestId === "guest-nair") {
    base.push({
      id: `comm-${guestId}-2`,
      channel: "email",
      direction: "inbound",
      subject: "Room temperature concern",
      summary: "Guest reported AC issue — service recovery initiated.",
      occurredAt: "2026-07-29T18:00:00.000Z",
    });
  }

  return base;
}

export function buildGuestTimelineSeed(): GuestTimelineEntry[] {
  const entries: GuestTimelineEntry[] = [
    {
      id: "tl-mehta-1",
      guestId: "guest-mehta",
      type: "reservation",
      title: "Reservation ORH-2026-0001 confirmed",
      summary: "Lake View Deluxe · 3 nights · Direct booking",
      occurredAt: "2026-07-25T08:00:00.000Z",
      relatedEntityId: "res-001",
    },
    {
      id: "tl-mehta-2",
      guestId: "guest-mehta",
      type: "special_occasion",
      title: "Anniversary celebration",
      summary: "Room decoration and dinner reservation arranged.",
      occurredAt: "2026-07-28T11:00:00.000Z",
    },
    {
      id: "tl-mehta-3",
      guestId: "guest-mehta",
      type: "compliment",
      title: "Positive feedback on concierge service",
      summary: "Guest praised personalized welcome experience.",
      occurredAt: "2026-07-29T16:00:00.000Z",
    },
    {
      id: "tl-nair-1",
      guestId: "guest-nair",
      type: "complaint",
      title: "Room temperature issue",
      summary: "AC not cooling adequately — maintenance dispatched.",
      occurredAt: "2026-07-29T18:00:00.000Z",
    },
    {
      id: "tl-nair-2",
      guestId: "guest-nair",
      type: "service_recovery",
      title: "Complimentary spa voucher issued",
      summary: "Recovery action for room comfort issue.",
      occurredAt: "2026-07-29T19:30:00.000Z",
    },
    {
      id: "tl-kapoor-1",
      guestId: "guest-kapoor",
      type: "stay",
      title: "Completed stay — 5 nights",
      summary: "Corporate retreat · ₹1.2L revenue",
      occurredAt: "2026-06-15T10:00:00.000Z",
    },
    {
      id: "tl-wilson-1",
      guestId: "guest-wilson",
      type: "feedback",
      title: "Post-stay survey — 5 stars",
      summary: "Excellent rating for heritage experience and dining.",
      occurredAt: "2026-07-10T09:00:00.000Z",
    },
  ];

  return entries;
}

/** Enriched guest records for P-007.3 engine. Includes a near-duplicate for merge testing. */
export function buildGuestSeed(): GuestRecord[] {
  const records = SEED_GUESTS.map(mapLegacyToRecord);

  records.push({
    id: "guest-mehta-dup",
    organizationId: "org-orania",
    fullName: "Rajesh M. Mehta",
    preferredName: "Rajesh",
    contact: {
      email: "r.mehta@example.com",
      phone: "+91 98765 43210",
      mobile: "+91 98765 43210",
      country: "India",
    },
    nationality: "India",
    languages: ["English", "Hindi"],
    identity: { passportNumber: "P1234567" },
    loyaltyTier: "gold",
    loyaltyNumber: "LOY-MEHTA-DUP",
    preferredCurrency: "INR",
    preferredChannel: "phone",
    consents: [{ type: "data_processing", status: "granted", grantedAt: NOW }],
    accessibilityRequirements: [],
    dietaryPreferences: ["Vegetarian meals"],
    preferences: [{ category: "general", value: "Lake view", source: "manual", updatedAt: NOW }],
    relationships: [],
    documents: [{ id: "doc-dup-1", type: "passport", reference: "P1234567" }],
    communications: [],
    tags: [],
    isVip: false,
    stayCount: 1,
    totalSpend: 52000,
    satisfactionScore: 80,
    createdAt: NOW,
    updatedAt: NOW,
  });

  return records;
}

export type { GuestConsent, GuestPreference, GuestRelationship };

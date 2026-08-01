import { DEFAULT_PROPERTY_ID } from "@/lib/hospitality/constants";
import type {
  AccommodationFeature,
  AccommodationType,
  Amenity,
  InventoryAvailability,
  InventoryItem,
  MediaAsset,
  PropertyLocation,
  PropertyPortfolio,
  PropertyZone,
} from "@/types/hospitality-inventory";
import type { HospitalityProperty } from "@/types/hospitality";

const ORG_ID = "org-orania";
export const SECOND_PROPERTY_ID = "prop-lakeview-homestay";

export const SEED_PORTFOLIO: PropertyPortfolio = {
  id: "portfolio-orania-hospitality",
  organizationId: ORG_ID,
  name: "ORANIA Hospitality Portfolio",
  slug: "orania-hospitality",
  description: "Resorts, heritage properties, and boutique homestays across Rajasthan.",
  propertyIds: [DEFAULT_PROPERTY_ID, SECOND_PROPERTY_ID],
};

export const SEED_SECOND_PROPERTY: HospitalityProperty = {
  id: SECOND_PROPERTY_ID,
  organizationId: ORG_ID,
  name: "Lakeview Homestay",
  slug: "lakeview-homestay",
  type: "homestay",
  address: "Ghatside Lane, Udaipur",
  timeZone: "Asia/Kolkata",
  totalRooms: 6,
  portfolioId: SEED_PORTFOLIO.id,
  operationalStatus: "active",
  city: "Udaipur",
  region: "Rajasthan",
  country: "India",
};

export const SEED_AMENITIES: Amenity[] = [
  { id: "amen-wifi", organizationId: ORG_ID, name: "WiFi", category: "technology", icon: "wifi" },
  { id: "amen-breakfast", organizationId: ORG_ID, name: "Breakfast", category: "food_beverage", icon: "coffee" },
  { id: "amen-lake-view", organizationId: ORG_ID, name: "Lake View", category: "outdoor", icon: "water" },
  { id: "amen-minibar", organizationId: ORG_ID, name: "Minibar", category: "food_beverage", icon: "glass" },
  { id: "amen-butler", organizationId: ORG_ID, name: "Butler Service", category: "general", icon: "bell" },
  { id: "amen-pool", organizationId: ORG_ID, name: "Private Pool", category: "wellness", icon: "pool" },
  { id: "amen-accessible", organizationId: ORG_ID, name: "Wheelchair Accessible", category: "accessibility", icon: "accessibility" },
  { id: "amen-jacuzzi", organizationId: ORG_ID, name: "Jacuzzi", category: "wellness", icon: "spa" },
];

export const SEED_FEATURES: AccommodationFeature[] = [
  { id: "feat-lake-view", name: "Lake View", category: "view" },
  { id: "feat-garden-view", name: "Garden View", category: "view" },
  { id: "feat-smart-tv", name: "Smart TV", category: "technology" },
  { id: "feat-climate", name: "Climate Control", category: "comfort" },
];

const defaultAccessibility = {
  wheelchairAccessible: false,
  hearingAccessible: false,
  visualAccessible: false,
  rollInShower: false,
  features: [] as string[],
};

export const SEED_ACCOMMODATION_TYPES: AccommodationType[] = [
  {
    id: "acc-rt-standard",
    propertyId: DEFAULT_PROPERTY_ID,
    name: "Heritage Standard",
    kind: "room",
    category: "standard",
    baseRate: 4200,
    maxOccupancy: 2,
    amenityIds: ["amen-wifi", "amen-breakfast", "amen-lake-view"],
    features: ["Garden View", "Climate Control"],
    bedConfiguration: [{ type: "queen", count: 1 }],
    views: ["garden"],
    accessibility: defaultAccessibility,
    occupancyRules: { maxAdults: 2, maxChildren: 1, maxTotal: 3, extraBedAllowed: true },
  },
  {
    id: "acc-rt-deluxe",
    propertyId: DEFAULT_PROPERTY_ID,
    name: "Lake View Deluxe",
    kind: "room",
    category: "deluxe",
    baseRate: 5200,
    maxOccupancy: 3,
    amenityIds: ["amen-wifi", "amen-breakfast", "amen-lake-view", "amen-minibar"],
    features: ["Lake View", "Smart TV"],
    bedConfiguration: [{ type: "king", count: 1 }],
    views: ["lake"],
    accessibility: defaultAccessibility,
    occupancyRules: { maxAdults: 3, maxChildren: 2, maxTotal: 4, extraBedAllowed: true },
  },
  {
    id: "acc-rt-suite",
    propertyId: DEFAULT_PROPERTY_ID,
    name: "Royal Suite",
    kind: "suite",
    category: "suite",
    baseRate: 12000,
    maxOccupancy: 4,
    amenityIds: ["amen-wifi", "amen-breakfast", "amen-lake-view", "amen-butler", "amen-jacuzzi"],
    features: ["Lake View", "Butler Service"],
    bedConfiguration: [{ type: "king", count: 1 }, { type: "sofa_bed", count: 1 }],
    views: ["lake", "courtyard"],
    accessibility: { ...defaultAccessibility, rollInShower: true, features: ["Wide doorways"] },
    occupancyRules: { maxAdults: 4, maxChildren: 2, maxTotal: 5, extraBedAllowed: false },
  },
  {
    id: "acc-rt-villa",
    propertyId: DEFAULT_PROPERTY_ID,
    name: "Heritage Villa",
    kind: "villa",
    category: "villa",
    baseRate: 25000,
    maxOccupancy: 6,
    amenityIds: ["amen-pool", "amen-butler", "amen-wifi"],
    features: ["Private Pool", "Chef Service"],
    bedConfiguration: [{ type: "king", count: 2 }, { type: "twin", count: 2 }],
    views: ["garden", "pool"],
    accessibility: defaultAccessibility,
    occupancyRules: { maxAdults: 6, maxChildren: 4, maxTotal: 8, extraBedAllowed: true },
  },
  {
    id: "acc-homestay-room",
    propertyId: SECOND_PROPERTY_ID,
    name: "Lakeview Room",
    kind: "room",
    category: "standard",
    baseRate: 2800,
    maxOccupancy: 2,
    amenityIds: ["amen-wifi", "amen-breakfast", "amen-lake-view"],
    features: ["Lake View"],
    bedConfiguration: [{ type: "double", count: 1 }],
    views: ["lake"],
    accessibility: { ...defaultAccessibility, wheelchairAccessible: true, features: ["Ground floor access"] },
    occupancyRules: { maxAdults: 2, maxChildren: 1, maxTotal: 3, extraBedAllowed: false },
  },
  {
    id: "acc-houseboat",
    propertyId: SECOND_PROPERTY_ID,
    name: "Heritage Houseboat",
    kind: "houseboat",
    category: "unique",
    baseRate: 8500,
    maxOccupancy: 4,
    amenityIds: ["amen-wifi", "amen-breakfast", "amen-lake-view"],
    features: ["Lake View", "Private Deck"],
    bedConfiguration: [{ type: "queen", count: 2 }],
    views: ["lake"],
    accessibility: defaultAccessibility,
    occupancyRules: { maxAdults: 4, maxChildren: 0, maxTotal: 4, extraBedAllowed: false },
  },
];

export const SEED_ZONES: PropertyZone[] = [
  {
    id: "zone-palace",
    propertyId: DEFAULT_PROPERTY_ID,
    name: "Palace Quarter",
    description: "Main heritage building and premium wing.",
    buildingIds: ["bld-main"],
  },
  {
    id: "zone-villa-estate",
    propertyId: DEFAULT_PROPERTY_ID,
    name: "Villa Estate",
    description: "Private villa cluster with pool access.",
    buildingIds: ["bld-villas"],
  },
  {
    id: "zone-ghatside",
    propertyId: SECOND_PROPERTY_ID,
    name: "Ghatside",
    description: "Lake-facing homestay rooms and houseboat mooring.",
    buildingIds: ["bld-homestay"],
  },
];

export const SEED_INVENTORY_ITEMS: InventoryItem[] = [
  { id: "inv-room-101", propertyId: DEFAULT_PROPERTY_ID, accommodationTypeId: "acc-rt-standard", kind: "room", label: "101", floorId: "fl-1", zoneId: "zone-palace", buildingId: "bld-main", status: "occupied", maintenanceStatus: "none", operationalStatus: "active", accessibility: defaultAccessibility, mediaIds: ["media-101"], isVip: false, capacity: 2 },
  { id: "inv-room-112", propertyId: DEFAULT_PROPERTY_ID, accommodationTypeId: "acc-rt-standard", kind: "room", label: "112", floorId: "fl-1", zoneId: "zone-palace", buildingId: "bld-main", status: "dirty", maintenanceStatus: "none", operationalStatus: "active", accessibility: defaultAccessibility, mediaIds: [], isVip: false, capacity: 2 },
  { id: "inv-room-118", propertyId: DEFAULT_PROPERTY_ID, accommodationTypeId: "acc-rt-deluxe", kind: "room", label: "118", floorId: "fl-1", zoneId: "zone-palace", buildingId: "bld-main", status: "clean", maintenanceStatus: "none", operationalStatus: "active", accessibility: defaultAccessibility, mediaIds: ["media-118"], isVip: false, capacity: 3 },
  { id: "inv-room-204", propertyId: DEFAULT_PROPERTY_ID, accommodationTypeId: "acc-rt-deluxe", kind: "room", label: "204", floorId: "fl-2", zoneId: "zone-palace", buildingId: "bld-main", status: "clean", maintenanceStatus: "none", operationalStatus: "active", accessibility: defaultAccessibility, mediaIds: [], isVip: true, capacity: 3 },
  { id: "inv-room-207", propertyId: DEFAULT_PROPERTY_ID, accommodationTypeId: "acc-rt-standard", kind: "room", label: "207", floorId: "fl-2", zoneId: "zone-palace", buildingId: "bld-main", status: "occupied", maintenanceStatus: "none", operationalStatus: "active", accessibility: defaultAccessibility, mediaIds: [], isVip: false, capacity: 2 },
  { id: "inv-room-305", propertyId: DEFAULT_PROPERTY_ID, accommodationTypeId: "acc-rt-deluxe", kind: "room", label: "305", floorId: "fl-3", zoneId: "zone-palace", buildingId: "bld-main", status: "maintenance", maintenanceStatus: "in_progress", operationalStatus: "active", accessibility: defaultAccessibility, mediaIds: [], isVip: true, capacity: 3 },
  { id: "inv-room-401", propertyId: DEFAULT_PROPERTY_ID, accommodationTypeId: "acc-rt-suite", kind: "suite", label: "401", floorId: "fl-4", zoneId: "zone-palace", buildingId: "bld-main", status: "occupied", maintenanceStatus: "none", operationalStatus: "active", accessibility: { ...defaultAccessibility, rollInShower: true, features: ["Wide doorways"] }, mediaIds: ["media-401"], isVip: true, capacity: 4 },
  { id: "inv-villa-v01", propertyId: DEFAULT_PROPERTY_ID, accommodationTypeId: "acc-rt-villa", kind: "villa", label: "V-01", floorId: "fl-v1", zoneId: "zone-villa-estate", buildingId: "bld-villas", status: "available", maintenanceStatus: "none", operationalStatus: "active", accessibility: defaultAccessibility, mediaIds: ["media-v01"], isVip: true, capacity: 6 },
  { id: "inv-hs-01", propertyId: SECOND_PROPERTY_ID, accommodationTypeId: "acc-homestay-room", kind: "room", label: "G-01", floorId: "fl-h1", zoneId: "zone-ghatside", buildingId: "bld-homestay", status: "available", maintenanceStatus: "none", operationalStatus: "active", accessibility: { ...defaultAccessibility, wheelchairAccessible: true, features: ["Ground floor access"] }, mediaIds: [], isVip: false, capacity: 2 },
  { id: "inv-hs-02", propertyId: SECOND_PROPERTY_ID, accommodationTypeId: "acc-homestay-room", kind: "room", label: "G-02", floorId: "fl-h1", zoneId: "zone-ghatside", buildingId: "bld-homestay", status: "clean", maintenanceStatus: "none", operationalStatus: "active", accessibility: defaultAccessibility, mediaIds: [], isVip: false, capacity: 2 },
  { id: "inv-boat-01", propertyId: SECOND_PROPERTY_ID, accommodationTypeId: "acc-houseboat", kind: "houseboat", label: "HB-01", zoneId: "zone-ghatside", buildingId: "bld-homestay", status: "available", maintenanceStatus: "scheduled", operationalStatus: "active", accessibility: defaultAccessibility, mediaIds: ["media-boat"], isVip: false, capacity: 4 },
];

export const SEED_MEDIA: MediaAsset[] = [
  { id: "media-101", organizationId: ORG_ID, propertyId: DEFAULT_PROPERTY_ID, inventoryItemId: "inv-room-101", type: "photo", url: "/media/hospitality/room-101.jpg", caption: "Heritage Standard Room 101", sortOrder: 1 },
  { id: "media-118", organizationId: ORG_ID, propertyId: DEFAULT_PROPERTY_ID, inventoryItemId: "inv-room-118", type: "photo", url: "/media/hospitality/room-118.jpg", caption: "Lake View Deluxe 118", sortOrder: 1 },
  { id: "media-401", organizationId: ORG_ID, propertyId: DEFAULT_PROPERTY_ID, inventoryItemId: "inv-room-401", type: "photo", url: "/media/hospitality/suite-401.jpg", caption: "Royal Suite 401", sortOrder: 1 },
  { id: "media-v01", organizationId: ORG_ID, propertyId: DEFAULT_PROPERTY_ID, inventoryItemId: "inv-villa-v01", type: "photo", url: "/media/hospitality/villa-v01.jpg", caption: "Heritage Villa V-01", sortOrder: 1 },
  { id: "media-floor-main", organizationId: ORG_ID, propertyId: DEFAULT_PROPERTY_ID, type: "floor_plan", url: "/media/hospitality/floor-main.pdf", caption: "Main Palace Floor Plan", sortOrder: 0 },
  { id: "media-boat", organizationId: ORG_ID, propertyId: SECOND_PROPERTY_ID, inventoryItemId: "inv-boat-01", type: "photo", url: "/media/hospitality/houseboat.jpg", caption: "Heritage Houseboat", sortOrder: 1 },
];

export const SEED_LOCATIONS: PropertyLocation[] = [
  {
    propertyId: DEFAULT_PROPERTY_ID,
    latitude: 24.5854,
    longitude: 73.7125,
    address: "Lake Road, Udaipur, Rajasthan",
    city: "Udaipur",
    region: "Rajasthan",
    country: "India",
    postalCode: "313001",
  },
  {
    propertyId: SECOND_PROPERTY_ID,
    latitude: 24.5799,
    longitude: 73.6833,
    address: "Ghatside Lane, Udaipur",
    city: "Udaipur",
    region: "Rajasthan",
    country: "India",
    postalCode: "313001",
  },
];

export const SEED_AVAILABILITY: InventoryAvailability[] = [
  { inventoryItemId: "inv-villa-v01", propertyId: DEFAULT_PROPERTY_ID, date: "2026-07-30", available: true },
  { inventoryItemId: "inv-room-305", propertyId: DEFAULT_PROPERTY_ID, date: "2026-07-30", available: false, reason: "Maintenance in progress" },
  { inventoryItemId: "inv-hs-01", propertyId: SECOND_PROPERTY_ID, date: "2026-07-30", available: true },
  { inventoryItemId: "inv-boat-01", propertyId: SECOND_PROPERTY_ID, date: "2026-07-30", available: true },
];

export function buildInventorySeed() {
  return {
    portfolio: SEED_PORTFOLIO,
    secondProperty: SEED_SECOND_PROPERTY,
    amenities: SEED_AMENITIES,
    features: SEED_FEATURES,
    accommodationTypes: SEED_ACCOMMODATION_TYPES,
    zones: SEED_ZONES,
    inventoryItems: SEED_INVENTORY_ITEMS,
    media: SEED_MEDIA,
    locations: SEED_LOCATIONS,
    availability: SEED_AVAILABILITY,
  };
}

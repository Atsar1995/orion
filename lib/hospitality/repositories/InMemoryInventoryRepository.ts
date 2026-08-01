import { randomUUID } from "crypto";
import { buildHospitalitySeed } from "@/lib/hospitality/data/seed-hospitality";
import { buildInventorySeed } from "@/lib/hospitality/data/seed-inventory";
import { buildReservationSeed } from "@/lib/hospitality/data/seed-reservations";
import { buildStaySeed } from "@/lib/hospitality/data/seed-front-office";
import { buildHousekeepingSeed } from "@/lib/hospitality/data/seed-housekeeping";
import { buildBillingSeed } from "@/lib/hospitality/data/seed-billing";
import type { BillingRepository } from "@/lib/hospitality/repositories/BillingRepository";
import { toLegacyReservation } from "@/lib/hospitality/reservations/reservation-mapper";
import { buildGuestSeed, buildGuestTimelineSeed } from "@/lib/hospitality/data/seed-guests";
import { toLegacyGuestProfile } from "@/lib/hospitality/guests/guest-mapper";
import type { GuestRepository } from "@/lib/hospitality/repositories/GuestRepository";
import type {
  ReservationRecord,
  ReservationSearchFilter,
} from "@/types/hospitality-reservation";
import type {
  AccommodationType,
  Amenity,
  CreateInventoryItemInput,
  CreatePropertyInput,
  InventoryAvailability,
  InventoryItem,
  InventorySearchFilter,
  MediaAsset,
  PropertyLocation,
  PropertyPortfolio,
  PropertyZone,
} from "@/types/hospitality-inventory";
import type {
  AssetRecord,
  HousekeepingTaskRecord,
  InspectionRecord,
  LinenItemRecord,
  LostAndFoundRecord,
  MaintenanceScheduleRecord,
  MaintenanceWorkOrderRecord,
} from "@/types/hospitality-housekeeping";
import type {
  AdjustmentRecord,
  ChargeRecord,
  DepositRecord,
  FolioRecord,
  InvoiceRecord,
  PaymentRecord,
  RefundRecord,
  RevenueEventRecord,
  TaxRecord,
} from "@/types/hospitality-billing";
import type { Folio, HousekeepingTask, MaintenanceRequest } from "@/types/hospitality";
import type {
  GuestRecord,
  GuestSearchFilter,
  GuestTimelineEntry,
} from "@/types/hospitality-guest";

import type { StayRecord } from "@/types/hospitality-front-office";
import type { HospitalityProperty, Reservation, RoomStatus } from "@/types/hospitality";

function normalizePhone(phone?: string): string {
  return (phone ?? "").replace(/\D/g, "");
}

/** In-memory unified hospitality repository (P-007.1–P-007.6). */
export class InMemoryInventoryRepository implements BillingRepository {
  private readonly hospitalitySeed = buildHospitalitySeed();
  private readonly inventorySeed = buildInventorySeed();
  private reservationRecords: ReservationRecord[];
  private guestRecords: GuestRecord[] = buildGuestSeed();
  private guestTimeline: GuestTimelineEntry[] = buildGuestTimelineSeed();
  private stayRecords: StayRecord[];
  private housekeepingTasks: HousekeepingTaskRecord[];
  private workOrders: MaintenanceWorkOrderRecord[];
  private inspections: InspectionRecord[];
  private assets: AssetRecord[];
  private maintenanceSchedules: MaintenanceScheduleRecord[];
  private linenItems: LinenItemRecord[];
  private lostAndFound: LostAndFoundRecord[];
  private folioRecords: FolioRecord[];
  private chargeRecords: ChargeRecord[];
  private paymentRecords: PaymentRecord[];
  private depositRecords: DepositRecord[];
  private refundRecords: RefundRecord[];
  private adjustmentRecords: AdjustmentRecord[];
  private invoiceRecords: InvoiceRecord[];
  private taxRecords: TaxRecord[];
  private revenueEvents: RevenueEventRecord[];

  constructor() {
    this.reservationRecords = buildReservationSeed();
    this.stayRecords = buildStaySeed(this.reservationRecords);
    const hkSeed = buildHousekeepingSeed();
    this.housekeepingTasks = [...hkSeed.tasks];
    this.workOrders = [...hkSeed.workOrders];
    this.inspections = [...hkSeed.inspections];
    this.assets = [...hkSeed.assets];
    this.maintenanceSchedules = [...hkSeed.schedules];
    this.linenItems = [...hkSeed.linen];
    this.lostAndFound = [...hkSeed.lostAndFound];
    const billingSeed = buildBillingSeed();
    this.folioRecords = [...billingSeed.folios];
    this.chargeRecords = [...billingSeed.charges];
    this.paymentRecords = [...billingSeed.payments];
    this.depositRecords = [...billingSeed.deposits];
    this.refundRecords = [...billingSeed.refunds];
    this.adjustmentRecords = [...billingSeed.adjustments];
    this.invoiceRecords = [...billingSeed.invoices];
    this.taxRecords = [...billingSeed.taxRecords];
    this.revenueEvents = [...billingSeed.revenueEvents];
  }
  private properties: HospitalityProperty[] = [
    {
      ...this.hospitalitySeed.property,
      portfolioId: this.inventorySeed.portfolio.id,
      operationalStatus: "active",
      city: "Udaipur",
      region: "Rajasthan",
      country: "India",
    },
    this.inventorySeed.secondProperty,
  ];
  private inventoryItems: InventoryItem[] = [...this.inventorySeed.inventoryItems];
  private accommodationTypes: AccommodationType[] = [...this.inventorySeed.accommodationTypes];
  private amenities: Amenity[] = [...this.inventorySeed.amenities];
  private zones: PropertyZone[] = [...this.inventorySeed.zones];
  private media: MediaAsset[] = [...this.inventorySeed.media];
  private locations: PropertyLocation[] = [...this.inventorySeed.locations];
  private availability: InventoryAvailability[] = [...this.inventorySeed.availability];
  private portfolios: PropertyPortfolio[] = [this.inventorySeed.portfolio];

  getPortfolio(organizationId: string) {
    return this.portfolios.find((entry) => entry.organizationId === organizationId) ?? null;
  }

  listPortfolios(organizationId: string) {
    return this.portfolios.filter((entry) => entry.organizationId === organizationId);
  }

  getProperty(propertyId: string) {
    return this.properties.find((entry) => entry.id === propertyId) ?? null;
  }

  listProperties(organizationId: string) {
    return this.properties.filter((entry) => entry.organizationId === organizationId);
  }

  createProperty(input: CreatePropertyInput, organizationId: string) {
    if (this.propertySlugExists(organizationId, input.slug)) {
      throw new Error("DUPLICATE_PROPERTY");
    }
    const property: HospitalityProperty = {
      id: randomUUID(),
      organizationId,
      name: input.name,
      slug: input.slug,
      type: input.type,
      address: input.address,
      timeZone: input.timeZone,
      totalRooms: 0,
      portfolioId: input.portfolioId,
      operationalStatus: "active",
      city: input.city,
      region: input.region,
      country: input.country,
    };
    this.properties.push(property);
    return property;
  }

  updateProperty(propertyId: string, patch: Partial<HospitalityProperty>) {
    const index = this.properties.findIndex((entry) => entry.id === propertyId);
    if (index < 0) return null;
    if (patch.slug && this.propertySlugExists(this.properties[index]!.organizationId, patch.slug, propertyId)) {
      throw new Error("DUPLICATE_PROPERTY");
    }
    this.properties[index] = { ...this.properties[index]!, ...patch };
    return this.properties[index]!;
  }

  deleteProperty(propertyId: string) {
    const index = this.properties.findIndex((entry) => entry.id === propertyId);
    if (index < 0) return false;
    this.properties.splice(index, 1);
    return true;
  }

  listZones(propertyId: string) {
    return this.zones.filter((entry) => entry.propertyId === propertyId);
  }

  listAmenities(organizationId: string) {
    return this.amenities.filter((entry) => entry.organizationId === organizationId);
  }

  getAmenity(id: string) {
    return this.amenities.find((entry) => entry.id === id) ?? null;
  }

  listAccommodationTypes(propertyId: string) {
    return this.accommodationTypes.filter((entry) => entry.propertyId === propertyId);
  }

  getAccommodationType(id: string) {
    return this.accommodationTypes.find((entry) => entry.id === id) ?? null;
  }

  listInventoryItems(propertyId?: string) {
    return this.inventoryItems.filter((entry) => !propertyId || entry.propertyId === propertyId);
  }

  getInventoryItem(id: string) {
    return this.inventoryItems.find((entry) => entry.id === id) ?? null;
  }

  createInventoryItem(input: CreateInventoryItemInput) {
    if (this.inventoryLabelExists(input.propertyId, input.label)) {
      throw new Error("DUPLICATE_ROOM_NUMBER");
    }
    const accommodationType = this.getAccommodationType(input.accommodationTypeId);
    if (!accommodationType) throw new Error("INVALID_ACCOMMODATION_TYPE");
    if (input.capacity > accommodationType.maxOccupancy) {
      throw new Error("INVALID_CAPACITY");
    }
    const item: InventoryItem = {
      id: randomUUID(),
      propertyId: input.propertyId,
      accommodationTypeId: input.accommodationTypeId,
      kind: input.kind,
      label: input.label,
      floorId: input.floorId,
      zoneId: input.zoneId,
      buildingId: input.buildingId,
      status: "available",
      maintenanceStatus: "none",
      operationalStatus: "active",
      accessibility: accommodationType.accessibility,
      mediaIds: [],
      isVip: input.isVip ?? false,
      capacity: input.capacity,
    };
    this.inventoryItems.push(item);
    return item;
  }

  updateInventoryItem(id: string, patch: Partial<InventoryItem>) {
    const index = this.inventoryItems.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    if (patch.label && this.inventoryLabelExists(this.inventoryItems[index]!.propertyId, patch.label, id)) {
      throw new Error("DUPLICATE_ROOM_NUMBER");
    }
    if (patch.capacity) {
      const type = this.getAccommodationType(this.inventoryItems[index]!.accommodationTypeId);
      if (type && patch.capacity > type.maxOccupancy) throw new Error("INVALID_CAPACITY");
    }
    this.inventoryItems[index] = { ...this.inventoryItems[index]!, ...patch };
    return this.inventoryItems[index]!;
  }

  bulkUpdateInventoryStatus(ids: readonly string[], status: RoomStatus) {
    let count = 0;
    for (const id of ids) {
      if (this.updateInventoryItem(id, { status })) count += 1;
    }
    return count;
  }

  bulkArchiveInventory(ids: readonly string[]) {
    let count = 0;
    for (const id of ids) {
      if (this.updateInventoryItem(id, { operationalStatus: "archived" })) count += 1;
    }
    return count;
  }

  searchInventory(filter: InventorySearchFilter, organizationId: string) {
    const propertyIds = new Set(this.listProperties(organizationId).map((entry) => entry.id));
    return this.inventoryItems.filter((item) => {
      if (!propertyIds.has(item.propertyId)) return false;
      if (filter.propertyId && item.propertyId !== filter.propertyId) return false;
      if (filter.kind && item.kind !== filter.kind) return false;
      if (filter.status && item.status !== filter.status) return false;
      if (filter.operationalStatus && item.operationalStatus !== filter.operationalStatus) return false;
      if (filter.zoneId && item.zoneId !== filter.zoneId) return false;
      if (filter.buildingId && item.buildingId !== filter.buildingId) return false;
      if (filter.accessibleOnly && !item.accessibility.wheelchairAccessible) return false;
      if (filter.availableOnly && item.status !== "available" && item.status !== "clean") return false;
      if (filter.query) {
        const q = filter.query.toLowerCase();
        const type = this.getAccommodationType(item.accommodationTypeId);
        const property = this.getProperty(item.propertyId);
        const haystack = [item.label, type?.name, property?.name].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return item.operationalStatus !== "archived";
    });
  }

  listMedia(propertyId?: string, inventoryItemId?: string) {
    return this.media.filter((entry) => {
      if (inventoryItemId && entry.inventoryItemId !== inventoryItemId) return false;
      if (propertyId && entry.propertyId !== propertyId) return false;
      return true;
    });
  }

  getPropertyLocation(propertyId: string) {
    return this.locations.find((entry) => entry.propertyId === propertyId) ?? null;
  }

  listAvailability(propertyId: string, date?: string) {
    return this.availability.filter(
      (entry) => entry.propertyId === propertyId && (!date || entry.date === date),
    );
  }

  propertySlugExists(organizationId: string, slug: string, excludeId?: string) {
    return this.properties.some(
      (entry) => entry.organizationId === organizationId && entry.slug === slug && entry.id !== excludeId,
    );
  }

  inventoryLabelExists(propertyId: string, label: string, excludeId?: string) {
    return this.inventoryItems.some(
      (entry) => entry.propertyId === propertyId && entry.label === label && entry.id !== excludeId,
    );
  }

  listBuildings(propertyId: string) {
    return this.hospitalitySeed.buildings.filter((entry) => entry.propertyId === propertyId);
  }

  listRoomTypes(propertyId: string) {
    return this.hospitalitySeed.roomTypes.filter((entry) => entry.propertyId === propertyId);
  }

  listRooms(propertyId: string) {
    return this.hospitalitySeed.rooms.filter((entry) => entry.propertyId === propertyId);
  }

  getRoom(id: string) {
    return this.hospitalitySeed.rooms.find((entry) => entry.id === id) ?? null;
  }

  listGuests(organizationId: string) {
    return this.listGuestRecords(organizationId).map(toLegacyGuestProfile);
  }

  getGuest(id: string) {
    const record = this.getGuestRecord(id);
    return record ? toLegacyGuestProfile(record) : null;
  }

  listGuestRecords(organizationId: string) {
    return this.guestRecords.filter((entry) => entry.organizationId === organizationId);
  }

  getGuestRecord(id: string) {
    return this.guestRecords.find((entry) => entry.id === id) ?? null;
  }

  searchGuestRecords(filter: GuestSearchFilter, organizationId: string) {
    return this.guestRecords.filter((record) => {
      if (record.organizationId !== organizationId) return false;
      if (filter.email && record.contact.email?.toLowerCase() !== filter.email.toLowerCase()) return false;
      if (filter.phone && !normalizePhone(record.contact.phone).includes(normalizePhone(filter.phone))) return false;
      if (filter.passport && record.identity?.passportNumber !== filter.passport) return false;
      if (filter.loyaltyNumber && record.loyaltyNumber !== filter.loyaltyNumber) return false;
      if (filter.company && record.company?.toLowerCase() !== filter.company.toLowerCase()) return false;
      if (filter.loyaltyTier && record.loyaltyTier !== filter.loyaltyTier) return false;
      if (filter.isVip !== undefined && record.isVip !== filter.isVip) return false;
      if (filter.tag && !record.tags.some((entry) => entry.label.toLowerCase() === filter.tag!.toLowerCase())) return false;
      if (filter.query) {
        const haystack = [
          record.fullName,
          record.preferredName,
          record.contact.email,
          record.contact.phone,
          record.company,
          record.loyaltyNumber,
          record.identity?.passportNumber,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(filter.query.toLowerCase())) return false;
      }
      return true;
    });
  }

  createGuestRecord(record: GuestRecord) {
    this.guestRecords.push(record);
    return record;
  }

  updateGuestRecord(id: string, patch: Partial<GuestRecord>) {
    const index = this.guestRecords.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.guestRecords[index] = { ...this.guestRecords[index]!, ...patch };
    return this.guestRecords[index]!;
  }

  deleteGuestRecord(id: string) {
    const index = this.guestRecords.findIndex((entry) => entry.id === id);
    if (index < 0) return false;
    this.guestRecords.splice(index, 1);
    return true;
  }

  listGuestTimeline(guestId: string) {
    return this.guestTimeline.filter((entry) => entry.guestId === guestId);
  }

  addGuestTimelineEntry(entry: GuestTimelineEntry) {
    this.guestTimeline.push(entry);
    return entry;
  }

  listStayRecords(organizationId: string, propertyId?: string) {
    return this.stayRecords.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  getStayRecord(id: string) {
    return this.stayRecords.find((entry) => entry.id === id) ?? null;
  }

  getStayByReservationId(reservationId: string) {
    return this.stayRecords.find((entry) => entry.reservationId === reservationId) ?? null;
  }

  createStayRecord(record: StayRecord) {
    this.stayRecords.push(record);
    return record;
  }

  updateStayRecord(id: string, patch: Partial<StayRecord>) {
    const index = this.stayRecords.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.stayRecords[index] = { ...this.stayRecords[index]!, ...patch };
    return this.stayRecords[index]!;
  }

  // reservation record methods below

  listReservationRecords(organizationId: string, propertyId?: string) {
    return this.reservationRecords.filter(
      (entry) =>
        entry.organizationId === organizationId &&
        (!propertyId || entry.propertyId === propertyId),
    );
  }

  getReservationRecord(id: string) {
    return this.reservationRecords.find((entry) => entry.id === id) ?? null;
  }

  getReservationByNumber(organizationId: string, reservationNumber: string) {
    return (
      this.reservationRecords.find(
        (entry) =>
          entry.organizationId === organizationId &&
          entry.reservationNumber.toLowerCase() === reservationNumber.toLowerCase(),
      ) ?? null
    );
  }

  searchReservationRecords(filter: ReservationSearchFilter, organizationId: string) {
    return this.reservationRecords.filter((record) => {
      if (record.organizationId !== organizationId) return false;
      if (filter.propertyId && record.propertyId !== filter.propertyId) return false;
      if (filter.guestId && record.guestId !== filter.guestId) return false;
      if (filter.status && record.status !== filter.status) return false;
      if (filter.source && record.source !== filter.source) return false;
      if (filter.accommodationTypeId && record.accommodationTypeId !== filter.accommodationTypeId) return false;
      if (filter.inventoryItemId && record.inventoryItemId !== filter.inventoryItemId) return false;
      if (filter.agentName && record.agentName !== filter.agentName) return false;
      if (filter.companyName && record.companyName !== filter.companyName) return false;
      if (filter.arrivalFrom && record.arrival < filter.arrivalFrom) return false;
      if (filter.arrivalTo && record.arrival > filter.arrivalTo) return false;
      if (filter.reservationNumber && !record.reservationNumber.toLowerCase().includes(filter.reservationNumber.toLowerCase())) {
        return false;
      }
      if (filter.query) {
        const guest = this.getGuest(record.guestId);
        const haystack = [record.reservationNumber, guest?.name, guest?.email, record.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(filter.query.toLowerCase())) return false;
      }
      return true;
    });
  }

  createReservationRecord(record: ReservationRecord) {
    this.reservationRecords.push(record);
    return record;
  }

  updateReservationRecord(id: string, patch: Partial<ReservationRecord>) {
    const index = this.reservationRecords.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.reservationRecords[index] = { ...this.reservationRecords[index]!, ...patch };
    return this.reservationRecords[index]!;
  }

  listReservations(organizationId: string, propertyId?: string) {
    return this.listReservationRecords(organizationId, propertyId).map(toLegacyReservation);
  }

  getReservation(id: string) {
    const record = this.getReservationRecord(id);
    return record ? toLegacyReservation(record) : null;
  }

  updateReservation(id: string, patch: Partial<Reservation>) {
    const record = this.getReservationRecord(id);
    if (!record) return null;
    const statusMap: Partial<Record<Reservation["status"], ReservationRecord["status"]>> = {
      confirmed: "confirmed",
      checked_in: "checked_in",
      checked_out: "checked_out",
      cancelled: "cancelled",
      waitlisted: "provisional",
      no_show: "no_show",
    };
    return toLegacyReservation(
      this.updateReservationRecord(id, {
        updatedAt: new Date().toISOString(),
        ...(patch.status ? { status: statusMap[patch.status]! } : {}),
        ...(patch.checkIn ? { arrival: patch.checkIn.slice(0, 10) } : {}),
        ...(patch.checkOut ? { departure: patch.checkOut.slice(0, 10) } : {}),
      })!,
    );
  }

  createReservation(reservation: Reservation) {
    if (this.getReservationRecord(reservation.id)) {
      return reservation;
    }
    const now = new Date().toISOString();
    const record: ReservationRecord = {
      id: reservation.id,
      reservationNumber: `ORH-LEG-${reservation.id}`,
      organizationId: reservation.organizationId,
      propertyId: reservation.propertyId,
      guestId: reservation.guestId,
      inventoryItemId: undefined,
      accommodationTypeId: reservation.roomTypeId,
      source: "direct_website",
      status: "confirmed",
      arrival: reservation.checkIn.slice(0, 10),
      departure: reservation.checkOut.slice(0, 10),
      lengthOfStay: 1,
      guestCount: { adults: reservation.adults, children: reservation.children, infants: 0 },
      paymentStatus: "pending",
      rate: reservation.rate,
      groupName: reservation.groupName,
      corporateAccount: reservation.corporateAccount,
      isVip: reservation.isVip,
      notes: reservation.notes,
      specialRequests: [],
      allocations: [],
      createdAt: reservation.createdAt,
      updatedAt: now,
    };
    this.reservationRecords.push(record);
    return reservation;
  }

  listHousekeepingTasks(propertyId: string): HousekeepingTask[] {
    return this.listHousekeepingTaskRecords("org-orania", propertyId)
      .filter((record) => record.status !== "cancelled")
      .map((record) => {
      const inventory = this.getInventoryItem(record.inventoryItemId);
      const room = this.hospitalitySeed.rooms.find((entry) => entry.number === inventory?.label);
      const status =
        record.status === "assigned"
          ? "pending"
          : record.status === "cancelled"
            ? "pending"
            : record.status;
      return {
        id: record.id,
        propertyId: record.propertyId,
        roomId: room?.id ?? record.inventoryItemId,
        status: status as HousekeepingTask["status"],
        assignedTo: record.assignedTo,
        priority: record.priority,
        notes: record.notes,
        createdAt: record.createdAt,
        completedAt: record.completedAt,
      };
    });
  }

  listMaintenanceRequests(propertyId: string): MaintenanceRequest[] {
    return this.listWorkOrders("org-orania", propertyId).map((order) => {
      const inventory = order.inventoryItemId ? this.getInventoryItem(order.inventoryItemId) : null;
      const room = inventory
        ? this.hospitalitySeed.rooms.find((entry) => entry.number === inventory.label)
        : null;
      return {
        id: order.id,
        propertyId: order.propertyId,
        roomId: room?.id ?? order.inventoryItemId ?? "",
        title: order.title,
        description: order.description,
        priority: order.priority === "critical" ? "critical" : order.priority === "high" ? "high" : order.priority === "medium" ? "medium" : "low",
        status: order.status === "assigned" ? "open" : order.status === "resolved" ? "resolved" : order.status === "in_progress" ? "in_progress" : "open",
        reportedAt: order.reportedAt,
      };
    });
  }

  listHousekeepingTaskRecords(organizationId: string, propertyId?: string) {
    return this.housekeepingTasks.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  getHousekeepingTaskRecord(id: string) {
    return this.housekeepingTasks.find((entry) => entry.id === id) ?? null;
  }

  getActiveTaskForInventory(inventoryItemId: string) {
    return (
      this.housekeepingTasks.find(
        (entry) =>
          entry.inventoryItemId === inventoryItemId &&
          entry.status !== "inspected" &&
          entry.status !== "cancelled",
      ) ?? null
    );
  }

  createHousekeepingTaskRecord(record: HousekeepingTaskRecord) {
    this.housekeepingTasks.push(record);
    return record;
  }

  updateHousekeepingTaskRecord(id: string, patch: Partial<HousekeepingTaskRecord>) {
    const index = this.housekeepingTasks.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.housekeepingTasks[index] = { ...this.housekeepingTasks[index]!, ...patch };
    return this.housekeepingTasks[index]!;
  }

  listWorkOrders(organizationId: string, propertyId?: string) {
    return this.workOrders.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  getWorkOrder(id: string) {
    return this.workOrders.find((entry) => entry.id === id) ?? null;
  }

  createWorkOrder(record: MaintenanceWorkOrderRecord) {
    this.workOrders.push(record);
    return record;
  }

  updateWorkOrder(id: string, patch: Partial<MaintenanceWorkOrderRecord>) {
    const index = this.workOrders.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.workOrders[index] = { ...this.workOrders[index]!, ...patch };
    return this.workOrders[index]!;
  }

  listInspections(organizationId: string, propertyId?: string) {
    return this.inspections.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  createInspection(record: InspectionRecord) {
    this.inspections.push(record);
    return record;
  }

  listAssets(organizationId: string, propertyId?: string) {
    return this.assets.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  listMaintenanceSchedules(organizationId: string, propertyId?: string) {
    return this.maintenanceSchedules.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  listLinenItems(organizationId: string, propertyId?: string) {
    return this.linenItems.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  listLostAndFound(organizationId: string, propertyId?: string) {
    return this.lostAndFound.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  listFolioRecords(organizationId: string, propertyId?: string) {
    return this.folioRecords.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  getFolioRecord(id: string) {
    return this.folioRecords.find((entry) => entry.id === id) ?? null;
  }

  getFolioByReservation(reservationId: string) {
    return this.folioRecords.find((entry) => entry.reservationId === reservationId) ?? null;
  }

  getFolioByStay(stayId: string) {
    return this.folioRecords.find((entry) => entry.stayId === stayId) ?? null;
  }

  createFolioRecord(record: FolioRecord) {
    this.folioRecords.push(record);
    return record;
  }

  updateFolioRecord(id: string, patch: Partial<FolioRecord>) {
    const index = this.folioRecords.findIndex((entry) => entry.id === id);
    if (index < 0) return null;
    this.folioRecords[index] = { ...this.folioRecords[index]!, ...patch };
    return this.folioRecords[index]!;
  }

  listCharges(folioId: string) {
    return this.chargeRecords.filter((entry) => entry.folioId === folioId);
  }

  createCharge(record: ChargeRecord) {
    this.chargeRecords.push(record);
    return record;
  }

  listPayments(folioId: string) {
    return this.paymentRecords.filter((entry) => entry.folioId === folioId);
  }

  createPayment(record: PaymentRecord) {
    this.paymentRecords.push(record);
    return record;
  }

  listDeposits(folioId: string) {
    return this.depositRecords.filter((entry) => entry.folioId === folioId);
  }

  createDeposit(record: DepositRecord) {
    this.depositRecords.push(record);
    return record;
  }

  listRefunds(folioId: string) {
    return this.refundRecords.filter((entry) => entry.folioId === folioId);
  }

  createRefund(record: RefundRecord) {
    this.refundRecords.push(record);
    return record;
  }

  listAdjustments(folioId: string) {
    return this.adjustmentRecords.filter((entry) => entry.folioId === folioId);
  }

  createAdjustment(record: AdjustmentRecord) {
    this.adjustmentRecords.push(record);
    return record;
  }

  listInvoices(organizationId: string, propertyId?: string) {
    return this.invoiceRecords.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  createInvoice(record: InvoiceRecord) {
    this.invoiceRecords.push(record);
    return record;
  }

  listTaxRecords(folioId: string) {
    return this.taxRecords.filter((entry) => entry.folioId === folioId);
  }

  createTaxRecord(record: TaxRecord) {
    this.taxRecords.push(record);
    return record;
  }

  listRevenueEvents(organizationId: string, propertyId?: string) {
    return this.revenueEvents.filter(
      (entry) => entry.organizationId === organizationId && (!propertyId || entry.propertyId === propertyId),
    );
  }

  createRevenueEvent(record: RevenueEventRecord) {
    this.revenueEvents.push(record);
    return record;
  }

  listFolios(organizationId: string): Folio[] {
    return this.listFolioRecords(organizationId).map((folio) => {
      const charges = this.listCharges(folio.id).map((entry) => ({
        id: entry.id,
        folioId: entry.folioId,
        description: entry.description,
        amount: entry.amount,
        taxRate: entry.taxRate,
        category: entry.category === "accommodation" ? "room" as const
          : entry.category === "food_beverage" ? "f_and_b" as const
          : entry.category === "spa" ? "spa" as const
          : entry.category === "discount" ? "discount" as const
          : "misc" as const,
        postedAt: entry.postedAt,
      }));
      const payments = this.listPayments(folio.id).map((entry) => ({
        id: entry.id,
        amount: entry.amount,
        method: entry.method.replaceAll("_", " "),
        postedAt: entry.postedAt,
      }));
      return {
        id: folio.id,
        reservationId: folio.reservationId,
        guestId: folio.guestId,
        status: folio.status === "pending_settlement" ? "open" as const
          : folio.status === "written_off" ? "settled" as const
          : folio.status === "refunded" ? "refunded" as const
          : folio.status,
        charges,
        payments,
      };
    });
  }

  getFolio(id: string): Folio | null {
    const folio = this.getFolioRecord(id);
    if (!folio) return null;
    return this.listFolios(folio.organizationId).find((entry) => entry.id === id) ?? null;
  }

  getOperationsSnapshot(propertyId: string) {
    const property = this.getProperty(propertyId);
    if (!property) {
      return {
        occupancyPercent: 0,
        adr: 0,
        revpar: 0,
        dailyRevenue: 0,
        monthlyRevenue: 0,
        arrivalsToday: 0,
        departuresToday: 0,
        inHouseGuests: 0,
        vipArrivals: 0,
        roomsReady: 0,
        roomsCleaning: 0,
        maintenanceOpen: 0,
      };
    }
    if (property.id === this.hospitalitySeed.property.id) {
      return this.hospitalitySeed.operations;
    }
    const items = this.listInventoryItems(property.id);
    const available = items.filter((entry) => entry.status === "available" || entry.status === "clean").length;
    return {
      occupancyPercent: items.length ? Math.round(((items.length - available) / items.length) * 100) : 0,
      adr: 2800,
      revpar: 2100,
      dailyRevenue: 42000,
      monthlyRevenue: 840000,
      arrivalsToday: 2,
      departuresToday: 1,
      inHouseGuests: 3,
      vipArrivals: 0,
      roomsReady: available,
      roomsCleaning: 1,
      maintenanceOpen: items.filter((entry) => entry.maintenanceStatus !== "none").length,
    };
  }
}

export const defaultInventoryRepository = new InMemoryInventoryRepository();

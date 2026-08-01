import { hospitalityService } from "@/lib/hospitality/services/HospitalityService";
import { HospitalityAnalyticsFacade } from "@/lib/hospitality/analytics";
import { HospitalityBillingFacade } from "@/lib/hospitality/billing";
import { HospitalityFrontOfficeFacade } from "@/lib/hospitality/front-office";
import { HospitalityHousekeepingFacade } from "@/lib/hospitality/housekeeping";
import { HospitalityGuestFacade } from "@/lib/hospitality/guests";
import { HospitalityInventoryFacade } from "@/lib/hospitality/inventory";
import { HospitalityReservationFacade } from "@/lib/hospitality/reservations";
import { defaultInventoryRepository } from "@/lib/hospitality/repositories/InMemoryInventoryRepository";

export const hospitalityInventoryService = new HospitalityInventoryFacade(defaultInventoryRepository);
export const hospitalityReservationService = new HospitalityReservationFacade(defaultInventoryRepository);
export const hospitalityGuestService = new HospitalityGuestFacade(defaultInventoryRepository);
export const hospitalityFrontOfficeService = new HospitalityFrontOfficeFacade(defaultInventoryRepository);
export const hospitalityHousekeepingService = new HospitalityHousekeepingFacade(defaultInventoryRepository);
export const hospitalityBillingService = new HospitalityBillingFacade(defaultInventoryRepository);
export const hospitalityAnalyticsService = new HospitalityAnalyticsFacade(defaultInventoryRepository);

export {
  HOSPITALITY_BASE_PATH,
  HOSPITALITY_MODULE_KEY,
  HOSPITALITY_PROVIDER_ID,
  HOSPITALITY_ROUTE_PERMISSIONS,
  HOSPITALITY_WORKSPACE_ID,
  HOSPITALITY_WORKSPACE_LABEL,
  HOSPITALITY_IIL_SERVICE_ID,
  DEFAULT_PROPERTY_ID,
} from "@/lib/hospitality/constants";

export { HOSPITALITY_NAV, type HospitalityNavItem } from "@/lib/hospitality/nav";

export type {
  HospitalityDashboardView,
  ReservationListItem,
  GuestListItem,
  RoomListItem,
  HousekeepingBoardItem,
  BillingListItem,
  HospitalityBriefContribution,
  HospitalityIntelligenceResult,
} from "@/lib/hospitality/models/dashboard";

export { hospitalityService, HospitalityService } from "@/lib/hospitality/services/HospitalityService";
export type { HospitalityServiceContext } from "@/lib/hospitality/services/HospitalityService";
export { hospitalityExecutiveProvider } from "@/lib/hospitality/providers/hospitality-executive-provider";
export type {
  PropertyListItem,
  PropertyDetailView,
  PropertyPortfolioView,
  InventoryListItem,
  InventoryExplorerView,
  InventoryAnalyticsView,
  InventoryBriefContribution,
} from "@/lib/hospitality/models/inventory";

export { publishHospitalityEvent, publishInventoryEvent } from "@/lib/hospitality/hospitality-events";

export {
  HospitalityInventoryFacade,
  PropertyService,
  InventoryService,
  AccommodationService,
  AmenityService,
  MediaService,
  LocationService,
  StatusService,
  InventorySearchService,
  PropertyAnalyticsService,
} from "@/lib/hospitality/inventory";

export {
  HospitalityFrontOfficeFacade,
  OperationalDashboardService,
  OccupancyService,
  CheckInService,
  CheckOutService,
  AccommodationAssignmentService,
  StayService,
  FrontOfficeRulesEngine,
} from "@/lib/hospitality/front-office";

export {
  HospitalityHousekeepingFacade,
  HousekeepingBoardService,
  CleaningWorkflowService,
  MaintenanceWorkOrderService,
  RoomStatusService,
  HousekeepingRulesEngine,
} from "@/lib/hospitality/housekeeping";

export type {
  HousekeepingDashboardView,
  MaintenanceDashboardView,
  HousekeepingBriefContribution,
} from "@/lib/hospitality/models/housekeeping";

export {
  HospitalityBillingFacade,
  FolioService,
  ChargeService,
  PaymentService,
  InvoiceService,
  RevenueService,
  BillingDashboardService,
  TaxEngine,
  PricingService,
  BillingRulesEngine,
} from "@/lib/hospitality/billing";

export type {
  BillingDashboardView,
  RevenueDashboardView,
  FolioDetailView,
  FolioListItem,
  BillingBriefContribution,
} from "@/lib/hospitality/models/billing";

export {
  HospitalityAnalyticsFacade,
  KpiService,
  TrendAnalysisService,
  ForecastingEngine,
  InsightGeneratorService,
  BenchmarkService,
  ExecutiveMetricsService,
  OperationalAnalyticsService,
  GuestIntelligenceAnalyticsService,
  CommercialAnalyticsService,
} from "@/lib/hospitality/analytics";

export type {
  HospitalityAnalyticsView,
  ExecutiveDashboardView,
  OperationalAnalyticsView,
  GuestIntelligenceAnalyticsView,
  CommercialAnalyticsView,
  AnalyticsBriefContribution,
} from "@/lib/hospitality/models/analytics";

export type {
  FrontOfficeDashboardView,
  FrontOfficeQueueItem,
  OccupancyBoardItem,
  FrontOfficeBriefContribution,
} from "@/lib/hospitality/models/front-office";

export {
  HospitalityGuestFacade,
  GuestService,
  GuestSearchService,
  GuestTimelineService,
  GuestAnalyticsService,
  PreferenceService,
  RelationshipService,
  ConsentManagementService,
  DuplicateDetectionEngine,
  GuestRulesEngine,
} from "@/lib/hospitality/guests";

export type {
  GuestListViewItem,
  GuestDetailView,
  GuestSearchView,
  GuestTimelineView,
  GuestAnalyticsView,
  GuestBriefContribution,
} from "@/lib/hospitality/models/guests";

export {
  HospitalityReservationFacade,
  ReservationService,
  AvailabilityService,
  CalendarService,
  ConflictDetectionEngine,
  AllocationEngine,
  ReservationRulesEngine,
  RateLookupService,
  ReservationSearchService,
} from "@/lib/hospitality/reservations";

export { SECOND_PROPERTY_ID } from "@/lib/hospitality/data/seed-inventory";

/** Executive Brief contribution for hospitality workspace. */
export function getHospitalityBriefContribution() {
  return hospitalityService.getBriefContribution({
    organizationId: "org-orania",
    workspaceId: "workspace-orania",
    userId: "user-executive",
    role: "executive",
  });
}

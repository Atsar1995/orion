import {
  HOSPITALITY_PROVIDER_ID,
  HOSPITALITY_WORKSPACE_ID,
  HOSPITALITY_WORKSPACE_LABEL,
} from "@/lib/hospitality/constants";
import { HospitalityAnalyticsFacade } from "@/lib/hospitality/analytics";
import { mapAnalyticsBriefContribution } from "@/lib/hospitality/mappers/analytics-brief";
import { mapBillingBriefContribution } from "@/lib/hospitality/mappers/billing-brief";
import { mapFrontOfficeBriefContribution } from "@/lib/hospitality/mappers/front-office-brief";
import { mapGuestBriefContribution } from "@/lib/hospitality/mappers/guest-brief";
import { mapHousekeepingBriefContribution } from "@/lib/hospitality/mappers/housekeeping-brief";
import { mapInventoryBriefContribution } from "@/lib/hospitality/mappers/inventory-brief";
import type { BillingRepository } from "@/lib/hospitality/repositories/BillingRepository";
import { HospitalityReservationFacade } from "@/lib/hospitality/reservations";
import type {
  HospitalityBriefContribution,
  HospitalityIntelligenceResult,
} from "@/lib/hospitality/models/dashboard";
import type { ServiceContext } from "@/types/services";

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function executiveContext(organizationId: string): ServiceContext {
  return {
    organizationId,
    workspaceId: "workspace-orania",
    userId: "user-executive",
    role: "executive",
  };
}

export function mapHospitalityIntelligence(
  repository: BillingRepository,
  organizationId: string,
  propertyId: string,
): HospitalityIntelligenceResult {
  const context = executiveContext(organizationId);
  const analytics = new HospitalityAnalyticsFacade(repository).getFullAnalytics(context, propertyId);
  const ops = repository.getOperationsSnapshot(propertyId);

  return {
    operations: {
      occupancyPercent: ops.occupancyPercent,
      adr: ops.adr,
      revpar: ops.revpar,
      dailyRevenue: ops.dailyRevenue,
    },
    recommendations: analytics.recommendations.map((entry) => ({
      priority: entry.priority,
      title: entry.title,
      description: entry.description,
      category: entry.category,
    })),
    alerts: analytics.alerts.map((entry) => ({
      severity: entry.severity === "info" ? ("attention" as const) : entry.severity,
      message: entry.message,
    })),
    patterns: [
      ...analytics.trends.slice(0, 2).map((entry) => ({
        title: entry.label,
        description: entry.narrative,
      })),
      ...analytics.insights.slice(0, 2).map((entry) => ({
        title: entry.title,
        description: entry.narrative,
      })),
    ],
  };
}

export function mapHospitalityBriefContribution(
  repository: BillingRepository,
  organizationId: string,
  propertyId: string,
): HospitalityBriefContribution {
  const context = executiveContext(organizationId);
  const ops = repository.getOperationsSnapshot(propertyId);
  const maintenance = repository.listMaintenanceRequests(propertyId);
  const property = repository.getProperty(propertyId);
  const inventoryBrief = mapInventoryBriefContribution(repository, organizationId);
  const guestBrief = mapGuestBriefContribution(repository, organizationId);
  const frontOfficeBrief = mapFrontOfficeBriefContribution(repository, organizationId, propertyId);
  const housekeepingBrief = mapHousekeepingBriefContribution(repository, organizationId, propertyId);
  const billingBrief = mapBillingBriefContribution(repository, organizationId, propertyId);
  const analyticsBrief = mapAnalyticsBriefContribution(repository, organizationId, propertyId);
  const reservationSignals = new HospitalityReservationFacade(repository).reservations.getBriefSignals(context);

  return {
    workspaceId: HOSPITALITY_WORKSPACE_ID,
    workspaceLabel: HOSPITALITY_WORKSPACE_LABEL,
    briefingLine: `${property?.name ?? "Hospitality"} — ${formatCurrency(billingBrief.todaysRevenue)} revenue · ${analyticsBrief.forecastOccupancy}% forecast occupancy · health ${analyticsBrief.operationalHealth}/100.`,
    occupancyToday: `${ops.occupancyPercent}%`,
    revenueToday: formatCurrency(ops.dailyRevenue),
    vipArrivals: Math.max(reservationSignals.vipArrivals, guestBrief.vipArrivals),
    criticalIssues: [
      ...maintenance.filter((entry) => entry.priority === "critical").map((entry) => entry.title),
      ...reservationSignals.criticalOverbookings,
      ...frontOfficeBrief.operationalDelays,
    ],
    operationalRisks: [
      analyticsBrief.topInsight,
      guestBrief.guestRetentionOpportunity,
      ...inventoryBrief.operationalAlerts.slice(0, 1),
    ],
    healthScore: Math.min(100, Math.round((analyticsBrief.operationalHealth + analyticsBrief.revenueHealth + analyticsBrief.guestExperienceHealth) / 3)),
    totalProperties: inventoryBrief.totalProperties,
    inventoryHealthScore: inventoryBrief.inventoryHealthScore,
    unavailableInventory: inventoryBrief.unavailableInventory,
    totalCapacity: inventoryBrief.totalCapacity,
    inventoryAlerts: inventoryBrief.operationalAlerts,
    todaysArrivals: reservationSignals.todaysArrivals,
    todaysDepartures: reservationSignals.todaysDepartures,
    bookingPace: reservationSignals.bookingPace,
    criticalOverbookings: reservationSignals.criticalOverbookings,
    repeatGuests: guestBrief.repeatGuests,
    highValueGuests: guestBrief.highValueGuests,
    guestSatisfactionTrend: guestBrief.satisfactionTrend,
    serviceRecoveryAlerts: guestBrief.serviceRecoveryAlerts,
    frontOfficeOccupancy: frontOfficeBrief.currentOccupancy,
    vipInHouse: frontOfficeBrief.vipInHouse,
    operationalDelays: frontOfficeBrief.operationalDelays,
    readyRooms: housekeepingBrief.readyRooms,
    awaitingCleaning: housekeepingBrief.awaitingCleaning,
    criticalMaintenance: housekeepingBrief.criticalMaintenance,
    assetHealthScore: housekeepingBrief.assetHealthScore,
    outstandingBalances: billingBrief.outstandingBalances,
    pendingPayments: billingBrief.pendingPayments,
    openFolioCount: billingBrief.openFolioCount,
    averageDailyRate: billingBrief.averageDailyRate,
    revpar: billingBrief.revpar,
    operationalHealth: analyticsBrief.operationalHealth,
    revenueHealth: analyticsBrief.revenueHealth,
    guestExperienceHealth: analyticsBrief.guestExperienceHealth,
    forecastOccupancy: analyticsBrief.forecastOccupancy,
    forecastRevenue: analyticsBrief.forecastRevenue,
  };
}

export { HOSPITALITY_PROVIDER_ID, HOSPITALITY_WORKSPACE_ID, HOSPITALITY_WORKSPACE_LABEL };

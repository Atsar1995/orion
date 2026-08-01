import type { HospitalityRepository } from "@/lib/hospitality/repositories/HospitalityRepository";
import type { HospitalityDashboardView } from "@/lib/hospitality/models/dashboard";

function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Maps hospitality repository data to overview dashboard view (Mission P-007). */
export function mapHospitalityDashboard(
  repository: HospitalityRepository,
  organizationId: string,
  propertyId: string,
): HospitalityDashboardView {
  const property = repository.getProperty(propertyId);
  const ops = repository.getOperationsSnapshot(propertyId);
  const reservations = repository.listReservations(organizationId, propertyId);
  const guests = repository.listGuests(organizationId);
  const maintenance = repository.listMaintenanceRequests(propertyId);
  const today = "2026-07-30";

  const todayArrivals = reservations.filter(
    (entry) => entry.checkIn === today && ["confirmed", "checked_in"].includes(entry.status),
  );
  const todayDepartures = reservations.filter(
    (entry) => entry.checkOut === today && ["checked_in", "checked_out"].includes(entry.status),
  );

  const arrivalDepartures = [
    ...todayArrivals.slice(0, 3).map((entry) => {
      const guest = guests.find((g) => g.id === entry.guestId);
      const room = entry.roomId ? repository.getRoom(entry.roomId) : null;
      return {
        guest: guest?.name ?? "Guest",
        room: room?.number ?? "TBD",
        time: entry.isVip ? "11:30" : "12:00",
        type: "arrival" as const,
      };
    }),
    ...todayDepartures.slice(0, 3).map((entry) => {
      const guest = guests.find((g) => g.id === entry.guestId);
      const room = entry.roomId ? repository.getRoom(entry.roomId) : null;
      return {
        guest: guest?.name ?? "Guest",
        room: room?.number ?? "—",
        time: "11:00",
        type: "departure" as const,
      };
    }),
  ];

  const criticalMaintenance = maintenance.filter((entry) => entry.priority === "critical");

  return {
    summary:
      "Property performance remains strong with healthy occupancy and positive guest sentiment. Weekday demand is softer than forecast while weekend bookings continue to outperform.",
    executiveBriefing: `Occupancy remains healthy at ${ops.occupancyPercent}% with strong weekend demand. Weekday bookings are softer than forecast. Revenue opportunities exist through premium room upgrades and direct booking promotions.`,
    hotelHealth: {
      score: "86",
      status: ops.occupancyPercent >= 80 ? "healthy" : "attention",
      property: property?.name ?? "Property",
    },
    kpis: [
      { label: "Occupancy", value: `${ops.occupancyPercent}%` },
      { label: "ADR", value: formatCurrency(ops.adr) },
      { label: "RevPAR", value: formatCurrency(ops.revpar) },
      { label: "Daily Revenue", value: formatCurrency(ops.dailyRevenue) },
      { label: "Monthly Revenue", value: formatCurrency(ops.monthlyRevenue) },
      { label: "Forecast Occupancy", value: "88%" },
      { label: "Direct Booking %", value: "42%" },
      { label: "OTA Booking %", value: "48%" },
      { label: "Guest Satisfaction", value: "4.6/5" },
      { label: "Cancellation Rate", value: "3.2%" },
    ],
    todayOperations: [
      { label: "Arrivals", value: String(ops.arrivalsToday) },
      { label: "Departures", value: String(ops.departuresToday) },
      { label: "Rooms Ready", value: String(ops.roomsReady) },
      { label: "Rooms Cleaning", value: String(ops.roomsCleaning) },
      { label: "VIP Guests", value: String(ops.vipArrivals) },
      { label: "Maintenance", value: String(ops.maintenanceOpen) },
    ],
    occupancyRevenue: [
      { label: "Occupancy Today", value: `${ops.occupancyPercent}%` },
      { label: "ADR", value: formatCurrency(ops.adr) },
      { label: "RevPAR", value: formatCurrency(ops.revpar) },
      { label: "Daily Revenue", value: formatCurrency(ops.dailyRevenue) },
      { label: "Monthly Revenue", value: formatCurrency(ops.monthlyRevenue) },
      { label: "Forecast Occupancy", value: "88%" },
    ],
    bookingPerformance: [
      { label: "Today's Arrivals", value: String(ops.arrivalsToday) },
      { label: "Today's Departures", value: String(ops.departuresToday) },
      { label: "Upcoming Reservations", value: String(reservations.filter((r) => r.status === "confirmed").length) },
      { label: "Booking Pace", value: "+12%" },
      { label: "7-Day Forecast", value: "87% occ." },
    ],
    arrivalsDepartures: arrivalDepartures,
    guestExperience: {
      positiveReviews: 12,
      complaints: 2,
      pendingRequests: 5,
      satisfactionTrend: "+0.2 vs last week",
      highlights: [
        "Housekeeping praised in 8 recent reviews",
        `${maintenance.length} maintenance requests active`,
        "5 pending guest requests — late checkout and extra amenities",
      ],
    },
    bookingChannels: [
      { channel: "Website", share: "28%", bookings: 34, status: "healthy", summary: "Direct website bookings converting strongly" },
      { channel: "Direct", share: "14%", bookings: 17, status: "healthy", summary: "Phone and walk-in reservations stable" },
      { channel: "Booking.com", share: "32%", bookings: 39, status: "attention", summary: "Highest volume; commission impact on margin" },
      { channel: "OTA (Other)", share: "26%", bookings: 32, status: "healthy", summary: "Steady international demand" },
    ],
    revenueOpportunities: [
      "Premium suite upgrades available for arriving VIP guests",
      "Dynamic pricing: increase weekend rates by 8% for next 14 days",
      "High demand dates: 26–28 July — limited inventory remaining",
      "Weak demand period: Mon–Wed next week — launch direct booking offer",
    ],
    orionInsights: [
      {
        category: "Revenue Insight",
        insight: "Weekend RevPAR is 14% above weekday average. Shifting promotional spend toward weekday direct bookings could improve margin.",
      },
      {
        category: "Guest Insight",
        insight: "Repeat guests represent 22% of this week's arrivals. A targeted welcome-back offer could increase direct rebookings.",
      },
      {
        category: "Operations Insight",
        insight: `Housekeeping turnaround averaging 42 minutes. ${criticalMaintenance.length} critical maintenance item(s) may affect VIP readiness.`,
      },
    ],
    criticalIssues: [
      ...criticalMaintenance.map((entry) => ({
        status: "critical" as const,
        message: `${entry.title} — ${entry.description}`,
      })),
      {
        status: "attention" as const,
        message: "Weekday occupancy tracking 6% below forecast for next week",
      },
      {
        status: "attention" as const,
        message: "OTA share at 48% — direct booking target is 50%",
      },
    ],
    recommendedActions: [
      {
        priority: 1,
        title: criticalMaintenance[0]?.title ?? "Review VIP arrival readiness",
        description: criticalMaintenance[0]?.description ?? "Confirm all VIP rooms are ready before peak arrivals.",
      },
      {
        priority: 2,
        title: "Launch weekday direct booking promotion",
        description: "Soft weekday demand suggests a targeted offer for Mon–Wed stays next week.",
      },
      {
        priority: 3,
        title: "Offer suite upgrades to arriving VIP guests",
        description: "Premium upgrades available — high-margin opportunity for today's arrivals.",
      },
    ],
    recentActivity: [
      { time: "09:30", description: "VIP guest pre-arrival amenities confirmed" },
      { time: "09:00", description: "Housekeeping completed turnover for premium wing" },
      { time: "08:45", description: "New booking — Suite 401 via website for 26 July" },
      { time: "08:00", description: `Daily revenue report — RevPAR ${formatCurrency(ops.revpar)}` },
    ],
    operationsDetail: {
      roomsOutOfService: maintenance.filter((entry) => entry.status !== "resolved").length,
      staffOnDuty: 24,
      maintenanceRequests: maintenance.length,
      repeatGuests: guests.filter((entry) => entry.stayCount > 1).length,
      earlyArrivals: 3,
      lateCheckouts: 2,
    },
    quickActions: [
      { label: "View Reservations", href: "/hospitality/reservations" },
      { label: "Front Office", href: "/hospitality/front-office" },
      { label: "Housekeeping", href: "/hospitality/housekeeping" },
      { label: "Operations", href: "/hospitality/operations" },
      { label: "Guest Profiles", href: "/hospitality/guests" },
      { label: "Billing", href: "/hospitality/billing" },
    ],
  };
}

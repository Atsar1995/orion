import type { HealthStatus } from "@/lib/command-center-data";

export type BookingChannel = {
  channel: string;
  share: string;
  bookings: number;
  status: HealthStatus;
  summary: string;
};

export type CriticalIssue = {
  status: HealthStatus;
  message: string;
};

export type RecommendedAction = {
  priority: number;
  title: string;
  description: string;
};

export type HospitalityActivity = {
  time: string;
  description: string;
};

export type OrionInsight = {
  category: "Revenue Insight" | "Guest Insight" | "Operations Insight";
  insight: string;
};

export type ArrivalDeparture = {
  guest: string;
  room: string;
  time: string;
  type: "arrival" | "departure";
};

export const HOSPITALITY_SUMMARY =
  "Property performance remains strong with healthy occupancy and positive guest sentiment. Weekday demand is softer than forecast while weekend bookings continue to outperform.";

export const HOTEL_HEALTH = {
  score: "86",
  status: "healthy" as HealthStatus,
  property: "ORANIA Heritage Resort",
};

export const HOTEL_KPIS = [
  { label: "Occupancy", value: "84%" },
  { label: "ADR", value: "₹5,200" },
  { label: "RevPAR", value: "₹4,368" },
  { label: "Daily Revenue", value: "₹8.4L" },
  { label: "Monthly Revenue", value: "₹1.8Cr" },
  { label: "Forecast Occupancy", value: "88%" },
  { label: "Direct Booking %", value: "42%" },
  { label: "OTA Booking %", value: "48%" },
  { label: "Guest Satisfaction", value: "4.6/5" },
  { label: "Cancellation Rate", value: "3.2%" },
] as const;

export const EXECUTIVE_BRIEFING =
  "Occupancy remains healthy at 84% with strong weekend demand. Weekday bookings are softer than forecast. Revenue opportunities exist through premium room upgrades and direct booking promotions.";

export const TODAY_OPERATIONS = [
  { label: "Arrivals", value: "18" },
  { label: "Departures", value: "14" },
  { label: "Rooms Ready", value: "42" },
  { label: "Rooms Cleaning", value: "8" },
  { label: "VIP Guests", value: "3" },
  { label: "Maintenance", value: "2" },
] as const;

export const OCCUPANCY_REVENUE = [
  { label: "Occupancy Today", value: "84%" },
  { label: "ADR", value: "₹5,200" },
  { label: "RevPAR", value: "₹4,368" },
  { label: "Daily Revenue", value: "₹8.4L" },
  { label: "Monthly Revenue", value: "₹1.8Cr" },
  { label: "Forecast Occupancy", value: "88%" },
] as const;

export const BOOKING_PERFORMANCE = [
  { label: "Today's Arrivals", value: "18" },
  { label: "Today's Departures", value: "14" },
  { label: "Upcoming Reservations", value: "126" },
  { label: "Booking Pace", value: "+12%" },
  { label: "7-Day Forecast", value: "87% occ." },
] as const;

export const ARRIVALS_DEPARTURES: ArrivalDeparture[] = [
  { guest: "Rajesh Mehta", room: "204", time: "11:30", type: "arrival" },
  { guest: "Sarah Chen", room: "118", time: "12:00", type: "arrival" },
  { guest: "Anil Kapoor", room: "305", time: "14:00", type: "arrival" },
  { guest: "Priya Sharma", room: "112", time: "10:00", type: "departure" },
  { guest: "James Wilson", room: "401", time: "11:00", type: "departure" },
  { guest: "Meera Nair", room: "207", time: "12:30", type: "departure" },
];

export const GUEST_EXPERIENCE = {
  positiveReviews: 12,
  complaints: 2,
  pendingRequests: 5,
  satisfactionTrend: "+0.2 vs last week",
  highlights: [
    "Housekeeping praised in 8 recent reviews",
    "2 complaints related to AC maintenance in Room 305",
    "5 pending guest requests — late checkout and extra amenities",
  ],
};

export const BOOKING_CHANNELS: BookingChannel[] = [
  {
    channel: "Website",
    share: "28%",
    bookings: 34,
    status: "healthy",
    summary: "Direct website bookings converting strongly",
  },
  {
    channel: "Direct",
    share: "14%",
    bookings: 17,
    status: "healthy",
    summary: "Phone and walk-in reservations stable",
  },
  {
    channel: "Booking.com",
    share: "32%",
    bookings: 39,
    status: "attention",
    summary: "Highest volume; commission impact on margin",
  },
  {
    channel: "Expedia",
    share: "12%",
    bookings: 15,
    status: "healthy",
    summary: "Steady international demand",
  },
  {
    channel: "Airbnb",
    share: "6%",
    bookings: 7,
    status: "attention",
    summary: "Lower ADR than property average",
  },
  {
    channel: "Travel Agents",
    share: "5%",
    bookings: 6,
    status: "healthy",
    summary: "Corporate group bookings via agents",
  },
  {
    channel: "Corporate",
    share: "3%",
    bookings: 4,
    status: "healthy",
    summary: "Repeat corporate accounts performing well",
  },
];

export const REVENUE_OPPORTUNITIES = [
  "Premium suite upgrades available for 6 arriving VIP guests",
  "Dynamic pricing: increase weekend rates by 8% for next 14 days",
  "High demand dates: 26–28 July and 2–4 August — limited inventory remaining",
  "Weak demand period: Mon–Wed next week — launch direct booking offer",
] as const;

export const ORION_INSIGHTS: OrionInsight[] = [
  {
    category: "Revenue Insight",
    insight:
      "Weekend RevPAR is 14% above weekday average. Shifting promotional spend toward weekday direct bookings could improve margin without discounting peak dates.",
  },
  {
    category: "Guest Insight",
    insight:
      "Repeat guests represent 22% of this week's arrivals. A targeted welcome-back offer for returning guests could increase direct rebookings.",
  },
  {
    category: "Operations Insight",
    insight:
      "Housekeeping turnaround is averaging 42 minutes. Two maintenance requests in the premium wing may affect VIP check-in readiness before 14:00.",
  },
];

export const CRITICAL_ISSUES: CriticalIssue[] = [
  {
    status: "critical",
    message: "Room 305 AC fault — VIP arrival at 14:00; maintenance in progress",
  },
  {
    status: "attention",
    message: "Weekday occupancy tracking 6% below forecast for next week",
  },
  {
    status: "attention",
    message: "OTA share at 48% — direct booking target is 50%",
  },
];

export const RECOMMENDED_ACTIONS: RecommendedAction[] = [
  {
    priority: 1,
    title: "Resolve Room 305 maintenance before VIP check-in",
    description:
      "Escalate AC repair and confirm room readiness before the 14:00 arrival.",
  },
  {
    priority: 2,
    title: "Launch weekday direct booking promotion",
    description:
      "Soft weekday demand suggests a targeted offer for Mon–Wed stays next week.",
  },
  {
    priority: 3,
    title: "Offer suite upgrades to arriving VIP guests",
    description:
      "Six premium upgrades available — high-margin opportunity for today's arrivals.",
  },
];

export const RECENT_ACTIVITY: HospitalityActivity[] = [
  { time: "09:30", description: "VIP guest Mr. Mehta — pre-arrival amenities confirmed" },
  { time: "09:00", description: "Housekeeping completed turnover for Rooms 112–115" },
  { time: "08:45", description: "New booking — Suite 401 via website for 26 July" },
  { time: "08:00", description: "Daily revenue report generated — RevPAR ₹4,368" },
  { time: "Yesterday", description: "Guest review posted — 5 stars for front desk service" },
];

export const OPERATIONS_DETAIL = {
  roomsOutOfService: 2,
  staffOnDuty: 24,
  maintenanceRequests: 2,
  repeatGuests: 8,
  earlyArrivals: 3,
  lateCheckouts: 2,
};

export const HOSPITALITY_QUICK_ACTIONS = [
  { label: "View Reservations" },
  { label: "Open PMS" },
  { label: "Review Housekeeping" },
  { label: "Revenue Dashboard" },
  { label: "Guest Feedback" },
  { label: "Create Offer" },
] as const;

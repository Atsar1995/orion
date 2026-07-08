import type { Metric } from "@/components/dashboard/MetricCard";

export const hotelsMetrics: Metric[] = [
  { label: "Occupancy", value: "78%" },
  { label: "Today's Arrivals", value: "12" },
  { label: "Today's Departures", value: "9" },
  { label: "Revenue", value: "₹2.4L" },
];

export const commerceMetrics: Metric[] = [
  { label: "Orders", value: "47" },
  { label: "Sales", value: "₹1.8L" },
  { label: "Visitors", value: "3,240" },
  { label: "Products", value: "186" },
];

export const marketingMetrics: Metric[] = [
  { label: "Google Reviews", value: "4.8 ★" },
  { label: "Meta Reach", value: "18.2K" },
  { label: "Campaigns", value: "6" },
  { label: "Pending Replies", value: "3" },
];

export const missionControlTasks = [
  "Reply to Booking.com guest",
  "Approve quotation",
  "Publish Instagram post",
  "Call supplier",
];

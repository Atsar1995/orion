/** GA4 OAuth2 token response from Google token endpoint. */
export type GA4OAuthTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

/** Single metric value from a GA4 Data API report row. */
export type GA4MetricValue = {
  name: string;
  value: number;
};

/** Dimension value from a GA4 Data API report row. */
export type GA4DimensionValue = {
  name: string;
  value: string;
};

/** Parsed row from a GA4 runReport response. */
export type GA4ReportRow = {
  dimensions: GA4DimensionValue[];
  metrics: GA4MetricValue[];
};

/** Normalized GA4 runReport API response. */
export type GA4RunReportResponse = {
  dimensionHeaders: string[];
  metricHeaders: string[];
  rows: GA4ReportRow[];
  rowCount: number;
};

/** Core traffic and engagement metrics for executive dashboards. */
export type GA4CoreMetrics = {
  sessions: number;
  users: number;
  activeUsers: number;
  newUsers: number;
  pageViews: number;
  screenViews: number;
  revenue: number;
  transactions: number;
  conversions: number;
  bounceRate: number;
  engagementRate: number;
  averageEngagementTime: number;
};

/** Period-over-period comparison for trend analysis. */
export type GA4PeriodComparison = {
  current: GA4CoreMetrics;
  previous: GA4CoreMetrics;
  periodLabel: string;
};

/** Traffic source breakdown row. */
export type GA4TrafficSource = {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  conversions: number;
};

/** Campaign performance row. */
export type GA4CampaignPerformance = {
  campaign: string;
  sessions: number;
  conversions: number;
  revenue: number;
};

/** Device category breakdown. */
export type GA4DeviceCategory = {
  category: string;
  sessions: number;
  users: number;
  engagementRate: number;
};

/** Geographic breakdown row. */
export type GA4GeographicData = {
  country: string;
  city?: string;
  sessions: number;
  users: number;
};

/** Page performance row (landing or top pages). */
export type GA4PagePerformance = {
  path: string;
  pageViews: number;
  sessions: number;
  bounceRate: number;
};

/** Full GA4 snapshot consumed by the ORION mapper. */
export type GA4MetricsSnapshot = {
  fetchedAt: string;
  propertyId: string;
  comparison: GA4PeriodComparison;
  trafficSources: GA4TrafficSource[];
  campaigns: GA4CampaignPerformance[];
  devices: GA4DeviceCategory[];
  geography: GA4GeographicData[];
  landingPages: GA4PagePerformance[];
  topPages: GA4PagePerformance[];
};

/** Runtime configuration loaded from environment variables. */
export type GA4Config = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  propertyId: string;
  cacheTtlMs: number;
  maxRetries: number;
  requestTimeoutMs: number;
};

/** Result of GA4 configuration validation. */
export type GA4ConfigValidation = {
  valid: boolean;
  missing: string[];
  config?: GA4Config;
};

/** Health probe result for GA4 connectivity. */
export type GA4HealthStatus = {
  healthy: boolean;
  authenticated: boolean;
  propertyReachable: boolean;
  message: string;
  lastCheckedAt: string;
};

/** Structured log levels for GA4 provider operations. */
export type GA4LogLevel = "debug" | "info" | "warn" | "error";

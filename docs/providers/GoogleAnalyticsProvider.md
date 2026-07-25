# Google Analytics 4 Provider

Production reference implementation for the ORION Provider Framework (ES-060). Connects to the [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1) and maps live metrics into Executive Dashboard intelligence models.

## Overview

| Property | Value |
|----------|-------|
| Provider ID | `google-analytics` |
| Workspace | Marketing |
| Capabilities | metrics, alerts, recommendations, trends, health, brief |
| Registration | Automatic via `ProviderFactory` when credentials are configured |
| Fallback | `MarketingProvider` mock when credentials are missing |

## Architecture

```
Environment Variables
        │
        ▼
   GA4Config ──► validate / load
        │
        ▼
GA4Authenticator ──► OAuth2 refresh token → access token
        │
        ▼
   GA4Client ──► runReport (retry, rate limits, cache)
        │
        ▼
   GA4Mapper ──► ProviderDashboardContribution
        │
        ▼
GoogleAnalyticsProvider ──► ProviderRegistry → Orchestrator Pipeline
```

### Module responsibilities

| Module | Purpose |
|--------|---------|
| `GoogleAnalyticsProvider.ts` | Provider lifecycle (`connect`, `sync`, `healthCheck`, …) |
| `GA4Client.ts` | Data API requests, retry, rate-limit handling |
| `GA4Authenticator.ts` | OAuth2 token refresh |
| `GA4Mapper.ts` | Maps GA4 metrics → ORION executive models |
| `GA4Health.ts` | Connectivity and property access probes |
| `GA4Config.ts` | Environment configuration and validation |
| `GA4Cache.ts` | In-memory TTL response cache |

## Configuration

The provider activates automatically when all required environment variables are set. No code changes are required beyond configuration.

When credentials are **not** configured, ORION continues using the existing `MarketingProvider` mock with no runtime errors.

## Authentication

Uses **OAuth 2.0 refresh-token flow**:

1. Create a Google Cloud project with the Analytics Data API enabled.
2. Configure an OAuth 2.0 client (Web application or Desktop).
3. Complete the OAuth consent flow and obtain a **refresh token** with scope:
   - `https://www.googleapis.com/auth/analytics.readonly`
4. Grant the authenticated Google account **Viewer** (or higher) access to the GA4 property.

Tokens are refreshed automatically by `GA4Authenticator` and cached in memory until expiry.

## Permissions

The provider reads analytics data only. Required Google OAuth scope:

| Scope | Purpose |
|-------|---------|
| `analytics.readonly` | Read GA4 property metrics via Data API |

ORION permission scopes (internal): `providers`, `external-apis`, `storage` (cache).

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `GOOGLE_ANALYTICS_CLIENT_ID` | OAuth 2.0 client ID |
| `GOOGLE_ANALYTICS_CLIENT_SECRET` | OAuth 2.0 client secret |
| `GOOGLE_ANALYTICS_REFRESH_TOKEN` | Long-lived refresh token |
| `GOOGLE_ANALYTICS_PROPERTY_ID` | Numeric GA4 property ID (e.g. `123456789`) |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_ANALYTICS_CACHE_TTL_MS` | `300000` (5 min) | Snapshot cache TTL in milliseconds |
| `GOOGLE_ANALYTICS_MAX_RETRIES` | `3` | Max retry attempts per API call |
| `GOOGLE_ANALYTICS_REQUEST_TIMEOUT_MS` | `30000` | HTTP request timeout |

### Example (`.env.local`)

```bash
GOOGLE_ANALYTICS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ANALYTICS_CLIENT_SECRET=your-client-secret
GOOGLE_ANALYTICS_REFRESH_TOKEN=your-refresh-token
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_ANALYTICS_CACHE_TTL_MS=300000
```

> **Security:** Never commit credentials. All secrets must be supplied via environment variables or your deployment secret manager.

## Supported Metrics

### Core (period comparison — last 7 days vs prior 7 days)

| GA4 Metric | ORION Usage |
|------------|-------------|
| `sessions` | Executive metric, trends, brief |
| `totalUsers` | Users trend |
| `activeUsers` | Brief segment |
| `newUsers` | Available in core snapshot |
| `screenPageViews` | Page views / screen views |
| `purchaseRevenue` | Revenue trend, alerts |
| `transactions` | E-commerce brief |
| `conversions` | Trends, recommendations |
| `bounceRate` | Health driver, alerts, recommendations |
| `engagementRate` | Health driver, trends |
| `averageSessionDuration` | Engagement brief segment |

### Dimensional breakdowns (last 28 days)

| Dimension(s) | ORION Usage |
|--------------|-------------|
| `sessionSource` + `sessionMedium` | Traffic sources |
| `sessionCampaignName` | Campaign performance |
| `deviceCategory` | Device categories |
| `country` + `city` | Geographic data |
| `landingPagePlusQueryString` | Landing pages |
| `pagePath` | Top pages |

## ORION Model Mapping

| GA4 Data | ORION Model |
|----------|-------------|
| Core metrics + comparison | `ExecutiveMetric` (Marketing workspace) |
| Bounce / engagement / session trend | `BusinessHealthDriver` |
| Traffic decline, bounce, campaigns | `Recommendation[]` |
| Critical bounce, traffic/revenue drops | `Alert[]` |
| Sessions, users, conversions, revenue, engagement | `Trend[]` |
| Summary sentences | `briefSegments[]` |
| Full contribution | `ProviderDashboardContribution` → Orchestrator → `DashboardSnapshot` |

## Integration

### Provider Registry & Manager

Registered automatically in `ProviderRegistry` via `createDefaultProviders()` when GA4 env vars are present. Replaces the marketing mock provider slot.

### Orchestrator

No orchestrator code changes required. Pipeline stage `refresh-providers` calls `providerManager.connectAll()` + `syncAll()`, and `collect-provider-data` fetches contributions through `fetchProviderContributions()`.

### Dashboard

`/dashboard` and `/command-center` consume the orchestrator snapshot. When GA4 is configured, Marketing metrics reflect live GA4 data.

## Error Handling

- **Missing credentials:** Falls back to `MarketingProvider` mock silently at factory time.
- **Auth failures:** Provider enters `error` state; connect/sync return structured `ProviderResult` errors.
- **Rate limits (429):** Exponential backoff with `Retry-After` header support.
- **Server errors (5xx):** Automatic retry up to `GOOGLE_ANALYTICS_MAX_RETRIES`.
- **Stale cache:** On fetch failure after sync, serves last known snapshot if available.

## Known Limitations

1. **In-process cache only** — cache is not shared across server instances or restarts.
2. **Refresh-token flow only** — no interactive OAuth UI in ORION; tokens must be provisioned externally.
3. **No Admin API** — property discovery is manual via `GOOGLE_ANALYTICS_PROPERTY_ID`.
4. **E-commerce metrics** — revenue/transactions require GA4 e-commerce event configuration in the property.
5. **Currency formatting** — mapper uses INR-style display (`₹`) consistent with other ORION mock providers; does not read GA4 property currency settings yet.
6. **Single property** — one GA4 property per deployment environment.
7. **No streaming** — batch `runReport` only; no real-time Reporting API integration.

## Related Documentation

- [ES-034 Provider Data Contract Standards](../02_Engineering/ES-034-Provider-Data-Contract-Standards.md)
- [ES-065 Executive Intelligence Architecture](../02_Engineering/ES-065-Executive-Intelligence-Architecture.md)
- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)

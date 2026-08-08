-- Aurora admin tables (WP-A001 · ES-AURORA-005 migration 001)

CREATE TABLE IF NOT EXISTS aurora_tenant (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aurora_brand (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES aurora_tenant(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en-US',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS aurora_tenant_config (
  tenant_id UUID PRIMARY KEY REFERENCES aurora_tenant(id),
  tier TEXT NOT NULL,
  approval_policy JSONB NOT NULL DEFAULT '{}',
  token_budget INTEGER NOT NULL,
  feature_overrides JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS aurora_schedule (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES aurora_tenant(id),
  brand_id UUID REFERENCES aurora_brand(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aurora_brand_tenant ON aurora_brand(tenant_id);
CREATE INDEX IF NOT EXISTS idx_aurora_schedule_tenant ON aurora_schedule(tenant_id, status);

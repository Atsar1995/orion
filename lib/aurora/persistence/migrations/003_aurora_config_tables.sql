-- Aurora workspace configuration (WP-A002 Phase 2B slice · ES-AURORA-006 §4.5)

CREATE TABLE IF NOT EXISTS aurora_workspace_config (
  tenant_id UUID NOT NULL REFERENCES aurora_tenant(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  active_brand_id UUID REFERENCES aurora_brand(id),
  dashboard_layout JSONB NOT NULL DEFAULT '{}',
  notification_preferences JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_aurora_workspace_config_tenant
  ON aurora_workspace_config(tenant_id);

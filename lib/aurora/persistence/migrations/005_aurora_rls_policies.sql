-- Aurora tenant RLS policies (WP-A002 · ES-AURORA-006 migration 005 · ADR-004)

CREATE OR REPLACE FUNCTION aurora_current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid;
$$;

ALTER TABLE aurora_business_entity ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_business_entity FORCE ROW LEVEL SECURITY;
CREATE POLICY aurora_business_entity_tenant_isolation ON aurora_business_entity
  FOR ALL
  USING (tenant_id = aurora_current_tenant_id())
  WITH CHECK (tenant_id = aurora_current_tenant_id());

ALTER TABLE aurora_brand ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_brand FORCE ROW LEVEL SECURITY;
CREATE POLICY aurora_brand_tenant_isolation ON aurora_brand
  FOR ALL
  USING (tenant_id = aurora_current_tenant_id())
  WITH CHECK (tenant_id = aurora_current_tenant_id());

ALTER TABLE aurora_tenant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_tenant_config FORCE ROW LEVEL SECURITY;
CREATE POLICY aurora_tenant_config_tenant_isolation ON aurora_tenant_config
  FOR ALL
  USING (tenant_id = aurora_current_tenant_id())
  WITH CHECK (tenant_id = aurora_current_tenant_id());

ALTER TABLE aurora_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_schedule FORCE ROW LEVEL SECURITY;
CREATE POLICY aurora_schedule_tenant_isolation ON aurora_schedule
  FOR ALL
  USING (tenant_id = aurora_current_tenant_id())
  WITH CHECK (tenant_id = aurora_current_tenant_id());

ALTER TABLE aurora_workspace_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_workspace_config FORCE ROW LEVEL SECURITY;
CREATE POLICY aurora_workspace_config_tenant_isolation ON aurora_workspace_config
  FOR ALL
  USING (tenant_id = aurora_current_tenant_id())
  WITH CHECK (tenant_id = aurora_current_tenant_id());

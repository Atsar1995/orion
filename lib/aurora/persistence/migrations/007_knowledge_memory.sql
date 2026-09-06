-- Aurora knowledge entity persistence (ES-AURORA-007 · Gate 4C · migration 007)

CREATE TABLE IF NOT EXISTS aurora_knowledge_entity (
  id TEXT PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES aurora_tenant(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES aurora_brand(id),
  domain TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  status TEXT NOT NULL,
  classification TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  source_type TEXT NOT NULL,
  source_trust DOUBLE PRECISION NOT NULL,
  version INTEGER NOT NULL,
  curator_agent TEXT NOT NULL,
  validated_at TIMESTAMPTZ,
  validated_by TEXT,
  stale_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT aurora_knowledge_entity_source_trust_range
    CHECK (source_trust >= 0 AND source_trust <= 1),
  CONSTRAINT aurora_knowledge_entity_version_positive
    CHECK (version > 0),
  UNIQUE (tenant_id, id)
);

CREATE INDEX IF NOT EXISTS idx_aurora_knowledge_entity_tenant_brand_domain
  ON aurora_knowledge_entity(tenant_id, brand_id, domain);

CREATE INDEX IF NOT EXISTS idx_aurora_knowledge_entity_tenant_status
  ON aurora_knowledge_entity(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_aurora_knowledge_entity_content_gin
  ON aurora_knowledge_entity USING gin (content);

CREATE TABLE IF NOT EXISTS aurora_knowledge_entity_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES aurora_tenant(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  changed_by TEXT NOT NULL,
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT aurora_knowledge_entity_version_positive
    CHECK (version > 0),
  CONSTRAINT aurora_knowledge_entity_version_entity_fk
    FOREIGN KEY (tenant_id, entity_id)
    REFERENCES aurora_knowledge_entity(tenant_id, id)
    ON DELETE CASCADE,
  UNIQUE (tenant_id, entity_id, version)
);

CREATE INDEX IF NOT EXISTS idx_aurora_knowledge_entity_version_lookup
  ON aurora_knowledge_entity_version(tenant_id, entity_id, version);

CREATE OR REPLACE FUNCTION aurora_enforce_knowledge_brand_tenant_match()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  brand_tenant UUID;
BEGIN
  SELECT tenant_id INTO brand_tenant
  FROM aurora_brand
  WHERE id = NEW.brand_id;

  IF brand_tenant IS NULL OR brand_tenant <> NEW.tenant_id THEN
    RAISE EXCEPTION 'Knowledge brand_id must belong to the same tenant';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS aurora_knowledge_entity_brand_tenant_match ON aurora_knowledge_entity;
CREATE TRIGGER aurora_knowledge_entity_brand_tenant_match
  BEFORE INSERT OR UPDATE OF brand_id, tenant_id ON aurora_knowledge_entity
  FOR EACH ROW
  EXECUTE FUNCTION aurora_enforce_knowledge_brand_tenant_match();

ALTER TABLE aurora_knowledge_entity ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_knowledge_entity FORCE ROW LEVEL SECURITY;
CREATE POLICY aurora_knowledge_entity_tenant_isolation ON aurora_knowledge_entity
  FOR ALL
  USING (tenant_id = aurora_current_tenant_id())
  WITH CHECK (tenant_id = aurora_current_tenant_id());

ALTER TABLE aurora_knowledge_entity_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_knowledge_entity_version FORCE ROW LEVEL SECURITY;
CREATE POLICY aurora_knowledge_entity_version_tenant_isolation ON aurora_knowledge_entity_version
  FOR ALL
  USING (tenant_id = aurora_current_tenant_id())
  WITH CHECK (tenant_id = aurora_current_tenant_id());

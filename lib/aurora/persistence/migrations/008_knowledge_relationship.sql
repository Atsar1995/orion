-- Aurora knowledge relationship persistence (ES-AURORA-007 · Gate 6 / Sprint 2 · migration 008)

CREATE TABLE IF NOT EXISTS aurora_knowledge_relationship (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES aurora_tenant(id) ON DELETE CASCADE,
  source_entity_id TEXT NOT NULL,
  target_entity_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  weight DOUBLE PRECISION NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT aurora_knowledge_relationship_weight_range
    CHECK (weight >= 0 AND weight <= 1),
  CONSTRAINT aurora_knowledge_relationship_source_entity_fk
    FOREIGN KEY (tenant_id, source_entity_id)
    REFERENCES aurora_knowledge_entity(tenant_id, id)
    ON DELETE CASCADE,
  CONSTRAINT aurora_knowledge_relationship_target_entity_fk
    FOREIGN KEY (tenant_id, target_entity_id)
    REFERENCES aurora_knowledge_entity(tenant_id, id)
    ON DELETE CASCADE,
  UNIQUE (tenant_id, source_entity_id, target_entity_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_aurora_knowledge_relationship_source
  ON aurora_knowledge_relationship(tenant_id, source_entity_id);

CREATE INDEX IF NOT EXISTS idx_aurora_knowledge_relationship_target
  ON aurora_knowledge_relationship(tenant_id, target_entity_id);

ALTER TABLE aurora_knowledge_relationship ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_knowledge_relationship FORCE ROW LEVEL SECURITY;
CREATE POLICY aurora_knowledge_relationship_tenant_isolation ON aurora_knowledge_relationship
  FOR ALL
  USING (tenant_id = aurora_current_tenant_id())
  WITH CHECK (tenant_id = aurora_current_tenant_id());

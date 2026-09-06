-- Aurora knowledge embedding persistence (ES-AURORA-007 · Sprint 3 Gate 2 · migration 009)

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS aurora_knowledge_embedding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES aurora_tenant(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES aurora_brand(id),
  entity_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  embedding vector(1536) NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT aurora_knowledge_embedding_chunk_index_nonnegative
    CHECK (chunk_index >= 0),
  CONSTRAINT aurora_knowledge_embedding_entity_fk
    FOREIGN KEY (tenant_id, entity_id)
    REFERENCES aurora_knowledge_entity(tenant_id, id)
    ON DELETE CASCADE,
  UNIQUE (tenant_id, entity_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_aurora_knowledge_embedding_tenant_entity
  ON aurora_knowledge_embedding(tenant_id, entity_id);

CREATE INDEX IF NOT EXISTS idx_aurora_knowledge_embedding_tenant_brand
  ON aurora_knowledge_embedding(tenant_id, brand_id);

CREATE INDEX IF NOT EXISTS idx_aurora_knowledge_embedding_vector
  ON aurora_knowledge_embedding
  USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION aurora_enforce_knowledge_embedding_brand_tenant_match()
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
    RAISE EXCEPTION 'Knowledge embedding brand_id must belong to the same tenant';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS aurora_knowledge_embedding_brand_tenant_match ON aurora_knowledge_embedding;
CREATE TRIGGER aurora_knowledge_embedding_brand_tenant_match
  BEFORE INSERT OR UPDATE OF brand_id, tenant_id ON aurora_knowledge_embedding
  FOR EACH ROW
  EXECUTE FUNCTION aurora_enforce_knowledge_embedding_brand_tenant_match();

ALTER TABLE aurora_knowledge_embedding ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_knowledge_embedding FORCE ROW LEVEL SECURITY;
CREATE POLICY aurora_knowledge_embedding_tenant_isolation ON aurora_knowledge_embedding
  FOR ALL
  USING (tenant_id = aurora_current_tenant_id())
  WITH CHECK (tenant_id = aurora_current_tenant_id());

-- Keyword search FTS foundation (ES-AURORA-007 §2.5) — additive on existing entity table.
ALTER TABLE aurora_knowledge_entity
  ADD COLUMN IF NOT EXISTS search_fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content::text, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_aurora_knowledge_entity_search_fts
  ON aurora_knowledge_entity USING gin (search_fts);

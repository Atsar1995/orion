-- Aurora business entity + brand hierarchy (WP-A002 · ES-AURORA-006 migration 002)

CREATE OR REPLACE FUNCTION aurora_deterministic_uuid(seed TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    substr(md5(seed), 1, 8) || '-' ||
    substr(md5(seed), 9, 4) || '-' ||
    '4' || substr(md5(seed), 13, 3) || '-' ||
    substr('89ab', 1 + (get_byte(decode(md5(seed), 'hex'), 6) % 4), 1) || substr(md5(seed), 17, 3) || '-' ||
    substr(md5(seed), 21, 12)
  )::uuid;
$$;

CREATE TABLE IF NOT EXISTS aurora_business_entity (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES aurora_tenant(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_aurora_business_entity_tenant
  ON aurora_business_entity(tenant_id);

INSERT INTO aurora_business_entity (id, tenant_id, name, slug, status)
SELECT
  aurora_deterministic_uuid('aurora:default-business:' || t.id::text),
  t.id,
  'Default',
  'default',
  'active'
FROM aurora_tenant t
ON CONFLICT (tenant_id, slug) DO NOTHING;

ALTER TABLE aurora_brand
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES aurora_business_entity(id);

UPDATE aurora_brand AS b
SET business_id = be.id
FROM aurora_business_entity AS be
WHERE be.tenant_id = b.tenant_id
  AND be.slug = 'default'
  AND b.business_id IS NULL;

ALTER TABLE aurora_brand
  ALTER COLUMN business_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_aurora_brand_business
  ON aurora_brand(business_id);

CREATE OR REPLACE FUNCTION aurora_enforce_brand_business_tenant_match()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  business_tenant UUID;
BEGIN
  SELECT tenant_id INTO business_tenant
  FROM aurora_business_entity
  WHERE id = NEW.business_id;

  IF business_tenant IS NULL OR business_tenant <> NEW.tenant_id THEN
    RAISE EXCEPTION 'Brand business_id must belong to the same tenant';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS aurora_brand_business_tenant_match ON aurora_brand;
CREATE TRIGGER aurora_brand_business_tenant_match
  BEFORE INSERT OR UPDATE OF business_id ON aurora_brand
  FOR EACH ROW
  EXECUTE FUNCTION aurora_enforce_brand_business_tenant_match();

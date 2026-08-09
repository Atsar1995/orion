-- WP-A002 Phase 2B.1 — Operator-only restricted Aurora application role
-- Run as a privileged role (e.g. orion) against the target database.
-- Do NOT execute from application or test code.
--
-- Replace placeholders before running:
--   <database_name>     e.g. orion_staging
--   <aurora_app_password>  choose a strong password; do not commit it

CREATE ROLE aurora_app
  LOGIN
  PASSWORD '<aurora_app_password>'
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS
  INHERIT;

GRANT CONNECT ON DATABASE <database_name> TO aurora_app;
GRANT USAGE ON SCHEMA public TO aurora_app;

GRANT SELECT ON TABLE public.aurora_tenant TO aurora_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.aurora_business_entity TO aurora_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.aurora_brand TO aurora_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.aurora_workspace_config TO aurora_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.aurora_schedule TO aurora_app;

GRANT EXECUTE ON FUNCTION public.aurora_current_tenant_id() TO aurora_app;
GRANT EXECUTE ON FUNCTION public.aurora_enforce_brand_business_tenant_match() TO aurora_app;

REVOKE ALL ON TABLE public.aurora_schema_version FROM aurora_app;
REVOKE ALL ON TABLE public.aurora_migration_history FROM aurora_app;

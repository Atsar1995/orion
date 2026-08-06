/**
 * Operational runbook registry (Mission P-015.8 · ADR-012).
 */

export type RunbookCategory =
  | "startup"
  | "shutdown"
  | "incident"
  | "database"
  | "migration"
  | "deployment"
  | "rollback"
  | "health";

export type RunbookEntry = {
  readonly id: string;
  readonly title: string;
  readonly category: RunbookCategory;
  readonly documentPath: string;
  readonly summary: string;
  readonly steps: readonly string[];
};

const RUNBOOKS: readonly RunbookEntry[] = [
  {
    id: "platform-startup",
    title: "Platform Startup",
    category: "startup",
    documentPath: "docs/Operations/Runbook-Platform-Startup.md",
    summary: "Start ORION platform with PostgreSQL persistence and health verification.",
    steps: [
      "Verify DATABASE_URL and ORION_STORE_PROVIDER environment variables",
      "Run database migrations via PlatformStore initialization",
      "Start Next.js application process",
      "Verify GET /api/health returns status healthy or degraded",
      "Verify GET /api/health/readiness operational score",
    ],
  },
  {
    id: "platform-shutdown",
    title: "Platform Shutdown",
    category: "shutdown",
    documentPath: "docs/Operations/Runbook-Platform-Shutdown.md",
    summary: "Graceful platform shutdown procedure.",
    steps: [
      "Drain active HTTP connections",
      "Complete in-flight API requests",
      "Close PlatformStore connection pool",
      "Stop application process",
    ],
  },
  {
    id: "incident-response",
    title: "Incident Response",
    category: "incident",
    documentPath: "docs/Platform/Operations/Operations-Runbook.md#incident-response",
    summary: "Standard incident response workflow for platform outages.",
    steps: [
      "Assess /api/health and operational diagnostics",
      "Identify affected subsystem from health checks",
      "Execute targeted recovery runbook",
      "Document incident timeline and root cause",
      "Schedule post-incident review",
    ],
  },
  {
    id: "database-recovery",
    title: "Database Recovery",
    category: "database",
    documentPath: "docs/Operations/Runbook-Disaster-Recovery.md",
    summary: "Restore PostgreSQL from verified backup.",
    steps: [
      "Validate latest backup via BackupService.verifyBackup",
      "Stop application write traffic",
      "Restore database from backup artifact",
      "Reinitialize PlatformStore and run migrations",
      "Execute restore validation drill",
    ],
  },
  {
    id: "migration-execution",
    title: "Migration Execution",
    category: "migration",
    documentPath: "docs/Platform/Operations/Operations-Runbook.md#migration-execution",
    summary: "Execute platform schema migrations safely.",
    steps: [
      "Create pre-migration backup",
      "Review pending migrations in MigrationRunner status",
      "Apply migrations via PlatformStore.initialize()",
      "Verify migration version matches registry",
      "Run health verification",
    ],
  },
  {
    id: "release-deployment",
    title: "Release Deployment",
    category: "deployment",
    documentPath: "docs/Operations/Runbook-Production-Deployment.md",
    summary: "Deploy release candidate to staging or production.",
    steps: [
      "Verify CI quality gate passed on release branch",
      "Build production artifact via npm run build",
      "Deploy to target environment",
      "Run staging smoke tests",
      "Monitor health endpoints for 15 minutes",
    ],
  },
  {
    id: "emergency-rollback",
    title: "Emergency Rollback",
    category: "rollback",
    documentPath: "docs/Platform/Operations/Operations-Runbook.md#emergency-rollback",
    summary: "Rollback to previous known-good release.",
    steps: [
      "Identify last stable release tag",
      "Deploy previous artifact",
      "Verify database migration compatibility",
      "Execute health verification runbook",
      "Notify stakeholders",
    ],
  },
  {
    id: "health-verification",
    title: "Health Verification",
    category: "health",
    documentPath: "docs/Operations/Runbook-Operational-Monitoring.md",
    summary: "Verify platform health after deploy or recovery.",
    steps: [
      "GET /api/health — liveness check",
      "GET /api/health/readiness — readiness assessment",
      "Verify platform_store and platform_security checks",
      "Confirm RBAC fail-closed in staging",
      "Review operational metrics snapshot",
    ],
  },
] as const;

/** Registry of operational runbooks and procedure metadata. */
export class RunbookRegistry {
  listRunbooks(category?: RunbookCategory): readonly RunbookEntry[] {
    if (!category) {
      return RUNBOOKS;
    }

    return RUNBOOKS.filter((entry) => entry.category === category);
  }

  getRunbook(id: string): RunbookEntry | undefined {
    return RUNBOOKS.find((entry) => entry.id === id);
  }

  countByCategory(): Record<RunbookCategory, number> {
    return RUNBOOKS.reduce(
      (counts, entry) => {
        counts[entry.category] += 1;
        return counts;
      },
      {
        startup: 0,
        shutdown: 0,
        incident: 0,
        database: 0,
        migration: 0,
        deployment: 0,
        rollback: 0,
        health: 0,
      } satisfies Record<RunbookCategory, number>,
    );
  }
}

export const runbookRegistry = new RunbookRegistry();

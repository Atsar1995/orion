#!/usr/bin/env node
/**
 * Production dependency audit for ORION Quality Gate (G7).
 *
 * - Audits production runtime dependencies only (`npm audit --omit=dev`)
 * - Fails on critical severity (never allowlisted)
 * - Fails on high severity unless explicitly allowlisted
 * - Fails on direct dependency advisories not covered by allowlist
 * - Fails when allowlist entries expire (reviewBy)
 * - Validates allowlist entries against Security Exception Policy
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWLIST_PATH = join(ROOT, ".github/security/npm-audit-allowlist.json");
const PACKAGE_JSON_PATH = join(ROOT, "package.json");

const SEVERITY_RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const MIN_FAIL_SEVERITY = "high";
const REQUIRED_ALLOWLIST_FIELDS = [
  "advisory",
  "package",
  "introducedBy",
  "reason",
  "reviewBy",
  "owner",
];
const APPROVED_OWNERS = new Set(["ORION CTO"]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function runProductionAudit() {
  try {
    return execSync("npm audit --omit=dev --json", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    if (error.stdout) {
      return error.stdout;
    }
    throw error;
  }
}

function loadAllowlist() {
  const allowlist = readJson(ALLOWLIST_PATH);
  const today = new Date().toISOString().slice(0, 10);
  const byId = new Map();
  const directDependencies = getDirectDependencies();

  for (const entry of allowlist.exceptions ?? []) {
    const advisoryId = entry.advisory ?? entry.advisoryId;
    const missingFields = REQUIRED_ALLOWLIST_FIELDS.filter(
      (field) => !entry[field] || String(entry[field]).trim() === "",
    );

    if (!advisoryId) {
      console.error("Allowlist entry missing advisory ID.");
      process.exit(1);
    }

    if (missingFields.length > 0) {
      console.error(
        `Allowlist entry ${advisoryId} missing required fields: ${missingFields.join(", ")}`,
      );
      process.exit(1);
    }

    if (!APPROVED_OWNERS.has(entry.owner)) {
      console.error(
        `Allowlist entry ${advisoryId} owner "${entry.owner}" is not an approved maintainer.`,
      );
      process.exit(1);
    }

    if (directDependencies.has(entry.package)) {
      console.error(
        `Allowlist entry ${advisoryId} targets direct dependency "${entry.package}". Security Exception Policy requires transitive vulnerabilities only.`,
      );
      process.exit(1);
    }

    if (entry.reviewBy && entry.reviewBy < today) {
      console.error(
        `Allowlist entry ${advisoryId} (${entry.package}) expired on ${entry.reviewBy}. Re-review required.`,
      );
      process.exit(1);
    }

    byId.set(advisoryId, entry);
  }

  return { allowlist, byId };
}

function getDirectDependencies() {
  const pkg = readJson(PACKAGE_JSON_PATH);
  return new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.optionalDependencies ?? {}),
  ]);
}

function collectFindings(auditReport) {
  const findings = [];

  for (const vulnerability of Object.values(auditReport.vulnerabilities ?? {})) {
    for (const via of vulnerability.via ?? []) {
      if (typeof via !== "object" || !via.url) {
        continue;
      }

      const advisoryId = via.url.split("/").pop() ?? via.url;
      findings.push({
        advisoryId,
        severity: via.severity ?? vulnerability.severity,
        package: vulnerability.name,
        isDirect: Boolean(vulnerability.isDirect),
        title: via.title ?? advisoryId,
        url: via.url,
      });
    }
  }

  return findings;
}

function shouldFailSeverity(severity) {
  return (SEVERITY_RANK[severity] ?? 0) >= (SEVERITY_RANK[MIN_FAIL_SEVERITY] ?? 3);
}

function main() {
  const { allowlist, byId } = loadAllowlist();
  const directDependencies = getDirectDependencies();
  const auditReport = JSON.parse(runProductionAudit());
  const findings = collectFindings(auditReport);

  const blocking = [];
  const allowlisted = [];

  for (const finding of findings) {
    const entry = byId.get(finding.advisoryId);

    if (finding.severity === "critical") {
      blocking.push({ ...finding, reason: "Critical vulnerabilities are never allowlisted." });
      continue;
    }

    if (entry) {
      allowlisted.push({ finding, entry });
      continue;
    }

    if (shouldFailSeverity(finding.severity)) {
      blocking.push({
        ...finding,
        reason: finding.isDirect
          ? "Direct production dependency vulnerability is not allowlisted."
          : "Production vulnerability is not allowlisted.",
      });
    }
  }

  console.log("ORION production dependency audit");
  console.log(`Scope: production runtime only (--omit=dev)`);
  console.log(`Allowlist: ${ALLOWLIST_PATH} (${allowlist.exceptions?.length ?? 0} entries)`);
  console.log(
    `Reported advisories: ${findings.length} · Allowlisted: ${allowlisted.length} · Blocking: ${blocking.length}`,
  );

  if (allowlisted.length > 0) {
    console.log("\nAllowlisted exceptions:");
    for (const { finding, entry } of allowlisted) {
      const introducedBy = entry.introducedBy ?? entry.upstream ?? "unknown";
      const owner = entry.owner ?? allowlist.reviewOwner ?? "ORION CTO";
      console.log(
        `  - ${finding.advisoryId} · ${finding.package} · ${introducedBy} · owner ${owner} · review by ${entry.reviewBy} · ${entry.reason}`,
      );
    }
  }

  if (blocking.length > 0) {
    console.error("\nBlocking production vulnerabilities:");
    for (const finding of blocking) {
      console.error(
        `  - ${finding.advisoryId} · ${finding.package}${finding.isDirect ? " (direct)" : ""} · ${finding.severity} · ${finding.title}`,
      );
      console.error(`    ${finding.reason}`);
      console.error(`    ${finding.url}`);
    }

    const directHits = blocking.filter(
      (finding) => finding.isDirect && directDependencies.has(finding.package),
    );
    if (directHits.length > 0) {
      console.error(
        `\nDirect dependency failures: ${directHits.map((item) => item.package).join(", ")}`,
      );
    }

    process.exit(1);
  }

  console.log("\nProduction dependency audit passed.");
}

main();

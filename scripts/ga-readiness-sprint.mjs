#!/usr/bin/env node
/**
 * GA-001 — ORION General Availability Readiness Sprint orchestrator.
 * Runs release-branch validation gates and GA operational certification tests.
 */

import { spawnSync } from "node:child_process";

const steps = [
  { name: "Typecheck", command: "npm", args: ["run", "typecheck"] },
  { name: "Lint", command: "npm", args: ["run", "lint"] },
  {
    name: "GA-001 Operational Certification",
    command: "npm",
    args: ["run", "test", "--", "tests/ga/GA001OperationalCertification.test.ts"],
  },
  { name: "Full Test Suite", command: "npm", args: ["run", "test"] },
  { name: "Production Build", command: "npm", args: ["run", "build"], env: { CI: "true" } },
  { name: "Production Dependency Audit", command: "npm", args: ["run", "audit:production"] },
];

function runStep(step) {
  const startedAt = Date.now();
  const result = spawnSync(step.command, step.args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...step.env },
  });

  return {
    name: step.name,
    passed: result.status === 0,
    durationMs: Date.now() - startedAt,
    exitCode: result.status ?? 1,
  };
}

console.log("GA-001 ORION General Availability Readiness Sprint");
console.log(`Branch baseline: release/v1.0.1 · commit 5354ed8`);
console.log(`Live PostgreSQL: ${process.env.GA001_LIVE_POSTGRES === "1" ? "enabled" : "skipped (set GA001_LIVE_POSTGRES=1 for live staging)"}`);
console.log("");

const results = [];

for (const step of steps) {
  console.log(`\n=== ${step.name} ===`);
  results.push(runStep(step));
}

console.log("\n=== GA-001 Sprint Summary ===");
for (const result of results) {
  console.log(`${result.passed ? "PASS" : "FAIL"} · ${result.name} · ${result.durationMs}ms`);
}

const failed = results.filter((result) => !result.passed);
if (failed.length > 0) {
  console.error(`\nGA-001 sprint failed: ${failed.map((result) => result.name).join(", ")}`);
  process.exit(1);
}

console.log("\nGA-001 automated sprint checks complete.");
process.exit(0);

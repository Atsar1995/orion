# Performance Tuning Guide

**Mission:** P-015.9 — Enterprise Performance & Scalability Certification  
**Audience:** Platform Engineering · DevOps  
**Last Updated:** August 2026

**Related:** [Enterprise Performance Certification](./Enterprise-Performance-Certification.md) · [Benchmark Report](./Performance-Benchmark-Report.md)

---

## Overview

This guide documents **approved optimization strategies** for ORION platform performance. All recommendations preserve repository contracts, PlatformStore abstraction, and clean architecture boundaries.

---

## Quick Diagnostics

```bash
# Performance health endpoint
curl -s http://localhost:3000/api/health/performance | jq .

# Run certification programmatically
# See PerformanceCertification.certify() in lib/platform/performance/
```

---

## PostgreSQL Tuning

| Parameter | Recommendation | Impact |
|-----------|----------------|--------|
| Connection pool size | 10–20 per instance | Reduces connection exhaustion |
| `statement_timeout` | 30s | Prevents runaway queries |
| Index review | After migration changes | Repository read latency |
| `shared_buffers` | 25% of RAM (DB server) | Query cache efficiency |

**Do not:** Bypass PlatformStore for direct SQL in domain services.

---

## PlatformStore Optimization

| Strategy | Allowed | Notes |
|----------|---------|-------|
| Lazy store initialization | ✅ | Already implemented via factory |
| Health report caching | ✅ | PostgresPlatformStore caches lastHealthReport |
| Batch repository reads | ✅ | Within existing repository interfaces |
| Skip health ping in dev | ⚠️ | Use in-memory store locally only |

---

## RBAC Performance

| Hot Path | Typical Latency | Optimization |
|----------|-----------------|--------------|
| Identity context creation | < 1ms | Cache session-derived context per request |
| Permission evaluation | < 5ms | Registry lookup — O(n) over role permissions |
| Authorization service | < 10ms | Avoid redundant evaluate calls per route |

**Do not:** Disable fail-closed mode for performance gains.

---

## API Response Time

| Strategy | Status |
|----------|--------|
| Health endpoint sync checks | Acceptable for liveness |
| Async operational health | Use `/api/health/operations` for deep checks |
| Response caching | Not implemented — evaluate per route in Wave 4 |
| Compression | Next.js default — enabled in production |

---

## Memory Management

| Area | Guidance |
|------|----------|
| In-memory stores | Dev only — production must use PostgreSQL |
| PerformanceMetrics ring buffer | Max 2000 samples per category |
| ObservabilityStore | Max 200 metrics/errors |
| Load test memory growth | Investigate if > 20MB per test run |

---

## Connection Pool Monitoring

Monitor via `/api/health/performance`:

- `connection_pool` check status
- `poolUtilizationEstimate` from load tests
- `DatabaseHealthReport.pool` when PostgreSQL configured

**Action threshold:** Pool utilization > 80% sustained → increase pool size or reduce concurrency.

---

## Caching Opportunities (Non-Blocking)

| Cache Target | Priority | Architecture Impact |
|--------------|----------|---------------------|
| Permission registry snapshot | Low | Read-only cache per process |
| Health report (5s TTL) | Low | Already partially cached |
| Static platform config | Low | env.ts loaded once |
| HCM facade domain status | Medium | Evaluate in Wave 4 |

**Rule:** No caching that bypasses organization isolation or RBAC checks.

---

## Load Testing Procedure

```typescript
import { loadTestRunner, performanceBenchmark } from "@/lib/platform/performance";

// 1. Run baseline benchmarks
await performanceBenchmark.runSuite({ iterations: 20 });

// 2. Run load test
const load = await loadTestRunner.run(myOperation, {
  concurrentUsers: 20,
  requestsPerUser: 5,
  category: "apiResponse",
});

// 3. Review results
console.log(load.throughputRps, load.p95LatencyMs, load.memoryGrowthMb);
```

---

## Stress Testing Procedure

```typescript
import { stressTestRunner } from "@/lib/platform/performance";

const stress = await stressTestRunner.run(myOperation, {
  initialConcurrency: 5,
  maxConcurrency: 100,
  stepSize: 10,
});

console.log(stress.breakingPoint, stress.gracefulDegradation, stress.recoveryVerified);
```

---

## Optimization Prohibitions

Per P-015.9 mission constraints:

- ❌ Modify repository interfaces or contracts
- ❌ Change business service behaviour
- ❌ Bypass PlatformStore abstraction
- ❌ Disable RBAC or organization isolation
- ❌ Introduce new business features under performance guise
- ❌ Add blocking synchronous I/O to hot paths without ADR

---

## Escalation

| Condition | Action |
|-----------|--------|
| p95 API > 500ms sustained | Platform Eng investigation |
| p95 authorization > 25ms | RBAC registry review |
| Memory growth > 50MB under load | Memory profiling session |
| Breaking point < 20 concurrent | Architecture review |

---

*Maintained under P-015.9 · Non-blocking optimizations only*

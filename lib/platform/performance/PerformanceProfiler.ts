/**
 * Performance profiler for hot-path measurement (Mission P-015.9).
 */

import type { BenchmarkCategory } from "@/lib/platform/performance/PerformanceTypes";
import { performanceMetrics, type LatencySample } from "@/lib/platform/performance/PerformanceMetrics";

export type ProfileResult<T> = {
  readonly result: T;
  readonly durationMs: number;
  readonly sample: LatencySample;
};

export type MemorySnapshot = {
  readonly heapUsedMb: number;
  readonly heapTotalMb: number;
  readonly externalMb: number;
  readonly rssMb: number;
  readonly capturedAt: string;
};

/** Profiles synchronous and asynchronous operations with metric recording. */
export class PerformanceProfiler {
  async profileAsync<T>(
    category: BenchmarkCategory | string,
    operation: () => Promise<T>,
  ): Promise<ProfileResult<T>> {
    const started = performance.now();
    const result = await operation();
    const durationMs = performance.now() - started;
    const sample = performanceMetrics.record(category, durationMs);

    return { result, durationMs, sample };
  }

  profileSync<T>(category: BenchmarkCategory | string, operation: () => T): ProfileResult<T> {
    const started = performance.now();
    const result = operation();
    const durationMs = performance.now() - started;
    const sample = performanceMetrics.record(category, durationMs);

    return { result, durationMs, sample };
  }

  captureMemory(): MemorySnapshot {
    const memory = process.memoryUsage();

    return {
      heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
      externalMb: Math.round((memory.external / 1024 / 1024) * 100) / 100,
      rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      capturedAt: new Date().toISOString(),
    };
  }

  measureCpuTime(): { userMs: number; systemMs: number } {
    const usage = process.cpuUsage();
    return {
      userMs: Math.round(usage.user / 1000),
      systemMs: Math.round(usage.system / 1000),
    };
  }
}

export const performanceProfiler = new PerformanceProfiler();

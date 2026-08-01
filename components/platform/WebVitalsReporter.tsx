"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { observabilityStore } from "@/lib/observability";

type WebVitalsReporterProps = {
  reportUrl?: string;
};

/** Reports Core Web Vitals to the shared observability store (Mission S1D). */
export function WebVitalsReporter({ reportUrl = "/api/health/metrics" }: WebVitalsReporterProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    const route = pathname;

    function record(name: string, value: number, unit: "ms" | "score") {
      observabilityStore.recordMetric({
        name,
        value,
        unit,
        route,
      });

      void fetch(reportUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value, unit, route }),
        keepalive: true,
      }).catch(() => undefined);
    }

    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            record("web_vitals.fcp", entry.startTime, "ms");
          }
        }
      });
      paintObserver.observe({ type: "paint", buffered: true });

      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          record("web_vitals.lcp", last.startTime, "ms");
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
          if (!layoutShift.hadRecentInput) {
            cls += layoutShift.value ?? 0;
          }
        }
        record("web_vitals.cls", cls, "score");
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });

      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        record("web_vitals.ttfb", nav.responseStart, "ms");
      }

      return () => {
        paintObserver.disconnect();
        lcpObserver.disconnect();
        clsObserver.disconnect();
      };
    } catch {
      return undefined;
    }
  }, [pathname, reportUrl]);

  return null;
}

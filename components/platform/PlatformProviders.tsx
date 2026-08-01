"use client";

import type { ReactNode } from "react";
import { OfflineBanner } from "@/components/platform/OfflineBanner";
import { WebVitalsReporter } from "@/components/platform/WebVitalsReporter";

type PlatformProvidersProps = {
  children: ReactNode;
};

/** Platform-wide client providers for reliability and observability (Mission S1D). */
export function PlatformProviders({ children }: PlatformProvidersProps) {
  return (
    <>
      <OfflineBanner />
      <WebVitalsReporter />
      {children}
    </>
  );
}

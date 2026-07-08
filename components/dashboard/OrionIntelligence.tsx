"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { SparkIcon } from "@/components/common/icons";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

const GREETING = "Good Evening, Mohammad Shafi";

const SUMMARY_ITEMS = [
  "Occupancy 84%",
  "Revenue Up 8%",
  "Orders 12",
  "Three reviews awaiting reply",
] as const;

const RECOMMENDATIONS = [
  "Increase room pricing",
  "Reply to Google Reviews",
  "Publish weekend promotion",
] as const;

export function OrionIntelligence() {
  const [query, setQuery] = useState("");

  return (
    <DashboardCard
      title="ORION Intelligence"
      variant="premium"
      className="h-full"
    >
      <div className="flex flex-1 flex-col gap-5">
        <div className="space-y-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-orion-gold/25 bg-orion-gold/10">
            <SparkIcon className="h-5 w-5 text-orion-gold" />
          </div>
          <p className="text-lg font-medium tracking-tight text-white">
            {GREETING}
          </p>
        </div>

        <section aria-label="Today's Summary">
          <h4 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase">
            Today&apos;s Summary
          </h4>
          <ul className="space-y-1.5">
            {SUMMARY_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm font-light text-white/60"
              >
                <span aria-hidden className="text-orion-gold/70">
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Recommendations">
          <h4 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase">
            Recommendations
          </h4>
          <ul className="space-y-1.5">
            {RECOMMENDATIONS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm font-light text-white/60"
              >
                <span aria-hidden className="text-orion-gold">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-label="Ask ORION"
          className="mt-auto space-y-3 border-t border-white/[0.06] pt-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask ORION anything..."
              className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-light text-white placeholder:text-white/30 transition-colors duration-200 outline-none focus:border-orion-gold/30 focus:bg-white/[0.06]"
            />
            <Button className="shrink-0 justify-center sm:w-auto">Send</Button>
          </div>
          <p className="text-center text-[11px] font-light tracking-wide text-white/30 sm:text-left">
            Powered by ORION Intelligence
          </p>
        </section>
      </div>
    </DashboardCard>
  );
}

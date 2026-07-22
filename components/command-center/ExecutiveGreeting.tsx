"use client";

import { FOUNDER_NAME } from "@/lib/command-center-data";

function getGreetingPeriod(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Compact executive greeting with date — minimal spacing before first content. */
export function ExecutiveGreeting() {
  return (
    <header className="space-y-1 border-b border-white/[0.06] pb-4">
      <p className="text-base font-medium text-white/85 md:text-lg">
        {getGreetingPeriod()}, {FOUNDER_NAME}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
        Executive Command Center
      </h1>
      <p className="text-sm font-light text-white/45">{formatTodayDate()}</p>
    </header>
  );
}

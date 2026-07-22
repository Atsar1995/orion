"use client";

import { FOUNDER_NAME } from "@/lib/command-center-data";
import {
  WORKSPACE_GREETING_CLASS,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";

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
    <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
      <p className={WORKSPACE_GREETING_CLASS}>
        {getGreetingPeriod()}, {FOUNDER_NAME}
      </p>
      <h1 className={WORKSPACE_TITLE_CLASS}>Executive Command Center</h1>
      <p className={WORKSPACE_SUBTITLE_CLASS}>{formatTodayDate()}</p>
    </header>
  );
}

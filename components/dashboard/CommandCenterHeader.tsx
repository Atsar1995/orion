"use client";

const COMMAND_VERSION = "0.5 – Command";
const FOUNDER_NAME = "Shafi";

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

/** Command Center page header with greeting, date, and version context. */
export function CommandCenterHeader() {
  return (
    <header className="space-y-4">
      <div className="space-y-1">
        <p className="text-base font-medium text-white/80 md:text-lg">
          {getGreetingPeriod()}, {FOUNDER_NAME}
        </p>
        <p className="text-sm font-light text-white/50">
          Welcome back to ORION.
        </p>
      </div>

      <div className="space-y-2 border-b border-white/[0.06] pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          ORION Command Center
        </h1>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <p className="text-sm font-light text-white/45">{formatTodayDate()}</p>
          <p className="text-xs font-medium tracking-[0.18em] text-white/35 uppercase">
            Version {COMMAND_VERSION}
          </p>
        </div>
      </div>
    </header>
  );
}

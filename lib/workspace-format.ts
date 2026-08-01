/** Shared workspace date and greeting formatters (Design System). */

export function getWorkspaceGreetingPeriod(referenceDate = new Date()): string {
  const hour = referenceDate.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function formatWorkspaceDateLabel(referenceDate = new Date()): string {
  return referenceDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

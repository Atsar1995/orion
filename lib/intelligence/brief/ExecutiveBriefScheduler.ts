/** Daily brief generation schedule and metadata (ES-028). */

export type BriefScheduleContext = {
  scheduledFor: string;
  generatedAt: string;
  timezone: string;
  cadence: "daily" | "weekly";
};

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function getBriefScheduleContext(referenceDate = new Date()): BriefScheduleContext {
  return {
    scheduledFor: startOfDay(referenceDate).toISOString(),
    generatedAt: referenceDate.toISOString(),
    timezone: "UTC",
    cadence: "daily",
  };
}

export function shouldGenerateDailyBrief(lastGeneratedAt?: string): boolean {
  if (!lastGeneratedAt) {
    return true;
  }

  const last = startOfDay(new Date(lastGeneratedAt));
  const today = startOfDay(new Date());

  return last.getTime() < today.getTime();
}

export function getNextBriefSchedule(referenceDate = new Date()): string {
  const next = startOfDay(referenceDate);
  next.setDate(next.getDate() + 1);
  return next.toISOString();
}

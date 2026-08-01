import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmOk, parseOptionalString } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getHcmApiContext();
  const url = new URL(request.url);
  const date = parseOptionalString(url, "date");

  const holidayCalendars = hcmFacade.calendar.listHolidayCalendars(context);
  const workCalendars = hcmFacade.calendar.listWorkCalendars(context);
  const isHoliday = date ? hcmFacade.calendar.isHoliday(date, context) : undefined;
  const workingHours = date ? hcmFacade.calendar.getWorkingHoursForDate(date, context) : undefined;

  return hcmOk({ holidayCalendars, workCalendars, isHoliday, workingHours });
}

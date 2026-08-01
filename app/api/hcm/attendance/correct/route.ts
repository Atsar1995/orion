import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmCreated, hcmFromError } from "@/lib/hcm/api";
import type { CorrectAttendanceInput } from "@/types/hcm-time";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as CorrectAttendanceInput;
    const record = hcmFacade.attendance.correct(body, context);
    return hcmCreated(record);
  } catch (error) {
    return hcmFromError(error, "CORRECTION_ERROR");
  }
}

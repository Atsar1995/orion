import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);
  const body = (await request.json()) as { rosterId: string };

  try {
    const roster = hcmFacade.roster.publish(body.rosterId, context);
    return hcmOk(roster);
  } catch (error) {
    return hcmFromError(error, "ROSTER_PUBLISH_ERROR");
  }
}

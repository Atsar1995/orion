import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";
import type { PromotionInput } from "@/types/hcm-employment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as PromotionInput;
    const employment = hcmFacade.promoteEmployee(body, context);
    return hcmOk(employment);
  } catch (error) {
    return hcmFromError(error, "EMPLOYMENT_PROMOTE_ERROR");
  }
}

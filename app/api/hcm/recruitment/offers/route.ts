import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmCreated, hcmFromError } from "@/lib/hcm/api";
import type { CreateOfferInput } from "@/lib/hcm/recruitment/services/RecruitmentService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as CreateOfferInput;
    const offer = hcmFacade.createOffer(body, context);
    return hcmCreated(offer);
  } catch (error) {
    return hcmFromError(error, "OFFER_CREATE_ERROR");
  }
}

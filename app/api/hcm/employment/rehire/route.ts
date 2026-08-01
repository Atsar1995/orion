import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";
import type { RehireInput } from "@/types/hcm-employment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as RehireInput;
    const employment = hcmFacade.rehireEmployee(body, context);
    return hcmOk(employment);
  } catch (error) {
    return hcmFromError(error, "EMPLOYMENT_REHIRE_ERROR");
  }
}

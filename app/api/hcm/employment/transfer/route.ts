import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";
import type { TransferInput } from "@/types/hcm-employment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as TransferInput;
    const employment = hcmFacade.transferEmployee(body, context);
    return hcmOk(employment);
  } catch (error) {
    return hcmFromError(error, "EMPLOYMENT_TRANSFER_ERROR");
  }
}

import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";
import type { ProvisioningTaskRecord } from "@/types/hcm-onboarding";

export const dynamic = "force-dynamic";

type CompleteProvisioningBody = {
  readonly processId: string;
  readonly provisioningType: ProvisioningTaskRecord["provisioningType"];
};

export async function POST(request: Request) {
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as CompleteProvisioningBody;
    const task = hcmFacade.completeProvisioning(
      body.processId,
      body.provisioningType,
      context,
    );
    return hcmOk(task);
  } catch (error) {
    return hcmFromError(error, "PROVISIONING_COMPLETE_ERROR");
  }
}

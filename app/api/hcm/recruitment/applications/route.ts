import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmCreated, hcmFromError } from "@/lib/hcm/api";
import type { CreateApplicationInput } from "@/lib/hcm/recruitment/services/RecruitmentService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as CreateApplicationInput;
    const application = hcmFacade.createApplication(body, context);
    return hcmCreated(application);
  } catch (error) {
    return hcmFromError(error, "APPLICATION_CREATE_ERROR");
  }
}

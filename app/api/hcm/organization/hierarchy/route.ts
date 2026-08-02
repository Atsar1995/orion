import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmCreated, hcmFromError, hcmOk } from "@/lib/hcm/api";
import type { CreateReportingRelationshipInput } from "@/types/hcm-organization";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getHcmApiContext(request);
  const relationships = hcmFacade.validateHierarchy(context);
  return hcmOk({ relationships });
}

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as CreateReportingRelationshipInput;
    const relationship = hcmFacade.createReportingRelationship(body, context);
    return hcmCreated(relationship);
  } catch (error) {
    return hcmFromError(error, "HIERARCHY_CREATE_ERROR");
  }
}

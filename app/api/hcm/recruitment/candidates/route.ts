import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmCreated, hcmFromError } from "@/lib/hcm/api";
import type { RegisterCandidateInput } from "@/lib/hcm/recruitment/services/RecruitmentService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as RegisterCandidateInput;
    const candidate = hcmFacade.createCandidate(body, context);
    return hcmCreated(candidate);
  } catch (error) {
    return hcmFromError(error, "CANDIDATE_CREATE_ERROR");
  }
}

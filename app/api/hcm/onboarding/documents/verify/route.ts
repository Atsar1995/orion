import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";
import type { VerifyDocumentInput } from "@/types/hcm-onboarding";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as VerifyDocumentInput;
    const document = hcmFacade.verifyDocument(body, context);
    return hcmOk(document);
  } catch (error) {
    return hcmFromError(error, "DOCUMENT_VERIFY_ERROR");
  }
}

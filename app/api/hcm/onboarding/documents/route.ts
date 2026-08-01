import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmCreated, hcmFromError } from "@/lib/hcm/api";
import type { UploadDocumentInput } from "@/types/hcm-onboarding";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as UploadDocumentInput;
    const document = hcmFacade.uploadDocument(body, context);
    return hcmCreated(document);
  } catch (error) {
    return hcmFromError(error, "DOCUMENT_UPLOAD_ERROR");
  }
}

import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

type CompleteTaskBody = {
  readonly processId: string;
  readonly taskCode: string;
};

export async function POST(request: Request) {
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as CompleteTaskBody;
    const task = hcmFacade.completeTask(body.processId, body.taskCode, context);
    return hcmOk(task);
  } catch (error) {
    return hcmFromError(error, "ONBOARDING_TASK_ERROR");
  }
}

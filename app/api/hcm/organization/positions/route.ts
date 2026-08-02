import { hcmFacade } from "@/lib/hcm";
import {
  getHcmApiContext,
  hcmCreated,
  hcmFromError,
  hcmPaginated,
  parseOptionalString,
  parsePagination,
  resolvePagination,
} from "@/lib/hcm/api";
import type { CreatePositionInput, PositionInquiryQuery, PositionStatus } from "@/types/hcm-organization";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getHcmApiContext(request);
  const url = new URL(request.url);
  const pagination = parsePagination(url);

  const query: PositionInquiryQuery = {
    orgUnitId: parseOptionalString(url, "orgUnitId"),
    status: parseOptionalString(url, "status") as PositionStatus | undefined,
  };

  const items = hcmFacade.listPositions(query, context);
  const resolved = resolvePagination(pagination, items.length);

  return hcmPaginated(items, resolved);
}

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as CreatePositionInput;
    const position = hcmFacade.createPosition(body, context);
    return hcmCreated(position);
  } catch (error) {
    return hcmFromError(error, "POSITION_CREATE_ERROR");
  }
}

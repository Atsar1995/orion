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
import type { CreateRosterInput } from "@/types/hcm-time";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getHcmApiContext(request);
  const url = new URL(request.url);
  const pagination = parsePagination(url);

  const items = hcmFacade.roster.list(
    {
      departmentId: parseOptionalString(url, "departmentId"),
      dateFrom: parseOptionalString(url, "dateFrom"),
      dateTo: parseOptionalString(url, "dateTo"),
    },
    context,
  );

  return hcmPaginated(items, resolvePagination(pagination, items.length));
}

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as CreateRosterInput;
    const roster = hcmFacade.roster.create(body, context);
    return hcmCreated(roster);
  } catch (error) {
    return hcmFromError(error, "ROSTER_ERROR");
  }
}

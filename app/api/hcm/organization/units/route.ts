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
import type { CreateOrgUnitInput } from "@/types/hcm-organization";
import type { OrgUnitInquiryQuery, OrgUnitStatus, OrgUnitType } from "@/types/hcm-organization";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getHcmApiContext(request);
  const url = new URL(request.url);
  const pagination = parsePagination(url);

  const query: OrgUnitInquiryQuery = {
    unitType: parseOptionalString(url, "unitType") as OrgUnitType | undefined,
    parentId: parseOptionalString(url, "parentId"),
    status: parseOptionalString(url, "status") as OrgUnitStatus | undefined,
    asOfDate: parseOptionalString(url, "asOfDate"),
  };

  const items = hcmFacade.listOrgUnits(query, context);
  const resolved = resolvePagination(pagination, items.length);

  return hcmPaginated(items, resolved);
}

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as CreateOrgUnitInput;
    const unit = hcmFacade.createOrgUnit(body, context);
    return hcmCreated(unit);
  } catch (error) {
    return hcmFromError(error, "ORG_UNIT_CREATE_ERROR");
  }
}

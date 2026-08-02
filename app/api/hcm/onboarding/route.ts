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
import type {
  DocumentType,
  OnboardingProcessStatus,
  OnboardingSearchQuery,
  StartOnboardingInput,
  VerificationStatus,
} from "@/types/hcm-onboarding";

export const dynamic = "force-dynamic";

function buildOnboardingQuery(url: URL): OnboardingSearchQuery {
  const pagination = parsePagination(url);
  return {
    employeeId: parseOptionalString(url, "employeeId"),
    candidateId: parseOptionalString(url, "candidateId"),
    joiningDateFrom: parseOptionalString(url, "joiningDateFrom"),
    joiningDateTo: parseOptionalString(url, "joiningDateTo"),
    documentType: parseOptionalString(url, "documentType") as DocumentType | undefined,
    verificationStatus: parseOptionalString(url, "verificationStatus") as VerificationStatus | undefined,
    onboardingStatus: parseOptionalString(url, "status") as OnboardingProcessStatus | undefined,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}

export async function GET(request: Request) {
  const { context } = await getHcmApiContext(request);
  const url = new URL(request.url);
  const query = buildOnboardingQuery(url);
  const items = hcmFacade.searchOnboarding(query, context);
  const pagination = resolvePagination(parsePagination(url), items.length);

  return hcmPaginated(items, pagination);
}

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as StartOnboardingInput;
    const process = hcmFacade.startOnboarding(body, context);
    return hcmCreated(process);
  } catch (error) {
    return hcmFromError(error, "ONBOARDING_START_ERROR");
  }
}

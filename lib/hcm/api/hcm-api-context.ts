import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** Resolves authenticated service context for HCM API routes. */
export async function getHcmApiContext() {
  return getDecisionServiceContext();
}

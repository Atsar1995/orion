import { PROVIDER_VERSION, WORKSPACE_IDS } from "@/lib/intelligence/constants";

import type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";

import {
  crmRepository,
  crmService,
  mapCrmProviderMetrics,
} from "@/lib/crm";

import {

  mapCrmBriefExecutiveSummary,

  mapCrmBriefPlatformAlerts,

  mapCrmBriefPlatformRecommendations,

} from "@/lib/crm/mappers/brief-contribution";



function getIntelligence() {

  return crmService.getIntelligence();

}



/** Customer Intelligence Executive Provider (ADR-006 / Mission 16A.7). */

export const crmExecutiveProvider: RegisteredExecutiveProvider = {

  id: WORKSPACE_IDS.CRM,

  workspace: "Customer Intelligence",

  version: PROVIDER_VERSION,



  getHealth() {

    return getIntelligence().health.customer;

  },



  getAlerts() {

    const intelligence = getIntelligence();

    return mapCrmBriefPlatformAlerts(crmRepository, intelligence);

  },



  getRecommendations() {

    return mapCrmBriefPlatformRecommendations(getIntelligence());

  },



  getExecutiveSummary() {

    const intelligence = getIntelligence();



    return {

      headline: "Customer Intelligence",

      body: mapCrmBriefExecutiveSummary(intelligence),

      status: intelligence.signals.executiveSummary.status,

    };

  },



  getMetrics() {

    return mapCrmProviderMetrics(getIntelligence());

  },



  getRisks() {

    return mapCrmBriefPlatformAlerts(crmRepository, getIntelligence()).map((alert) => ({

      severity: alert.severity,

      message: alert.message,

      source: alert.category ?? "crm",

    }));

  },



  getPriorities() {

    return getIntelligence().recommendations.executivePriorities;

  },



  getBriefingLine() {

    return getIntelligence().brief.briefingLine;

  },



  getBriefCardSnapshot() {

    return getIntelligence().brief.snapshot;

  },

};


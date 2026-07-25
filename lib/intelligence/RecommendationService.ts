import {
  buildDashboardRecommendations,
  buildRecommendationBundle,
} from "@/lib/intelligence/recommendations/RecommendationEngine";
import type { RecommendationBundle } from "@/types/recommendations";
import type { Recommendation } from "@/types/intelligence";

/** Recommendation service — Recommendation Engine (ES-029) via Provider Framework. */
export const recommendationService = {
  async getRecommendations(): Promise<Recommendation[]> {
    return buildDashboardRecommendations();
  },

  async getRecommendationBundle(): Promise<RecommendationBundle> {
    return buildRecommendationBundle();
  },
};

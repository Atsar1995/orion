export { GA4Normalizer, type GA4RawSignals } from "@/lib/business-health/normalizers/GA4Normalizer";
export { MetaNormalizer, type MetaRawSignals } from "@/lib/business-health/normalizers/MetaNormalizer";
export { ShopifyNormalizer, type ShopifyRawSignals } from "@/lib/business-health/normalizers/ShopifyNormalizer";
export {
  buildNormalizedKPI,
  type KPISignalNormalizer,
  type NormalizationError,
  type NormalizationResult,
} from "@/lib/business-health/normalizers/types";

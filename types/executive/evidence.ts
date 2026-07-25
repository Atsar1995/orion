/** Traceable evidence attached to executive recommendations and summaries. */
export type EvidenceType =
  | "metric"
  | "event"
  | "document"
  | "integration"
  | "calendar";

export type ExecutiveEvidence = {
  id: string;
  type: EvidenceType;
  source: string;
  label: string;
  value?: string;
  capturedAt?: string;
};

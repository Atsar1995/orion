/** Clamps a numeric score to the inclusive 0–100 range. */
export function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Validates and normalizes category or KPI weights to sum to 1. */
export function normalizeWeights(weights: number[]): number[] {
  if (weights.length === 0) {
    return [];
  }

  const sanitized = weights.map((weight) =>
    Number.isFinite(weight) && weight > 0 ? weight : 0,
  );
  const total = sanitized.reduce((sum, weight) => sum + weight, 0);

  if (total <= 0) {
    const equal = 1 / weights.length;
    return weights.map(() => equal);
  }

  return sanitized.map((weight) => weight / total);
}

/** Computes weighted average from parallel values and weights. */
export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const normalized = normalizeWeights(weights.length === values.length ? weights : values.map(() => 1));
  const total = values.reduce(
    (sum, value, index) => sum + value * (normalized[index] ?? 0),
    0,
  );

  return clampScore(total);
}

/** Validates that a weight is a positive finite number. */
export function isValidWeight(weight: number): boolean {
  return Number.isFinite(weight) && weight > 0;
}

/** Computes aggregate confidence as weighted average of KPI confidences. */
export function aggregateConfidence(values: number[], weights: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const normalized = normalizeWeights(weights.length === values.length ? weights : values.map(() => 1));
  const total = values.reduce(
    (sum, value, index) => sum + clampScore(value) * (normalized[index] ?? 0),
    0,
  );

  return clampScore(total);
}

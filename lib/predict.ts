/**
 * JalRakshak AI — Water Quality Prediction Engine (TypeScript port)
 *
 * Mirrors the Python logic in JALRASHAK-AI-MODEL/api/main.py.
 * Uses threshold-based analysis for immediate predictions and
 * multi-reading trend analysis for future risk.
 */

export interface PredictionInput {
  ph: number;
  tds: number;
  conductivity: number;
  turbidity: number;
}

export interface WaterPrediction {
  water_status: "Safe" | "Unsafe";
  confidence: string;
  safety_score: number;
  risk_level: "Low" | "Moderate" | "High";
  possible_causes: string[];
  recommended_actions: string[];
  future_risk: string;
}

// Ring buffer for trend analysis (mirrors Python `reading_history`)
const readingHistory: PredictionInput[] = [];

function calculateSafetyScore(
  ph: number,
  tds: number,
  conductivity: number,
  turbidity: number
): number {
  let score = 100;

  if (turbidity > 5) score -= 30;
  if (tds > 500) score -= 25;
  if (ph < 6.5 || ph > 8.5) score -= 20;
  if (conductivity > 600) score -= 15;

  return Math.max(score, 0);
}

function detectCauses(
  ph: number,
  tds: number,
  conductivity: number,
  turbidity: number
): string[] {
  const causes: string[] = [];

  if (turbidity > 5)
    causes.push("High turbidity detected (possible sediment contamination or soil runoff)");
  if (tds > 500)
    causes.push("High TDS detected (possible industrial waste or mineral contamination)");
  if (ph < 6.5)
    causes.push("Water is acidic (possible chemical contamination or acid rain)");
  if (ph > 8.5)
    causes.push("Water is alkaline (possible waste discharge or mineral imbalance)");
  if (conductivity > 600)
    causes.push("High conductivity detected (excess dissolved salts in water)");

  if (causes.length === 0)
    causes.push("No major contamination indicators detected");

  return causes;
}

function recommendActions(
  ph: number,
  tds: number,
  conductivity: number,
  turbidity: number
): string[] {
  const actions: string[] = [];

  if (turbidity > 5)
    actions.push("Use sediment filtration or allow water to settle before use");
  if (tds > 500)
    actions.push("Install reverse osmosis (RO) purification system");
  if (ph < 6.5 || ph > 8.5)
    actions.push("Test water for chemical pollutants and adjust pH levels");
  if (conductivity > 600)
    actions.push("Investigate possible industrial discharge near the water source");

  if (actions.length === 0)
    actions.push("Water quality appears stable. Continue regular monitoring.");

  return actions;
}

function getRiskLevel(score: number): "Low" | "Moderate" | "High" {
  if (score >= 80) return "Low";
  if (score >= 50) return "Moderate";
  return "High";
}

function futureRiskAnalysis(input: PredictionInput): string {
  readingHistory.push(input);
  if (readingHistory.length > 5) readingHistory.shift();

  if (readingHistory.length < 3)
    return "Insufficient data for trend prediction";

  const turbidityVals = readingHistory.map((r) => r.turbidity);
  if (turbidityVals[turbidityVals.length - 1] > turbidityVals[0] + 2)
    return "Turbidity rising rapidly – contamination risk increasing";

  const tdsVals = readingHistory.map((r) => r.tds);
  if (tdsVals[tdsVals.length - 1] > tdsVals[0] + 100)
    return "TDS increasing – possible chemical contamination developing";

  return "Water parameters stable";
}

/**
 * Calculates confidence based on distance from safe/unsafe thresholds.
 * Higher confidence when parameters are clearly safe or clearly unsafe.
 */
function calculateConfidence(score: number): string {
  const distFromBoundary = Math.abs(score - 50);
  const confidence = Math.min(50 + distFromBoundary * 0.8, 97);
  return `${confidence.toFixed(1)}%`;
}

export function predictWaterQuality(input: PredictionInput): WaterPrediction {
  const { ph, tds, conductivity, turbidity } = input;

  const score = calculateSafetyScore(ph, tds, conductivity, turbidity);
  const causes = detectCauses(ph, tds, conductivity, turbidity);
  const actions = recommendActions(ph, tds, conductivity, turbidity);
  const risk = getRiskLevel(score);
  const future_risk = futureRiskAnalysis(input);
  const confidence = calculateConfidence(score);

  // Mirrors the Python API: unsafe if score < 50 regardless of model output
  const water_status: "Safe" | "Unsafe" = score < 50 ? "Unsafe" : "Safe";

  return {
    water_status,
    confidence,
    safety_score: score,
    risk_level: risk,
    possible_causes: causes,
    recommended_actions: actions,
    future_risk,
  };
}

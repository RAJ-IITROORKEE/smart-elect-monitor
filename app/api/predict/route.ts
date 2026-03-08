/**
 * POST /api/predict
 * Runs the water quality prediction model.
 *
 * Body: { ph: number, tds: number, conductivity: number, turbidity: number }
 * Returns: WaterPrediction
 */

import { NextRequest, NextResponse } from "next/server";
import { predictWaterQuality } from "@/lib/predict";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ph = parseFloat(String(body.ph));
  const tds = parseFloat(String(body.tds));
  const conductivity = parseFloat(String(body.conductivity));
  const turbidity = parseFloat(String(body.turbidity));

  if ([ph, tds, conductivity, turbidity].some(isNaN)) {
    return NextResponse.json(
      { error: "Invalid input: ph, tds, conductivity, turbidity must be numbers" },
      { status: 400 }
    );
  }

  const prediction = predictWaterQuality({ ph, tds, conductivity, turbidity });

  return NextResponse.json(prediction);
}

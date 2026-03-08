/**
 * POST /api/predict
 * Runs the water quality prediction model.
 *
 * Attempts to call the Railway-hosted FastAPI model (FASTAPI_URL env var).
 * Falls back to the built-in TypeScript engine if the env var is not set
 * or if the upstream call fails (keeps the app functional during dev / cold starts).
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

  // ── Azure FastAPI path ─────────────────────────────────────────────────────
  const fastapiUrl = process.env.FASTAPI_URL;
  if (fastapiUrl) {
    try {
      const params = new URLSearchParams({
        ph: String(ph),
        tds: String(tds),
        conductivity: String(conductivity),
        turbidity: String(turbidity),
      });
      const upstream = await fetch(`${fastapiUrl}/predict?${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000), // 8 s hard timeout
      });

      if (upstream.ok) {
        const data = await upstream.json();
        return NextResponse.json({ ...data, engine: "railway" });
      }
      console.warn(`[predict] Azure FastAPI returned ${upstream.status} — falling back to TypeScript engine`);
    } catch (err) {
      console.warn("[predict] Azure FastAPI unreachable — falling back to TypeScript engine", err);
    }
  }

  // ── TypeScript fallback engine ─────────────────────────────────────────────
  const prediction = predictWaterQuality({ ph, tds, conductivity, turbidity });
  return NextResponse.json({ ...prediction, engine: "typescript" });
}

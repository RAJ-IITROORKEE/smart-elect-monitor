/**
 * GET /api/db-test
 * Quick connectivity check — returns DB state and a device + reading count.
 * Remove or protect this endpoint before going to production.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [deviceCount, readingCount] = await Promise.all([
      prisma.device.count(),
      prisma.reading.count(),
    ]);

    return NextResponse.json({
      status: "ok",
      db: "connected",
      devices: deviceCount,
      readings: readingCount,
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 }
    );
  }
}

/**
 * Device Context API Route
 * GET /api/device/[deviceId]/context
 * 
 * Returns comprehensive device data for AI context including:
 * - Device metadata
 * - Historical readings (last 500)
 * - Calculated statistics
 */

import { getDeviceContext } from "@/lib/device-context-cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const forceRefresh = req.nextUrl.searchParams.get("forceRefresh") === "true";
    const context = await getDeviceContext(deviceId, forceRefresh);

    if (!context) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      device: context.device,
      readings: context.readings,
      stats: context.stats,
    });
  } catch (error) {
    console.error("Error fetching device context:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET  /api/admin/devices  — list all devices
 * POST /api/admin/devices  — create a new device
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateDeviceContextCache } from "@/lib/device-context-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ status: "ok", data: devices });
  } catch (err) {
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, deviceName } = body as { deviceId?: string; deviceName?: string };

    if (!deviceId || typeof deviceId !== "string" || !deviceId.trim()) {
      return NextResponse.json(
        { status: "error", message: "deviceId is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.device.findUnique({ where: { deviceId: deviceId.trim() } });
    if (existing) {
      return NextResponse.json(
        { status: "error", message: `Device "${deviceId}" already exists` },
        { status: 409 }
      );
    }

    const device = await prisma.device.create({
      data: {
        deviceId: deviceId.trim(),
        deviceName: (deviceName?.trim() || deviceId.trim()),
        isActive: true,
        lastSeen: new Date(),
        totalReadings: 0,
      },
    });

    invalidateDeviceContextCache(device.deviceId);

    return NextResponse.json({ status: "ok", data: device }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
  }
}

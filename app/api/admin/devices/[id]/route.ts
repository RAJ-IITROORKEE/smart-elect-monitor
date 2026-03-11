/**
 * PUT    /api/admin/devices/[id]  — update device name / active status
 * DELETE /api/admin/devices/[id]  — delete device and all its readings
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { deviceName, isActive } = body as { deviceName?: string; isActive?: boolean };

    const device = await prisma.device.findUnique({ where: { deviceId: id } });
    if (!device) {
      return NextResponse.json({ status: "error", message: "Device not found" }, { status: 404 });
    }

    const updated = await prisma.device.update({
      where: { deviceId: id },
      data: {
        ...(deviceName !== undefined && { deviceName: deviceName.trim() }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ status: "ok", data: updated });
  } catch (err) {
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const device = await prisma.device.findUnique({ where: { deviceId: id } });
    if (!device) {
      return NextResponse.json({ status: "error", message: "Device not found" }, { status: 404 });
    }

    // Delete all readings for this device first, then the device
    const [deletedReadings] = await prisma.$transaction([
      prisma.reading.deleteMany({ where: { deviceId: id } }),
      prisma.device.delete({ where: { deviceId: id } }),
    ]);

    return NextResponse.json({
      status: "ok",
      message: `Device "${id}" and ${deletedReadings.count} readings deleted.`,
    });
  } catch (err) {
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
  }
}

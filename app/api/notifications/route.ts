import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface Notification {
  id: string;
  deviceId: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  temperature?: number;
  humidity?: number;
  occupied?: boolean;
  ledEnabled?: boolean;
  pirEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const dynamic = "force-dynamic";

// GET: Retrieve notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const deviceId = searchParams.get("device_id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const severity = searchParams.get("severity");

    // Build where clause
    const where: any = {};
    if (status && ["active", "acknowledged", "resolved"].includes(status)) {
      where.status = status;
    }
    if (deviceId) {
      where.deviceId = deviceId;
    }
    if (severity && ["info", "warning", "error"].includes(severity)) {
      where.severity = severity;
    }

    // Fetch notifications from MongoDB
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { 
          ...where,
          status: "active" 
        } 
      }),
    ]);

    // Format notifications for frontend
    const formattedNotifications: Notification[] = notifications.map(n => ({
      id: n.id,
      deviceId: n.deviceId,
      type: n.type,
      title: n.title,
      message: n.message,
      severity: n.severity,
      status: n.status,
      temperature: n.temperature ?? undefined,
      humidity: n.humidity ?? undefined,
      occupied: n.occupied ?? undefined,
      ledEnabled: n.ledEnabled ?? undefined,
      pirEnabled: n.pirEnabled ?? undefined,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      count: formattedNotifications.length,
      total,
      unread: unreadCount,
      notifications: formattedNotifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH: Update notification status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      );
    }

    if (!["active", "acknowledged", "resolved"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be: active, acknowledged, or resolved" },
        { status: 400 }
      );
    }

    // Update in MongoDB
    const notification = await prisma.notification.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: "Notification status updated",
      notification: {
        id: notification.id,
        deviceId: notification.deviceId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        severity: notification.severity,
        status: notification.status,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error updating notification status:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update notification status" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Delete from MongoDB
    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}

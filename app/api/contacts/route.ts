import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "acknowledged" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export const dynamic = "force-dynamic";

// POST: Submit a new contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Create new submission in MongoDB
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject ? subject.trim() : "General Inquiry",
        message: message.trim(),
        status: "new",
      },
    });

    console.log(`📬 New contact submission from: ${name} (${email})`);

    return NextResponse.json(
      { 
        success: true, 
        message: "Contact form submitted successfully",
        id: inquiry.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to process contact form" },
      { status: 500 }
    );
  }
}

// GET: Retrieve all contact submissions (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = {};
    if (status && (status === "new" || status === "acknowledged" || status === "resolved")) {
      where.status = status;
    }

    // Fetch submissions from MongoDB
    const [submissions, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.contactInquiry.count({ where }),
    ]);

    // Format submissions for frontend
    const formattedSubmissions: ContactSubmission[] = submissions.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      subject: s.subject,
      message: s.message,
      status: s.status as "new" | "acknowledged" | "resolved",
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      count: formattedSubmissions.length,
      total,
      submissions: formattedSubmissions,
    });
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact submissions" },
      { status: 500 }
    );
  }
}

// PATCH: Update submission status
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

    if (!["new", "acknowledged", "resolved"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be: new, acknowledged, or resolved" },
        { status: 400 }
      );
    }

    // Update in MongoDB
    const inquiry = await prisma.contactInquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: "Submission status updated",
      submission: {
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        subject: inquiry.subject,
        message: inquiry.message,
        status: inquiry.status,
        createdAt: inquiry.createdAt.toISOString(),
        updatedAt: inquiry.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error updating submission status:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update submission status" },
      { status: 500 }
    );
  }
}

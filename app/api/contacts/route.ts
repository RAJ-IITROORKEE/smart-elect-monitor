import { NextRequest, NextResponse } from "next/server";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  status: "new" | "read" | "responded";
}

// In-memory storage for contact submissions
const contactSubmissions: ContactSubmission[] = [];

// POST: Submit a new contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

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

    // Create new submission
    const submission: ContactSubmission = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
      status: "new",
    };

    // Store submission (at the beginning to show newest first)
    contactSubmissions.unshift(submission);

    // Keep only last 100 submissions
    if (contactSubmissions.length > 100) {
      contactSubmissions.splice(100);
    }

    console.log(`📬 New contact submission from: ${name} (${email})`);

    return NextResponse.json(
      { 
        success: true, 
        message: "Contact form submitted successfully",
        id: submission.id 
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

    let filteredSubmissions = [...contactSubmissions];

    // Filter by status if provided
    if (status && (status === "new" || status === "read" || status === "responded")) {
      filteredSubmissions = filteredSubmissions.filter(s => s.status === status);
    }

    // Apply limit
    filteredSubmissions = filteredSubmissions.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: filteredSubmissions.length,
      total: contactSubmissions.length,
      submissions: filteredSubmissions,
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

    if (!["new", "read", "responded"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const submission = contactSubmissions.find(s => s.id === id);

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    submission.status = status;

    return NextResponse.json({
      success: true,
      message: "Submission status updated",
      submission,
    });
  } catch (error) {
    console.error("Error updating submission status:", error);
    return NextResponse.json(
      { error: "Failed to update submission status" },
      { status: 500 }
    );
  }
}

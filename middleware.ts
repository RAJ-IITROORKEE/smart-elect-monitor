import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith("/admin");
  if (!isAdminPath) return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

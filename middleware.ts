import { NextRequest, NextResponse } from "next/server";
import { getAdminIdentityFromToken } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const adminIdentity = await getAdminIdentityFromToken(token);
      if (!adminIdentity) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

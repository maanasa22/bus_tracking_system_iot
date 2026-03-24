import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  
  // Natively reconstruct the true external proxy URL because custom Node.js servers 
  // drop `X-Forwarded-Host` context during req.url population.
  const forwardedHost = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const forwardedProto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(':', '');
  const baseUrl = `${forwardedProto}://${forwardedHost}`;

  // Public routes
  const publicRoutes = ["/auth/login", "/auth/register"];
  if (publicRoutes.includes(pathname)) {
    if (isLoggedIn) {
      // Redirect to appropriate portal
      const redirectUrl = getRedirectUrl(role);
      return NextResponse.redirect(new URL(redirectUrl, baseUrl));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", baseUrl));
  }

  // Role-based route protection
  if (pathname.startsWith("/driver") && role !== "DRIVER" && role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  if (pathname.startsWith("/student") && role !== "STUDENT" && role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  // Admin routes — only ADMIN and SUPER_ADMIN
  if (
    !pathname.startsWith("/driver") &&
    !pathname.startsWith("/student") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/auth") &&
    role !== "ADMIN" &&
    role !== "SUPERADMIN"
  ) {
    const redirectUrl = getRedirectUrl(role);
    return NextResponse.redirect(new URL(redirectUrl, baseUrl));
  }

  return NextResponse.next();
});

function getRedirectUrl(role?: string | null): string {
  switch (role) {
    case "DRIVER":
      return "/driver";
    case "STUDENT":
      return "/student";
    default:
      return "/";
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|socket.io).*)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/admin/login"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login"];

// Admin auth routes that should redirect to admin dashboard if authenticated
const adminAuthRoutes = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for access token in cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthenticated = !!accessToken;

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));

  // Check if it's a country auth route (login)
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // Check if it's an admin auth route
  const isAdminAuthRoute = adminAuthRoutes.some((route) => pathname === route);

  // Check if it's an admin route
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminAuthRoute;

  // If user is authenticated and trying to access country login, redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is authenticated and trying to access admin login, redirect to admin dashboard
  if (isAuthenticated && isAdminAuthRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // If user is not authenticated and trying to access admin routes, redirect to admin login
  if (!isAuthenticated && isAdminRoute) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is not authenticated and trying to access other protected routes, redirect to country login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};

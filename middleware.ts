import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const blockedRoutes = ["/documents", "/invitations", "/travel"];

  if (blockedRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/updating", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/documents", "/invitations", "/travel"],
};

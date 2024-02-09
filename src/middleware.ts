// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Clone the request headers to modify them
  const requestHeaders = new Headers(request.headers);
  const twitterSession = request.cookies.get("twitter_session")?.value;

  // Add cache control headers to prevent caching for auth routes
  if (request.nextUrl.pathname.startsWith("/api/auth/twitter")) {
    requestHeaders.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    requestHeaders.set("Pragma", "no-cache");
    requestHeaders.set("Expires", "0");
  }

  // Handle authentication routes
  if (request.nextUrl.pathname.startsWith("/auth/twitter")) {
    const returnUrl =
      request.cookies.get("returnUrl")?.value || "/content/compose/twitter";
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Set return URL cookie
    response.cookies.set("returnUrl", returnUrl, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    // Add CORS headers for auth routes
    if (request.nextUrl.pathname.startsWith("/api/auth/twitter")) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Origin",
        process.env.NEXT_PUBLIC_BASE_URL || "*"
      );
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
      );
    }

    return response;
  }

  // Handle protected routes
  if (
    !twitterSession &&
    request.nextUrl.pathname.startsWith("/content/compose")
  ) {
    const loginUrl = new URL("/auth/twitter", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Default response for all other routes
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/content/compose/:path*",
    "/auth/twitter",
    "/api/auth/twitter/:path*",
  ],
};

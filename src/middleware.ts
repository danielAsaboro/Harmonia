// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// middleware.ts
export function middleware(request: NextRequest) {
  const twitterSession = request.cookies.get("twitter_session")?.value;

  if (request.nextUrl.pathname.startsWith("/auth/twitter")) {
    const returnUrl =
      request.cookies.get("returnUrl")?.value || "/content/compose/twitter";
    const response = NextResponse.next();
    response.cookies.set("returnUrl", returnUrl, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }

  if (
    !twitterSession &&
    request.nextUrl.pathname.startsWith("/content/compose")
  ) {
    const loginUrl = new URL("/auth/twitter", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/content/compose/:path*", "/auth/twitter"],
};

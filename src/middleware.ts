// // /middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   // Check for twitter tokens in the session
//   const twitterTokens = request.cookies.get("twitter_tokens")?.value;

//   // If accessing editor routes without auth, redirect to auth page
//   if (
//     !twitterTokens &&
//     request.nextUrl.pathname.startsWith("/content/compose")
//   ) {
//     const loginUrl = new URL("/auth/twitter", request.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: "/content/compose/:path*",
// };

// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for twitter tokens in the session
  const twitterTokens = request.cookies.get("twitter_tokens")?.value;

  // Store return URL in a cookie for authentication flow
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

  // If accessing editor routes without auth, redirect to auth page
  if (
    !twitterTokens &&
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

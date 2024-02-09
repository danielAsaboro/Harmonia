// // /app/api/auth/twitter/callback/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { TwitterApi } from "twitter-api-v2";
// import { getSession } from "@/lib/session";

// const CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
// const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;
// const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL!;

// export async function GET(request: NextRequest) {
//   console.log("🔍 Callback Route Hit");
//   console.log("Full URL:", request.url);

//   const searchParams = request.nextUrl.searchParams;
//   const state = searchParams.get("state");
//   const code = searchParams.get("code");

//   const session = await getSession(request);

//   const codeVerifier = session.get("codeVerifier");
//   const sessionState = session.get("state");

//   // Retrieve the return URL from cookies
//   const returnUrl =
//     request.cookies.get("returnUrl")?.value || "/content/compose/twitter";

//   console.log("Return URL:", returnUrl);

//   if (!codeVerifier || !state || !sessionState || !code) {
//     console.error("❌ Authentication Failed: Missing Parameters", {
//       codeVerifier: !!codeVerifier,
//       state: !!state,
//       sessionState: !!sessionState,
//       code: !!code,
//     });

//     return new NextResponse("Authentication failed: Missing parameters", {
//       status: 400,
//     });
//   }

//   if (state !== sessionState) {
//     console.error("❌ State Mismatch", {
//       expectedState: sessionState,
//       receivedState: state,
//     });

//     return new NextResponse("Authentication failed: Invalid state", {
//       status: 400,
//     });
//   }

//   try {
//     console.log("🔐 Attempting OAuth Login");

//     const client = new TwitterApi({
//       clientId: CLIENT_ID,
//       clientSecret: CLIENT_SECRET,
//     });

//     const { accessToken, refreshToken, expiresIn } =
//       await client.loginWithOAuth2({
//         code,
//         codeVerifier,
//         redirectUri: CALLBACK_URL,
//       });

//     console.log("🎉 OAuth Login Successful");

//     // Fetch user data immediately after successful auth
//     const twitterClient = new TwitterApi(accessToken);
//     const { data: userObject } = await twitterClient.v2.me({
//       "user.fields": [
//         "name",
//         "username",
//         "profile_image_url",
//         "verified",
//         "verified_type",
//       ],
//     });

//     const sessionData: TwitterSessionData = {
//       tokens: {
//         accessToken,
//         refreshToken,
//         expiresAt: Date.now() + expiresIn * 1000,
//       },
//       userData: {
//         id: userObject.id,
//         name: userObject.name,
//         username: userObject.username,
//         profile_image_url: userObject.profile_image_url,
//         verified: userObject.verified,
//         verified_type: userObject.verified_type,
//         fetchedAt: Date.now(),
//       },
//     };

//     // Create the response with redirect
//     const response = NextResponse.redirect(new URL(returnUrl, request.url));

//     // Set the cookie correctly using NextResponse
//     // Store everything in both cookie and session
//     response.cookies.set({
//       name: "twitter_session",
//       value: JSON.stringify(sessionData),
//       expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//     });

//     await session.update("twitter_session", JSON.stringify(sessionData));

//     console.log("🔐 Tokens Updated in Session");

//     // Redirect to the stored return URL or default
//     const redirectUrl = new URL(returnUrl, request.url);
//     console.log("🚀 Redirecting to:", redirectUrl.toString());

//     return response;
//   } catch (error) {
//     console.error("❌ Authentication Error:", error);
//     return new NextResponse("Authentication failed: Invalid credentials", {
//       status: 403,
//     });
//   }
// }

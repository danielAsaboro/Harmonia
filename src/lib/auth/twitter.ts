// lib/auth/twitter.ts
import { TwitterApi } from "twitter-api-v2";
import { getSession } from "../session";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface OAuth2State {
  oauth1Token: string;
  oauth1Secret: string;
  codeVerifier: string;
  state: string;
}

// Helper function to safely parse JSON
function safeJSONParse(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    console.error("Attempted to parse:", str);
    return null;
  }
}

async function setAuthStateCookie(stateData: OAuth2State) {
  try {
    const cookieStore = await cookies();
    const serializedData = JSON.stringify(stateData);

    cookieStore.set("twitter_auth_state", serializedData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });
  } catch (e) {
    console.error("Error setting auth state cookie:", e);
    throw e;
  }
}

export async function initiateTwitterAuth(request: NextRequest) {
  try {
    const oauth1Client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
    });

    const oauth1AuthLink = await oauth1Client.generateAuthLink(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/twitter/oauth1/callback`,
      { linkMode: "authorize" }
    );

    const oauth2Client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const {
      url: oauth2Url,
      state,
      codeVerifier,
    } = oauth2Client.generateOAuth2AuthLink(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/twitter/oauth2/callback`,
      {
        scope: [
          "tweet.read",
          "tweet.write",
          "tweet.moderate.write",
          "users.read",
          "follows.read",
          "follows.write",
          "offline.access",
          "like.read",
          "like.write",
        ],
      }
    );

    // Create and store state data
    const stateData: OAuth2State = {
      oauth1Token: oauth1AuthLink.oauth_token,
      oauth1Secret: oauth1AuthLink.oauth_token_secret,
      codeVerifier,
      state,
    };

    await setAuthStateCookie(stateData);

    // Return the auth URL
    return NextResponse.json({
      url: oauth1AuthLink.url,
    });
  } catch (error) {
    console.error("Error initiating Twitter auth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Twitter authentication" },
      { status: 500 }
    );
  }
}

export async function handleOAuth1Callback(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const oauth_token = searchParams.get("oauth_token");
    const oauth_verifier = searchParams.get("oauth_verifier");

    if (!oauth_token || !oauth_verifier) {
      throw new Error("Missing OAuth 1.0a tokens");
    }

    const cookieStore = await cookies();
    const stateCookie = cookieStore.get("twitter_auth_state");

    if (!stateCookie?.value) {
      throw new Error("No state data found");
    }

    const stateData = safeJSONParse(stateCookie.value);

    if (!stateData || stateData.oauth1Token !== oauth_token) {
      throw new Error("Invalid state or OAuth1 token mismatch");
    }

    const oauth1Client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: oauth_token,
      accessSecret: stateData.oauth1Secret,
    });

    const { accessToken: oauth1AccessToken, accessSecret: oauth1AccessSecret } =
      await oauth1Client.login(oauth_verifier);

    // Update state data
    const updatedStateData: OAuth2State = {
      ...stateData,
      oauth1Token: oauth1AccessToken,
      oauth1Secret: oauth1AccessSecret,
    };

    await setAuthStateCookie(updatedStateData);

    const oauth2Client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    // Generate OAuth 2.0 auth link using just the necessary parameters
    const { url, codeVerifier, state } = oauth2Client.generateOAuth2AuthLink(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/twitter/oauth2/callback`,
      {
        scope: [
          "tweet.read",
          "tweet.write",
          "tweet.moderate.write",
          "users.read",
          "follows.read",
          "follows.write",
          "offline.access",
          "like.read",
          "like.write",
        ],
        state: stateData.state,
      }
    );

    // Store verifier and state in session with enhanced validation
    const session = await getSession(request);
    if (!codeVerifier || !state) {
      throw new Error("Failed to generate authentication parameters");
    }

    session.set("codeVerifier", codeVerifier);
    session.set("state", state);

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error handling OAuth 1.0a callback:", error);
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/auth/error?error=OAuth1Failed&message=${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function handleOAuth2Callback(request: NextRequest) {
  try {
    console.log("🔍 Callback Route Hit");
    console.log("Full URL:", request.url);

    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get("state");
    const code = searchParams.get("code");

    const session = await getSession(request);

    const codeVerifier = session.get("codeVerifier");
    const sessionState = session.get("state");

    // Retrieve the return URL from cookies
    const returnUrl =
      request.cookies.get("returnUrl")?.value || "/content/compose/twitter";

    if (!codeVerifier || !state || !sessionState || !code) {
      console.error(
        "❌ Authentication Failed: Missing Parameters {OAuth 2.0 state or code}",
        {
          codeVerifier: !!codeVerifier,
          state: !!state,
          sessionState: !!sessionState,
          code: !!code,
        }
      );

      return new NextResponse("Authentication failed: Missing parameters", {
        status: 400,
      });
    }

    // just added
    if (state !== sessionState) {
      console.error("❌ State Mismatch", {
        expectedState: sessionState,
        receivedState: state,
      });

      return new NextResponse("Authentication failed: Invalid state", {
        status: 400,
      });
    }

    const cookieStore = await cookies();
    const stateCookie = cookieStore.get("twitter_auth_state");

    if (!stateCookie?.value) {
      throw new Error("No state data found");
    }

    const stateData = safeJSONParse(stateCookie.value);

    if (!stateData || stateData.state !== state) {
      throw new Error("Invalid state");
    }

    console.log("🔐 Attempting OAuth Login");
    const oauth2Client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    console.log("success setting up oauth 2.0 client");
    const {
      accessToken: oauth2AccessToken,
      refreshToken: oauth2RefreshToken,
      expiresIn,
    } = await oauth2Client.loginWithOAuth2({
      code,
      // codeVerifier: stateData.codeVerifier,
      codeVerifier,
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/twitter/oauth2/callback`,
    });

    console.log("🎉 OAuth Login Successful");

    // Get user data
    const loggedClient = new TwitterApi(oauth2AccessToken);
    const { data: userData } = await loggedClient.v2.me({
      "user.fields": [
        "name",
        "username",
        "profile_image_url",
        "verified",
        "verified_type",
      ],
    });

    // Create session data
    const sessionData = {
      tokens: {
        accessToken: oauth2AccessToken,
        refreshToken: oauth2RefreshToken,
        expiresAt: Date.now() + expiresIn * 1000,
        oauth1AccessToken: stateData.oauth1Token,
        oauth1AccessSecret: stateData.oauth1Secret,
      },
      userData,
    };

    // Set session cookie
    cookieStore.set("twitter_session", JSON.stringify(sessionData), {
      httpOnly: true,
      value: JSON.stringify(sessionData),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    await session.update("twitter_session", JSON.stringify(sessionData));

    // Clean up state cookie
    cookieStore.delete("twitter_auth_state");

    // Redirect to the stored return URL or default
    const redirectUrl = new URL(returnUrl, request.url);
    console.log("🚀 Redirecting to:", redirectUrl.toString());

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("Error handling OAuth 2.0 callback:", error);
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/auth/error?error=OAuth2Failed&message=${
        error.message || "Unknown error"
      }`
    );
  }
}

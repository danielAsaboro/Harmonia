// /app/api/auth/twitter/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTwitterClient } from "@/lib/twitter";
import { error } from "console";


export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    const sessionData = session.get("twitter_session");

    if (!sessionData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { tokens, userData } = JSON.parse(sessionData) as TwitterSessionData;
    const now = Date.now();

    // Check if we have valid cached user data
    const duration = process.env.USER_CACHE_DURATION;
    if (!duration) throw error;
    if (userData && now - userData.fetchedAt < parseInt(duration)) {
      return NextResponse.json(userData);
    }

    // If we reach here, we need to fetch fresh data
    const client = await getTwitterClient(sessionData, request);
    const { data: userObject } = await client.v2.me({
      "user.fields": [
        "name",
        "username",
        "profile_image_url",
        "verified",
        "verified_type",
      ],
    });

    // Update the cached data
    const newUserData: TwitterUserData = {
      id: userObject.id,
      name: userObject.name,
      username: userObject.username,
      profile_image_url: userObject.profile_image_url,
      verified: userObject.verified,
      verified_type: userObject.verified_type,
      fetchedAt: now,
    };

    const newSessionData: TwitterSessionData = {
      tokens,
      userData: newUserData,
    };

    // Update both session and cookie
    await session.update("twitter_session", JSON.stringify(newSessionData));

    // Also update the cookie directly
    const response = NextResponse.json(newUserData);
    response.cookies.set({
      name: "twitter_session",
      value: JSON.stringify(newSessionData),
      expires: new Date(now + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

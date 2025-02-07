// /app/api/auth/twitter/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getTwitterClient } from "@/lib/twitter";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    const tokens = session.get("twitter_tokens");

    if (!tokens) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // todo
    const client = await getTwitterClient(tokens, request);
    const { data: userObject } = await client.v2.me({
      "user.fields": [
        "name",
        "username",
        "profile_image_url",
        "verified",
        "verified_type",
      ],
    });

    console.log("got user id, fr ", userObject.id);

    return NextResponse.json({
      id: userObject.id,
      name: userObject.name,
      username: userObject.username,
      profile_image_url: userObject.profile_image_url,
      verified: userObject.verified,
      verified_type: userObject.verified_type,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

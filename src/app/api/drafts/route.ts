import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// /app/api/drafts/route.ts - For getting drafts
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("twitter_session");

    if (!sessionData?.value) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { userData } = JSON.parse(sessionData.value);

    // Get all drafts for user
    const tweets = db.getDraftTweetsForUser(userData.id);
    const threads = db.getDraftThreadsForUser(userData.id);

    return NextResponse.json({ tweets, threads });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

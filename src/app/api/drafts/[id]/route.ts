import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// /app/api/drafts/[id]/route.ts - For getting a specific draft
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("twitter_session");

    if (!sessionData?.value) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Try to find as tweet first, then as thread
    const tweet = db.getDraftTweetById(id);
    if (tweet) {
      return NextResponse.json({ type: "tweet", content: tweet });
    }

    const thread = db.getDraftThreadById(id);
    if (thread) {
      return NextResponse.json({ type: "thread", content: thread });
    }

    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

// /app/api/drafts/[id]/route.ts - For deleting a draft
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("twitter_session");

    if (!sessionData?.value) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Try to delete as both tweet and thread
    db.deleteDraftTweet(id);
    db.deleteDraftThread(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}

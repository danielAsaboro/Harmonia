import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

// POST /api/shared-draft/comment - Add a comment to a shared draft
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: paramToken } = await params;
    const session = await getSession(req);
    const sessionData = session.get("twitter_session");
    const { token, content, position } = await req.json();

    const sharedDraft = db.getSharedDraftByToken(token);
    if (!sharedDraft) {
      return NextResponse.json(
        { error: "Shared draft not found or expired" },
        { status: 404 }
      );
    }

    if (!sharedDraft.canComment) {
      return NextResponse.json(
        { error: "Comments are not enabled for this draft" },
        { status: 403 }
      );
    }

    let authorId = null;
    let authorName = "Anonymous";

    // If user is logged in, use their Twitter info
    if (sessionData) {
      const { userData } = JSON.parse(sessionData) as TwitterSessionData;
      authorId = userData.id;
      authorName = userData.name;
    }

    const comment = {
      id: nanoid(),
      sharedDraftId: sharedDraft.id,
      content,
      authorId,
      authorName,
      createdAt: new Date().toISOString(),
      position: position || null,
    };

    db.addComment(comment);

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

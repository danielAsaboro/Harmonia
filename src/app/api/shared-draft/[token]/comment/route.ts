// /app/api/shared-draft/[token]/comment/route.ts
import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db/sqlite_db_service";
import {
  draftTweetsService,
  draftThreadsService,
  scheduledThreadsService,
  sharedDraftCommentsService,
  sharedDraftsService,
  scheduledTweetsService,
  userTokensService,
} from "@/lib/services";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { getUserFromSession } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const user = await getUserFromSession();
    const body = await request.json();

    const draft = await sharedDraftsService.getSharedDraftByToken(token);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (!draft.canComment) {
      return NextResponse.json(
        { error: "Comments are disabled" },
        { status: 403 }
      );
    }

    const comment = {
      id: nanoid(),
      sharedDraftId: draft.id,
      content: body.content,
      authorId: user?.id || null,
      authorName: user?.name || "Anonymous",
      createdAt: new Date().toISOString(),
      metadata: body.metadata,
      resolved: false,
    };

    await sharedDraftCommentsService.addComment(comment);
    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

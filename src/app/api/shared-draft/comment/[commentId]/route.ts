// /app/api/shared-draft/comment/[commentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db/sqlite_db_service";
import {
  draftTweetsService,
  draftThreadsService,
  scheduledThreadsService,
  scheduledTweetsService,
  userTokensService,
  sharedDraftCommentsService,
} from "@/lib/services";
import { getUserFromSession } from "@/lib/session";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      !(await sharedDraftCommentsService.canModifyComment(commentId, user.id))
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await sharedDraftCommentsService.deleteComment(commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      !(await sharedDraftCommentsService.canModifyComment(commentId, user.id))
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    if (body.resolved) {
      await sharedDraftCommentsService.resolveComment(commentId, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

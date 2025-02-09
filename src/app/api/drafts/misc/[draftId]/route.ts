// /app/api/drafts/[draftId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;
    const sharedDraft = db.getSharedDraft(draftId);

    if (!sharedDraft) {
      return NextResponse.json(
        { error: "Draft not found or expired" },
        { status: 404 }
      );
    }

    // Increment view count
    db.updateSharedDraftViewCount(draftId);

    let content: any = null;
    let user = null;
    let comments: any[] = [];

    if (sharedDraft.tweetId) {
      content = db.getTweetById(sharedDraft.tweetId);
    } else if (sharedDraft.threadId) {
      content = db.getThreadById(sharedDraft.threadId);
    }

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Get user info
    const contentId = sharedDraft.tweetId || sharedDraft.threadId;
    if (contentId) {
      user = db.getUserByContentId(contentId);
    }

    // Fetch comments if allowed
    if (sharedDraft.allowComments) {
      comments = db.getCommentsForDraft(sharedDraft.id);
    }

    return NextResponse.json({
      id: sharedDraft.id,
      allowComments: sharedDraft.allowComments,
      viewCount: sharedDraft.viewCount,
      content,
      comments,
      userName: user?.name,
      userHandle: user?.username,
      userImage: user?.profileImageUrl,
      createdAt: sharedDraft.createdAt,
    });
  } catch (error) {
    console.error("Error fetching shared draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

// export async function POST(
//   request: NextRequest,
//   { params }: { params: { draftId: string } }
// ) {
//   try {
//     const sharedDraft = db.getSharedDraft(draftId);

//     if (!sharedDraft || !sharedDraft.allowComments) {
//       return NextResponse.json(
//         { error: "Comments not allowed for this draft" },
//         { status: 403 }
//       );
//     }

//     const { content, authorName, authorEmail } = await request.json();

//     // Basic validation
//     if (!content || !authorName) {
//       return NextResponse.json(
//         { error: "Content and author name are required" },
//         { status: 400 }
//       );
//     }

//     const comment = {
//       id: uuidv4(),
//       sharedDraftId: sharedDraft.id,
//       content,
//       authorName,
//       authorEmail,
//       createdAt: new Date().toISOString(),
//     };

//     db.addCommentToDraft(comment);

//     return NextResponse.json({
//       message: "Comment added successfully",
//       comment,
//     });
//   } catch (error) {
//     console.error("Error adding comment:", error);
//     return NextResponse.json(
//       { error: "Failed to add comment" },
//       { status: 500 }
//     );
//   }
// }

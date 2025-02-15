// /app/api/shared-draft/[token]/route.ts
import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db/sqlite_db_service";
import {
  draftTweetsService,
  draftThreadsService,
  scheduledThreadsService,
  scheduledTweetsService,
  userTokensService,
  sharedDraftsService,
  sharedDraftCommentsService,
} from "@/lib/services";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    // First, get the shared draft info using the access token
    const sharedDraft = await sharedDraftsService.getSharedDraftByToken(token);

    if (!sharedDraft) {
      return NextResponse.json(
        { error: "Shared draft not found or expired" },
        { status: 404 }
      );
    }

    // Get the author's information from user_tokens
    const authorTokens = await userTokensService.getUserTokens(
      sharedDraft.creatorId
    );
    if (!authorTokens) {
      return NextResponse.json(
        { error: "Author information not found" },
        { status: 404 }
      );
    }

    // Then get the actual draft content based on type
    let draft;
    if (sharedDraft.draftType === "tweet") {
      draft = await draftTweetsService.getDraftTweet(
        sharedDraft.draftId,
        sharedDraft.creatorId
      );
      if (draft) {
        draft = {
          ...draft,
          authorName: authorTokens.name,
          authorHandle: `@${authorTokens.username}`,
          authorProfileUrl: authorTokens.profileImageUrl,
        };
      }
    } else {
      const threadData = await draftThreadsService.getDraftThread(
        sharedDraft.draftId,
        sharedDraft.creatorId
      );
      if (threadData) {
        // Add author info to each tweet in the thread
        const tweetsWithAuthor = threadData.tweets.map((tweet) => ({
          ...tweet,
          authorName: authorTokens.name,
          authorHandle: `@${authorTokens.username}`,
          authorProfileUrl: authorTokens.profileImageUrl,
        }));

        draft = {
          ...threadData.thread,
          tweets: tweetsWithAuthor,
          authorName: authorTokens.name,
          authorHandle: `@${authorTokens.username}`,
          authorProfileUrl: authorTokens.profileImageUrl,
        };
      }
    }

    if (!draft) {
      return NextResponse.json(
        { error: "Original draft not found or has been deleted" },
        { status: 404 }
      );
    }

    // Get comments if enabled
    const comments = sharedDraft.canComment
      ? await sharedDraftCommentsService.getComments(sharedDraft.id)
      : [];

    return NextResponse.json({
      draft,
      comments,
      canComment: sharedDraft.canComment,
      expiresAt: sharedDraft.expiresAt,
    });
  } catch (error) {
    console.error("Error fetching shared draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared draft" },
      { status: 500 }
    );
  }
}

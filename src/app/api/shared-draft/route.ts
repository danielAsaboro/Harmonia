// /app/api/shared-draft/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/sqlite_db_service";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/session";

// GET /api/shared-draft/info?draftId={draftId} - Get existing share info
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    const sessionData = session.get("twitter_session");

    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const draftId = url.searchParams.get("draftId");

    if (!draftId) {
      return NextResponse.json({ error: "Missing draftId" }, { status: 400 });
    }

    const shareInfo = db.getSharedDraftInfo(draftId);

    return NextResponse.json({ shareInfo });
  } catch (error) {
    console.error("Error fetching share info:", error);
    return NextResponse.json(
      { error: "Failed to fetch share info" },
      { status: 500 }
    );
  }
}

// POST /api/shared-draft - Create or update shared draft link
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    const sessionData = session.get("twitter_session");

    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tokens, userData } = JSON.parse(sessionData) as TwitterSessionData;
    const { draftId, draftType, canComment, expirationDays } = await req.json();

    // Validate inputs
    if (!draftId || !draftType || !expirationDays) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for existing active share
    const existingShare = db.getSharedDraftInfo(draftId);

    if (existingShare) {
      // Update settings if they changed
      if (existingShare.canComment !== canComment) {
        db.updateSharedDraftSettings(existingShare.id, canComment);
      }

      return NextResponse.json({
        sharedDraftId: existingShare.accessToken,
        isExisting: true,
      });
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Create new shared draft record with author information
    const sharedDraft = {
      id: nanoid(),
      draftId,
      draftType,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      canComment: Boolean(canComment),
      creatorId: userData.id,
      accessToken: nanoid(32),
      shareState: "active" as const,
      // Add required author information from session
      authorName: userData.name,
      authorHandle: userData.username,
      authorProfileUrl: userData.profile_image_url, // Optional field
    };

    db.createSharedDraft(sharedDraft);

    return NextResponse.json({
      sharedDraftId: sharedDraft.accessToken,
      isExisting: false,
    });
  } catch (error) {
    console.error("Error creating shared draft:", error);
    return NextResponse.json(
      { error: "Failed to create shared draft" },
      { status: 500 }
    );
  }
}

// DELETE /api/shared-draft - Revoke a shared draft
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    const sessionData = session.get("twitter_session");

    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { draftId } = await req.json();
    const shareInfo = db.getSharedDraftInfo(draftId);

    if (shareInfo) {
      db.revokeSharedDraft(shareInfo.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking shared draft:", error);
    return NextResponse.json(
      { error: "Failed to revoke shared draft" },
      { status: 500 }
    );
  }
}

// src/app/api/media/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { fileStorage, FileStorageError } from "@/lib/storage/fileStorage";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getUserId(request: NextRequest): Promise<string | null> {
  const session = await getSession(request);
  const twitterSession = session.get("twitter_session");

  if (!twitterSession) return null;

  try {
    const sessionData = JSON.parse(twitterSession);
    return sessionData.userData?.id || null;
  } catch (error) {
    console.error("Error parsing session:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Store the file
    const { id, path } = await fileStorage.storeFile(
      userId,
      buffer,
      file.type,
      file.name
    );

    // Return the file information
    return NextResponse.json({
      id,
      path,
      type: file.type,
      name: file.name,
    });
  } catch (error) {
    console.error("Error uploading file:", error);

    if (error instanceof FileStorageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json(
        { error: "No file ID provided" },
        { status: 400 }
      );
    }

    const fileData = await fileStorage.getFile(userId, fileId);

    // Create response with appropriate Content-Type
    return new NextResponse(fileData, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Error retrieving file:", error);

    if (error instanceof FileStorageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json(
        { error: "No file ID provided" },
        { status: 400 }
      );
    }

    await fileStorage.deleteFile(userId, fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);

    if (error instanceof FileStorageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

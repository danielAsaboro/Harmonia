// /app/api/media/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const sessionData = cookieStore.get("twitter_session");

    if (!sessionData?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { path: filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "No file path provided" },
        { status: 400 }
      );
    }

    // Extract filename from path and create full server path
    const filename = path.basename(filePath);
    const fullPath = path.join(UPLOADS_DIR, filename);

    // Security check - ensure the file is within uploads directory
    if (!fullPath.startsWith(UPLOADS_DIR)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    try {
      await unlink(fullPath);
    } catch (error) {
      // If file doesn't exist, we consider it a success
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

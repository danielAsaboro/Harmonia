// src/lib/utils/mediaUrl.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function getMediaUrl(
  mediaId: string,
  userId: string
): Promise<string> {
  const storageType = process.env.STORAGE_TYPE;

  if (storageType === "local") {
    // For local storage, return the path relative to public directory
    return `/media_uploads/${userId}/${mediaId}`;
  } else {
    // For S3, generate a signed URL
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `${userId}/${mediaId}`,
    });

    try {
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw new Error("Failed to generate media URL");
    }
  }
}

// Batch version for handling multiple media IDs
export async function getMediaUrls(
  mediaIds: string[],
  userId: string
): Promise<string[]> {
  return Promise.all(mediaIds.map((id) => getMediaUrl(id, userId)));
}

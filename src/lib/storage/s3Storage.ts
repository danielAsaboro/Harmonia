// src/lib/storage/s3Storage.ts
import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StorageProvider, S3StorageConfig, StorageResult } from "./types";
import { FileStorageError } from "./errors";

export class S3Storage implements StorageProvider {
  private client: S3Client;
  private config: S3StorageConfig;

  constructor(config: S3StorageConfig) {
    this.config = {
      ...config,
      allowedTypes: config.allowedTypes.map((type) => type.toLowerCase()),
    };

    this.client = new S3Client({ region: config.region });
  }

  private validateFile(file: Buffer, mimeType: string): void {
    if (!this.config.allowedTypes.includes(mimeType.toLowerCase())) {
      throw new FileStorageError(
        `File type ${mimeType} not allowed`,
        "INVALID_FILE_TYPE"
      );
    }

    if (file.length > this.config.maxFileSize) {
      throw new FileStorageError(
        `File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`,
        "FILE_TOO_LARGE"
      );
    }
  }

  private getKey(userId: string, fileId: string): string {
    return `${userId}/${fileId}`;
  }

  async storeFile(
    userId: string,
    file: Buffer,
    mimeType: string,
    fileName?: string
  ): Promise<StorageResult> {
    try {
      this.validateFile(file, mimeType);

      const fileId =
        fileName || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const key = this.getKey(userId, fileId);

      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
      });

      await this.client.send(command);

      // Generate a signed URL that expires in 1 hour
      const getCommand = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });
      const url = await getSignedUrl(this.client, getCommand, {
        expiresIn: 3600,
      });

      return {
        path: key,
        id: fileId,
        url,
      };
    } catch (error) {
      throw new FileStorageError(
        `Failed to store file: ${(error as Error).message}`,
        "FILE_STORE_ERROR"
      );
    }
  }

  async getFile(userId: string, fileId: string): Promise<string> {
    try {
      const key = this.getKey(userId, fileId);
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      // Return a signed URL instead of the actual file
      return await getSignedUrl(this.client, command, { expiresIn: 3600 });
    } catch (error) {
      throw new FileStorageError(
        `Failed to retrieve file: ${(error as Error).message}`,
        "FILE_RETRIEVE_ERROR"
      );
    }
  }

  async deleteFile(userId: string, fileId: string): Promise<void> {
    try {
      const key = this.getKey(userId, fileId);
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      throw new FileStorageError(
        `Failed to delete file: ${(error as Error).message}`,
        "FILE_DELETE_ERROR"
      );
    }
  }
}

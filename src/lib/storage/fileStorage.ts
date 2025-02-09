// src/lib/storage/fileStorage.ts

import { mkdir, writeFile, readFile, readdir, unlink } from "fs/promises";
import { join, dirname } from "path";
import { exists } from "fs";
import { promisify } from "util";
import { randomUUID } from "crypto";

const existsAsync = promisify(exists);

export class FileStorageError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "FileStorageError";
  }
}

export interface StorageConfig {
  basePath: string;
  allowedTypes: string[];
  maxFileSize: number; // in bytes
}

export class FileStorage {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = {
      ...config,
      allowedTypes: config.allowedTypes.map((type) => type.toLowerCase()),
    };
  }

  /**
   * Creates a user-specific directory for storing files
   */
  private async ensureUserDirectory(userId: string): Promise<string> {
    const userDir = join(this.config.basePath, userId);
    try {
      await mkdir(userDir, { recursive: true });
      return userDir;
    } catch (error) {
      throw new FileStorageError(
        `Failed to create user directory: ${(error as Error).message}`,
        "DIRECTORY_CREATE_ERROR"
      );
    }
  }

  /**
   * Validates file metadata before storage
   */
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

  /**
   * Stores a file in the user's directory
   */
  async storeFile(
    userId: string,
    file: Buffer,
    mimeType: string,
    fileName?: string
  ): Promise<{ path: string; id: string }> {
    try {
      this.validateFile(file, mimeType);
      const userDir = await this.ensureUserDirectory(userId);

      const fileId = randomUUID();
      const extension = mimeType.split("/")[1] || "bin";
      const storedFileName = fileName
        ? `${fileId}-${fileName}`
        : `${fileId}.${extension}`;
      // const storedFileName = `${fileId}.${extension}`;

      const filePath = join(userDir, storedFileName);
      await writeFile(filePath, file);

      return {
        path: filePath,
        // id: fileId,
        id: storedFileName,
      };
    } catch (error) {
      if (error instanceof FileStorageError) {
        throw error;
      }
      throw new FileStorageError(
        `Failed to store file: ${(error as Error).message}`,
        "FILE_STORE_ERROR"
      );
    }
  }

  /**
   * Retrieves a file from storage
   */
  async getFile(userId: string, fileId: string): Promise<Buffer> {
    const userDir = join(this.config.basePath, userId);

    try {
      // Use readdir instead of readFile to get directory contents
      const files = await readdir(userDir);
      const targetFile = files.find((file) => file.startsWith(fileId));

      if (!targetFile) {
        throw new FileStorageError("File not found", "FILE_NOT_FOUND");
      }

      const filePath = join(userDir, targetFile);
      return await readFile(filePath);
    } catch (error) {
      if (error instanceof FileStorageError) {
        throw error;
      }
      throw new FileStorageError(
        `Failed to retrieve file: ${(error as Error).message}`,
        "FILE_RETRIEVE_ERROR"
      );
    }
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(userId: string, fileId: string): Promise<void> {
    const userDir = join(this.config.basePath, userId);

    try {
      const files = await readdir(userDir);
      const targetFile = files.find((file) => file.startsWith(fileId));

      if (!targetFile) {
        throw new FileStorageError("File not found", "FILE_NOT_FOUND");
      }

      const filePath = join(userDir, targetFile);
      await unlink(filePath);
    } catch (error) {
      if (error instanceof FileStorageError) {
        throw error;
      }
      throw new FileStorageError(
        `Failed to delete file: ${(error as Error).message}`,
        "FILE_DELETE_ERROR"
      );
    }
  }
}

// Create and export default instance with common config
export const fileStorage = new FileStorage({
  basePath: process.env.STORAGE_BASE_PATH || "./public/media_uploads",
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
  ],
  maxFileSize: 5 * 1024 * 1024, // 15MB
});

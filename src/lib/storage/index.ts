// src/lib/storage/index.ts
import {
  StorageProvider,
  StorageConfig,
  S3StorageConfig,
  LocalStorageConfig,
} from "./types";
import { FileStorage as LocalFileStorage } from "./fileStorage";
import { S3Storage } from "./s3Storage";

export class StorageFactory {
  static createStorage(config: StorageConfig): StorageProvider {
    switch (config.type) {
      case "local":
        return new LocalFileStorage(config);
      case "s3":
        return new S3Storage(config);
      default:
        throw new Error(`Unsupported storage type: ${config}`);
    }
  }
}

// Usage example:
const devConfig: LocalStorageConfig = {
  type: "local",
  basePath: "./public/media_uploads",
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
  ],
  maxFileSize: 5 * 1024 * 1024, // 5MB
};

const prodConfig: S3StorageConfig = {
  type: "s3",
  region: process.env.AWS_REGION!,
  bucket: process.env.AWS_BUCKET_NAME!,
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
  ],
  maxFileSize: 5 * 1024 * 1024, // 5MB
};

export const fileStorage = StorageFactory.createStorage(
  process.env.STORAGE_TYPE === "local" ? devConfig : prodConfig
);

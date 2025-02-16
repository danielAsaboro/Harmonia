// src/lib/storage/types.ts
export interface BaseStorageConfig {
  allowedTypes: string[];
  maxFileSize: number;
}

export interface LocalStorageConfig extends BaseStorageConfig {
  type: "local";
  basePath: string;
}

export interface S3StorageConfig extends BaseStorageConfig {
  type: "s3";
  region: string;
  bucket: string;
}

export type StorageConfig = LocalStorageConfig | S3StorageConfig;

export interface StorageResult {
  path: string;
  id: string;
  url?: string;
}

export interface StorageProvider {
  storeFile(
    userId: string,
    file: Buffer,
    mimeType: string,
    fileName?: string
  ): Promise<StorageResult>;
  getFile(userId: string, fileId: string): Promise<Buffer | string>;
  deleteFile(userId: string, fileId: string): Promise<void>;
}

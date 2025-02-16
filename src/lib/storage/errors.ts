// src/lib/storage/errors.ts
export class FileStorageError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "StorageError";
  }
}

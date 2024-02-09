// // indexedDB.ts

"use client";

import { v4 as uuidv4 } from "uuid";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined" && window.indexedDB;

interface StoredMedia {
  id: string;
  data: string; // base64 encoded file data
  type: string; // mime type
  lastModified: string;
  size: number;
}

class MediaStorageService {
  private dbName = "TweetMediaDB";
  private storeName = "mediaFiles";
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (isBrowser) {
      this.initPromise = this.initDatabase().catch((error) => {
        console.error("[MediaStorage] Failed to initialize database:", error);
        throw error;
      });
    }
  }

  private initDatabase(): Promise<IDBDatabase> {
    if (!isBrowser) {
      return Promise.reject(
        new Error("IndexedDB is not available in this environment")
      );
    }

    return new Promise((resolve, reject) => {
      const checkRequest = indexedDB.open(this.dbName);

      checkRequest.onsuccess = () => {
        const currentVersion = checkRequest.result.version;
        checkRequest.result.close();

        const request = indexedDB.open(this.dbName, currentVersion + 1);

        request.onerror = () => {
          console.error(
            "[MediaStorage] Error opening database:",
            request.error
          );
          reject(request.error);
        };

        request.onblocked = () => {
          console.error(
            "[MediaStorage] Database blocked. Please close other tabs with this site open"
          );
          reject(new Error("Database blocked"));
        };

        request.onsuccess = () => {
          console.log("[MediaStorage] Database opened successfully");
          this.db = request.result;

          // Handle database connection errors
          this.db.onerror = (event) => {
            console.error(
              "[MediaStorage] Database error:",
              (event.target as IDBDatabase).onerror
            );
          };

          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          console.log("[MediaStorage] Database upgrade needed");
          const db = request.result;

          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, {
              keyPath: "id",
            });
            store.createIndex("lastModified", "lastModified", {
              unique: false,
            });
            console.log("[MediaStorage] Created object store:", this.storeName);
          }
        };
      };

      checkRequest.onerror = () => {
        console.log(
          "[MediaStorage] Initial check failed, creating new database"
        );
        const request = indexedDB.open(this.dbName, 1);

        request.onerror = () => {
          console.error(
            "[MediaStorage] Error creating database:",
            request.error
          );
          reject(request.error);
        };

        request.onblocked = () => {
          console.error("[MediaStorage] Database creation blocked");
          reject(new Error("Database creation blocked"));
        };

        request.onsuccess = () => {
          console.log("[MediaStorage] New database created successfully");
          this.db = request.result;
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, {
              keyPath: "id",
            });
            store.createIndex("lastModified", "lastModified", {
              unique: false,
            });
          }
        };
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!isBrowser) {
      throw new Error("IndexedDB is not available in this environment");
    }

    if (this.db) return this.db;

    if (!this.initPromise) {
      this.initPromise = this.initDatabase();
    }

    return this.initPromise;
  }

  async storeMediaFile(file: File): Promise<string> {
    console.log("[MediaStorage] Starting to store file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!isBrowser) {
      console.warn(
        "[MediaStorage] Not in browser environment, returning dummy ID"
      );
      return Promise.resolve(uuidv4());
    }

    try {
      const db = await this.getDB();
      const mediaId = uuidv4();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadstart = () => {
          console.log("[MediaStorage] Started reading file");
        };

        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            console.log(`[MediaStorage] Reading progress: ${progress}%`);
          }
        };

        reader.onload = async () => {
          console.log("[MediaStorage] File read complete");

          const mediaData: StoredMedia = {
            id: mediaId,
            data: reader.result as string,
            type: file.type,
            lastModified: new Date().toISOString(),
            size: file.size,
          };

          try {
            const transaction = db.transaction([this.storeName], "readwrite");

            transaction.onerror = (event) => {
              console.error(
                "[MediaStorage] Transaction error:",
                transaction.error
              );
              reject(transaction.error);
            };

            transaction.onabort = (event) => {
              console.error(
                "[MediaStorage] Transaction aborted:",
                transaction.error
              );
              reject(transaction.error);
            };

            const store = transaction.objectStore(this.storeName);
            const request = store.add(mediaData);

            request.onsuccess = () => {
              console.log(
                "[MediaStorage] File stored successfully with ID:",
                mediaId
              );
              resolve(mediaId);
            };

            request.onerror = () => {
              console.error(
                "[MediaStorage] Error storing file:",
                request.error
              );
              reject(request.error);
            };
          } catch (error) {
            console.error("[MediaStorage] Error in store transaction:", error);
            reject(error);
          }
        };

        reader.onerror = (error) => {
          console.error("[MediaStorage] Error reading file:", error);
          reject(error);
        };

        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("[MediaStorage] Top-level error in storeMediaFile:", error);
      throw error;
    }
  }

  async getMediaFile(mediaId: string): Promise<string | null> {
    console.log("[MediaStorage] Retrieving media file:", mediaId);

    if (!isBrowser) {
      console.warn("[MediaStorage] Not in browser environment");
      return Promise.resolve(null);
    }

    try {
      const db = await this.getDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.get(mediaId);

        request.onsuccess = () => {
          const media = request.result as StoredMedia | undefined;
          if (media) {
            console.log("[MediaStorage] Media file retrieved successfully");
            resolve(media.data);
          } else {
            console.log("[MediaStorage] Media file not found:", mediaId);
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error(
            "[MediaStorage] Error retrieving media file:",
            request.error
          );
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("[MediaStorage] Error in getMediaFile:", error);
      throw error;
    }
  }

  async removeMediaFile(mediaId: string): Promise<void> {
    console.log("[MediaStorage] Removing media file:", mediaId);

    if (!isBrowser) {
      console.warn("[MediaStorage] Not in browser environment");
      return Promise.resolve();
    }

    try {
      const db = await this.getDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(mediaId);

        request.onsuccess = () => {
          console.log("[MediaStorage] Media file removed successfully");
          resolve();
        };

        request.onerror = () => {
          console.error(
            "[MediaStorage] Error removing media file:",
            request.error
          );
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("[MediaStorage] Error in removeMediaFile:", error);
      throw error;
    }
  }

  async cleanupOldMedia(maxFiles = 50): Promise<void> {
    console.log("[MediaStorage] Starting media cleanup, max files:", maxFiles);

    if (!isBrowser) {
      console.warn("[MediaStorage] Not in browser environment");
      return Promise.resolve();
    }

    try {
      const db = await this.getDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const index = store.index("lastModified");
        let count = 0;

        const request = index.openCursor(null, "prev");

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
            .result;
          if (cursor) {
            count++;
            if (count > maxFiles) {
              console.log(
                "[MediaStorage] Removing old media file:",
                cursor.value.id
              );
              store.delete(cursor.primaryKey);
            }
            cursor.continue();
          }
        };

        transaction.oncomplete = () => {
          console.log(
            "[MediaStorage] Cleanup complete, processed files:",
            count
          );
          resolve();
        };

        transaction.onerror = () => {
          console.error(
            "[MediaStorage] Error during cleanup:",
            transaction.error
          );
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error("[MediaStorage] Error in cleanupOldMedia:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const mediaStorage = new MediaStorageService();

// Export the individual methods bound to the singleton
export const storeMediaFile = mediaStorage.storeMediaFile.bind(mediaStorage);
export const getMediaFile = mediaStorage.getMediaFile.bind(mediaStorage);
export const removeMediaFile = mediaStorage.removeMediaFile.bind(mediaStorage);

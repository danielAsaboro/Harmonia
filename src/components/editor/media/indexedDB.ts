// /components/editor/media/indexedDB.ts
import { v4 as uuidv4 } from "uuid";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined" && window.indexedDB;

interface StoredMedia {
  id: string;
  data: string; // base64 encoded file data
  type: string; // mime type
  lastModified: string;
  size: number;
  serverPath?: string;
}

interface MediaUploadResult {
  fileId: string;
  path: string;
}

class MediaStorageService {
  private dbName = "TweetMediaDB";
  private storeName = "mediaFiles";
  private db: IDBDatabase | null = null;

  constructor() {
    if (isBrowser) {
      this.initDatabase();
    }
  }

  private initDatabase(): Promise<IDBDatabase> {
    if (!isBrowser) {
      return Promise.reject(
        new Error("IndexedDB is not available in this environment")
      );
    }

    return new Promise((resolve, reject) => {
      // First, get the current version of the database
      const checkRequest = indexedDB.open(this.dbName);

      checkRequest.onsuccess = () => {
        const currentVersion = checkRequest.result.version;
        checkRequest.result.close();

        // Open with a version higher than the current one
        const request = indexedDB.open(this.dbName, currentVersion + 1);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
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

      checkRequest.onerror = () => {
        // If the database doesn't exist yet, open it with version 1
        const request = indexedDB.open(this.dbName, 1);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
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
    return this.initDatabase();
  }

  private async uploadMediaToServer(file: File): Promise<MediaUploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload media to server");
    }

    return response.json();
  }

  async storeMediaFile(file: File): Promise<string> {
    if (!isBrowser) {
      return Promise.resolve(uuidv4());
    }

    const db = await this.getDB();
    const mediaId = uuidv4();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const mediaData: StoredMedia = {
          id: mediaId,
          data: reader.result as string,
          type: file.type,
          lastModified: new Date().toISOString(),
          size: file.size,
        };

        // Try to upload to server first
        try {
          const uploadResult = await this.uploadMediaToServer(file);
          mediaData.serverPath = uploadResult.path;
        } catch (error) {
          console.error(
            "Failed to upload to server, storing locally only:",
            error
          );
        }

        const transaction = db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.add(mediaData);

        request.onsuccess = () => resolve(mediaId);
        request.onerror = () => reject(request.error);
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async getMediaFile(mediaId: string): Promise<string | null> {
    if (!isBrowser) {
      return Promise.resolve(null);
    }

    return new Promise(async (resolve, reject) => {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(mediaId);

      request.onsuccess = () => {
        const media = request.result as StoredMedia;
        if (media?.serverPath) {
          // If we have a server path, return that instead
          resolve(media.serverPath);
        } else {
          resolve(media ? media.data : null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async removeMediaFile(mediaId: string): Promise<void> {
    if (!isBrowser) {
      return Promise.resolve();
    }

    return new Promise(async (resolve, reject) => {
      const db = await this.getDB();

      // First get the media to check if it has a server path
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(mediaId);

      getRequest.onsuccess = async () => {
        const media = getRequest.result as StoredMedia;

        // If media exists on server, try to delete it
        if (media?.serverPath) {
          try {
            await fetch(`/api/media/delete`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ path: media.serverPath }),
            });
          } catch (error) {
            console.error("Failed to delete media from server:", error);
          }
        }

        // Delete from IndexedDB
        const deleteRequest = store.delete(mediaId);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async cleanupOldMedia(maxFiles = 50): Promise<void> {
    if (!isBrowser) {
      return Promise.resolve();
    }

    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("lastModified");

      const request = index.openCursor(null, "prev");
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          count++;
          if (count > maxFiles) {
            const media = cursor.value as StoredMedia;
            // Also try to delete from server if it exists there
            if (media.serverPath) {
              fetch(`/api/media/delete`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ path: media.serverPath }),
              }).catch((error) => {
                console.error("Failed to delete old media from server:", error);
              });
            }
            store.delete(cursor.primaryKey);
          }
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Create a singleton instance
export const mediaStorage = new MediaStorageService();

// Export the original interface for compatibility
export const storeMediaFile = mediaStorage.storeMediaFile.bind(mediaStorage);
export const getMediaFile = mediaStorage.getMediaFile.bind(mediaStorage);
export const removeMediaFile = mediaStorage.removeMediaFile.bind(mediaStorage);

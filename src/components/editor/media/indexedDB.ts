// indexedDB.ts

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

  // Rest of the class implementation remains the same...
  private async getDB(): Promise<IDBDatabase> {
    if (!isBrowser) {
      throw new Error("IndexedDB is not available in this environment");
    }

    if (this.db) return this.db;
    return this.initDatabase();
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

  getMediaFile(mediaId: string): Promise<string | null> {
    if (!isBrowser) {
      return Promise.resolve(null);
    }

    return new Promise(async (resolve, reject) => {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(mediaId);

      request.onsuccess = () => {
        const media = request.result;
        resolve(media ? media.data : null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  removeMediaFile(mediaId: string): Promise<void> {
    if (!isBrowser) {
      return Promise.resolve();
    }

    return new Promise(async (resolve, reject) => {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(mediaId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
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

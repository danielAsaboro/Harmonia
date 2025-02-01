// indexedDB.ts
import { v4 as uuidv4 } from "uuid";

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
    this.initDatabase();
  }

  private initDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
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
          store.createIndex("lastModified", "lastModified", { unique: false });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.initDatabase();
  }

  async storeMediaFile(file: File): Promise<string> {
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

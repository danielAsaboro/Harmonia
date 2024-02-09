// src/lib/sync/draftSync.ts

import { Tweet, Thread, ThreadWithTweets } from "@/types/tweet";
import { tweetStorage } from "@/utils/localStorage";

interface PendingSync {
  id: string;
  type: "tweet" | "thread";
  lastModified: Date;
}

class DraftSyncService {
  private static instance: DraftSyncService;
  private pendingSyncs: Set<PendingSync> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;
  private SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private isSyncing = false;

  private constructor() {
    // Start sync interval when service is created
    this.startSyncInterval();
  }

  static getInstance(): DraftSyncService {
    if (!DraftSyncService.instance) {
      DraftSyncService.instance = new DraftSyncService();
    }
    return DraftSyncService.instance;
  }

  private startSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncPendingDrafts();
    }, this.SYNC_INTERVAL);
  }

  private async syncPendingDrafts() {
    if (this.isSyncing || this.pendingSyncs.size === 0) return;

    this.isSyncing = true;
    const syncsArray = Array.from(this.pendingSyncs);
    this.pendingSyncs.clear();

    try {
      for (const sync of syncsArray) {
        if (sync.type === "tweet") {
          const tweet = tweetStorage.getTweets().find((t) => t.id === sync.id);
          if (tweet) {
            await this.syncTweetToBackend(tweet);
          }
        } else {
          const thread = tweetStorage.getThreadWithTweets(sync.id);
          if (thread) {
            await this.syncThreadToBackend(thread);
          }
        }
      }
    } catch (error) {
      console.error("Error syncing drafts:", error);
      // Re-add failed syncs to the queue
      syncsArray.forEach((sync) => this.pendingSyncs.add(sync));
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncTweetToBackend(tweet: Tweet) {
    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "tweet",
          data: tweet,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync tweet: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error syncing tweet to backend:", error);
      throw error;
    }
  }

  private async syncThreadToBackend(threadWithTweets: ThreadWithTweets) {
    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "thread",
          data: {
            id: threadWithTweets.id,
            tweetIds: threadWithTweets.tweetIds,
            createdAt: threadWithTweets.createdAt,
            status: threadWithTweets.status,
            scheduledFor: threadWithTweets.scheduledFor,
            tags: threadWithTweets.tags,
            tweets: threadWithTweets.tweets,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync thread: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error syncing thread to backend:", error);
      throw error;
    }
  }

  // Public methods

  /**
   * Queues a draft for syncing with the backend
   */
  queueForSync(id: string, type: "tweet" | "thread") {
    this.pendingSyncs.add({
      id,
      type,
      lastModified: new Date(),
    });
  }

  /**
   * Forces an immediate sync of all pending drafts
   */
  async forceSyncNow() {
    await this.syncPendingDrafts();
  }

  /**
   * Cleans up the service
   */
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const draftSync = DraftSyncService.getInstance();

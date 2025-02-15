// // src/lib/sync/draftSync.ts

import { Tweet, Thread, ThreadWithTweets } from "@/types/tweet";
import { tweetStorage } from "@/utils/localStorage";

interface PendingSync {
  id: string;
  type: "tweet" | "thread";
  lastModified: Date;
}

class DraftSyncService {
  private static instance: DraftSyncService;
  private pendingSyncs: Map<string, PendingSync> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  // private SYNC_INTERVAL = 15 * 1000; // 15 seconds for testing
  private SYNC_INTERVAL = 0.1 * 60 * 1000; // 3 minutes in milliseconds
  private isSyncing = false;

  private constructor() {
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
    const syncsArray = Array.from(this.pendingSyncs.values());
    this.pendingSyncs.clear();

    try {
      for (const sync of syncsArray) {
        if (sync.type === "tweet") {
          const tweet = tweetStorage.getTweets().find((t) => t.id === sync.id);
          if (tweet && !tweet.threadId) {
            // Only sync standalone tweets
            console.log("doesn't have an id");
            await this.syncTweetToBackend(tweet);
          } else if (tweet && tweet.threadId) {
            console.log("has an id");

            // If it has a threadId, we should sync the entire thread instead
            const thread = tweetStorage.getThreadWithTweets(tweet.threadId);
            console.log(" is thread or not 1", thread);

            if (thread) {
              console.log("about to sync thread to backend 1");

              await this.syncThreadToBackend(thread);
              console.log("finished syncing thread to backend 1");
            }
          }
        } else {
          const tweet = tweetStorage.getTweets().find((t) => t.id === sync.id);
          if (tweet) {
            const thread = tweetStorage.getThreadWithTweets(tweet.threadId!);
            console.log(" is thread or not 2", thread);
            if (thread) {
              console.log("about to sync thread to backend 2");

              await this.syncThreadToBackend(thread);
              console.log("finished syncing thread to backend 2");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error syncing drafts:", error);
      // Re-add failed syncs to the queue
      syncsArray.forEach((sync) => this.pendingSyncs.set(sync.id, sync));
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

  queueForSync(id: string, type: "tweet" | "thread") {
    this.pendingSyncs.set(id, {
      id,
      type,
      lastModified: new Date(),
    });
  }

  async forceSyncNow() {
    await this.syncPendingDrafts();
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const draftSync = DraftSyncService.getInstance();

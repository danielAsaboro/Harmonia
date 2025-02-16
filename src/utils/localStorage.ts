// // /utils/localStorage.ts

import { draftSync } from "@/lib/sync/draftSync";
import { Tweet, Thread, ThreadWithTweets } from "@/types/tweet";
import { debounce } from "lodash";

interface TwitterUserDetails {
  id: string;
  name: string;
  handle: string;
  profileImageUrl: string;
  verified: boolean;
  verifiedType: string | null;
}

export class TweetStorageService {
  private static instance: TweetStorageService;
  private readonly TWEETS_KEY = "tweets";
  private readonly THREADS_KEY = "threads";
  private readonly USER_DETAILS_KEY = "twitter_user_details";
  private lastSave: number = Date.now();

  private constructor() {}

  static getInstance(): TweetStorageService {
    if (!TweetStorageService.instance) {
      TweetStorageService.instance = new TweetStorageService();
    }
    return TweetStorageService.instance;
  }

  getUserDetails(): TwitterUserDetails | null {
    try {
      const details = localStorage.getItem(this.USER_DETAILS_KEY);
      if (details) {
        const parsedDetails = JSON.parse(details);
        if (parsedDetails && Object.keys(parsedDetails).length > 0) {
          return parsedDetails;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting user details:", error);
      return null;
    }
  }

  saveUserDetails(details: TwitterUserDetails) {
    try {
      localStorage.setItem(this.USER_DETAILS_KEY, JSON.stringify(details));
    } catch (error) {
      console.error("Error saving user details:", error);
    }
  }

  getTweets(): Tweet[] {
    try {
      const tweets = localStorage.getItem(this.TWEETS_KEY);
      return tweets ? JSON.parse(tweets) : [];
    } catch (error) {
      console.error("Error getting tweets:", error);
      return [];
    }
  }

  getThreads(): Thread[] {
    try {
      const threads = localStorage.getItem(this.THREADS_KEY);
      return threads ? JSON.parse(threads) : [];
    } catch (error) {
      console.error("Error getting threads:", error);
      return [];
    }
  }

  getThreadWithTweets(threadId: string): ThreadWithTweets | null {
    const thread = this.getThreads().find((t) => t.id === threadId);
    if (!thread) return null;

    const tweets = this.getTweets()
      .filter((t) => t.threadId === threadId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    return {
      ...thread,
      tweets,
    };
  }

  getThreadPreview(threadId: string): Tweet | null {
    const tweets = this.getTweets()
      .filter((t) => t.threadId === threadId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    return tweets[0] || null;
  }

  saveTweet(tweet: Tweet, immediate: boolean = false) {
    try {
      const tweets = this.getTweets();
      const index = tweets.findIndex((t) => t.id === tweet.id);

      if (index >= 0) {
        tweets[index] = tweet;
      } else {
        tweets.push(tweet);
      }

      // Always save to localStorage with debounce
      localStorage.setItem(this.TWEETS_KEY, JSON.stringify(tweets));
      this.lastSave = Date.now();

      // Queue for backend sync if it's a draft
      if (tweet.status === "draft") {
        draftSync.queueForSync(tweet.id, "tweet");

        // Only force immediate sync if explicitly requested
        if (immediate) {
          draftSync.forceSyncNow();
        }
      }
    } catch (error) {
      console.error("Error saving tweet:", error);
    }
  }

  saveThread(thread: Thread, tweets: Tweet[], immediate: boolean = false) {
    try {
      const threads = this.getThreads();
      const threadIndex = threads.findIndex((t) => t.id === thread.id);

      if (threadIndex >= 0) {
        threads[threadIndex] = thread;
      } else {
        threads.push(thread);
      }

      // Save thread to localStorage with debounce
      localStorage.setItem(this.THREADS_KEY, JSON.stringify(threads));
      this.lastSave = Date.now();

      // Save associated tweets to localStorage
      tweets.forEach((tweet) => {
        this.saveTweet(
          { ...tweet, threadId: thread.id, status: tweet.status },
          false // Don't force immediate sync for individual tweets
        );
      });

      // Queue thread for backend sync if it's a draft
      if (thread.status === "draft") {
        draftSync.queueForSync(thread.id, "thread");

        // Only force immediate sync if explicitly requested
        if (immediate) {
          draftSync.forceSyncNow();
        }
      }
    } catch (error) {
      console.error("Error saving thread:", error);
    }
  }

  deleteTweet(tweetId: string) {
    try {
      const tweets = this.getTweets().filter((t) => t.id !== tweetId);
      localStorage.setItem(this.TWEETS_KEY, JSON.stringify(tweets));

      // Send delete request to backend immediately
      fetch(`/api/drafts?type=tweet&id=${tweetId}&cleanup=true`, {
        method: "DELETE",
      }).catch((error) => {
        console.error("Error deleting tweet from backend:", error);
      });
    } catch (error) {
      console.error("Error deleting tweet:", error);
    }
  }

  deleteThread(threadId: string) {
    try {
      const threads = this.getThreads().filter((t) => t.id !== threadId);
      localStorage.setItem(this.THREADS_KEY, JSON.stringify(threads));

      const tweets = this.getTweets().filter((t) => t.threadId !== threadId);
      localStorage.setItem(this.TWEETS_KEY, JSON.stringify(tweets));

      // Send delete request to backend immediately
      fetch(`/api/drafts?type=thread&id=${threadId}&cleanup=true`, {
        method: "DELETE",
      }).catch((error) => {
        console.error("Error deleting thread from backend:", error);
      });
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  }

  getLastSaveTime(): number {
    return this.lastSave;
  }
}

export const tweetStorage = TweetStorageService.getInstance();

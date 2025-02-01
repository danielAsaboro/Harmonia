// // /utils/localStorage.ts
// import { Tweet, Thread } from "../types/tweet";

// const TWEETS_KEY = "tweets";
// const THREADS_KEY = "threads";

// export const StorageKeys = {
//   TWEETS: TWEETS_KEY,
//   THREADS: THREADS_KEY,
// } as const;

// export const storage = {
//   getTweets: (): Tweet[] => {
//     const tweets = localStorage.getItem(TWEETS_KEY);
//     return tweets ? JSON.parse(tweets) : [];
//   },

//   getThreads: (): Thread[] => {
//     const threads = localStorage.getItem(THREADS_KEY);
//     return threads ? JSON.parse(threads) : [];
//   },

//   saveTweet: (tweet: Tweet): void => {
//     const tweets = storage.getTweets();
//     const existingIndex = tweets.findIndex((t) => t.id === tweet.id);

//     if (existingIndex >= 0) {
//       tweets[existingIndex] = tweet;
//     } else {
//       tweets.push(tweet);
//     }

//     localStorage.setItem(TWEETS_KEY, JSON.stringify(tweets));
//   },

//   saveThread: (thread: Thread): void => {
//     const threads = storage.getThreads();
//     const existingIndex = threads.findIndex((t) => t.id === thread.id);

//     if (existingIndex >= 0) {
//       threads[existingIndex] = thread;
//     } else {
//       threads.push(thread);
//     }

//     localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
//   },

//   deleteTweet: (tweetId: string): void => {
//     const tweets = storage.getTweets().filter((t) => t.id !== tweetId);
//     localStorage.setItem(TWEETS_KEY, JSON.stringify(tweets));
//   },

//   deleteThread: (threadId: string): void => {
//     const threads = storage.getThreads().filter((t) => t.id !== threadId);
//     localStorage.setItem(THREADS_KEY, JSON.stringify(threads));

//     // Also delete associated tweets
//     const tweets = storage.getTweets().filter((t) => t.threadId !== threadId);
//     localStorage.setItem(TWEETS_KEY, JSON.stringify(tweets));
//   },
// };

// src/services/tweetStorage.ts
import { Tweet, Thread, ThreadWithTweets } from "@/types/tweet";
import { debounce } from "lodash";

export class TweetStorageService {
  private static instance: TweetStorageService;
  private readonly TWEETS_KEY = "tweets";
  private readonly THREADS_KEY = "threads";
  private saveQueue: Set<string> = new Set();
  private lastSave: number = Date.now();

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): TweetStorageService {
    if (!TweetStorageService.instance) {
      TweetStorageService.instance = new TweetStorageService();
    }
    return TweetStorageService.instance;
  }

  // Debounced save operation
  private debouncedSave = debounce(async () => {
    const tweetsToSave = Array.from(this.saveQueue);
    this.saveQueue.clear();

    const tweets = this.getTweets();
    const updatedTweets = tweets.map((tweet) => {
      if (tweetsToSave.includes(tweet.id)) {
        return { ...tweet, lastSaved: new Date().toISOString() };
      }
      return tweet;
    });

    localStorage.setItem(this.TWEETS_KEY, JSON.stringify(updatedTweets));
    this.lastSave = Date.now();
  }, 1000);

  // Get all tweets
  getTweets(): Tweet[] {
    try {
      const tweets = localStorage.getItem(this.TWEETS_KEY);
      return tweets ? JSON.parse(tweets) : [];
    } catch (error) {
      console.error("Error getting tweets:", error);
      return [];
    }
  }

  // Get all threads
  getThreads(): Thread[] {
    try {
      const threads = localStorage.getItem(this.THREADS_KEY);
      return threads ? JSON.parse(threads) : [];
    } catch (error) {
      console.error("Error getting threads:", error);
      return [];
    }
  }

  // Get thread with associated tweets
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

  // Get first tweet of thread
  getThreadPreview(threadId: string): Tweet | null {
    const tweets = this.getTweets()
      .filter((t) => t.threadId === threadId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    return tweets[0] || null;
  }

  // Save a single tweet
  saveTweet(tweet: Tweet, immediate: boolean = false) {
    try {
      const tweets = this.getTweets();
      const index = tweets.findIndex((t) => t.id === tweet.id);

      if (index >= 0) {
        tweets[index] = tweet;
      } else {
        tweets.push(tweet);
      }

      if (immediate) {
        localStorage.setItem(this.TWEETS_KEY, JSON.stringify(tweets));
        this.lastSave = Date.now();
      } else {
        this.saveQueue.add(tweet.id);
        this.debouncedSave();
      }
    } catch (error) {
      console.error("Error saving tweet:", error);
    }
  }

  // Save a thread and its tweets
  saveThread(thread: Thread, tweets: Tweet[], immediate: boolean = false) {
    try {
      // Save thread
      const threads = this.getThreads();
      const threadIndex = threads.findIndex((t) => t.id === thread.id);

      if (threadIndex >= 0) {
        threads[threadIndex] = thread;
      } else {
        threads.push(thread);
      }

      localStorage.setItem(this.THREADS_KEY, JSON.stringify(threads));

      // Save associated tweets
      tweets.forEach((tweet) => {
        this.saveTweet({ ...tweet, threadId: thread.id }, immediate);
      });
    } catch (error) {
      console.error("Error saving thread:", error);
    }
  }

  // Delete a tweet
  deleteTweet(tweetId: string) {
    try {
      const tweets = this.getTweets().filter((t) => t.id !== tweetId);
      localStorage.setItem(this.TWEETS_KEY, JSON.stringify(tweets));
    } catch (error) {
      console.error("Error deleting tweet:", error);
    }
  }

  // Delete a thread and its tweets
  deleteThread(threadId: string) {
    try {
      const threads = this.getThreads().filter((t) => t.id !== threadId);
      localStorage.setItem(this.THREADS_KEY, JSON.stringify(threads));

      const tweets = this.getTweets().filter((t) => t.threadId !== threadId);
      localStorage.setItem(this.TWEETS_KEY, JSON.stringify(tweets));
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  }

  // Get the timestamp of last save operation
  getLastSaveTime(): number {
    return this.lastSave;
  }
}

// Export singleton instance
export const tweetStorage = TweetStorageService.getInstance();

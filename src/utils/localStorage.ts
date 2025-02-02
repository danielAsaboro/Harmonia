// /utils/localStorage.ts
import { Tweet, Thread, ThreadWithTweets } from "@/types/tweet";
import { debounce } from "lodash";

/**
 * Service for managing tweet and thread storage in localStorage.
 * Implements singleton pattern to ensure a single instance across the application.
 * Provides methods for CRUD operations on tweets and threads with debounced saving.
 */
export class TweetStorageService {
  private static instance: TweetStorageService;
  /** Key used for storing tweets in localStorage */
  private readonly TWEETS_KEY = "tweets";
  /** Key used for storing threads in localStorage */
  private readonly THREADS_KEY = "threads";
  /** Set of tweet IDs queued for saving */
  private saveQueue: Set<string> = new Set();
  /** Timestamp of the last save operation */
  private lastSave: number = Date.now();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Gets the singleton instance of TweetStorageService
   * @returns {TweetStorageService} The singleton instance
   */
  static getInstance(): TweetStorageService {
    if (!TweetStorageService.instance) {
      TweetStorageService.instance = new TweetStorageService();
    }
    return TweetStorageService.instance;
  }

  /**
   * Debounced save operation that batches tweet saves
   * Waits 1 second after the last save request before executing
   * Updates lastSaved timestamp for saved tweets
   */
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

  /**
   * Retrieves all tweets from localStorage
   * @returns {Tweet[]} Array of all stored tweets
   */
  getTweets(): Tweet[] {
    try {
      const tweets = localStorage.getItem(this.TWEETS_KEY);
      // console.log("retrieved tweets", tweets);

      return tweets ? JSON.parse(tweets) : [];
    } catch (error) {
      console.error("Error getting tweets:", error);
      return [];
    }
  }

  /**
   * Retrieves all threads from localStorage
   * @returns {Thread[]} Array of all stored threads
   */
  getThreads(): Thread[] {
    try {
      const threads = localStorage.getItem(this.THREADS_KEY);
      // console.log("retrieved threads", threads);
      return threads ? JSON.parse(threads) : [];
    } catch (error) {
      console.error("Error getting threads:", error);
      return [];
    }
  }

  /**
   * Gets a thread and all its associated tweets
   * @param {string} threadId - ID of the thread to retrieve
   * @returns {ThreadWithTweets | null} Thread with its tweets or null if not found
   */
  getThreadWithTweets(threadId: string): ThreadWithTweets | null {
    const thread = this.getThreads().find((t) => t.id === threadId);
    if (!thread) return null;

    const tweets = this.getTweets()
      .filter((t) => t.threadId === threadId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    console.log("retrieved thread with tweets", {
      ...thread,
      tweets,
    });

    return {
      ...thread,
      tweets,
    };
  }

  /**
   * Gets the first tweet of a thread for preview purposes
   * @param {string} threadId - ID of the thread
   * @returns {Tweet | null} First tweet in the thread or null if thread is empty
   */
  getThreadPreview(threadId: string): Tweet | null {
    const tweets = this.getTweets()
      .filter((t) => t.threadId === threadId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    // console.log("thread preview", tweets[0]);

    return tweets[0] || null;
  }

  /**
   * Saves or updates a single tweet
   * @param {Tweet} tweet - Tweet to save
   * @param {boolean} immediate - If true, saves immediately; if false, uses debounced save
   */
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

  /**
   * Saves or updates a thread and its associated tweets
   * @param {Thread} thread - Thread to save
   * @param {Tweet[]} tweets - Tweets belonging to the thread
   * @param {boolean} immediate - If true, saves immediately; if false, uses debounced save
   */
  saveThread(thread: Thread, tweets: Tweet[], immediate: boolean = false) {
    try {
      const threads = this.getThreads();
      const threadIndex = threads.findIndex((t) => t.id === thread.id);

      if (threadIndex >= 0) {
        threads[threadIndex] = thread;
      } else {
        threads.push(thread);
      }

      localStorage.setItem(this.THREADS_KEY, JSON.stringify(threads));

      tweets.forEach((tweet) => {
        this.saveTweet({ ...tweet, threadId: thread.id, status: tweet.status }, immediate);
      });
    } catch (error) {
      console.error("Error saving thread:", error);
    }
  }

  /**
   * Deletes a tweet from storage
   * @param {string} tweetId - ID of the tweet to delete
   */
  deleteTweet(tweetId: string) {
    try {
      const tweets = this.getTweets().filter((t) => t.id !== tweetId);
      localStorage.setItem(this.TWEETS_KEY, JSON.stringify(tweets));
    } catch (error) {
      console.error("Error deleting tweet:", error);
    }
  }

  /**
   * Deletes a thread and all its associated tweets
   * @param {string} threadId - ID of the thread to delete
   */
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
  
  deleteTweetFromThread(tweetId: string) {
    try {
      // Get all tweets
      const tweets = this.getTweets();

      // Find the tweet and its thread
      const tweetToDelete = tweets.find((t) => t.id === tweetId);

      if (tweetToDelete && tweetToDelete.threadId) {
        // Remove the tweet from tweets
        const updatedTweets = tweets.filter((t) => t.id !== tweetId);

        // Update threads: remove the tweet ID from the thread's tweetIds
        const threads = this.getThreads();
        const updatedThreads = threads.map((thread) => {
          if (thread.id === tweetToDelete.threadId) {
            return {
              ...thread,
              tweetIds: thread.tweetIds.filter((id) => id !== tweetId),
            };
          }
          return thread;
        });

        // Completely remove threads with no tweets
        const filteredThreads = updatedThreads.filter(
          (thread) => thread.tweetIds.length > 0
        );

        // Save updated data
        localStorage.setItem(this.TWEETS_KEY, JSON.stringify(updatedTweets));
        localStorage.setItem(this.THREADS_KEY, JSON.stringify(filteredThreads));
      }
    } catch (error) {
      console.error("Error deleting tweet from thread:", error);
    }
  }

  /**
   * Gets the timestamp of the last save operation
   * @returns {number} Timestamp of the last save
   */
  getLastSaveTime(): number {
    return this.lastSave;
  }
}

/** Singleton instance of TweetStorageService */
export const tweetStorage = TweetStorageService.getInstance();

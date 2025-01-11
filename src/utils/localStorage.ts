import { Tweet, Thread } from "../types/tweet";

const TWEETS_KEY = "tweets";
const THREADS_KEY = "threads";

export const StorageKeys = {
  TWEETS: TWEETS_KEY,
  THREADS: THREADS_KEY,
} as const;

export const storage = {
  getTweets: (): Tweet[] => {
    const tweets = localStorage.getItem(TWEETS_KEY);
    return tweets ? JSON.parse(tweets) : [];
  },

  getThreads: (): Thread[] => {
    const threads = localStorage.getItem(THREADS_KEY);
    return threads ? JSON.parse(threads) : [];
  },

  saveTweet: (tweet: Tweet): void => {
    const tweets = storage.getTweets();
    const existingIndex = tweets.findIndex((t) => t.id === tweet.id);

    if (existingIndex >= 0) {
      tweets[existingIndex] = tweet;
    } else {
      tweets.push(tweet);
    }

    localStorage.setItem(TWEETS_KEY, JSON.stringify(tweets));
  },

  saveThread: (thread: Thread): void => {
    const threads = storage.getThreads();
    const existingIndex = threads.findIndex((t) => t.id === thread.id);

    if (existingIndex >= 0) {
      threads[existingIndex] = thread;
    } else {
      threads.push(thread);
    }

    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  },

  deleteTweet: (tweetId: string): void => {
    const tweets = storage.getTweets().filter((t) => t.id !== tweetId);
    localStorage.setItem(TWEETS_KEY, JSON.stringify(tweets));
  },

  deleteThread: (threadId: string): void => {
    const threads = storage.getThreads().filter((t) => t.id !== threadId);
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));

    // Also delete associated tweets
    const tweets = storage.getTweets().filter((t) => t.threadId !== threadId);
    localStorage.setItem(TWEETS_KEY, JSON.stringify(tweets));
  },
};

// /lib/cron/scheduler.ts
import cron from "node-cron";
import { db } from "../db";
import { publishTweet, publishThread } from "../twitter/publisher";

export function startScheduler() {
  // Run every minute to check for tweets that need to be published
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Get pending tweets and threads
      const pendingTweets = db.getPendingTweets(now);
      const pendingThreads = db.getPendingThreads(now);

      // Process standalone tweets
      for (const tweet of pendingTweets) {
        if (!tweet.threadId) {
          // Only process standalone tweets here
          try {
            await publishTweet(tweet);
            db.updateTweetStatus(tweet.id, "published");
          console.log("publish all current scheduled tweets successful")
          } catch (error) {
            console.error(`Failed to publish tweet ${tweet.id}:`, error);
            db.updateTweetStatus(
              tweet.id,
              "failed",
              error instanceof Error ? error.message : "Unknown error"
            );
          }
        }
      }

      // Process threads
      for (const thread of pendingThreads) {
        try {
          const threadTweets = pendingTweets
            .filter((t) => t.threadId === thread.id)
            .sort((a, b) => (a.position || 0) - (b.position || 0));

          await publishThread(thread, threadTweets);
          db.updateThreadStatus(thread.id, "published");

          // Update status for all tweets in thread
          threadTweets.forEach((tweet) => {
            db.updateTweetStatus(tweet.id, "published");
          });

          console.log("publish all current tweets in scheduled in thread successful")
        } catch (error) {
          console.error(`Failed to publish thread ${thread.id}:`, error);
          db.updateThreadStatus(
            thread.id,
            "failed",
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    } catch (error) {
      console.error("Scheduler error:", error);
    }
  });
}

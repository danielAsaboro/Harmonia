// /lib/cron/scheduler.ts
import cron from "node-cron";
import { publishTweet, publishThread } from "../twitter/publisher";
import { logToFile, logError } from "../utils/logger";
import { scheduledThreadsService, scheduledTweetsService } from "../services";

export function startScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      logToFile("Starting scheduled publication check");
      scheduledThreadsService;
      const pendingTweets =
        await scheduledTweetsService.getPendingScheduledTweets(now);
      const pendingThreads =
        await scheduledThreadsService.getPendingScheduledThreads(now);

      // Process standalone tweets
      for (const tweet of pendingTweets) {
        if (!tweet.threadId) {
          try {
            await publishTweet(tweet);
            await scheduledTweetsService.updateTweetStatus(
              tweet.id,
              "published"
            );
            logToFile(`Successfully published tweet ${tweet.id}`);
          } catch (error) {
            logError(error, `Failed to publish tweet ${tweet.id}`);
            await scheduledTweetsService.updateTweetStatus(
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
          await scheduledThreadsService.updateThreadStatus(
            thread.id,
            "published"
          );

          threadTweets.forEach(async (tweet) => {
            await scheduledTweetsService.updateTweetStatus(
              tweet.id,
              "published"
            );
          });

          logToFile(
            `Successfully published thread ${thread.id} with ${threadTweets.length} tweets`
          );
        } catch (error) {
          logError(error, `Failed to publish thread ${thread.id}`);
          await scheduledThreadsService.updateThreadStatus(
            thread.id,
            "failed",
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }

      if (pendingTweets.length === 0 && pendingThreads.length === 0) {
        logToFile("No pending publications found");
      }
    } catch (error) {
      logError(error, "Scheduler error");
    }
  });

  logToFile("Tweet scheduler started");
}

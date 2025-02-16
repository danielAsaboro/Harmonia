import { PrismaClient } from "@prisma/client";
import { ScheduledTweet, TokenData } from "../schema";

export class PrismaScheduledTweetsService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // Adapter method to convert Prisma result to ScheduledTweet
  private adaptScheduledTweet(tweet: any): ScheduledTweet {
    return {
      id: tweet.id,
      content: tweet.content,
      mediaIds: tweet.mediaIds ? JSON.parse(tweet.mediaIds) : [],
      scheduledFor: tweet.scheduledFor,
      threadId: tweet.threadId || undefined,
      position: tweet.position || undefined,
      status: tweet.status,
      createdAt: tweet.createdAt,
      error: tweet.error || undefined,
      userId: tweet.userId,
      userTokens: tweet.user
        ? {
            accessToken: tweet.user.accessToken,
            refreshToken: tweet.user.refreshToken,
            expiresAt: tweet.user.expiresAt,
            userId: tweet.user.userId,
          }
        : undefined,
    };
  }

  // Save a scheduled tweet
  async saveScheduledTweet(tweet: ScheduledTweet): Promise<void> {
    await this.prisma.scheduled_tweets.upsert({
      where: { id: tweet.id },
      update: {
        content: tweet.content,
        mediaIds: JSON.stringify(tweet.mediaIds || []),
        scheduledFor: tweet.scheduledFor,
        threadId: tweet.threadId || null,
        position: tweet.position || null,
        status: tweet.status,
        createdAt: tweet.createdAt,
        error: tweet.error || null,
        userId: tweet.userId,
      },
      create: {
        id: tweet.id,
        content: tweet.content,
        mediaIds: JSON.stringify(tweet.mediaIds || []),
        scheduledFor: tweet.scheduledFor,
        threadId: tweet.threadId || null,
        position: tweet.position || null,
        status: tweet.status,
        createdAt: tweet.createdAt,
        error: tweet.error || null,
        userId: tweet.userId,
      },
    });
  }

  // Get pending scheduled tweets
  async getPendingScheduledTweets(beforeDate: Date): Promise<ScheduledTweet[]> {
    const tweets = await this.prisma.scheduled_tweets.findMany({
      where: {
        status: "scheduled",
        scheduledFor: {
          lte: beforeDate.toISOString(),
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        scheduledFor: "asc",
      },
    });

    return tweets.map((tweet) => this.adaptScheduledTweet(tweet));
  }

  // Update tweet status
  async updateTweetStatus(
    id: string,
    status: "published" | "failed",
    error?: string
  ): Promise<void> {
    await this.prisma.scheduled_tweets.update({
      where: { id },
      data: {
        status,
        error: error || null,
      },
    });
  }
}

// Helper function to create the service with a singleton-like approach
export function createScheduledTweetsService(prismaClient?: PrismaClient) {
  const client = prismaClient || new PrismaClient();
  return new PrismaScheduledTweetsService(client);
}

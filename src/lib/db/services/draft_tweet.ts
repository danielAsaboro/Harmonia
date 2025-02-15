import { PrismaClient } from "@prisma/client";
import { DraftTweet } from "../schema";

export class PrismaDraftTweetsService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // Adapter method to convert Prisma result to DraftTweet
  private adaptDraftTweet(tweet: any): DraftTweet {
    return {
      id: tweet.id,
      content: tweet.content,
      mediaIds: tweet.mediaIds ? JSON.parse(tweet.mediaIds) : [],
      createdAt: tweet.createdAt,
      updatedAt: tweet.updatedAt,
      status: tweet.status,
      threadId: tweet.threadId || undefined,
      position: tweet.position || undefined,
      tags: tweet.tags ? JSON.parse(tweet.tags) : [],
      userId: tweet.userId,
    };
  }

  // Save a draft tweet
  async saveDraftTweet(tweet: DraftTweet): Promise<void> {
    await this.prisma.draft_tweets.upsert({
      where: { id: tweet.id },
      update: {
        content: tweet.content,
        mediaIds: JSON.stringify(tweet.mediaIds || []),
        createdAt: tweet.createdAt,
        updatedAt: tweet.updatedAt,
        status: tweet.status,
        threadId: tweet.threadId || null,
        position: tweet.position || null,
        tags: JSON.stringify(tweet.tags || []),
        userId: tweet.userId,
      },
      create: {
        id: tweet.id,
        content: tweet.content,
        mediaIds: JSON.stringify(tweet.mediaIds || []),
        createdAt: tweet.createdAt,
        updatedAt: tweet.updatedAt,
        status: tweet.status,
        threadId: tweet.threadId || null,
        position: tweet.position || null,
        tags: JSON.stringify(tweet.tags || []),
        userId: tweet.userId,
      },
    });
  }

  // Get a specific draft tweet
  async getDraftTweet(id: string, userId: string): Promise<DraftTweet | null> {
    const tweet = await this.prisma.draft_tweets.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    return tweet ? this.adaptDraftTweet(tweet) : null;
  }

  // Get user's draft tweets (without thread)
  async getUserDraftTweets(userId: string): Promise<DraftTweet[]> {
    const tweets = await this.prisma.draft_tweets.findMany({
      where: {
        userId: userId,
        threadId: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return tweets.map((tweet) => this.adaptDraftTweet(tweet));
  }

  // Delete a draft tweet
  async deleteDraftTweet(id: string, userId: string): Promise<void> {
    await this.prisma.draft_tweets.delete({
      where: {
        id: id,
        userId: userId,
      },
    });
  }
}

// Helper function to create the service with a singleton-like approach
export function createDraftTweetsService(prismaClient?: PrismaClient) {
  const client = prismaClient || new PrismaClient();
  return new PrismaDraftTweetsService(client);
}

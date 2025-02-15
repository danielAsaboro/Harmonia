import { PrismaClient } from "@prisma/client";
import { ScheduledThread, TokenData } from "../schema";

export class PrismaScheduledThreadsService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // Adapter method to convert Prisma result to ScheduledThread
  private adaptScheduledThread(thread: any): ScheduledThread {
    return {
      id: thread.id,
      tweetIds: JSON.parse(thread.tweetIds),
      scheduledFor: thread.scheduledFor,
      status: thread.status,
      createdAt: thread.createdAt,
      error: thread.error || undefined,
      userId: thread.userId,
      userTokens: thread.user
        ? {
            accessToken: thread.user.accessToken,
            refreshToken: thread.user.refreshToken,
            expiresAt: thread.user.expiresAt,
            userId: thread.user.userId,
          }
        : undefined,
    };
  }

  // Save a scheduled thread
  async saveScheduledThread(thread: ScheduledThread): Promise<void> {
    await this.prisma.scheduled_threads.upsert({
      where: { id: thread.id },
      update: {
        tweetIds: JSON.stringify(thread.tweetIds),
        scheduledFor: thread.scheduledFor,
        status: thread.status,
        createdAt: thread.createdAt,
        error: thread.error || null,
        userId: thread.userId,
      },
      create: {
        id: thread.id,
        tweetIds: JSON.stringify(thread.tweetIds),
        scheduledFor: thread.scheduledFor,
        status: thread.status,
        createdAt: thread.createdAt,
        error: thread.error || null,
        userId: thread.userId,
      },
    });
  }

  // Get pending scheduled threads
  async getPendingScheduledThreads(
    beforeDate: Date
  ): Promise<ScheduledThread[]> {
    const threads = await this.prisma.scheduled_threads.findMany({
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

    return threads.map((thread) => this.adaptScheduledThread(thread));
  }

  // Update thread status
  async updateThreadStatus(
    id: string,
    status: "published" | "failed",
    error?: string
  ): Promise<void> {
    await this.prisma.scheduled_threads.update({
      where: { id },
      data: {
        status,
        error: error || null,
      },
    });
  }
}

// Helper function to create the service with a singleton-like approach
export function createScheduledThreadsService(prismaClient?: PrismaClient) {
  const client = prismaClient || new PrismaClient();
  return new PrismaScheduledThreadsService(client);
}

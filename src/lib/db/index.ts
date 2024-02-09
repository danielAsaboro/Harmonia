// /lib/db/index.ts
import Database from "better-sqlite3";
import path from "path";
import {
  ScheduledTweet,
  ScheduledThread,
  UserTokens,
  initializeDatabase,
  DraftTweet,
  DraftThread,
} from "./schema";

class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database;

  private constructor() {
    this.db = new Database(path.join(process.cwd(), "tweets.db"));
    initializeDatabase(this.db);
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // User Tokens Operations
  saveUserTokens(tokens: UserTokens): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_tokens 
      (userId, accessToken, refreshToken, expiresAt, username, name, profileImageUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      tokens.userId,
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresAt,
      tokens.username,
      tokens.name,
      tokens.profileImageUrl || null
    );
  }

  getUserTokens(userId: string): UserTokens | null {
    const stmt = this.db.prepare(`
      SELECT * FROM user_tokens WHERE userId = ?
    `);

    const row = stmt.get(userId) as UserTokens | undefined;
    return row || null;
  }

  updateUserTokens(
    userId: string,
    accessToken: string,
    expiresAt: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE user_tokens 
      SET accessToken = ?, expiresAt = ?
      WHERE userId = ?
    `);

    stmt.run(accessToken, expiresAt, userId);
  }

  // Scheduled Tweets Operations
  saveScheduledTweet(tweet: ScheduledTweet): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO scheduled_tweets 
      (id, content, mediaIds, scheduledFor, threadId, position, status, createdAt, error, userId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      tweet.id,
      tweet.content,
      JSON.stringify(tweet.mediaIds),
      tweet.scheduledFor,
      tweet.threadId || null,
      tweet.position || null,
      tweet.status,
      tweet.createdAt,
      tweet.error || null,
      tweet.userId
    );
  }

  saveScheduledThread(thread: ScheduledThread): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO scheduled_threads 
      (id, tweetIds, scheduledFor, status, createdAt, error, userId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      thread.id,
      JSON.stringify(thread.tweetIds),
      thread.scheduledFor,
      thread.status,
      thread.createdAt,
      thread.error || null,
      thread.userId
    );
  }

  getPendingTweets(beforeDate: Date): ScheduledTweet[] {
    const stmt = this.db.prepare(`
      SELECT 
        t.*,
        ut.accessToken,
        ut.refreshToken,
        ut.expiresAt as tokenExpiresAt
      FROM scheduled_tweets t
      JOIN user_tokens ut ON t.userId = ut.userId
      WHERE t.status = 'scheduled' 
      AND t.scheduledFor <= ? 
      ORDER BY t.scheduledFor ASC
    `);

    const rows = stmt.all(beforeDate.toISOString()) as any[];
    return rows.map((row) => ({
      ...row,
      mediaIds: JSON.parse(row.mediaIds || "[]"),
      userTokens: {
        accessToken: row.accessToken,
        refreshToken: row.refreshToken,
        expiresAt: row.tokenExpiresAt,
      },
    }));
  }

  getPendingThreads(beforeDate: Date): ScheduledThread[] {
    const stmt = this.db.prepare(`
      SELECT 
        t.*,
        ut.accessToken,
        ut.refreshToken,
        ut.expiresAt as tokenExpiresAt
      FROM scheduled_threads t
      JOIN user_tokens ut ON t.userId = ut.userId
      WHERE t.status = 'scheduled' 
      AND t.scheduledFor <= ? 
      ORDER BY t.scheduledFor ASC
    `);

    const rows = stmt.all(beforeDate.toISOString()) as any[];
    return rows.map((row) => ({
      ...row,
      tweetIds: JSON.parse(row.tweetIds),
      userTokens: {
        accessToken: row.accessToken,
        refreshToken: row.refreshToken,
        expiresAt: row.tokenExpiresAt,
      },
    }));
  }

  updateTweetStatus(
    id: string,
    status: "published" | "failed",
    error?: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE scheduled_tweets 
      SET status = ?, error = ? 
      WHERE id = ?
    `);

    stmt.run(status, error || null, id);
  }

  updateThreadStatus(
    id: string,
    status: "published" | "failed",
    error?: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE scheduled_threads 
      SET status = ?, error = ? 
      WHERE id = ?
    `);

    stmt.run(status, error || null, id);
  }

  // Draft Tweet Operations
  saveDraftTweet(tweet: DraftTweet): void {
    const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO draft_tweets 
        (id, content, mediaIds, createdAt, updatedAt, status, threadId, position, tags, userId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      tweet.id,
      tweet.content,
      JSON.stringify(tweet.mediaIds || []),
      tweet.createdAt,
      tweet.updatedAt,
      tweet.status,
      tweet.threadId || null,
      tweet.position || null,
      JSON.stringify(tweet.tags || []),
      tweet.userId
    );
  }

  getDraftTweet(id: string, userId: string): DraftTweet | null {
    const stmt = this.db.prepare(`
        SELECT * FROM draft_tweets WHERE id = ? AND userId = ?
    `);

    const row = stmt.get(id, userId) as any;
    if (!row) return null;

    return {
      ...row,
      mediaIds: JSON.parse(row.mediaIds || "[]"),
      tags: JSON.parse(row.tags || "[]"),
    };
  }

  getUserDraftTweets(userId: string): DraftTweet[] {
    const stmt = this.db.prepare(`
        SELECT * FROM draft_tweets 
        WHERE userId = ? AND threadId IS NULL 
        ORDER BY updatedAt DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map((row) => ({
      ...row,
      mediaIds: JSON.parse(row.mediaIds || "[]"),
      tags: JSON.parse(row.tags || "[]"),
    }));
  }

  deleteDraftTweet(id: string, userId: string): void {
    const stmt = this.db.prepare(`
        DELETE FROM draft_tweets WHERE id = ? AND userId = ?
    `);

    stmt.run(id, userId);
  }

  // Draft Thread Operations
  saveDraftThread(thread: DraftThread, tweets: DraftTweet[]): void {
    const threadStmt = this.db.prepare(`
        INSERT OR REPLACE INTO draft_threads 
        (id, tweetIds, createdAt, updatedAt, status, tags, userId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const tweetStmt = this.db.prepare(`
        INSERT OR REPLACE INTO draft_tweets 
        (id, content, mediaIds, createdAt, updatedAt, status, threadId, position, tags, userId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Use a transaction to ensure all operations succeed or fail together
    const transaction = this.db.transaction(
      (thread: DraftThread, tweets: DraftTweet[]) => {
        threadStmt.run(
          thread.id,
          JSON.stringify(thread.tweetIds),
          thread.createdAt,
          thread.updatedAt,
          thread.status,
          JSON.stringify(thread.tags || []),
          thread.userId
        );

        tweets.forEach((tweet) => {
          tweetStmt.run(
            tweet.id,
            tweet.content,
            JSON.stringify(tweet.mediaIds || []),
            tweet.createdAt,
            tweet.updatedAt,
            tweet.status,
            thread.id,
            tweet.position,
            JSON.stringify(tweet.tags || []),
            tweet.userId
          );
        });
      }
    );

    transaction(thread, tweets);
  }

  getDraftThread(
    id: string,
    userId: string
  ): { thread: DraftThread; tweets: DraftTweet[] } | null {
    const threadStmt = this.db.prepare(`
        SELECT * FROM draft_threads WHERE id = ? AND userId = ?
    `);

    const tweetsStmt = this.db.prepare(`
        SELECT * FROM draft_tweets 
        WHERE threadId = ? 
        ORDER BY position ASC
    `);

    const thread = threadStmt.get(id, userId) as any;
    if (!thread) return null;

    const tweets = tweetsStmt.all(id) as any[];

    return {
      thread: {
        ...thread,
        tweetIds: JSON.parse(thread.tweetIds),
        tags: JSON.parse(thread.tags || "[]"),
      },
      tweets: tweets.map((tweet) => ({
        ...tweet,
        mediaIds: JSON.parse(tweet.mediaIds || "[]"),
        tags: JSON.parse(tweet.tags || "[]"),
      })),
    };
  }

  getUserDraftThreads(
    userId: string
  ): { thread: DraftThread; tweets: DraftTweet[] }[] {
    const threadStmt = this.db.prepare(`
        SELECT * FROM draft_threads 
        WHERE userId = ? 
        ORDER BY updatedAt DESC
    `);

    const tweetsStmt = this.db.prepare(`
        SELECT * FROM draft_tweets 
        WHERE threadId = ? 
        ORDER BY position ASC
    `);

    const threads = threadStmt.all(userId) as any[];

    return threads.map((thread) => ({
      thread: {
        ...thread,
        tweetIds: JSON.parse(thread.tweetIds),
        tags: JSON.parse(thread.tags || "[]"),
      },
      tweets: tweetsStmt.all(thread.id).map((tweet: any) => ({
        ...tweet,
        mediaIds: JSON.parse(tweet.mediaIds || "[]"),
        tags: JSON.parse(tweet.tags || "[]"),
      })),
    }));
  }

  deleteDraftThread(id: string, userId: string): void {
    const deleteThreadStmt = this.db.prepare(`
        DELETE FROM draft_threads WHERE id = ? AND userId = ?
    `);

    const deleteTweetsStmt = this.db.prepare(`
        DELETE FROM draft_tweets WHERE threadId = ?
    `);

    const transaction = this.db.transaction((id: string, userId: string) => {
      deleteTweetsStmt.run(id);
      deleteThreadStmt.run(id, userId);
    });

    transaction(id, userId);
  }
}

export const db = DatabaseService.getInstance();

// /lib/db/index.ts
import Database from "better-sqlite3";
import path from "path";
import {
  ScheduledTweet,
  ScheduledThread,
  UserTokens,
  initializeDatabase,
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
}

export const db = DatabaseService.getInstance();

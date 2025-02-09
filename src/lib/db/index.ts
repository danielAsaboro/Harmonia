// /lib/db/index.ts
import Database from "better-sqlite3";
import path from "path";
import {
  ScheduledTweet,
  ScheduledThread,
  UserTokens,
  initializeDatabase,
  SharedDraft,
  SharedDraftComment,
  DraftTweet,
  DraftThread,
} from "./schema";
import { Thread, Tweet } from "@/types/tweet";

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
  // When saving, ensure JSON stringification
  saveScheduledTweet(tweet: ScheduledTweet): void {
    const stmt = this.db.prepare(`
    INSERT OR REPLACE INTO scheduled_tweets 
    (id, content, mediaIds, scheduledFor, threadId, position, status, createdAt, error, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    stmt.run(
      tweet.id,
      tweet.content,
      JSON.stringify(tweet.mediaIds || []), // Always stringify
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
      JSON.stringify(thread.tweetIds || []), // Always stringify
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

  prepare(sql: string): Database.Statement {
    return this.db.prepare(sql);
  }

  // For shared drafts
  saveSharedDraft(draft: SharedDraft): void {
    const stmt = this.db.prepare(`
    INSERT OR REPLACE INTO shared_drafts 
    (id, tweetId, threadId, allowComments, shareLink, createdAt, userId, viewCount, expiresAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    stmt.run(
      draft.id,
      draft.tweetId || null,
      draft.threadId || null,
      draft.allowComments ? 1 : 0,
      draft.shareLink,
      draft.createdAt,
      draft.userId,
      draft.viewCount,
      draft.expiresAt
    );
  }

  getSharedDraft(shareId: string): SharedDraft | null {
    const stmt = this.db.prepare(`
      SELECT * FROM shared_drafts 
      WHERE shareLink = ? AND datetime('now') <= datetime(expiresAt)
    `);

    const row = stmt.get(shareId) as SharedDraft | undefined;
    return row || null;
  }

  updateSharedDraftViewCount(shareId: string): void {
    const stmt = this.db.prepare(`
      UPDATE shared_drafts 
      SET viewCount = viewCount + 1
      WHERE shareLink = ?
    `);

    stmt.run(shareId);
  }

  // Comments Operations
  addCommentToDraft(comment: SharedDraftComment): void {
    const stmt = this.db.prepare(`
      INSERT INTO shared_draft_comments 
      (id, sharedDraftId, content, authorName, authorEmail, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      comment.id,
      comment.sharedDraftId,
      comment.content,
      comment.authorName,
      comment.authorEmail || null,
      comment.createdAt
    );
  }

  getCommentsForDraft(sharedDraftId: string): SharedDraftComment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM shared_draft_comments 
      WHERE sharedDraftId = ? 
      ORDER BY datetime(createdAt) ASC
    `);

    return stmt.all(sharedDraftId) as SharedDraftComment[];
  }

  getTweetById(tweetId: string): ScheduledTweet | null {
    const stmt = this.db.prepare(`
      SELECT * FROM scheduled_tweets WHERE id = ?
    `);

    const row = stmt.get(tweetId) as ScheduledTweet | undefined;
    if (row) {
      return {
        ...row,
        mediaIds: row.mediaIds ? JSON.parse(row.mediaIds) : [], // Safe parsing
      };
    }
    return null;
  }

  getThreadById(
    threadId: string
  ): (ScheduledThread & { tweets: ScheduledTweet[] }) | null {
    const threadStmt = this.db.prepare(`
      SELECT * FROM scheduled_threads WHERE id = ?
    `);

    const thread = threadStmt.get(threadId) as ScheduledThread | undefined;
    if (!thread) return null;

    const tweetStmt = this.db.prepare(`
      SELECT * FROM scheduled_tweets 
      WHERE threadId = ? 
      ORDER BY position ASC
    `);

    const tweets = tweetStmt.all(threadId) as ScheduledTweet[];
    const tweetsWithParsedMedia = tweets.map((tweet) => ({
      ...tweet,
      mediaIds: tweet.mediaIds ? JSON.parse(tweet.mediaIds) : [], // Safe parsing
    }));

    return {
      ...thread,
      tweetIds: thread.tweetIds ? JSON.parse(thread.tweetIds) : [], // Safe parsing
      tweets: tweetsWithParsedMedia,
    };
  }

  // Add method to get user data by tweet/thread ID
  getUserByContentId(contentId: string): UserTokens | null {
    const stmt = this.db.prepare(`
      SELECT ut.* FROM user_tokens ut
      LEFT JOIN scheduled_tweets st ON st.userId = ut.userId
      LEFT JOIN scheduled_threads sth ON sth.userId = ut.userId
      WHERE st.id = ? OR sth.id = ?
    `);

    const row = stmt.get(contentId, contentId) as UserTokens | undefined;
    return row || null;
  }

  // Add method to get tweets from a thread
  getTweetsFromThread(threadId: string): ScheduledTweet[] {
    const stmt = this.db.prepare(`
      SELECT * FROM scheduled_tweets 
      WHERE threadId = ? 
      ORDER BY position ASC
    `);

    const tweets = stmt.all(threadId) as ScheduledTweet[];
    return tweets.map((tweet) => ({
      ...tweet,
      mediaIds: JSON.parse(tweet.mediaIds || "[]"),
    }));
  }

  ///////
  // Save draft tweet : Draft Tweet Operations
  saveDraftTweet(tweet: DraftTweet): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO draft_tweets 
      (id, content, mediaIds, threadId, position, status, createdAt, userId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      tweet.id,
      tweet.content,
      JSON.stringify(tweet.mediaIds || []),
      tweet.threadId || null,
      tweet.position || null,
      tweet.status,
      tweet.createdAt,
      tweet.userId
    );
  }

  getDraftTweetsForUser(userId: string): DraftTweet[] {
    const stmt = this.db.prepare(`
      SELECT * FROM draft_tweets 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `);

    const rows = stmt.all(userId) as DraftTweet[];
    return rows.map((row) => ({
      ...row,
      mediaIds: JSON.parse(row.mediaIds || "[]"),
    }));
  }

  getDraftTweetById(id: string): DraftTweet | null {
    const stmt = this.db.prepare(`
      SELECT * FROM draft_tweets WHERE id = ?
    `);

    const row = stmt.get(id) as DraftTweet | undefined;
    if (row) {
      return {
        ...row,
        mediaIds: JSON.parse(row.mediaIds || "[]"),
      };
    }
    return null;
  }

  // / Save draft thread
  saveDraftThread(thread: DraftThread, tweets: DraftTweet[]): void {
    const threadStmt = this.db.prepare(`
      INSERT OR REPLACE INTO draft_threads 
      (id, tweetIds, status, createdAt, userId)
      VALUES (?, ?, ?, ?, ?)
    `);

    const tweetStmt = this.db.prepare(`
      INSERT OR REPLACE INTO draft_tweets 
      (id, content, mediaIds, threadId, position, status, createdAt, userId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Use a transaction to ensure all operations succeed or fail together
    const transaction = this.db.transaction(
      (thread: DraftThread, tweets: DraftTweet[]) => {
        threadStmt.run(
          thread.id,
          JSON.stringify(thread.tweetIds),
          thread.status,
          thread.createdAt,
          thread.userId
        );

        for (const tweet of tweets) {
          tweetStmt.run(
            tweet.id,
            tweet.content,
            JSON.stringify(tweet.mediaIds || []),
            thread.id,
            tweet.position,
            tweet.status,
            tweet.createdAt,
            tweet.userId
          );
        }
      }
    );

    transaction(thread, tweets);
  }

  getDraftThreadsForUser(
    userId: string
  ): (DraftThread & { tweets: DraftTweet[] })[] {
    const threadStmt = this.db.prepare(`
      SELECT * FROM draft_threads 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `);

    const tweetStmt = this.db.prepare(`
      SELECT * FROM draft_tweets 
      WHERE threadId = ? 
      ORDER BY position ASC
    `);

    const threads = threadStmt.all(userId) as DraftThread[];

    return threads.map((thread) => {
      const tweets = tweetStmt.all(thread.id) as DraftTweet[];
      return {
        ...thread,
        tweetIds: JSON.parse(thread.tweetIds),
        tweets: tweets.map((tweet) => ({
          ...tweet,
          mediaIds: JSON.parse(tweet.mediaIds || "[]"),
        })),
      };
    });
  }

  getDraftThreadById(
    id: string
  ): (DraftThread & { tweets: DraftTweet[] }) | null {
    const threadStmt = this.db.prepare(`
      SELECT * FROM draft_threads WHERE id = ?
    `);

    const thread = threadStmt.get(id) as DraftThread | undefined;
    if (!thread) return null;

    const tweetStmt = this.db.prepare(`
      SELECT * FROM draft_tweets 
      WHERE threadId = ? 
      ORDER BY position ASC
    `);

    const tweets = tweetStmt.all(thread.id) as DraftTweet[];

    return {
      ...thread,
      tweetIds: JSON.parse(thread.tweetIds),
      tweets: tweets.map((tweet) => ({
        ...tweet,
        mediaIds: JSON.parse(tweet.mediaIds || "[]"),
      })),
    };
  }

  // Delete operations
  deleteDraftTweet(id: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM draft_tweets WHERE id = ?
    `);
    stmt.run(id);
  }

  deleteDraftThread(id: string): void {
    const deleteThreadStmt = this.db.prepare(`
      DELETE FROM draft_threads WHERE id = ?
    `);
    const deleteTweetsStmt = this.db.prepare(`
      DELETE FROM draft_tweets WHERE threadId = ?
    `);

    // Use transaction to ensure both operations succeed or fail together
    const transaction = this.db.transaction((id: string) => {
      deleteTweetsStmt.run(id);
      deleteThreadStmt.run(id);
    });

    transaction(id);
  }

  getScheduledTweetById(id: string): ScheduledTweet | null {
    const stmt = this.db.prepare(`
      SELECT * FROM draft_tweets WHERE id = ?
    `);

    const row = stmt.get(id) as ScheduledTweet | undefined;
    if (row) {
      return {
        ...row,
        mediaIds: JSON.parse(row.mediaIds || "[]"),
      };
    }
    return null;
  }
  // Get draft tweet
  getDraftById(tweetId: string): ScheduledTweet | null {
    const stmt = this.db.prepare(`
    SELECT * FROM draft_tweets WHERE id = ?
  `);

    const row = stmt.get(tweetId) as ScheduledTweet | undefined;
    if (row) {
      return {
        ...row,
        mediaIds: row.mediaIds ? JSON.parse(row.mediaIds) : [],
      };
    }
    return null;
  }
}

export const db = DatabaseService.getInstance();

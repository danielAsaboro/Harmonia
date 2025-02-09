// /lib/db/schema.ts
import Database from "better-sqlite3";
import { Tweet, Thread } from "@/types/tweet";

export interface SharedDraft {
  id: string;
  tweetId?: string;
  threadId?: string;
  allowComments: boolean;
  shareLink: string;
  createdAt: string;
  userId: string;
  viewCount: number;
  expiresAt: string;
}

export interface SharedDraftComment {
  id: string;
  sharedDraftId: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  createdAt: string;
}

export interface UserTokens {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  username: string;
  name: string;
  profileImageUrl?: string;
}

// Interface for token data joined from the database
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
}

export interface DraftTweet {
  id: string;
  content: string;
  mediaIds: string;
  threadId?: string;
  position?: number;
  status: "draft" | "failed";
  createdAt: string;
  error?: string;
  userId: string;
}

export interface DraftThread {
  id: string;
  tweetIds: string;
  status: "draft" | "failed";
  createdAt: string;
  error?: string;
  userId: string;
}

export interface ScheduledTweet {
  id: string;
  content: string;
  mediaIds: string;
  // mediaIds: string[];
  scheduledFor: string;
  threadId?: string;
  position?: number;
  status: "scheduled" | "published" | "failed";
  createdAt: string;
  error?: string;
  userId: string;
  userTokens?: TokenData; // Added for joined data from database
}

export interface ScheduledThread {
  id: string;
  tweetIds: string;
  // tweetIds: string[];
  scheduledFor: string;
  status: "scheduled" | "published" | "failed";
  createdAt: string;
  error?: string;
  userId: string;
  userTokens?: TokenData; // Added for joined data from database
}

export function initializeDatabase(db: Database.Database) {
  // Create user tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_tokens (
      userId TEXT PRIMARY KEY,
      accessToken TEXT NOT NULL,
      refreshToken TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      username TEXT NOT NULL,
      name TEXT NOT NULL,
      profileImageUrl TEXT
    );
  `);

  // Add new draft_tweets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS draft_tweets (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      mediaIds TEXT,
      threadId TEXT,
      position INTEGER,
      status TEXT NOT NULL DEFAULT 'draft',
      createdAt TEXT NOT NULL,
      userId TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES user_tokens(userId)
    );
  `);

  // Add new draft_threads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS draft_threads (
      id TEXT PRIMARY KEY,
      tweetIds TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      createdAt TEXT NOT NULL,
      userId TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES user_tokens(userId)
    );
  `);

  // Create scheduled tweets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduled_tweets (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      mediaIds TEXT,
      scheduledFor TEXT NOT NULL,
      threadId TEXT,
      position INTEGER,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      error TEXT,
      userId TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES user_tokens(userId)
    );
  `);

  // Create scheduled threads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduled_threads (
      id TEXT PRIMARY KEY,
      tweetIds TEXT NOT NULL,
      scheduledFor TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      error TEXT,
      userId TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES user_tokens(userId)
    );
  `);

  // Create shared drafts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS shared_drafts (
      id TEXT PRIMARY KEY,
      tweetId TEXT,
      threadId TEXT,
      allowComments BOOLEAN NOT NULL DEFAULT false,
      shareLink TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL,
      userId TEXT NOT NULL,
      viewCount INTEGER DEFAULT 0,
      expiresAt TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES user_tokens(userId),
      FOREIGN KEY(tweetId) REFERENCES draft_tweets(id),
      FOREIGN KEY(threadId) REFERENCES draft_threads(id)
    );
  
    CREATE TABLE IF NOT EXISTS shared_draft_comments (
      id TEXT PRIMARY KEY,
      sharedDraftId TEXT NOT NULL,
      content TEXT NOT NULL,
      authorName TEXT NOT NULL,
      authorEmail TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(sharedDraftId) REFERENCES shared_drafts(id)
    );
    `);

  // Create indices for faster querying
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_draft_tweets_user_id ON draft_tweets(userId);
    CREATE INDEX IF NOT EXISTS idx_draft_threads_user_id ON draft_threads(userId);
    CREATE INDEX IF NOT EXISTS idx_tweets_scheduled_for ON scheduled_tweets(scheduledFor);
    CREATE INDEX IF NOT EXISTS idx_threads_scheduled_for ON scheduled_threads(scheduledFor);
    CREATE INDEX IF NOT EXISTS idx_tweets_user_id ON scheduled_tweets(userId);
    CREATE INDEX IF NOT EXISTS idx_threads_user_id ON scheduled_threads(userId);
    CREATE INDEX IF NOT EXISTS idx_shared_drafts_share_link ON shared_drafts(shareLink);
    CREATE INDEX IF NOT EXISTS idx_shared_draft_comments_draft_id ON shared_draft_comments(sharedDraftId);
  `);
}

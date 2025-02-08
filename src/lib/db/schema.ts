// /lib/db/schema.ts
import Database from "better-sqlite3";
import { Tweet, Thread } from "@/types/tweet";

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

export interface ScheduledTweet {
  id: string;
  content: string;
  mediaIds: string[];
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
  tweetIds: string[];
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

  // Create indices for faster querying
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tweets_scheduled_for ON scheduled_tweets(scheduledFor);
    CREATE INDEX IF NOT EXISTS idx_threads_scheduled_for ON scheduled_threads(scheduledFor);
    CREATE INDEX IF NOT EXISTS idx_tweets_user_id ON scheduled_tweets(userId);
    CREATE INDEX IF NOT EXISTS idx_threads_user_id ON scheduled_threads(userId);
  `);
}

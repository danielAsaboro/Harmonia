// /lib/db/init_db.ts

import Database from "better-sqlite3";

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

  // Create draft tweets table
  db.exec(`
      CREATE TABLE IF NOT EXISTS draft_tweets (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          mediaIds TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          status TEXT NOT NULL,
          threadId TEXT,
          position INTEGER,
          tags TEXT,
          userId TEXT NOT NULL,
          FOREIGN KEY(userId) REFERENCES user_tokens(userId)
      );
  `);

  // Create draft threads table
  db.exec(`
      CREATE TABLE IF NOT EXISTS draft_threads (
          id TEXT PRIMARY KEY,
          tweetIds TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          status TEXT NOT NULL,
          tags TEXT,
          userId TEXT NOT NULL,
          FOREIGN KEY(userId) REFERENCES user_tokens(userId)
      );
  `);

  // Create shared drafts table
  db.exec(`
      CREATE TABLE IF NOT EXISTS shared_drafts (
        id TEXT PRIMARY KEY,
        draftId TEXT NOT NULL,
        draftType TEXT NOT NULL CHECK(draftType IN ('tweet', 'thread')),
        createdAt TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        canComment BOOLEAN NOT NULL DEFAULT 0,
        creatorId TEXT NOT NULL,
        accessToken TEXT NOT NULL UNIQUE,
        authorName TEXT NOT NULL,
        authorHandle TEXT NOT NULL,
        authorProfileUrl TEXT,
        shareState TEXT NOT NULL DEFAULT 'active',
        FOREIGN KEY(creatorId) REFERENCES user_tokens(userId)
      );
    `);

  // Create shared draft comments table
  db.exec(`
      CREATE TABLE IF NOT EXISTS shared_draft_comments (
        id TEXT PRIMARY KEY,
        sharedDraftId TEXT NOT NULL,
        content TEXT NOT NULL,
        authorId TEXT,
        authorName TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        position INTEGER,
        metadata TEXT NOT NULL DEFAULT '{}',
        resolved BOOLEAN NOT NULL DEFAULT 0,
        resolvedAt TEXT,
        resolvedBy TEXT,
        FOREIGN KEY(sharedDraftId) REFERENCES shared_drafts(id) ON DELETE CASCADE,
        FOREIGN KEY(authorId) REFERENCES user_tokens(userId)
      );
    `);

  // Create indices for faster querying
  db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tweets_scheduled_for ON scheduled_tweets(scheduledFor);
      CREATE INDEX IF NOT EXISTS idx_threads_scheduled_for ON scheduled_threads(scheduledFor);
      CREATE INDEX IF NOT EXISTS idx_tweets_user_id ON scheduled_tweets(userId);
      CREATE INDEX IF NOT EXISTS idx_threads_user_id ON scheduled_threads(userId);
    `);

  // Create indices for drafts
  db.exec(`
      CREATE INDEX IF NOT EXISTS idx_draft_tweets_user_id ON draft_tweets(userId);
      CREATE INDEX IF NOT EXISTS idx_draft_threads_user_id ON draft_threads(userId);
      CREATE INDEX IF NOT EXISTS idx_draft_tweets_thread_id ON draft_tweets(threadId);
  `);

  // Create indices for faster querying
  db.exec(`
      CREATE INDEX IF NOT EXISTS idx_shared_drafts_creator ON shared_drafts(creatorId);
      CREATE INDEX IF NOT EXISTS idx_shared_drafts_access_token ON shared_drafts(accessToken);
      CREATE INDEX IF NOT EXISTS idx_shared_draft_comments_draft ON shared_draft_comments(sharedDraftId);
      CREATE INDEX IF NOT EXISTS idx_shared_drafts_draft_id ON shared_drafts(draftId);
  
    `);

  // Create indices for the new fields
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_comments_shared_draft_id ON shared_draft_comments(sharedDraftId);
    CREATE INDEX IF NOT EXISTS idx_comments_author_id ON shared_draft_comments(authorId);
    CREATE INDEX IF NOT EXISTS idx_comments_resolved ON shared_draft_comments(resolved);
  `);
}

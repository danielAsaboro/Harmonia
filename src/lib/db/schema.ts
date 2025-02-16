// /lib/db/schema.ts
import { Tweet, Thread } from "@/types/tweet";

export interface SharedDraft {
  id: string;
  draftId: string;
  draftType: "tweet" | "thread";
  createdAt: string;
  expiresAt: string;
  canComment: boolean;
  creatorId: string;
  accessToken: string;
  authorName: string;
  authorHandle: string;
  authorProfileUrl?: string;
  shareState: "active" | "expired" | "revoked";
}

export interface CommentMetadata {
  tweetId: string;
  highlightedContent: string;
  startOffset: number;
  endOffset: number;
}

export interface SharedDraftComment {
  id: string;
  sharedDraftId: string;
  content: string;
  authorId: string | null;
  authorName: string;
  createdAt: string;
  position?: number;
  metadata: CommentMetadata;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface DraftTweet extends Omit<Tweet, "createdAt"> {
  createdAt: string;
  userId: string;
  updatedAt: string;
}

export interface DraftThread extends Omit<Thread, "createdAt"> {
  createdAt: string;
  userId: string;
  updatedAt: string;
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

export interface SharedDraftInfo {
  id: string;
  accessToken: string;
  canComment: boolean;
  expiresAt: string;
  shareState: "active" | "expired" | "revoked";
}

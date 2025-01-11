// src/types/tweet.ts

export type TweetStatus = "draft" | "scheduled" | "posted";

export interface Tweet {
  id: string;
  content: string;
  media?: string[]; 
  createdAt: Date;
  status: TweetStatus;
  scheduledFor?: Date;
  threadId?: string;
  position?: number;
}

export interface Thread {
  id: string;
  tweetIds: string[];
  createdAt: Date;
  status: TweetStatus;
  scheduledFor?: Date;
}

// Types for media storage
export interface StoredMedia {
  id: string;
  data: string;  // base64 encoded file data
  type: string;  // mime type
  lastModified: string;
}
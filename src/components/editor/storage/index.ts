// src/features/editor/storage/index.ts

import { Tweet, Thread, StoredMedia } from "@/types/tweet";

export type SaveableData = Tweet | Thread | StoredMedia;

// 1 = highest, 3 = lowest
export type SavePriority = 1 | 2 | 3;

export type SaveStatus = "pending" | "processing" | "completed" | "failed";

export interface SaveOperation {
  id: string;
  timestamp: number;
  type: SaveableData;
  priority: SavePriority;
  status: SaveStatus;
  retryCount?: number;
}

export interface SaveState {
  lastSaveAttempt: Date | null;
  lastSuccessfulSave: Date | null;
  pendingOperations: number;
  errorCount: number;
  isProcessing: boolean;
}

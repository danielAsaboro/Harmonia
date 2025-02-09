// /components/editor/SyncStatus.tsx
import React from "react";
import { Check, Cloud, AlertCircle, Clock } from "lucide-react";

interface SyncStatusProps {
  lastSync: Date | null;
  hasPendingChanges: boolean;
  syncError: string | null;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  lastSync,
  hasPendingChanges,
  syncError,
}) => {
  // Calculate time since last sync
  const getTimeSinceSync = () => {
    if (!lastSync) return "Never synced";
    const diff = Date.now() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    return `${minutes} minutes ago`;
  };

  if (syncError) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Sync failed: {syncError}</span>
      </div>
    );
  }

  if (hasPendingChanges) {
    return (
      <div className="flex items-center gap-2 text-yellow-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Changes pending...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-400">
      <Check className="w-4 h-4" />
      <span className="text-sm">Synced {getTimeSinceSync()}</span>
    </div>
  );
};

// components/composer/SaveStatus.tsx
import React from "react";
import { Check, AlertCircle, Loader2, PenSquare, Send } from "lucide-react";
import { SaveState } from ".";

interface SaveStatusProps {
  saveState: SaveState;
}

export function SaveStatus({ saveState }: SaveStatusProps) {
  const { pendingOperations, isProcessing, errorCount, lastSuccessfulSave } =
    saveState;

  if (errorCount > 0) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle size={16} />
        <span className="text-sm">Save failed. Retrying...</span>
      </div>
    );
  }

  if (isProcessing || pendingOperations > 0) {
    return (
      <div className="flex items-center gap-2 text-blue-400">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">
          {pendingOperations > 1
            ? `Saving ${pendingOperations} changes...`
            : "Saving..."}
        </span>
      </div>
    );
  }

  if (lastSuccessfulSave) {
    return (
      <div className="flex items-center gap-2 text-green-500 animate-fadeOut">
        <Check size={16} />
        <span className="text-sm">Saved</span>
      </div>
    );
  }

  return null;
}

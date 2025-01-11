import React from "react";
import { Tweet, Thread } from "@/types/tweet";
import { storage } from "@/utils/localStorage";
import { dateUtils } from "@/utils/dateUtils";

interface DraftCardProps {
  item: Tweet | Thread;
  onEdit: (item: Tweet | Thread) => void;
  onDelete: (id: string) => void;
}

function DraftCard({ item, onEdit, onDelete }: DraftCardProps) {
  const isThread = "tweetIds" in item;

  return (
    <div className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-400">
              {isThread ? "🧵 Thread" : "💭 Tweet"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="text-white">
            {isThread
              ? `Thread with ${(item as Thread).tweetIds.length} tweets`
              : (item as Tweet).content}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 hover:bg-gray-700 rounded-full text-red-400"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScheduledPostsList() {
  const [drafts, setDrafts] = React.useState<(Tweet | Thread)[]>([]);

  React.useEffect(() => {
    const tweets = storage.getTweets().filter((t) => t.status === "draft");
    const threads = storage.getThreads().filter((t) => t.status === "draft");
    const allDrafts = [...tweets, ...threads].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setDrafts(allDrafts);
  }, []);

  const handleEdit = (item: Tweet | Thread) => {
    // Implementation for editing
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      // Delete from storage and update state
      storage.deleteTweet(id);
      storage.deleteThread(id);
      setDrafts(drafts.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {drafts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No drafts yet. Start composing!
        </div>
      ) : (
        drafts.map((draft) => (
          <DraftCard
            key={draft.id}
            item={draft}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
}

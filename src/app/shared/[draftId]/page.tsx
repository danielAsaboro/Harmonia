// /app/shared/[draftId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Tweet, Thread } from "@/types/tweet";
import { MessageCircle, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SharedDraftData {
  id: string;
  tweetId?: string;
  threadId?: string;
  allowComments: boolean;
  viewCount: number;
  tweet?: Tweet;
  thread?: Thread;
  userName: string;
  userHandle: string;
  userImage?: string;
}

export default async function SharedDraftPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const [draftData, setDraftData] = useState<SharedDraftData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/drafts/${draftId}`);
        if (!response.ok) {
          throw new Error("Failed to load draft");
        }
        const data = await response.json();
        setDraftData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load draft");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraft();
  }, [draftId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading draft...</div>
      </div>
    );
  }

  if (error || !draftData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">{error || "Draft not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              {draftData.viewCount} views
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-8">
          {draftData.userImage ? (
            <img
              src={draftData.userImage}
              alt={draftData.userName}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-800 rounded-full" />
          )}
          <div>
            <div className="font-semibold">{draftData.userName}</div>
            <div className="text-gray-400">@{draftData.userHandle}</div>
          </div>
        </div>

        {/* Draft Content */}
        <div className="space-y-4">
          {draftData.thread ? (
            // Thread View
            draftData.thread.tweetIds.map((tweetId, index) => (
              <div key={tweetId} className="p-4 bg-gray-900 rounded-lg">
                {/* Thread number indicator */}
                <div className="text-sm text-gray-400 mb-2">
                  Tweet {index + 1} of {draftData.thread?.tweetIds.length}
                </div>
                {/* Tweet content */}
                <p className="text-white whitespace-pre-wrap">
                  {draftData.tweet?.content}
                </p>
              </div>
            ))
          ) : (
            // Single Tweet View
            <div className="p-4 bg-gray-900 rounded-lg">
              <p className="text-white whitespace-pre-wrap">
                {draftData.tweet?.content}
              </p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        {draftData.allowComments && (
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex items-center gap-2 text-xl mb-4">
              <MessageCircle className="w-6 h-6" />
              <h2>Comments</h2>
            </div>
            {/* Comments will be implemented later */}
            <div className="text-gray-400 text-center py-8">
              Comments coming soon...
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

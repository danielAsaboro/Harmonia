// /components/composer/SidebarContent.tsx
import React from "react";
import { Tweet } from "@/types/tweet";

interface SidebarContentProps {
  tweets: Tweet[];
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
}

export const DraftsSidebarContent = ({
  tweets,
  selectedPostId,
  setSelectedPostId,
}: SidebarContentProps) => {
  const drafts = tweets.filter((tweet) => tweet.status === "draft");

  return (
    <>
      {drafts.map((tweet) => (
        <div
          key={tweet.id}
          className={`
            group relative border-t border-gray-800 p-4
            transition-all hover:bg-gray-900 cursor-pointer
            ${selectedPostId === tweet.id ? "bg-gray-900" : "bg-transparent"}
          `}
          onClick={() => setSelectedPostId(tweet.id)}
        >
          <div
            className={`
            absolute left-0 top-0 bottom-0 w-1 transition-all duration-200
            ${
              selectedPostId === tweet.id
                ? "bg-blue-500"
                : "bg-transparent group-hover:bg-gray-700"
            }
          `}
          />

          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              {tweet.threadId ? "🧵 Draft Thread" : "💭 Draft Tweet"}
            </p>
            <p className="text-sm text-gray-200">
              {tweet.content.trim().slice(0, 80)}...
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Created {new Date(tweet.createdAt).toLocaleDateString()}
              </span>
              <img src="/icons/x.svg" alt="x logo" className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export const ScheduledSidebarContent = ({
  tweets,
  selectedPostId,
  setSelectedPostId,
}: SidebarContentProps) => {
  const scheduled = tweets.filter((tweet) => tweet.status === "scheduled");

  return (
    <>
      {scheduled.map((tweet) => (
        <div
          key={tweet.id}
          className={`
            group relative border-t border-gray-800 p-4
            transition-all hover:bg-gray-900 cursor-pointer
            ${selectedPostId === tweet.id ? "bg-gray-900" : "bg-transparent"}
          `}
          onClick={() => setSelectedPostId(tweet.id)}
        >
          <div
            className={`
            absolute left-0 top-0 bottom-0 w-1 transition-all duration-200
            ${
              selectedPostId === tweet.id
                ? "bg-green-500"
                : "bg-transparent group-hover:bg-gray-700"
            }
          `}
          />

          <div className="space-y-2">
            <p className="text-sm text-green-400">
              {tweet.threadId ? "🧵 Scheduled Thread" : "📅 Scheduled Tweet"}
            </p>
            <p className="text-sm text-gray-200">
              {tweet.content.trim().slice(0, 80)}...
            </p>
            <div className="flex flex-col gap-1 text-xs">
              <span className="text-green-400">
                Scheduled for: {tweet.scheduledFor?.toLocaleDateString()}
              </span>
              <span className="text-gray-500">
                Created: {new Date(tweet.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export const PostedSidebarContent = ({
  tweets,
  selectedPostId,
  setSelectedPostId,
}: SidebarContentProps) => {
  const posted = tweets.filter((tweet) => tweet.status === "posted");

  return (
    <>
      {posted.map((tweet) => (
        <div
          key={tweet.id}
          className={`
            group relative border-t border-gray-800 p-4
            transition-all hover:bg-gray-900 cursor-pointer
            ${selectedPostId === tweet.id ? "bg-gray-900" : "bg-transparent"}
          `}
          onClick={() => setSelectedPostId(tweet.id)}
        >
          <div
            className={`
            absolute left-0 top-0 bottom-0 w-1 transition-all duration-200
            ${
              selectedPostId === tweet.id
                ? "bg-purple-500"
                : "bg-transparent group-hover:bg-gray-700"
            }
          `}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-purple-400">
                {tweet.threadId ? "🧵 Posted Thread" : "✓ Posted Tweet"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {Math.floor(Math.random() * 100)} likes
                </span>
                <span className="text-xs text-gray-400">
                  {Math.floor(Math.random() * 20)} retweets
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-200">
              {tweet.content.trim().slice(0, 80)}...
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Posted on {new Date(tweet.createdAt).toLocaleDateString()}
              </span>
              <img src="/icons/x.svg" alt="x logo" className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

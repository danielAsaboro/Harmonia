// app/compose/twitter/layout.tsx

"use client";
import React, { useState } from "react";
import {
  ComposerProvider,
  useComposer,
} from "@/components/composer/ComposerContext";
import { Tweet } from "@/types/tweet";
import { testTweets } from "@/types/data";
import {
  DraftsSidebarContent,
  PostedSidebarContent,
  ScheduledSidebarContent,
} from "@/components/composer/SidebarContent";

function ComposerSidebar() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { activeTab, setActiveTab } = useComposer();
  const [tweetList, setTweetList] = useState<Tweet[]>([...testTweets]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const createNewDraft = () => {
    const newTweet: Tweet = {
      id: `tweet-${Date.now()}`,
      content: "",
      createdAt: new Date(),
      status: "draft",
    };

    setTweetList((prev) => [newTweet, ...prev]);
    setSelectedPostId(newTweet.id);
    setIsCreatingNew(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "drafts":
        return (
          <DraftsSidebarContent
            tweets={tweetList}
            selectedPostId={selectedPostId}
            setSelectedPostId={setSelectedPostId}
          />
        );
      case "scheduled":
        return (
          <ScheduledSidebarContent
            tweets={tweetList}
            selectedPostId={selectedPostId}
            setSelectedPostId={setSelectedPostId}
          />
        );
      case "posted":
        return (
          <PostedSidebarContent
            tweets={tweetList}
            selectedPostId={selectedPostId}
            setSelectedPostId={setSelectedPostId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="border-gray-800 max-w-min border-r bg-black">
      <nav className="flex border-b border-gray-800">
        {(["drafts", "scheduled", "posted"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
      <div className="flex-col">
        {activeTab === "drafts" && (
          <section
            className={`
              group flex justify-between items-center
              p-4 cursor-pointer hover:bg-gray-900
              transition-all duration-200 border-b border-gray-800
            `}
            onClick={createNewDraft}
            onMouseEnter={() => setIsCreatingNew(true)}
            onMouseLeave={() => setIsCreatingNew(false)}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`
                flex items-center justify-center
                w-6 h-6 rounded-full
                ${isCreatingNew ? "bg-blue-500" : "bg-gray-700"}
                transition-all duration-200
              `}
              >
                <span className="text-white text-lg">+</span>
              </div>
              <span
                className={`
                font-medium
                ${isCreatingNew ? "text-blue-500" : "text-gray-300"}
                transition-all duration-200
              `}
              >
                New Draft
              </span>
            </div>
            <div
              className={`
              transform transition-transform duration-200
              ${isCreatingNew ? "rotate-180" : "rotate-0"}
            `}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`
                  ${isCreatingNew ? "text-blue-500" : "text-gray-500"}
                  transition-all duration-200
                `}
              >
                <path
                  d="M8 3L14 9L12.5 10.5L8 6L3.5 10.5L2 9L8 3Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </section>
        )}
        <section className="border-b-2 h-screen">{renderContent()}</section>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ComposerProvider>
      <div className="flex">
        <ComposerSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </ComposerProvider>
  );
}

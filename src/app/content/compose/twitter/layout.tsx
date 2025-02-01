// app/compose/twitter/layout.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { EditorProvider, useEditor } from "@/components/editor/context/Editor";
import { Tweet, Thread } from "@/types/tweet";
import { UserAccountProvider } from "@/components/editor/context/account";
import ConfirmDialog from "@/components/editor/ConfirmDialog";
import { SidebarItem } from "@/components/editor/SidebarItem";
import { tweetStorage } from "@/services/tweetStorage";

function EditorSidebar() {
  const {
    activeTab,
    setActiveTab,
    editorState,
    showEditor,
    hideEditor,
    refreshSidebar,
  } = useEditor();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [items, setItems] = useState<(Tweet | Thread)[]>([]);
  const [currentDraft, setCurrentDraft] = useState<Tweet | null>(null);

  // Update current draft state
  useEffect(() => {
    if (editorState.selectedDraftId) {
      const draft = tweetStorage
        .getTweets()
        .find((t) => t.id === editorState.selectedDraftId);
      setCurrentDraft(draft || null);
    } else {
      setCurrentDraft(null);
    }
  }, [editorState.selectedDraftId]);

  // Load items whenever storage changes or tab changes
  useEffect(() => {
    const loadItems = () => {
      let filtered: (Tweet | Thread)[] = [];
      const tweets = tweetStorage.getTweets();
      const threads = tweetStorage.getThreads();

      switch (activeTab) {
        case "drafts":
          filtered = [
            ...tweets.filter((t) => t.status === "draft" && !t.threadId),
            ...threads.filter((t) => t.status === "draft"),
          ];
          break;
        case "scheduled":
          filtered = [
            ...tweets.filter((t) => t.status === "scheduled" && !t.threadId),
            ...threads.filter((t) => t.status === "scheduled"),
          ];
          break;
        case "published":
          filtered = [
            ...tweets.filter((t) => t.status === "published" && !t.threadId),
            ...threads.filter((t) => t.status === "published"),
          ];
          break;
      }

      setItems(
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    };

    // Initial load
    loadItems();
  }, [activeTab, refreshSidebar]);

  const createNewDraft = () => {
    showEditor();
    setIsCreatingNew(false);
  };

  const handleItemClick = (item: Tweet | Thread) => {
    const type = "tweetIds" in item ? "thread" : "tweet";
    showEditor(item.id, type);
  };

  return (
    <div className="border-gray-800 w-80 border-r bg-black">
      <nav className="flex border-b border-gray-800">
        {(["drafts", "scheduled", "published"] as const).map((tab) => (
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
            // onClick={createNewDraft}
            onClick={() => {
              if (
                currentDraft &&
                !currentDraft.threadId &&
                !currentDraft.content.trim() &&
                (!currentDraft.media || currentDraft.media.length === 0)
              ) {
                return; // Don't create new if current is empty
              }
              createNewDraft();
            }}
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
        <section className="h-screen overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No {activeTab} available
            </div>
          ) : (
            items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isSelected={editorState.selectedDraftId === item.id}
                onClick={() => handleItemClick(item)}
                onDelete={(id) => {
                  if (editorState.selectedDraftId === id) {
                    hideEditor();
                  }
                  // Force re-render of the list
                  setItems((prevItems) =>
                    prevItems.filter((item) => item.id !== id)
                  );
                }}
              />
            ))
          )}
        </section>
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
    <UserAccountProvider>
      <EditorProvider>
        <div className="flex">
          <EditorSidebar />
          <main className="flex-1">{children}</main>
        </div>
      </EditorProvider>
    </UserAccountProvider>
  );
}

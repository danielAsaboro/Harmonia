// app/compose/twitter/layout.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { EditorProvider, useEditor } from "@/components/editor/context/Editor";
import { Tweet, Thread } from "@/types/tweet";
import { storage } from "@/utils/localStorage";
import { UserAccountProvider } from "@/components/editor/context/account";
import ConfirmDialog from "@/components/editor/ConfirmDialog";

interface SidebarItemProps {
  item: Tweet | Thread;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}

function SidebarItem({
  item,
  isSelected,
  onClick,
  onDelete,
}: SidebarItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isThread = "tweetIds" in item;
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const preview = isThread
    ? storage.getTweets().find((t) => t.threadId === item.id)?.content || ""
    : (item as Tweet).content;

  const truncatedPreview =
    preview.slice(0, 80) + (preview.length > 80 ? "..." : "");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmDelete = () => {
    // This is the actual delete logic that will run after confirmation
    if (isThread) {
      storage.deleteThread(item.id);
    } else {
      storage.deleteTweet(item.id);
    }
    setShowMenu(false);
    onDelete(item.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement share functionality
  };

  return (
    <div
      className={`
        relative p-4 cursor-pointer transition-all duration-200 border-b border-gray-800
        ${isSelected ? "bg-gray-800" : "hover:bg-gray-900"}
      `}
    >
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this ${
          isThread ? "Thread" : "Tweet"
        } This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
      <div className="flex justify-between items-start group" onClick={onClick}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm text-gray-400">
              {isThread ? "🧵 Thread" : "💭 Tweet"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-300 text-sm truncate">{truncatedPreview}</p>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-700 rounded-full"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <circle cx="8" cy="2" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="14" r="1.5" />
            </svg>
          </button>
        </div>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-4 top-8 z-50 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-700"
          >
            <div className="py-1">
              <button
                onClick={handleShare}
                className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-800 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
              <button
                // onClick={handleDelete}
                onClick={(_) => setShowConfirmDialog(true)}
                className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-gray-800 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

  // Load items whenever storage changes or tab changes
  useEffect(() => {
    const loadItems = () => {
      let filtered: (Tweet | Thread)[] = [];
      const tweets = storage.getTweets();
      const threads = storage.getThreads();

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

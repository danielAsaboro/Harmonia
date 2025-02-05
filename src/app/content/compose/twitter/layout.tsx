// app/content/compose/twitter/layout.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { EditorProvider, useEditor } from "@/components/editor/context/Editor";
import { Tweet, Thread } from "@/types/tweet";
import {
  UserAccountProvider,
  useUserAccount,
} from "@/components/editor/context/account";
import { SidebarItem } from "@/components/editor/SidebarItem";
import { tweetStorage } from "@/utils/localStorage";
import { Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import LoadingState from "@/components/editor/LoadingState";
import { KeyboardProvider, useKeyboard } from "@/context/keyboard-context";
import KeyboardShortcutsDialog from "@/components/keyboard/KeyboardShortcutsDialog";
import SearchModal from "@/components/search/SearchModal";

function EditorSidebar() {
  const {
    activeTab,
    setActiveTab,
    editorState,
    showEditor,
    hideEditor,
    refreshCounter,
    isSidebarVisible,
    toggleSidebar,
  } = useEditor();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [items, setItems] = useState<(Tweet | Thread)[]>([]);
  const [currentDraft, setCurrentDraft] = useState<Tweet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { name, handle, profileImageUrl } = useUserAccount();
  const { showSearch, setShowSearch } = useKeyboard();

  // Filter items based on search query
  const filteredItems = items.filter((item) => {
    const content =
      "content" in item
        ? item.content.toLowerCase()
        : tweetStorage.getThreadPreview(item.id)?.content.toLowerCase() || "";
    return content.includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    if (editorState.selectedDraftId) {
      const draft = tweetStorage
        .getTweets()
        .find((t) => t.id === editorState.selectedDraftId);
      setCurrentDraft(draft || null);
    } else {
      setCurrentDraft(null);
    }
  }, [editorState.selectedDraftId, refreshCounter]);

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

    loadItems();
  }, [activeTab, refreshCounter]);

  const createNewDraft = () => {
    const emptyDraft = items.find(
      (item) =>
        !("tweetIds" in item) &&
        !item.content?.trim() &&
        (!item.media || item.media.length === 0)
    );

    if (emptyDraft) {
      showEditor(emptyDraft.id, "tweet");
    } else {
      showEditor();
    }
    setIsCreatingNew(false);
  };

  const handleItemClick = (item: Tweet | Thread) => {
    const type = "tweetIds" in item ? "thread" : "tweet";
    showEditor(item.id, type);
  };

  return (
    <div
      className={`transition-all duration-300 bg-black ${
        isSidebarVisible ? "w-72 border-r border-gray-800" : "w-0"
      }`}
    >
      {isSidebarVisible && (
        <>
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={name}
                  className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500"
                  title={`${name} (${handle})`}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-800" />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                  title="Search (⌘/Ctrl + F)"
                >
                  <Search size={20} />
                </button>
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-gray-800 rounded-full text-gray-400"
                  title="Toggle sidebar"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex border-b border-gray-800">
            {(["drafts", "scheduled", "published"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 font-medium text-center ${
                  activeTab === tab
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          {/* Content List*/}
          <div className="flex-col">
            {activeTab === "drafts" && (
              <section
                className={`
              group flex justify-between items-center
              p-4 cursor-pointer hover:bg-gray-900
              transition-all duration-200 border-b border-gray-800
            `}
                onClick={() => {
                  if (
                    currentDraft &&
                    !currentDraft.threadId &&
                    !currentDraft.content.trim() &&
                    (!currentDraft.media || currentDraft.media.length === 0)
                  ) {
                    showEditor(currentDraft?.id, "tweet");
                    return;
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
              {activeTab === "scheduled" && (
                <Link
                  href="/content/calendar"
                  className="group flex justify-between items-center p-4 hover:bg-gray-900 transition-all duration-200 border-b border-gray-800"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">View Calendar</span>
                  </div>
                  <span className="text-gray-500 group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </Link>
              )}
              {items.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No {activeTab === "drafts" ? activeTab : `${activeTab} post`}{" "}
                  available
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
                      setItems((prevItems) =>
                        prevItems.filter((item) => item.id !== id)
                      );
                    }}
                  />
                ))
              )}
            </section>
          </div>
        </>
      )}
      {!isSidebarVisible && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 p-2 bg-gray-800 rounded-full text-gray-400 hover:bg-gray-700"
          title="Show sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function WholeEditor({ children }: { children: React.ReactNode }) {
  const { showSearch, setShowSearch, showShortcuts, setShowShortcuts } =
    useKeyboard();

  // Monitor showSearch changes
  // and close shortcuts if needed
  useEffect(() => {
    if (showSearch && showShortcuts) {
      setShowShortcuts(false);
    }
  }, [showSearch]);

  // Monitor showShortcuts changes
  // and close search if needed
  useEffect(() => {
    if (showShortcuts && showSearch) {
      setShowSearch(false);
    }
  }, [showShortcuts]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showSearch) {
          setShowSearch(false);
        }
        if (showShortcuts) {
          setShowShortcuts(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSearch, showShortcuts, setShowSearch, setShowShortcuts]);

  return (
    <>
      <div className="flex h-screen">
        <div className="flex-shrink-0 transition-all duration-300">
          <EditorSidebar />
        </div>
        <div className="flex-1 min-w-0 ">
          <main className="h-full">{children}</main>
        </div>
      </div>
      <KeyboardShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
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
        <KeyboardProvider>
          <AuthErrorHandler>
            <React.Suspense fallback={<LoadingState />}>
              <WholeEditor>{children}</WholeEditor>
            </React.Suspense>
          </AuthErrorHandler>
        </KeyboardProvider>
      </EditorProvider>
    </UserAccountProvider>
  );
}

// New component to handle auth errors within the provider context
function AuthErrorHandler({ children }: { children: React.ReactNode }) {
  const { error } = useUserAccount();

  // If there's an auth error, redirect to login
  useEffect(() => {
    if (error) {
      window.location.href = "/auth/twitter";
    }
  }, [error]);

  return <>{children}</>;
}

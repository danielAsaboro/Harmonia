// components/Editor/Editor.tsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Tweet, Thread, ThreadWithTweets } from "@/types/tweet";
import { v4 as uuidv4 } from "uuid";
import { tweetStorage } from "@/utils/localStorage";

type Tab = "drafts" | "scheduled" | "published";

type EditorState = {
  isVisible: boolean;
  selectedDraftId: string | null;
  selectedDraftType: "tweet" | "thread" | null;
  selectedItemStatus?: Tab;
};

type EditorContextType = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  editorState: EditorState;
  showEditor: (draftId?: string, type?: "tweet" | "thread") => void;
  hideEditor: () => void;
  loadDraft: () => Tweet | ThreadWithTweets | null;
  loadScheduledItem: () => Tweet | ThreadWithTweets | null;
  refreshSidebar: () => void;
  refreshCounter: number;
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
  handleNewDraft: () => void;
  handleScheduleDraft: () => void;
  handlePublishDraft: () => void;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("drafts");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [editorState, setEditorState] = useState<EditorState>({
    isVisible: false,
    selectedDraftId: null,
    selectedDraftType: null,
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible((prev) => !prev);
  }, []);

  const showEditor = useCallback(
    (draftId?: string, type?: "tweet" | "thread") => {
      if (activeTab === "scheduled" || activeTab === "published") {
        // For scheduled items, just show the preview
        if (draftId) {
          setEditorState({
            isVisible: true,
            selectedDraftId: draftId,
            selectedDraftType: type || "tweet",
            selectedItemStatus: activeTab,
          });
        }
        return;
      }

      // Handle draft creation/editing
      if (activeTab == "drafts") {
        if (!draftId) {
          console.log("No draft id - creating new tweet");
          const newId = `tweet-${uuidv4()}`;
          const newTweet: Tweet = {
            id: newId,
            content: "",
            media: [],
            createdAt: new Date(),
            status: "draft",
          };

          tweetStorage.saveTweet(newTweet, true);

          setEditorState({
            isVisible: true,
            selectedDraftId: newId,
            selectedDraftType: "tweet",
            selectedItemStatus: activeTab,
          });

          setRefreshCounter((prev) => prev + 1);
        } else {
          // Load existing draft

          let draftType = type;
          if (!draftType) {
            const thread = tweetStorage
              .getThreads()
              .find((t) => t.id === draftId);
            draftType = thread ? "thread" : "tweet";
          }

          setEditorState({
            isVisible: true,
            selectedDraftId: draftId,
            selectedDraftType: draftType || "tweet",
            selectedItemStatus: activeTab,
          });

          setRefreshCounter((prev) => prev + 1);
        }
      }
    },
    [activeTab]
  );

  const hideEditor = useCallback(() => {
    setEditorState({
      isVisible: false,
      selectedDraftId: null,
      selectedDraftType: null,
    });
    setRefreshCounter((prev) => prev + 1);
  }, []);

  const loadScheduledItem = useCallback(() => {
    if (!editorState.selectedDraftId || !editorState.selectedDraftType) {
      return null;
    }

    if (editorState.selectedDraftType === "tweet") {
      const tweets = tweetStorage.getTweets();
      return (
        tweets.find(
          (t) =>
            t.id === editorState.selectedDraftId &&
            (t.status === "scheduled" || t.status === "published")
        ) || null
      );
    }

    const threads = tweetStorage.getThreads();
    const thread = threads.find((t) => t.id === editorState.selectedDraftId);

    if (
      thread &&
      (thread.status === "scheduled" || thread.status === "published")
    ) {
      const tweets = tweetStorage
        .getTweets()
        .filter((t) => t.threadId === thread.id)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((tweet) => ({
          ...tweet,
          status: "scheduled" as const,
          scheduledFor: thread.scheduledFor,
        }));

      return {
        ...thread,
        tweets,
      };
    }

    return null;
  }, [editorState.selectedDraftId, editorState.selectedDraftType]);

  const loadDraft = useCallback(() => {
    if (!editorState.selectedDraftId || !editorState.selectedDraftType) {
      return null;
    }

    if (editorState.selectedDraftType === "tweet") {
      const tweets = tweetStorage.getTweets();
      return (
        tweets.find(
          (t) => t.id === editorState.selectedDraftId && t.status === "draft"
        ) || null
      );
    } else {
      const threads = tweetStorage.getThreads();
      const thread = threads.find((t) => t.id === editorState.selectedDraftId);

      if (thread && thread.status === "draft") {
        const tweets = tweetStorage
          .getTweets()
          .filter((t) => t.threadId === thread.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        // Important: Preserve the thread's status when loading
        return {
          ...thread,
          tweets: tweets.map((t) => ({
            ...t,
            status: thread.status,
          })),
        } as ThreadWithTweets;
      }
      return null;
    }
  }, [editorState.selectedDraftId, editorState.selectedDraftType]);

  const refreshSidebar = useCallback(() => {
    setRefreshCounter((prev) => prev + 1);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleTabSwitch = (e: CustomEvent<Tab>) => {
      setActiveTab(e.detail);
    };

    const handleNewDraft = () => {
      showEditor();
    };

    const handleScheduleDraft = () => {
      // We'll implement this when we add scheduling functionality
      window.dispatchEvent(new CustomEvent("openScheduler"));
    };

    const handlePublishDraft = () => {
      // We'll implement this when we add publishing functionality
      window.dispatchEvent(new CustomEvent("publishCurrent"));
    };

    window.addEventListener("switchTab", handleTabSwitch as EventListener);
    window.addEventListener("newDraft", handleNewDraft);
    window.addEventListener("scheduleDraft", handleScheduleDraft);
    window.addEventListener("publishDraft", handlePublishDraft);

    return () => {
      window.removeEventListener("switchTab", handleTabSwitch as EventListener);
      window.removeEventListener("newDraft", handleNewDraft);
      window.removeEventListener("scheduleDraft", handleScheduleDraft);
      window.removeEventListener("publishDraft", handlePublishDraft);
    };
  }, [showEditor]);

  useEffect(() => {
    setEditorState({
      isVisible: false,
      selectedDraftId: null,
      selectedDraftType: null,
    });
  }, [activeTab]);

  return (
    <EditorContext.Provider
      value={{
        activeTab,
        setActiveTab,
        editorState,
        showEditor,
        hideEditor,
        loadDraft,
        loadScheduledItem,
        refreshSidebar,
        refreshCounter,
        isSidebarVisible,
        toggleSidebar,
        handleNewDraft: () => window.dispatchEvent(new CustomEvent("newDraft")),
        handleScheduleDraft: () =>
          window.dispatchEvent(new CustomEvent("scheduleDraft")),
        handlePublishDraft: () =>
          window.dispatchEvent(new CustomEvent("publishDraft")),
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within a EditorProvider");
  }
  return context;
}

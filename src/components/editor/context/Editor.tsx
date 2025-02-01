// components/Editor/EditorContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Tweet, Thread, ThreadWithTweets } from "@/types/tweet";
import { v4 as uuidv4 } from "uuid";
import { tweetStorage } from "@/services/tweetStorage";

type Tab = "drafts" | "scheduled" | "published";

type EditorState = {
  isVisible: boolean;
  selectedDraftId: string | null;
  selectedDraftType: "tweet" | "thread" | null;
};

type EditorContextType = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  editorState: EditorState;
  showEditor: (draftId?: string, type?: "tweet" | "thread") => void;
  hideEditor: () => void;
  loadDraft: () => Tweet | ThreadWithTweets | null;
  refreshSidebar: () => void;
  refreshCounter: number;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("drafts");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [editorState, setEditorState] = useState<EditorState>({
    isVisible: false,
    selectedDraftId: null,
    selectedDraftType: null,
  });

  const showEditor = useCallback(
    (draftId?: string, type?: "tweet" | "thread") => {
      // If no draftId is provided, we're creating a new draft
      if (!draftId) {
        const newId = uuidv4();
        const newTweet: Tweet = {
          id: newId,
          content: "",
          media: [],
          createdAt: new Date(),
          status: "draft",
        };

        // // Save the new tweet immediately
        // storage.saveTweet(newTweet);
        // Save the new tweet immediately - Added this line
        tweetStorage.saveTweet(newTweet, true);

        // Set editor state for the new draft
        setEditorState({
          isVisible: true,
          selectedDraftId: newId,
          selectedDraftType: "tweet",
        });

        // Force refresh to update sidebar
        setRefreshCounter((prev) => prev + 1);
      } else {
        // Opening an existing draft
        setEditorState({
          isVisible: true,
          selectedDraftId: draftId,
          selectedDraftType: type || "tweet",
        });
      }
    },
    []
  );

  const hideEditor = useCallback(() => {
    setEditorState({
      isVisible: false,
      selectedDraftId: null,
      selectedDraftType: null,
    });
    setRefreshCounter((prev) => prev + 1);
  }, []);

  const loadDraft = useCallback(() => {
    if (!editorState.selectedDraftId || !editorState.selectedDraftType) {
      return null;
    }

    if (editorState.selectedDraftType === "tweet") {
      const tweets = tweetStorage.getTweets();
      return tweets.find((t) => t.id === editorState.selectedDraftId) || null;
    } else {
      const threads = tweetStorage.getThreads();
      const thread = threads.find((t) => t.id === editorState.selectedDraftId);

      if (thread) {
        const tweets = tweetStorage
          .getTweets()
          .filter((t) => t.threadId === thread.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        return {
          ...thread,
          tweets,
        } as ThreadWithTweets;
      }
      return null;
    }
  }, [editorState.selectedDraftId, editorState.selectedDraftType]);

  const refreshSidebar = useCallback(() => {
    setRefreshCounter((prev) => prev + 1);
  }, []);

  return (
    <EditorContext.Provider
      value={{
        activeTab,
        setActiveTab,
        editorState,
        showEditor,
        hideEditor,
        loadDraft,
        refreshSidebar,
        refreshCounter,
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

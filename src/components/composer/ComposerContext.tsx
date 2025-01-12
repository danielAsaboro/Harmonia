// components/composer/ComposerContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Tweet, Thread, ThreadWithTweets } from "@/types/tweet";
import { storage } from "@/utils/localStorage";

type Tab = "drafts" | "scheduled" | "posted";

type EditorState = {
  isVisible: boolean;
  selectedDraftId: string | null;
  selectedDraftType: "tweet" | "thread" | null;
};

type ComposerContextType = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  editorState: EditorState;
  showEditor: (draftId?: string, type?: "tweet" | "thread") => void;
  hideEditor: () => void;
  loadDraft: () => Tweet | ThreadWithTweets | null;
};

const ComposerContext = createContext<ComposerContextType | undefined>(
  undefined
);

export function ComposerProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("drafts");
  const [editorState, setEditorState] = useState<EditorState>({
    isVisible: false,
    selectedDraftId: null,
    selectedDraftType: null,
  });

  const showEditor = useCallback(
    (draftId?: string, type?: "tweet" | "thread") => {
      setEditorState({
        isVisible: true,
        selectedDraftId: draftId || null,
        selectedDraftType: type || null,
      });
    },
    []
  );

  const hideEditor = useCallback(() => {
    setEditorState({
      isVisible: false,
      selectedDraftId: null,
      selectedDraftType: null,
    });
  }, []);

  const loadDraft = useCallback(() => {
    if (!editorState.selectedDraftId || !editorState.selectedDraftType) {
      return null;
    }

    if (editorState.selectedDraftType === "tweet") {
      const tweets = storage.getTweets();
      return tweets.find((t) => t.id === editorState.selectedDraftId) || null;
    } else {
      const threads = storage.getThreads();
      const thread = threads.find((t) => t.id === editorState.selectedDraftId);

      if (thread) {
        // Load all tweets associated with this thread
        const tweets = storage
          .getTweets()
          .filter((t) => t.threadId === thread.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        return {
          ...thread,
          tweets, // Adding tweets to thread object for easier access
        }  as ThreadWithTweets;
      }
      return null;
    }
  }, [editorState.selectedDraftId, editorState.selectedDraftType]);

  return (
    <ComposerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        editorState,
        showEditor,
        hideEditor,
        loadDraft,
      }}
    >
      {children}
    </ComposerContext.Provider>
  );
}

export function useComposer() {
  const context = useContext(ComposerContext);
  if (context === undefined) {
    throw new Error("useComposer must be used within a ComposerProvider");
  }
  return context;
}

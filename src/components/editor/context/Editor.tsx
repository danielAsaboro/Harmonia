// components/Editor/Editor.tsx
"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
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

  // const showEditor = useCallback(
  //   (draftId?: string, type?: "tweet" | "thread") => {
  //     console.log("active tab:", activeTab);
  //     console.log("draft id: ", draftId);
  //     if (activeTab == "drafts") {
  //       console.log("inside draft conditional");

  //       if (!draftId) {
  //         console.log("No draft id");
  //         const newId = `tweet-${uuidv4()}`;
  //         const newTweet: Tweet = {
  //           id: newId,
  //           content: "",
  //           media: [],
  //           createdAt: new Date(),
  //           status: "draft",
  //         };

  //         tweetStorage.saveTweet(newTweet, true);

  //         setEditorState({
  //           isVisible: true,
  //           selectedDraftId: newId,
  //           selectedDraftType: "tweet",
  //           selectedItemStatus: activeTab,
  //         });

  //         setRefreshCounter((prev) => prev + 1);
  //       } else {
  //         console.log();

  //         // For existing drafts, explicitly preserve status
  //         let draftType = type;
  //         if (!draftType) {
  //           console.log("there's draft id but no draft type");

  //           // Try to determine type from storage
  //           const thread = tweetStorage
  //             .getThreads()
  //             .find((t) => t.id === draftId);
  //           if (thread) {
  //             draftType = "thread";
  //           } else {
  //             const tweet = tweetStorage
  //               .getTweets()
  //               .find((t) => t.id === draftId);
  //             if (tweet) {
  //               draftType = "tweet";
  //             }
  //           }
  //         }

  //         setEditorState({
  //           isVisible: true,
  //           selectedDraftId: draftId,
  //           selectedDraftType: draftType || "tweet",
  //           selectedItemStatus: activeTab,
  //         });

  //         setRefreshCounter((prev) => prev + 1);
  //       }
  //     } else if (activeTab == "scheduled") {
  //       //
  //       console.log("inside scheduled conditional");
  //     }
  //   },
  //   [activeTab]
  // );

  const showEditor = useCallback(
    (draftId?: string, type?: "tweet" | "thread") => {
      console.log("=== showEditor called ===");
      console.log("Current active tab:", activeTab);
      console.log("Received draftId:", draftId);
      console.log("Received type:", type);

      if (activeTab === "scheduled") {
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

      if (activeTab == "drafts") {
        console.log("Inside drafts conditional");

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
          console.log("Created new tweet:", newTweet);

          setEditorState({
            isVisible: true,
            selectedDraftId: newId,
            selectedDraftType: "tweet",
            selectedItemStatus: activeTab,
          });
          console.log("Set editor state for new tweet");

          setRefreshCounter((prev) => prev + 1);
        } else {
          console.log("Has draft id");

          let draftType = type;
          if (!draftType) {
            console.log("Determining type from storage");

            const thread = tweetStorage
              .getThreads()
              .find((t) => t.id === draftId);
            if (thread) {
              console.log("Found thread:", thread);
              draftType = "thread";
            } else {
              const tweet = tweetStorage
                .getTweets()
                .find((t) => t.id === draftId);
              if (tweet) {
                console.log("Found tweet:", tweet);
                draftType = "tweet";
              }
            }
          }

          console.log("Setting editor state with type:", draftType);
          setEditorState({
            isVisible: true,
            selectedDraftId: draftId,
            selectedDraftType: draftType || "tweet",
            selectedItemStatus: activeTab,
          });

          setRefreshCounter((prev) => prev + 1);
        }
      }
      // } else if (activeTab == "scheduled") {
      //   console.log("Inside scheduled conditional");

      //   if (draftId) {
      //     let draftType = type;
      //     if (!draftType) {
      //       console.log("Determining type for scheduled item");
      //       const thread = tweetStorage
      //         .getThreads()
      //         .find((t) => t.id === draftId);
      //       if (thread) {
      //         console.log("Found scheduled thread:", thread);
      //         draftType = "thread";
      //       } else {
      //         const tweet = tweetStorage
      //           .getTweets()
      //           .find((t) => t.id === draftId);
      //         if (tweet) {
      //           console.log("Found scheduled tweet:", tweet);
      //           draftType = "tweet";
      //         }
      //       }
      //     }

      //     console.log("Setting editor state for scheduled item:", draftType);
      //     setEditorState({
      //       isVisible: true,
      //       selectedDraftId: draftId,
      //       selectedDraftType: draftType || "tweet",
      //       selectedItemStatus: activeTab,
      //     });

      //     setRefreshCounter((prev) => prev + 1);
      //   }
      // }

      console.log("=== showEditor completed ===");
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

  // in Editor.tsx
  const loadScheduledItem = useCallback(() => {
    if (!editorState.selectedDraftId || !editorState.selectedDraftType) {
      return null;
    }

    if (editorState.selectedDraftType === "tweet") {
      const tweets = tweetStorage.getTweets();
      return tweets.find((t) => t.id === editorState.selectedDraftId) || null;
    } else {
      // For threads
      const threads = tweetStorage.getThreads();
      const thread = threads.find((t) => t.id === editorState.selectedDraftId);

      if (thread && thread.status === "scheduled") {
        // Get all tweets in the thread and ensure they maintain scheduled status
        const tweets = tweetStorage
          .getTweets()
          .filter((t) => t.threadId === thread.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .map((tweet) => ({
            ...tweet,
            status: "scheduled" as const,
            scheduledFor: thread.scheduledFor, // Important: Use thread's scheduledFor
          }));

        return {
          ...thread,
          tweets,
        } as ThreadWithTweets;
      }
      return null;
    }
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

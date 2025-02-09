// components/editor/Main.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Tweet, Thread, UnifiedTweetComposerProps } from "@/types/tweet";
import MediaUpload from "./media/MediaUpload";
import MediaPreview from "./media/MediaPreview";
import ThreadPreview from "./ThreadPreview";
import { useEditor } from "./context/Editor";
import { PenSquare, Eye, Save, Clock, Send, X, Search } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { SaveStatus } from "./storage/SaveStatus";
import { useUserAccount } from "./context/account";
import CharacterCount, { AddTweetButton, ThreadPosition } from "./extras";
import { SaveState } from "./storage";
import { tweetStorage } from "@/utils/localStorage";
import {
  getMediaFile,
  removeMediaFile,
  storeMediaFile,
} from "./media/indexedDB";
import SchedulePicker from "../scheduler/SchedulePicker";
import { cn } from "@/utils/ts-merge";
import PublishingModal from "./PublishingModal";
import { useKeyboard } from "@/context/keyboard-context";

//  helper function
const repurposeTweet = (tweet: Tweet): Tweet => {
  return {
    id: `tweet-${uuidv4()}`,
    content: tweet.content,
    media: [...(tweet.media || [])],
    createdAt: new Date(),
    status: "draft",
  };
};

const repurposeThread = (
  thread: Thread,
  tweets: Tweet[]
): [Thread, Tweet[]] => {
  const newThreadId = `thread-${uuidv4()}`;
  const newThread: Thread = {
    id: newThreadId,
    tweetIds: [],
    createdAt: new Date(),
    status: "draft",
  };

  const newTweets = tweets.map((tweet, index) => ({
    id: `tweet-${uuidv4()}`,
    content: tweet.content,
    media: [...(tweet.media || [])],
    createdAt: new Date(),
    status: "draft" as const,
    threadId: newThreadId,
    position: index,
  }));

  newThread.tweetIds = newTweets.map((t) => t.id);
  return [newThread, newTweets];
};

export default function PlayGround({
  draftId,
  draftType,
}: UnifiedTweetComposerProps) {
  const {
    name: userName,
    handle: userTwitterHandle,
    profileImageUrl,
    isLoading: isUserAccountDetailsLoading,
    getAvatar,
  } = useUserAccount();
  const {
    hideEditor,
    loadDraft,
    refreshSidebar,
    activeTab,
    setActiveTab,
    loadScheduledItem,
    editorState,
  } = useEditor();
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [saveState, setSaveState] = useState<SaveState>({
    lastSaveAttempt: null,
    lastSuccessfulSave: null,
    pendingOperations: 0,
    errorCount: 0,
    isProcessing: false,
  });
  const [isThread, setIsThread] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const textareaRefs = useRef<HTMLTextAreaElement[]>([]);
  const [currentlyEditedTweet, setCurrentlyEditedTweet] = useState<number>(0);
  const [contentChanged, setContentChanged] = useState(false);
  const [publishingStatus, setPublishingStatus] = useState<
    "publishing" | "success" | "error" | null
  >(null);
  const [publishingError, setPublishingError] = useState<string | null>(null);
  const [lastBackendSync, setLastBackendSync] = useState<Date | null>(null);
  const pendingChangesRef = useRef(false);

  const validateTweets = (): boolean => {
    const MAX_CHARS = 280;
    const invalidTweets = tweets.filter(
      (tweet) => tweet.content.length > MAX_CHARS
    );

    if (invalidTweets.length > 0) {
      // Find first invalid tweet position
      const position =
        tweets.findIndex((tweet) => tweet.content.length > MAX_CHARS) + 1;
      const message =
        tweets.length > 1
          ? `Tweet ${position} exceeds ${MAX_CHARS} characters`
          : `Tweet exceeds ${MAX_CHARS} characters`;

      alert(message);
      return false;
    }
    return true;
  };

  const validateTweetsLength = (): boolean => {
    const MAX_CHARS = 280;
    return !tweets.some((tweet) => tweet.content.length > MAX_CHARS);
  };

  const ensureUniqueIds = (tweetsArray: Tweet[]): Tweet[] => {
    const seenIds = new Set<string>();
    return tweetsArray.map((tweet, index) => {
      if (!tweet.id || seenIds.has(tweet.id)) {
        // Generate new ID if missing or duplicate
        const newId = `${uuidv4()}-${index}`;
        seenIds.add(newId);
        return { ...tweet, id: newId };
      }
      seenIds.add(tweet.id);
      return tweet;
    });
  };

  const handleTweetChange = (index: number, newContent: string) => {
    if (activeTab != "drafts") return;

    const newTweets = [...tweets];
    newTweets[index] = {
      ...newTweets[index],
      content: newContent,
    };

    setTweets(ensureUniqueIds(newTweets));
    setContentChanged(true);
    pendingChangesRef.current = true;

    if (isThread && threadId) {
      const thread: Thread = {
        id: threadId,
        tweetIds: newTweets.map((t) => t.id),
        createdAt: new Date(),
        status: "draft",
      };
      tweetStorage.saveThread(thread, newTweets, true);
    } else {
      tweetStorage.saveTweet(newTweets[0], true);
    }
  };

  const handleDeleteTweet = async (index: number) => {
    try {
      const newTweets = [...tweets];
      const tweetToDelete = newTweets[index];

      // Clean up media files before deleting tweet
      if (tweetToDelete.media && tweetToDelete.media.length > 0) {
        try {
          await Promise.all(
            tweetToDelete.media.map(async (mediaId) => {
              try {
                await removeMediaFile(mediaId);
              } catch (mediaError) {
                console.error(`Failed to remove media ${mediaId}:`, mediaError);
              }
            })
          );
        } catch (mediaError) {
          console.error("Error cleaning up media files:", mediaError);
        }
      }

      if (tweets.length === 1) {
        // For the last tweet in any context (thread or standalone)
        const currentId = newTweets[0].id;
        const resetTweet = {
          ...newTweets[0],
          id: currentId,
          content: "",
          media: [], // Ensure media array is reset
          createdAt: new Date(),
          status: "draft" as const,
          threadId: undefined,
          position: undefined,
        };

        // If it was part of a thread, clean up thread
        if (threadId) {
          tweetStorage.deleteThread(threadId);
          setThreadId(null);
          setIsThread(false);
        }

        // Update local state and save
        setTweets([resetTweet]);
        tweetStorage.saveTweet(resetTweet, true);
      } else if (tweets.length === 2 && isThread && threadId) {
        // When we're about to delete one tweet from a two-tweet thread

        // Remove the tweet to be deleted
        newTweets.splice(index, 1);

        // Convert remaining tweet to standalone
        const remainingTweet = {
          ...newTweets[0],
          threadId: undefined,
          position: undefined,
        };

        // Delete the thread since it's no longer needed
        tweetStorage.deleteThread(threadId);

        // Save the remaining tweet as standalone
        tweetStorage.saveTweet(remainingTweet, true);

        // Update state
        setTweets([remainingTweet]);
        setThreadId(null);
        setIsThread(false);
      } else if (isThread && threadId) {
        // For threads with more than 2 tweets

        // First delete the tweet from storage
        tweetStorage.deleteTweetFromThread(tweetToDelete.id);

        // Remove the tweet from array
        newTweets.splice(index, 1);

        // Update positions for remaining tweets
        const updatedTweets = newTweets.map((tweet, i) => ({
          ...tweet,
          position: i,
        }));

        // Update thread in storage with new tweet arrangement
        const thread = {
          id: threadId,
          tweetIds: updatedTweets.map((t) => t.id),
          createdAt: new Date(),
          status: "draft" as const,
        };

        // Update local state
        setTweets(updatedTweets);

        // Save updated thread and tweets
        tweetStorage.saveThread(thread, updatedTweets, true);
      } else {
        // For standalone tweets
        tweetStorage.deleteTweet(newTweets[index].id);
        newTweets.splice(index, 1);
        setTweets(newTweets);
      }

      refreshSidebar();
    } catch (error) {
      console.error("Error deleting tweet:", error);
      alert("Failed to delete tweet. Please try again.");
    }
  };

  const handleMediaUpload = async (tweetIndex: number, files: File[]) => {
    const newTweets = [...tweets];
    const currentMedia = newTweets[tweetIndex].media || [];
    const totalFiles = currentMedia.length + files.length;

    if (totalFiles > 4) {
      alert("Maximum 4 media files per tweet");
      return;
    }

    try {
      // Store media files and get their IDs
      const mediaIds = await Promise.all(
        files.map((file) => storeMediaFile(file))
      );

      // Update the tweet's media array
      newTweets[tweetIndex] = {
        ...newTweets[tweetIndex],
        media: [...currentMedia, ...mediaIds],
      };

      // Save the updated tweets
      setTweets(newTweets);
      setContentChanged(true);

      // If it's a thread, save with thread context
      if (isThread && threadId) {
        const thread: Thread = {
          id: threadId,
          tweetIds: newTweets.map((t) => t.id),
          createdAt: new Date(),
          status: "draft",
        };
        tweetStorage.saveThread(thread, newTweets, true);
      } else {
        // For single tweet
        tweetStorage.saveTweet(newTweets[0], true);
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      alert("Failed to upload media");
    }
  };

  const handleRemoveMedia = (tweetIndex: number, mediaIndex: number) => {
    const newTweets = [...tweets];
    const currentMedia = newTweets[tweetIndex].media || [];
    const mediaId = currentMedia[mediaIndex];

    if (mediaId) {
      removeMediaFile(mediaId);
      newTweets[tweetIndex].media = currentMedia.filter(
        (_, i) => i !== mediaIndex
      );
      setTweets(newTweets);
    }
  };

  const addTweetToThread = (index: number) => {
    if (activeTab != "drafts") return;
    // Generate a new threadId when converting to a thread

    if (!threadId) {
      const newThreadId = `thread-${uuidv4()}`;
      setThreadId(newThreadId);
    }

    createNewTweet(index);
  };
  const createNewTweet = (index: number) => {
    if (!isThread) {
      // Generate a new threadId when converting to a thread
      const newThreadId = `thread-${uuidv4()}`;
      setThreadId(newThreadId);

      const firstTweet = {
        ...tweets[0],
        threadId: newThreadId,
        position: 0,
      };

      const newTweet = {
        id: `tweet-${uuidv4()}`,
        content: "",
        media: [],
        createdAt: new Date(),
        status: "draft" as const,
        threadId: newThreadId,
        position: 1,
      };

      setTweets([firstTweet, newTweet]);
      setIsThread(true);
    } else {
      // For existing threads, use current threadId
      const newTweet = {
        id: `tweet-${uuidv4()}`,
        content: "",
        media: [],
        createdAt: new Date(),
        status: "draft" as const,
        threadId: threadId || `thread-${uuidv4()}`,
        position: index + 1,
      };

      const newTweets = [...tweets];
      newTweets.splice(index + 1, 0, newTweet);
      setTweets(newTweets);
    }
    setTimeout(() => {
      const nextTextarea = textareaRefs.current[index + 1];
      if (nextTextarea) {
        nextTextarea.focus();
      }
    }, 0);
  };

  const handleSchedulePost = async (scheduledDate: Date) => {
    if (!validateTweets()) return;
    try {
      // Get user session data first
      const response = await fetch("/api/auth/twitter/user");
      if (!response.ok) {
        throw new Error("Failed to get user data");
      }
      const userData = await response.json();
      const userId = userData.id;

      // Save scheduled tweets to both localStorage and SQLite
      if (isThread && threadId) {
        // Prepare thread data for SQLite
        const threadData = {
          id: threadId,
          tweetIds: tweets.map((t) => t.id),
          scheduledFor: scheduledDate.toISOString(),
          status: "scheduled" as const,
          createdAt: new Date().toISOString(),
          userId,
        };

        // Prepare tweets data for SQLite
        const tweetsData = tweets.map((tweet) => ({
          id: tweet.id,
          content: tweet.content,
          mediaIds: tweet.media || [],
          scheduledFor: scheduledDate.toISOString(),
          threadId: threadId,
          position: tweet.position,
          status: "scheduled" as const,
          createdAt: new Date().toISOString(),
          userId,
        }));

        // Save to SQLite via API
        const scheduleResponse = await fetch("/api/scheduler/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "thread",
            thread: threadData,
            tweets: tweetsData,
          }),
        });

        if (!scheduleResponse.ok) {
          throw new Error("Failed to schedule thread");
        }

        // Save to localStorage for UI
        const thread: Thread = {
          id: threadId,
          tweetIds: tweets.map((t) => t.id),
          createdAt: new Date(),
          status: "scheduled",
          scheduledFor: scheduledDate,
        };

        tweetStorage.saveThread(
          thread,
          tweets.map((t) => ({
            ...t,
            status: "scheduled" as const,
            scheduledFor: scheduledDate,
          })),
          true
        );
      } else {
        // Prepare single tweet data for SQLite
        const tweetData = {
          id: tweets[0].id,
          content: tweets[0].content,
          mediaIds: tweets[0].media || [],
          scheduledFor: scheduledDate.toISOString(),
          status: "scheduled" as const,
          createdAt: new Date().toISOString(),
          userId,
        };

        // Save to SQLite via API
        const scheduleResponse = await fetch("/api/scheduler/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "tweet",
            tweet: tweetData,
          }),
        });

        if (!scheduleResponse.ok) {
          throw new Error("Failed to schedule tweet");
        }

        // Save to localStorage for UI
        tweetStorage.saveTweet(
          {
            ...tweets[0],
            status: "scheduled",
            scheduledFor: scheduledDate,
          },
          true
        );
      }

      // Close the scheduler and editor
      setShowScheduler(false);
      hideEditor();

      // Refresh the sidebar to show the new scheduled post
      refreshSidebar();
    } catch (error) {
      console.error("Error scheduling post:", error);
      alert("Failed to schedule post. Please try again.");
    }
  };

  const isValidToPublish = validateTweetsLength();

  const handlePublish = async () => {
    if (!validateTweets()) return;

    setPublishingStatus("publishing");
    setPublishingError(null);

    try {
      // Get media data for each tweet
      const tweetsWithMedia = await Promise.all(
        tweets.map(async (tweet) => {
          let mediaUrls: string[] = [];
          if (tweet.media && tweet.media.length > 0) {
            mediaUrls = await Promise.all(
              tweet.media.map(async (mediaId) => {
                const mediaData = await getMediaFile(mediaId);
                return mediaData || "";
              })
            );
          }
          return {
            content: tweet.content,
            media: mediaUrls,
          };
        })
      );

      // Post to Twitter API - handles both single tweets and threads
      const response = await fetch("/api/twitter/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isThread ? tweetsWithMedia : tweetsWithMedia[0]),
      });

      if (!response.ok) {
        console.log(response.body);
        throw new Error("Failed to post to Twitter");
      }

      // await new Promise((resolve) => setTimeout(resolve, 5000));

      // Update local storage
      if (isThread && threadId) {
        const thread: Thread = {
          id: threadId,
          tweetIds: tweets.map((t) => t.id),
          createdAt: new Date(),
          status: "published",
        };
        tweetStorage.saveThread(
          thread,
          tweets.map((t) => ({ ...t, status: "published" as const })),
          true
        );
      } else {
        tweetStorage.saveTweet(
          { ...tweets[0], status: "published" as const },
          true
        );
      }

      setPublishingStatus("success");
      setTimeout(() => {
        setPublishingStatus(null);
        hideEditor();
        refreshSidebar();
      }, 2000); // Auto-close after success
    } catch (error) {
      console.error("Error publishing:", error);
      setPublishingError(
        error instanceof Error
          ? error.message
          : "Failed to publish. Please try again."
      );
      setPublishingStatus("error");
    }
  };
  const handleSaveAsDraft = () => {
    if (isThread && threadId) {
      const thread: Thread = {
        id: threadId,
        tweetIds: tweets.map((t) => t.id),
        createdAt: new Date(),
        status: "draft",
      };
      tweetStorage.saveThread(thread, tweets, true);
    } else {
      tweetStorage.saveTweet(tweets[0], true);
    }

    hideEditor();
    refreshSidebar();
  };

  const setTextAreaRef = (el: HTMLTextAreaElement | null, index: number) => {
    if (el) {
      textareaRefs.current[index] = el;
    }
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  const handleRepurpose = () => {
    if (isThread && threadId) {
      const [newThread, newTweets] = repurposeThread(
        {
          id: threadId,
          tweetIds: tweets.map((t) => t.id),
          createdAt: new Date(),
          status: "draft",
        },
        tweets
      );
      tweetStorage.saveThread(newThread, newTweets, true);
    } else {
      const newTweet = repurposeTweet(tweets[0]);
      tweetStorage.saveTweet(newTweet, true);
    }

    hideEditor();
    setActiveTab("drafts");
    refreshSidebar();
  };

  // Ensure unique IDs before rendering
  const tweetsWithUniqueIds = tweets.map((tweet, index) => ({
    ...tweet,
    id: tweet.id || `${uuidv4()}-${index}`, // Fallback ID includes index for uniqueness
  }));

  // // Initialize editor with proper state
  useEffect(() => {
    const initializeEditor = async () => {
      if (draftId) {
        const isScheduled =
          editorState.selectedItemStatus === "scheduled" ||
          editorState.selectedItemStatus === "published";
        const content = isScheduled ? loadScheduledItem() : loadDraft();

        if (content) {
          // Reset thread state before setting new content
          setIsThread(false);

          if ("tweets" in content) {
            setIsThread(true);
            setTweets(
              content.tweets.map((tweet) => ({
                ...tweet,
                status: content.status,
                scheduledFor: content.scheduledFor,
              }))
            );
            setThreadId(content.id);
          } else {
            setTweets([content as Tweet]);
            setThreadId(null);
          }
        }
      } else {
        // Only create new tweets in draft mode
        if (activeTab === "drafts") {
          setIsThread(false);
          setThreadId(null);
          const newTweet: Tweet = {
            id: `tweet-${uuidv4()}`,
            content: "",
            media: [],
            createdAt: new Date(),
            status: "draft",
          };
          setTweets([newTweet]);
          tweetStorage.saveTweet(newTweet, true);
          refreshSidebar();
        }
      }
      setIsLoading(false);
    };

    initializeEditor();
  }, [
    draftId,
    draftType,
    loadDraft,
    activeTab,
    loadScheduledItem,
    editorState.selectedDraftId,
    editorState.selectedItemStatus,
    refreshSidebar,
  ]);

  // Add effect to manage threadId
  useEffect(() => {
    // If it's a thread draft, use its existing threadId
    if (draftType === "thread" && draftId) {
      const thread = tweetStorage.getThreads().find((t) => t.id === draftId);
      setThreadId(thread?.id || `thread-${uuidv4()}`);
    }
    // For new tweets or single tweets, set threadId to null
    else {
      setThreadId(null);
    }
  }, [draftId, draftType]);

  useEffect(() => {
    if (!isLoading && tweets.length > 0 && contentChanged) {
      // Only run if content changed
      setSaveState((prev) => ({
        ...prev,
        isProcessing: true,
        pendingOperations: prev.pendingOperations + 1,
        lastSaveAttempt: new Date(),
      }));

      try {
        if (isThread && threadId) {
          const firstTweet = tweets[0];
          const thread: Thread = {
            id: threadId,
            tweetIds: tweets.map((t) => t.id),
            createdAt: firstTweet.createdAt,
            status: firstTweet.status,
            scheduledFor: firstTweet.scheduledFor,
          };
          tweetStorage.saveThread(thread, tweets);
        } else {
          tweetStorage.saveTweet(tweets[0]);
        }

        setSaveState((prev) => ({
          ...prev,
          isProcessing: false,
          pendingOperations: Math.max(0, prev.pendingOperations - 1),
          lastSuccessfulSave: new Date(),
          errorCount: 0,
        }));
        refreshSidebar();
        setContentChanged(false); // Reset the flag after successful save
      } catch (error) {
        setSaveState((prev) => ({
          ...prev,
          isProcessing: false,
          errorCount: prev.errorCount + 1,
          pendingOperations: Math.max(0, prev.pendingOperations - 1),
        }));
        console.error("Error saving tweets:", error);
      }
    }
  }, [tweets, isThread, threadId, isLoading, contentChanged, refreshSidebar]);

  useEffect(() => {
    const handleSwitchDraft = (e: CustomEvent) => {
      const direction = e.detail as "prev" | "next";
      if (!tweets.length) return;

      const currentIndex = currentlyEditedTweet;
      let newIndex;

      if (direction === "prev") {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tweets.length - 1;
      } else {
        newIndex = currentIndex < tweets.length - 1 ? currentIndex + 1 : 0;
      }

      setCurrentlyEditedTweet(newIndex);
      textareaRefs.current[newIndex]?.focus();
    };

    window.addEventListener("switchDraft", handleSwitchDraft as EventListener);

    return () => {
      window.removeEventListener(
        "switchDraft",
        handleSwitchDraft as EventListener
      );
    };
  }, [currentlyEditedTweet, tweets.length]);
  // Clean up when component unmounts

  useEffect(() => {
    return () => setTweets([]);
  }, []);

  // keyboard shortcuts
  // useEffect for publishing and scheduling
  useEffect(() => {
    const handlePublish = () => {
      if (isValidToPublish) {
        handlePublish();
      }
    };

    const handleSchedule = () => {
      if (isValidToPublish) {
        setShowScheduler(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSchedule();
            break;
          case "p":
            e.preventDefault();
            handlePublish();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("publishDraft", handlePublish);
    window.addEventListener("scheduleDraft", handleSchedule);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("publishDraft", handlePublish);
      window.removeEventListener("scheduleDraft", handleSchedule);
    };
  }, [isValidToPublish, handlePublish]);

  // useEffect for draft switching in thread
  useEffect(() => {
    const handleDraftSwitch = (e: KeyboardEvent) => {
      if (e.metaKey && e.altKey) {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            // Move to previous draft
            if (currentlyEditedTweet > 0) {
              setCurrentlyEditedTweet((prev) => prev - 1);
              textareaRefs.current[currentlyEditedTweet - 1]?.focus();
            }
            break;
          case "ArrowDown":
            e.preventDefault();
            // Move to next draft
            if (currentlyEditedTweet < tweets.length - 1) {
              setCurrentlyEditedTweet((prev) => prev + 1);
              textareaRefs.current[currentlyEditedTweet + 1]?.focus();
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleDraftSwitch);
    return () => window.removeEventListener("keydown", handleDraftSwitch);
  }, [currentlyEditedTweet, tweets.length]);

  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (!pendingChangesRef.current) return;

      try {
        if (isThread && threadId) {
          const thread: Thread = {
            id: threadId,
            tweetIds: tweets.map((t) => t.id),
            createdAt: new Date(),
            status: "draft",
          };

          await fetch("/api/drafts/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "thread",
              thread,
              tweets,
            }),
          });
        } else {
          await fetch("/api/drafts/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "tweet",
              tweet: tweets[0],
            }),
          });
        }

        setLastBackendSync(new Date());
        pendingChangesRef.current = false;
      } catch (error) {
        console.error("Failed to sync with backend:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(syncInterval);
  }, [tweets, isThread, threadId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={hideEditor}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* Show different controls based on tab */}

        <div className="flex items-center gap-3">
          {activeTab === "drafts" && (
            <>
              <SaveStatus saveState={saveState} />

              <button
                className={cn(
                  "px-4 py-1.5 rounded-full flex items-center gap-2",
                  "text-gray-400 hover:bg-gray-800",
                  !isValidToPublish &&
                    "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
                onClick={() => isValidToPublish && setShowScheduler(true)}
                disabled={!isValidToPublish}
                title={
                  !isValidToPublish
                    ? "Tweet content exceeds character limit"
                    : undefined
                }
              >
                <Clock size={18} />
                Schedule
              </button>

              <button
                onClick={handlePublish}
                className={cn(
                  "px-4 py-1.5 bg-blue-500 text-white rounded-full",
                  "hover:bg-blue-600 flex items-center gap-2",
                  !isValidToPublish &&
                    "opacity-50 cursor-not-allowed hover:bg-blue-500"
                )}
                disabled={!isValidToPublish}
                title={
                  !isValidToPublish
                    ? "Tweet content exceeds character limit"
                    : undefined
                }
              >
                <Send size={18} />
                Publish
              </button>
            </>
          )}

          {activeTab === "scheduled" && (
            <button
              onClick={handlePublish}
              className={cn(
                "px-4 py-1.5 bg-blue-500 text-white rounded-full",
                "hover:bg-blue-600 flex items-center gap-2",
                !isValidToPublish &&
                  "opacity-50 cursor-not-allowed hover:bg-blue-500"
              )}
              disabled={!isValidToPublish}
              title={
                !isValidToPublish
                  ? "Tweet content exceeds character limit"
                  : undefined
              }
            >
              <Send size={18} />
              Publish
            </button>
          )}
        </div>
        {/* <div className="flex items-center gap-3">
          {activeTab === "drafts" ? (
            <>
              <SaveStatus saveState={saveState} />

              <button
                className={cn(
                  "px-4 py-1.5 rounded-full flex items-center gap-2",
                  "text-gray-400 hover:bg-gray-800",
                  !isValidToPublish &&
                    "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
                onClick={() => isValidToPublish && setShowScheduler(true)}
                disabled={!isValidToPublish}
                title={
                  !isValidToPublish
                    ? "Tweet content exceeds character limit"
                    : undefined
                }
              >
                <Clock size={18} />
                Schedule
              </button>
            </>
          ) : undefined}
          {activeTab === "scheduled" ? (
            <button
              onClick={handlePublish}
              className={cn(
                "px-4 py-1.5 bg-blue-500 text-white rounded-full",
                "hover:bg-blue-600 flex items-center gap-2",
                !isValidToPublish &&
                  "opacity-50 cursor-not-allowed hover:bg-blue-500"
              )}
              disabled={!isValidToPublish}
              title={
                !isValidToPublish
                  ? "Tweet content exceeds character limit"
                  : undefined
              }
            >
              <Send size={18} />
              Publish
            </button>
          ) : undefined}
        </div> */}
      </div>

      <div className="bg-gray-900 rounded-lg">
        {tweetsWithUniqueIds.map((tweet, index) => (
          <div key={tweet.id} className="relative p-4">
            {/* Thread line */}
            {index < tweets.length - 1 && (
              <div
                className="absolute left-10 w-0.5 bg-gray-800"
                style={{
                  top: "4rem",
                  bottom: "-1rem",
                }}
              />
            )}

            <div className="flex gap-3">
              <div className="flex-shrink-0">{getAvatar()}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-400">
                    <span
                      className={cn(
                        "font-bold",
                        isUserAccountDetailsLoading
                          ? "text-gray-600 animate-pulse"
                          : "text-white"
                      )}
                    >
                      {userName}
                    </span>
                    <span
                      className={cn(
                        isUserAccountDetailsLoading
                          ? "text-gray-700 animate-pulse"
                          : "text-gray-400"
                      )}
                    >
                      {userTwitterHandle}
                    </span>
                  </div>
                  {(tweets.length === 1 || index > 0) &&
                    activeTab === "drafts" && (
                      <button
                        onClick={() => handleDeleteTweet(index)}
                        className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                    )}
                </div>

                {/* Make textarea readonly if not in drafts */}
                <textarea
                  value={tweet.content}
                  onFocus={() => setCurrentlyEditedTweet(index)}
                  onChange={(e) => {
                    if (activeTab === "drafts") {
                      handleTweetChange(index, e.target.value);
                      adjustTextareaHeight(e.target);
                    }
                  }}
                  placeholder={
                    index === 0 ? "What's happening?" : "Add to thread..."
                  }
                  className="w-full bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-white min-h-[60px] mt-2"
                  ref={(el) => setTextAreaRef(el, index)}
                  onKeyDown={(e) => {
                    if (
                      activeTab === "drafts" &&
                      e.key === "Enter" &&
                      e.shiftKey
                    ) {
                      e.preventDefault();
                      addTweetToThread(index);
                    }
                  }}
                  readOnly={activeTab !== "drafts"}
                />

                {/* Media Preview */}
                {tweet.media && tweet.media.length > 0 && (
                  <div className="mt-2">
                    <MediaPreview
                      mediaIds={tweet.media}
                      onRemove={(mediaIndex) => {
                        activeTab === "scheduled"
                          ? undefined
                          : handleRemoveMedia(index, mediaIndex);
                      }}
                      getMediaUrl={getMediaFile}
                      isDraft={activeTab == "drafts"}
                    />
                  </div>
                )}
                {/* Extra Options*/}
                <div className="mt-4 flex items-center justify-between">
                  {/* Front Side */}
                  <MediaUpload
                    onUpload={(files) => handleMediaUpload(index, files)}
                    maxFiles={4 - (tweet.media?.length || 0)}
                    disabled={activeTab != "drafts"}
                  />

                  {/* Right Side */}

                  <div
                    className={
                      currentlyEditedTweet === index
                        ? "flex justify-evenly items-center gap-3"
                        : "hidden"
                    }
                  >
                    <CharacterCount content={tweet.content} />
                    <ThreadPosition
                      position={index + 1}
                      totalTweets={tweets.length}
                    />
                    {activeTab === "drafts" && (
                      <div
                        className={
                          currentlyEditedTweet === index ? "" : "hidden"
                        }
                      >
                        <AddTweetButton
                          onClick={() => addTweetToThread(index)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:bg-gray-800 rounded-full"
        >
          <Eye size={18} />
          Preview
        </button>
        {activeTab === "drafts" ? (
          <button
            onClick={handleSaveAsDraft}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-full hover:bg-blue-600 text-white"
          >
            <Save size={18} />
            Save {isThread ? "Thread" : "Tweet"} as draft
          </button>
        ) : activeTab === "scheduled" ? (
          activeTab === "scheduled" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Convert to draft
                  const updatedTweets = tweets.map((tweet) => ({
                    ...tweet,
                    status: "draft" as const,
                    scheduledFor: undefined,
                  }));

                  if (isThread && threadId) {
                    const thread: Thread = {
                      id: threadId,
                      tweetIds: updatedTweets.map((t) => t.id),
                      createdAt: new Date(),
                      status: "draft",
                    };
                    tweetStorage.saveThread(thread, updatedTweets, true);
                  } else {
                    tweetStorage.saveTweet(updatedTweets[0], true);
                  }

                  hideEditor();
                  setActiveTab("drafts");
                  refreshSidebar();
                }}
                className="px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center gap-2"
              >
                <PenSquare size={18} />
                Switch to Draft
              </button>
            </div>
          )
        ) : (
          activeTab === "published" && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleRepurpose}
                className="px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center gap-2"
              >
                <PenSquare size={18} />
                Repurpose {isThread ? "Thread" : "Tweet"}
              </button>
            </div>
          )
        )}
      </div>

      {showPreview && (
        <ThreadPreview
          tweets={tweets}
          onClose={() => setShowPreview(false)}
          getMediaUrl={getMediaFile}
        />
      )}
      {showScheduler && (
        <div
          className="fixed inset-0 
      bg-black/50 
      backdrop-blur-sm 
      flex items-center justify-center 
      z-50 
      p-4 
      animate-fadeIn   // More standard Tailwind animation
      duration-300 
      ease-out"
          onClick={(e) => {
            // Only close if clicking outside the picker
            if (e.target === e.currentTarget) {
              setShowScheduler(false);
            }
          }}
        >
          <div
            className="transform transition-all duration-300 scale-100 opacity-100"
            // Prevent clicks inside from closing
            onClick={(e) => e.stopPropagation()}
          >
            <SchedulePicker
              onSchedule={handleSchedulePost}
              onCancel={() => setShowScheduler(false)}
            />
          </div>
        </div>
      )}
      <PublishingModal
        isOpen={publishingStatus !== null}
        // isOpen={true}
        onClose={() => {
          setPublishingStatus(null);
          setPublishingError(null);
        }}
        status={publishingStatus || "publishing"}
        error={publishingError || undefined}
        isThread={isThread}
      />
    </div>
  );
}

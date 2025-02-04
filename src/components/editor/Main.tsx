// components/editor/Main.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Tweet, Thread, UnifiedTweetComposerProps } from "@/types/tweet";
import MediaUpload from "./media/MediaUpload";
import MediaPreview from "./media/MediaPreview";
import ThreadPreview from "./ThreadPreview";
import { useEditor } from "./context/Editor";
import { PenSquare, Eye, Save, Clock, Send, X } from "lucide-react";
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

export default function PlayGround({
  draftId,
  draftType,
}: UnifiedTweetComposerProps) {
  const {
    name: userName,
    handle: userTwitterHandle,
    profileImageUrl,
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

  // // Initialize editor with proper state
  useEffect(() => {
    const initializeEditor = async () => {
      if (draftId) {
        const isScheduled = editorState.selectedItemStatus === "scheduled";
        const content = isScheduled ? loadScheduledItem() : loadDraft();

        if (content) {
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
          }
        }
      } else {
        // Only create new tweets in draft mode
        if (activeTab === "drafts") {
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
    editorState.selectedItemStatus,
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
  }, [tweets, isThread, threadId, isLoading, contentChanged]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => setTweets([]);
  }, []);

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

  const handleSchedulePost = (scheduledDate: Date) => {
    try {
      // Convert tweets to scheduled status
      const updatedTweets = tweets.map((tweet) => ({
        ...tweet,
        status: "scheduled" as const,
        scheduledFor: scheduledDate,
      }));

      if (isThread && threadId) {
        // Handle thread scheduling
        const thread: Thread = {
          id: threadId,
          tweetIds: updatedTweets.map((t) => t.id),
          createdAt: updatedTweets[updatedTweets.length - 1].createdAt,
          status: "scheduled",
          scheduledFor: scheduledDate,
        };

        // Save the thread and its tweets
        tweetStorage.saveThread(thread, updatedTweets, true);
      } else {
        // Handle single tweet scheduling
        tweetStorage.saveTweet(updatedTweets[0], true);
      }

      // Close the scheduler and editor
      setShowScheduler(false);
      hideEditor();

      // Refresh the sidebar to show the new scheduled post
      refreshSidebar();
    } catch (error) {
      console.error("Error scheduling post:", error);
    }
  };

  const handlePublish = () => {
    const updatedTweets = tweets.map((tweet) => ({
      ...tweet,
      status: "published" as const,
    }));

    if (isThread && threadId) {
      const thread: Thread = {
        id: threadId,
        tweetIds: updatedTweets.map((t) => t.id),
        createdAt: new Date(),
        status: "published",
      };
      tweetStorage.saveThread(thread, updatedTweets, true);
    } else {
      tweetStorage.saveTweet(updatedTweets[0], true);
    }

    hideEditor();
    refreshSidebar();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // Ensure unique IDs before rendering
  const tweetsWithUniqueIds = tweets.map((tweet, index) => ({
    ...tweet,
    id: tweet.id || `${uuidv4()}-${index}`, // Fallback ID includes index for uniqueness
  }));

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
          {activeTab === "drafts" ? (
            <>
              <SaveStatus saveState={saveState} />

              <button
                className="px-4 py-1.5 text-gray-400 hover:bg-gray-800 rounded-full flex items-center gap-2"
                onClick={() => setShowScheduler(true)}
              >
                <Clock size={18} />
                Schedule
              </button>
            </>
          ) : undefined}
          <button
            onClick={handlePublish}
            className="px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center gap-2"
          >
            <Send size={18} />
            Publish
          </button>
        </div>
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
              <div className="flex-shrink-0">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={userName}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-800" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-400">
                    <span className="font-bold text-white">{userName}</span>
                    <span>{userTwitterHandle}</span>
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
        ) : (
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
    </div>
  );
}

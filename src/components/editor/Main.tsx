// components/editor/Main.tsx
"use client";
import { debounce } from "lodash";

import React, { useState, useRef, useEffect } from "react";
import { Tweet, Thread, UnifiedTweetComposerProps } from "@/types/tweet";
import { storage } from "@/utils/localStorage";
import MediaUpload from "./media/MediaUpload";
import MediaPreview from "./media/MediaPreview";
import ThreadPreview from "./ThreadPreview";
import { useEditor } from "./context/Editor";
import { PenSquare, Eye, Save, Clock, Send, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import SchedulePicker from "./SchedulePicker";
import { SaveStatus } from "./storage/SaveStatus";
import { getMediaFile, removeMediaFile, storeMediaFile } from "./media";
import { useUserAccount } from "./context/account";

export default function PlayGround({
  draftId,
  draftType,
}: UnifiedTweetComposerProps) {
  const { name: userName, handle: userTwitterHandle } = useUserAccount();
  const { hideEditor, loadDraft, refreshSidebar } = useEditor();
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isThread, setIsThread] = useState(false);
  const [threadId] = useState<string>(uuidv4());
  const textareaRefs = useRef<HTMLTextAreaElement[]>([]);
  const lastSaveRef = useRef<number>(Date.now());
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  // Initialize editor with proper state
  useEffect(() => {
    const initializeEditor = async () => {
      if (draftId) {
        // Editing existing draft
        const draft = loadDraft();
        if (draft) {
          if ("tweetIds" in draft) {
            setIsThread(true);
            setTweets(draft.tweets || []);
            setCurrentThreadId(draft.id);
          } else {
            setTweets([draft as Tweet]);
          }
          setCurrentDraftId(draftId);
        }
      } else {
        // Creating new draft
        const newTweetId = uuidv4();
        setCurrentDraftId(newTweetId);
        setTweets([
          {
            id: newTweetId,
            content: "",
            media: [],
            createdAt: new Date(),
            status: "draft",
          },
        ]);
      }
      setIsLoading(false);
    };

    initializeEditor();
  }, [draftId, draftType, loadDraft]);

  // Important: Clean up function
  // to reset state when component unmounts
  useEffect(() => {
    return () => {
      setCurrentDraftId(null);
      setCurrentThreadId(null);
      setTweets([]);
      setIsThread(false);
    };
  }, []);

  // Save helpers
  const saveCurrentState = (immediate = false) => {
    if (isThread) {
      const thread: Thread = {
        id: draftId || threadId,
        tweetIds: tweets.map((t) => t.id),
        createdAt: new Date(),
        status: "draft",
      };

      // Save both thread and tweets atomically
      // saveThreadWithTweets(thread, tweets);
      refreshSidebar();
    } else {
      // Single tweet
      // saveTweet(tweets[0], immediate);
      refreshSidebar();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveCurrentState(true); // Immediate save on keyboard shortcut
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [tweets, isThread]);

  const setTextAreaRef = (el: HTMLTextAreaElement | null, index: number) => {
    if (el) {
      textareaRefs.current[index] = el;
    }
  };

  const saveData = () => {
    lastSaveRef.current = Date.now();

    if (isThread) {
      const thread: Thread = {
        id: draftId || threadId,
        tweetIds: tweets.map((t) => t.id),
        createdAt: new Date(),
        status: "draft",
      };
      storage.saveThread(thread);
    }

    tweets.forEach((tweet, index) => {
      if (isThread) {
        tweet.threadId = draftId || threadId;
        tweet.position = index;
      }
      // storage.saveTweet(tweet);
    });
  };

  const debouncedSave = useRef(
    debounce((tweetsToSave: Tweet[], isThreadState: boolean) => {
      lastSaveRef.current = Date.now();

      if (isThreadState) {
        const thread: Thread = {
          id: draftId || threadId,
          tweetIds: tweetsToSave.map((t) => t.id),
          createdAt: new Date(),
          status: "draft",
        };
        storage.saveThread(thread);
      }

      tweetsToSave.forEach((tweet, index) => {
        if (isThreadState) {
          tweet.threadId = draftId || threadId;
          tweet.position = index;
        }
        // storage.saveTweet(tweet);
      });
    }, 1000) // 1 second delay
  ).current;

  const updateTweetsAndSave = (newTweets: Tweet[]) => {
    setTweets(newTweets);
    debouncedSave(newTweets, newTweets.length > 1);
  };

  // Existing useEffect for autosave
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastSaveRef.current >= 15000) {
        saveData();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [tweets, isThread]);

  // Existing useEffect for keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveData();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [tweets, isThread]);

  const handleTweetChange = (index: number, newContent: string) => {
    const newTweets = [...tweets];

    // Update content
    newTweets[index] = {
      ...newTweets[index],
      content: newContent,
    };

    // Handle empty tweet
    if (
      !newContent.trim() &&
      (!newTweets[index].media || newTweets[index].media.length === 0)
    ) {
      if (newTweets.length > 1) {
        newTweets.splice(index, 1);
        setIsThread(newTweets.length > 1);
      } else {
        newTweets[0] = {
          id: uuidv4(),
          content: "",
          media: [],
          createdAt: new Date(),
          status: "draft",
        };
      }
    }

    setTweets(newTweets);

    // Save changes
    if (isThread) {
      const updatedTweet = newTweets[index];
      if (updatedTweet) {
        // saveTweet(updatedTweet); // Debounced save for content changes
      }
    } else {
      // saveTweet(newTweets[0]); // Debounced save for single tweet
    }
  };

  const handleDeleteTweet = (index: number) => {
    const newTweets = [...tweets];

    if (tweets.length === 1) {
      // If it's the last tweet, create a fresh empty one
      newTweets[0] = {
        id: uuidv4(),
        content: "",
        media: [],
        createdAt: new Date(),
        status: "draft",
      };
    } else {
      // Otherwise delete it
      newTweets.splice(index, 1);
      setIsThread(newTweets.length > 1);
    }

    setTweets(newTweets);
    debouncedSave(newTweets, newTweets.length > 1);
  };

  // Handle media operations
  const handleMediaUpload = async (tweetIndex: number, files: File[]) => {
    const newTweets = [...tweets];
    const currentMedia = newTweets[tweetIndex].media || [];
    const totalFiles = currentMedia.length + files.length;

    if (totalFiles > 4) {
      alert("Maximum 4 media files per tweet");
      return;
    }

    try {
      const mediaIds = await Promise.all(
        files.map((file) => storeMediaFile(file))
      );

      newTweets[tweetIndex] = {
        ...newTweets[tweetIndex],
        media: [...currentMedia, ...mediaIds],
      };

      setTweets(newTweets);

      // Immediate save for media operations
      if (isThread) {
        // saveTweet(newTweets[tweetIndex], true);
      } else {
        // saveTweet(newTweets[0], true);
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
    }

    newTweets[tweetIndex].media = currentMedia.filter(
      (_, i) => i !== mediaIndex
    );
    updateTweetsAndSave(newTweets);
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  // Handle publishing
  const handlePublish = () => {
    const updatedTweets = tweets.map((tweet) => ({
      ...tweet,
      status: "published" as const,
    }));

    if (isThread) {
      const thread: Thread = {
        id: draftId || threadId,
        tweetIds: updatedTweets.map((t) => t.id),
        createdAt: new Date(),
        status: "published",
      };

      // Save thread and tweets with published status
      // saveThreadWithTweets(thread, updatedTweets);
    } else {
      // Save single tweet with published status
      // saveTweet(updatedTweets[0], true);
    }

    hideEditor();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header Left Side */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={hideEditor}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <X size={20} className="text-gray-400  hover:text-red-500" />
          </button>
          {/* Add SaveStatus component here */}
          {/* <SaveStatus saveState={} /> */}
        </div>

        {/* Header Right Side */}
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-1.5 text-gray-400 hover:bg-gray-800 rounded-full flex items-center gap-2"
            onClick={() => setShowScheduler(true)}
          >
            <Clock size={18} />
            Schedule
          </button>
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
        {tweets.map((tweet, index) => (
          <div key={tweet.id} className="relative p-4">
            {/* Thread line - now starts below the avatar */}
            {index < tweets.length - 1 && (
              <div
                className="absolute left-10 w-0.5 bg-gray-800"
                style={{
                  top: "4rem", // Starts below the avatar
                  bottom: "-1rem", // Extends to the next tweet
                }}
              />
            )}

            <div className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-800" />
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-400">
                    <span className="font-bold text-white">{userName}</span>
                    <span>{userTwitterHandle}</span>
                  </div>
                  {(tweets.length === 1 || index > 0) && (
                    <button
                      onClick={() => handleDeleteTweet(index)}
                      className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Tweet content */}
                <textarea
                  value={tweet.content}
                  onChange={(e) => {
                    handleTweetChange(index, e.target.value);
                    adjustTextareaHeight(e.target);
                  }}
                  placeholder={
                    index === 0 ? "What's happening?" : "Add to thread..."
                  }
                  className="w-full bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-white min-h-[60px] mt-2"
                  ref={(el) => setTextAreaRef(el, index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.shiftKey) {
                      e.preventDefault();
                      const newTweet: Tweet = {
                        id: uuidv4(),
                        content: "",
                        media: [],
                        createdAt: new Date(),
                        status: "draft",
                        threadId: isThread ? draftId || threadId : undefined,
                        position: index + 1,
                      };
                      const newTweets = [...tweets];
                      newTweets.splice(index + 1, 0, newTweet);
                      // setTweets(newTweets);
                      updateTweetsAndSave(newTweets);
                      setIsThread(true);

                      setTimeout(() => {
                        const nextTextarea = textareaRefs.current[index + 1];
                        if (nextTextarea) {
                          nextTextarea.focus();
                        }
                      }, 0);
                    }
                  }}
                />

                {/* Media upload and character count */}
                {tweet.media && tweet.media.length > 0 && (
                  <div className="mt-2">
                    <MediaPreview
                      mediaIds={tweet.media}
                      onRemove={(mediaIndex) =>
                        handleRemoveMedia(index, mediaIndex)
                      }
                      getMediaUrl={getMediaFile}
                    />
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <MediaUpload
                    onUpload={(files) => handleMediaUpload(index, files)}
                    maxFiles={4 - (tweet.media?.length || 0)}
                  />
                  <span
                    className={`text-sm ${
                      tweet.content.length > 280
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {tweet.content.length}/280
                  </span>
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
        <button
          onClick={saveData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-full hover:bg-blue-600 text-white"
        >
          <Save size={18} />
          Save {isThread ? "Thread" : "Tweet"}
        </button>
      </div>

      {showPreview && (
        <ThreadPreview
          tweets={tweets}
          onClose={() => setShowPreview(false)}
          getMediaUrl={getMediaFile}
        />
      )}

      {showScheduler && (
        <SchedulePicker
          onSchedule={(date) => {
            // Handle scheduling
            setShowScheduler(false);
          }}
          onCancel={() => setShowScheduler(false)}
        />
      )}
    </div>
  );
}

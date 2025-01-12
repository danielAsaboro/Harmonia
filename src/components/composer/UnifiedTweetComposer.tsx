// components/composer/UnifiedTweetComposer.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tweet, Thread } from "@/types/tweet";
import { storage } from "@/utils/localStorage";
import MediaUpload from "./MediaUpload";
import MediaPreview from "./MediaPreview";
import ThreadPreview from "./ThreadPreview";
import { useComposer } from "./ComposerContext";
import { PenSquare, Eye, Save, Clock, Send, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import SchedulePicker from "./SchedulePicker";

// Media storage helpers remain the same
const MEDIA_STORAGE_KEY = "tweetMediaFiles";

const storeMediaFile = async (file: File): Promise<string> => {
  const mediaId = uuidv4();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const mediaStorage = JSON.parse(
          localStorage.getItem(MEDIA_STORAGE_KEY) || "{}"
        );
        mediaStorage[mediaId] = {
          id: mediaId,
          data: reader.result,
          type: file.type,
        };
        localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(mediaStorage));
        resolve(mediaId);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getMediaFile = (mediaId: string): string | null => {
  try {
    const mediaStorage = JSON.parse(
      localStorage.getItem(MEDIA_STORAGE_KEY) || "{}"
    );
    return mediaStorage[mediaId]?.data || null;
  } catch {
    return null;
  }
};

const removeMediaFile = (mediaId: string): void => {
  try {
    const mediaStorage = JSON.parse(
      localStorage.getItem(MEDIA_STORAGE_KEY) || "{}"
    );
    delete mediaStorage[mediaId];
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(mediaStorage));
  } catch (error) {
    console.error("Error removing media:", error);
  }
};

interface UnifiedTweetComposerProps {
  draftId: string | null;
  draftType: "tweet" | "thread" | null;
}

export default function UnifiedTweetComposer({
  draftId,
  draftType,
}: UnifiedTweetComposerProps) {
  const { hideEditor, loadDraft } = useComposer();
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isThread, setIsThread] = useState(false);
  const [threadId] = useState<string>(uuidv4());
  const textareaRefs = useRef<HTMLTextAreaElement[]>([]);
  const lastSaveRef = useRef<number>(Date.now());

  useEffect(() => {
    const initializeComposer = async () => {
      if (draftId) {
        const draft = loadDraft();
        if (draft) {
          if ("tweetIds" in draft) {
            // It's a thread
            setIsThread(true);
            setTweets(draft.tweets || []);
          } else {
            // It's a single tweet
            setTweets([draft as Tweet]);
          }
        }
      } else {
        // New draft
        setTweets([
          {
            id: uuidv4(),
            content: "",
            media: [],
            createdAt: new Date(),
            status: "draft",
          },
        ]);
      }
      setIsLoading(false);
    };

    initializeComposer();
  }, [draftId, draftType, loadDraft]);

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
      storage.saveTweet(tweet);
    });
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
    setTweets(newTweets);
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  const handlePublish = () => {
    const updatedTweets = tweets.map((tweet) => ({
      ...tweet,
      status: "posted" as const,
    }));

    if (isThread) {
      const thread: Thread = {
        id: draftId || threadId,
        tweetIds: updatedTweets.map((t) => t.id),
        createdAt: new Date(),
        status: "posted",
      };
      storage.saveThread(thread);
    }

    updatedTweets.forEach((tweet) => {
      storage.saveTweet(tweet);
    });

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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-800 rounded-full">
            <PenSquare size={20} className="text-blue-400" />
          </button>
          <button
            onClick={hideEditor}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
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

      {/* Rest of the component remains largely the same */}
      <div className="bg-gray-900 rounded-lg divide-y divide-gray-800">
        {tweets.map((tweet, index) => (
          <div key={tweet.id} className="relative p-4">
            {isThread && (
              <div className="absolute left-8 -top-4 bottom-0 w-0.5 bg-gray-800" />
            )}

            {isThread && (
              <div className="absolute -left-4 top-4 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                {index + 1}
              </div>
            )}

            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-800" />
              <div className="flex-1">
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="font-bold text-white">Your Name</span>
                  <span>@yourhandle</span>
                </div>

                <textarea
                  value={tweet.content}
                  onChange={(e) => {
                    const newTweets = [...tweets];
                    newTweets[index] = {
                      ...newTweets[index],
                      content: e.target.value,
                    };
                    setTweets(newTweets);
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
                      setTweets(newTweets);
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

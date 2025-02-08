// src/components/ThreadPreview.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Tweet } from "@/types/tweet";
import Image from "next/image";

interface ThreadPreviewProps {
  tweets: Tweet[];
  onClose: () => void;
  getMediaUrl: (id: string) => Promise<string | null>;
}

export default function ThreadPreview({
  tweets,
  onClose,
  getMediaUrl,
}: ThreadPreviewProps) {
  const [mediaUrls, setMediaUrls] = useState<Record<string, string | null>>({});

  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const loadMediaUrls = async () => {
      const urls: Record<string, string | null> = {};
      for (const tweet of tweets) {
        if (tweet.media && tweet.media.length > 0) {
          for (const mediaId of tweet.media) {
            urls[mediaId] = await getMediaUrl(mediaId);
          }
        }
      }
      setMediaUrls(urls);
    };

    loadMediaUrls();
  }, [tweets, getMediaUrl]);

  const isImageUrl = (url: string) => {
    return url.match(/^data:image/);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the preview
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Thread Preview</h2>
            <p className="text-sm text-gray-400">{tweets.length} tweets</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {tweets.map((tweet, index) => (
            <div key={tweet.id} className="relative rounded-lg p-4">
              {index < tweets.length - 1 && (
                <div className="absolute left-[38px] top-[36px] w-0.5 h-[calc(100%+16px)] bg-gray-800" />
              )}

              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">Your Name</span>
                    <span className="text-gray-500">@yourhandle</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500">{tweet.status}</span>
                  </div>

                  <div className="mt-2 whitespace-pre-wrap text-white">
                    {tweet.content || "Empty tweet"}
                  </div>

                  {tweet.media && tweet.media.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {tweet.media.map((mediaId, mediaIndex) => {
                        const url = mediaUrls[mediaId];
                        if (!url) return null;

                        return (
                          <div
                            key={mediaId}
                            className="aspect-video bg-gray-800 rounded-lg overflow-hidden"
                          >
                            {isImageUrl(url) ? (
                              <Image
                                src={url}
                                alt={`Media ${mediaIndex + 1}`}
                                className="w-full h-full object-cover"
                                width={48}
                                height={48}
                              />
                            ) : (
                              <video
                                src={url}
                                className="w-full h-full object-cover"
                                controls={false}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 flex items-center space-x-6 text-gray-500">
                    <button className="hover:text-blue-400">💬 0</button>
                    <button className="hover:text-green-400">🔄 0</button>
                    <button className="hover:text-red-400">❤️ 0</button>
                    <button className="hover:text-blue-400">📊 0</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

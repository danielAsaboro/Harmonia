import React from "react";
import { Tweet, Thread } from "@/types/tweet";

interface Props {
  content: Tweet | Thread;
  onClose: () => void;
}

export default function TweetPreview({ content, onClose }: Props) {
  const isThread = "tweetIds" in content;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {isThread ? (
            // Thread preview
            <div className="space-y-4">
              {(content as Thread).tweetIds.map((tweetId, index) => (
                <div
                  key={tweetId}
                  className="border border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-800" />
                    <div>
                      <div className="font-bold">You</div>
                      <div className="text-gray-400 text-sm">@you</div>
                    </div>
                  </div>
                  <div className="ml-12">Tweet content {index + 1}</div>
                </div>
              ))}
            </div>
          ) : (
            // Single tweet preview
            <div className="border border-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-800" />
                <div>
                  <div className="font-bold">You</div>
                  <div className="text-gray-400 text-sm">@you</div>
                </div>
              </div>
              <div className="ml-12">{(content as Tweet).content}</div>
              {(content as Tweet).media &&
                (content as Tweet).media.length > 0 && (
                  <div className="ml-12 mt-4 grid grid-cols-2 gap-2">
                    {(content as Tweet).media?.map((media, index) => (
                      <div
                        key={index}
                        className="aspect-video bg-gray-800 rounded-lg"
                      />
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Tweet } from "@/types/tweet";
import MediaPreview from "@/components/editor/media/MediaPreview";

interface ReadOnlyTweetViewerProps {
  tweets: Tweet[];
  isThread?: boolean;
  author: Author;
}

interface Author {
  id: string;
  name: string;
  handle: string;
  profileUrl?: string;
}

const ReadOnlyTweetViewer = ({
  tweets,
  isThread = false,
  author,
}: ReadOnlyTweetViewerProps) => {
  const [hoveredTweetId, setHoveredTweetId] = useState<string | null>(null);

  const getAvatar = () => {
    if (author.profileUrl) {
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src={author.profileUrl}
            alt={author.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
        <span className="text-gray-300 text-sm">
          {author.name[0].toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto">
      <div className="bg-gray-900 rounded-lg">
        {tweets.map((tweet, index) => (
          <div key={tweet.id} className="relative p-4">
            {isThread && index < tweets.length - 1 && (
              <div
                className="absolute left-8 w-0.5 bg-gray-800"
                style={{
                  top: "4rem",
                  bottom: "-1rem",
                }}
              />
            )}

            <div className="flex gap-3">
              <div className="flex-shrink-0">{getAvatar()}</div>

              <div
                className="flex-1 min-w-0 cursor-pointer"
                onMouseEnter={() => setHoveredTweetId(tweet.id)}
                onMouseLeave={() => setHoveredTweetId(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-400">
                    <span className="font-bold text-white">{author.name}</span>
                    <span className="text-gray-400">{author.handle}</span>
                  </div>
                </div>

                <div className="w-full bg-transparent text-white mt-2 whitespace-pre-wrap min-h-[60px] font-normal">
                  {tweet.content}
                </div>

                {tweet.mediaIds && tweet.mediaIds.length > 0 && (
                  <div className="mt-2">
                    <MediaPreview
                      onRemove={() => undefined}
                      mediaIds={tweet.mediaIds}
                      getMediaUrl={async (mediaId: string) => {
                        return mediaId;
                      }}
                      isDraft={false}
                    />
                  </div>
                )}

                {/* Metrics section that appears on hover */}
                <div
                  className={`mt-4 flex items-center justify-between transition-opacity duration-200 ${
                    hoveredTweetId === tweet.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="text-gray-500">
                    {tweet.mediaIds?.length || 0}/4 media
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500">
                      {tweet.content.length}/280
                    </div>
                    {isThread && (
                      <div className="text-gray-500">
                        {index + 1}/{tweets.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadOnlyTweetViewer;

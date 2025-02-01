// src/components/MediaPreview.tsx

import React, { useState, useEffect } from "react";

interface Props {
  mediaIds: string[];
  onRemove: (index: number) => void;
  getMediaUrl: (id: string) => Promise<string | null>; // Update type
}

export default function MediaPreview({
  mediaIds,
  onRemove,
  getMediaUrl,
}: Props) {
  const [mediaUrls, setMediaUrls] = useState<(string | null)[]>([]);

  useEffect(() => {
    const loadMediaUrls = async () => {
      const urls = await Promise.all(
        mediaIds.map((mediaId) => getMediaUrl(mediaId))
      );
      setMediaUrls(urls);
    };

    loadMediaUrls();
  }, [mediaIds, getMediaUrl]);

  const isImageUrl = (url: string) => {
    return url.match(/^data:image/);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {mediaUrls.map((url, index) => {
        if (!url) return null;

        return (
          <div key={mediaIds[index]} className="relative">
            <div className="w-24 h-24 relative rounded-lg overflow-hidden">
              {isImageUrl(url) ? (
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  controls={false}
                />
              )}
            </div>
            <button
              onClick={() => onRemove(index)}
              className="absolute -top-2 -right-2 bg-gray-900 rounded-full p-1 
                       hover:bg-gray-800 text-red-400"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

// src/components/MediaPreview.tsx

import React from "react";

interface Props {
  mediaIds: string[];
  onRemove: (index: number) => void;
  getMediaUrl: (id: string) => string | null;
}

export default function MediaPreview({
  mediaIds,
  onRemove,
  getMediaUrl,
}: Props) {
  const isImageUrl = (url: string) => {
    return url.match(/^data:image/);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {mediaIds.map((mediaId, index) => {
        const url = getMediaUrl(mediaId);
        if (!url) return null;

        return (
          <div key={mediaId} className="relative">
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

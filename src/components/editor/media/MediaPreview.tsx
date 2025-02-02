// src/components/editor/media/MediaPreview.tsx
import React, { useState, useEffect, useCallback } from "react";

interface Props {
  mediaIds: string[];
  onRemove: (index: number) => void;
  getMediaUrl: (id: string) => Promise<string | null>;
  isDraft?: boolean;
}

export default function MediaPreview({
  mediaIds,
  onRemove,
  getMediaUrl,
  isDraft = true,
}: Props) {
  const [mediaUrls, setMediaUrls] = useState<(string | null)[]>([]);
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] =
    useState<number>(-1);

  useEffect(() => {
    const loadMediaUrls = async () => {
      const urls = await Promise.all(
        mediaIds.map((mediaId) => getMediaUrl(mediaId))
      );
      setMediaUrls(urls);
    };

    loadMediaUrls();
  }, [mediaIds, getMediaUrl]);

  const handleNavigation = useCallback(
    (direction: "left" | "right") => {
      setCurrentFullscreenIndex((prev) => {
        let newIndex;
        if (direction === "left") {
          newIndex = prev > 0 ? prev - 1 : mediaUrls.length - 1;
        } else {
          newIndex = prev < mediaUrls.length - 1 ? prev + 1 : 0;
        }
        const newUrl = mediaUrls[newIndex];
        if (newUrl) setFullscreenMedia(newUrl);
        return newIndex;
      });
    },
    [mediaUrls]
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (fullscreenMedia) {
        switch (e.key) {
          case "Escape":
            setFullscreenMedia(null);
            setCurrentFullscreenIndex(-1);
            break;
          case "ArrowLeft":
            handleNavigation("left");
            break;
          case "ArrowRight":
            handleNavigation("right");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [fullscreenMedia, handleNavigation]);

  const isImageUrl = (url: string) => {
    return url.match(/^data:image/);
  };

  const handleMediaClick = (url: string, index: number) => {
    setFullscreenMedia(url);
    setCurrentFullscreenIndex(index);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-4">
        {mediaUrls.map((url, index) => {
          if (!url) return null;

          return (
            <div key={mediaIds[index]} className="relative">
              <div
                className="w-24 h-24 relative rounded-lg overflow-hidden cursor-pointer"
                onClick={() => handleMediaClick(url, index)}
              >
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
              {isDraft && (
                <button
                  onClick={() => onRemove(index)}
                  className="absolute -top-2 -right-2 bg-gray-900 rounded-full p-1 
                           hover:bg-gray-800 text-red-400"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Fullscreen Media Modal */}
      {fullscreenMedia && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => {
            setFullscreenMedia(null);
            setCurrentFullscreenIndex(-1);
          }}
        >
          <div
            className="max-w-[90vw] max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {isImageUrl(fullscreenMedia) ? (
              <img
                src={fullscreenMedia}
                alt={`Fullscreen media ${currentFullscreenIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <video
                src={fullscreenMedia}
                className="max-w-full max-h-[90vh]"
                controls
                autoPlay
              />
            )}

            {/* Navigation UI */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                {currentFullscreenIndex + 1} / {mediaUrls.length}
              </span>
              <button
                onClick={() => {
                  setFullscreenMedia(null);
                  setCurrentFullscreenIndex(-1);
                }}
                className="bg-gray-900/50 hover:bg-gray-900 
                         rounded-full p-2 text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Arrow buttons - only show if there's more than one media item */}
            {mediaUrls.length > 1 && (
              <>
                <button
                  onClick={() => handleNavigation("left")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900/50 hover:bg-gray-900 
                           rounded-full p-3 text-white transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => handleNavigation("right")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900/50 hover:bg-gray-900 
                           rounded-full p-3 text-white transition-colors"
                >
                  →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

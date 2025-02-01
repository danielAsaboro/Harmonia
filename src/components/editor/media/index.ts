import { v4 as uuidv4 } from "uuid";

// Media storage helpers remain the same
export const MEDIA_STORAGE_KEY = "tweetMediaFiles";

export const storeMediaFile = async (file: File): Promise<string> => {
  const mediaId = uuidv4();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const mediaStorage = JSON.parse(
          localStorage.getItem(MEDIA_STORAGE_KEY) || "{}"
        );
        const mediaData = {
          id: mediaId,
          data: reader.result,
          type: file.type,
          lastModified: new Date().toISOString(),
        };
        mediaStorage[mediaId] = mediaData;
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

export const getMediaFile = (mediaId: string): string | null => {
  try {
    const mediaStorage = JSON.parse(
      localStorage.getItem(MEDIA_STORAGE_KEY) || "{}"
    );
    return mediaStorage[mediaId]?.data || null;
  } catch {
    return null;
  }
};

export const removeMediaFile = (mediaId: string): void => {
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

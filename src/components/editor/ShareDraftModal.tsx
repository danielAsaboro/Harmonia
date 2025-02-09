import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Share2, X, MessageSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ShareDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (settings: ShareSettings) => Promise<string>;
  draftType: "tweet" | "thread";
}

interface ShareSettings {
  allowComments: boolean;
}

export default function ShareDraftModal({
  isOpen,
  onClose,
  onShare,
  draftType,
}: ShareDraftModalProps) {
  const [settings, setSettings] = useState<ShareSettings>({
    allowComments: false,
  });
  const [shareLink, setShareLink] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      setError(null);
      const link = await onShare(settings);
      setShareLink(link);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create share link"
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleClose = () => {
    setShareLink("");
    setError(null);
    setSettings({ allowComments: false });
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Share {draftType === "thread" ? "Thread" : "Tweet"} Draft
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-300 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!shareLink ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Allow Comments
                    </div>
                    <p className="text-sm text-gray-400">
                      Let viewers add comments on your draft
                    </p>
                  </div>
                  <Checkbox
                    id="allow-comments"
                    checked={settings.allowComments}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        allowComments: checked as boolean,
                      }))
                    }
                    className="h-5 w-5"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating Share Link...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Create Share Link
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Your shareable link has been created. Share it with others to
                get their feedback!
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

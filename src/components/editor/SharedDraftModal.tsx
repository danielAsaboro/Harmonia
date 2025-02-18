// /components/editor/SharedDraftModal.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Copy, Link, X, Loader2, RotateCcw } from "lucide-react";

interface SharedDraftModalProps {
  isOpen: boolean;
  draftId: string;
  draftType: "tweet" | "thread";
  onClose: () => void;
}

interface ShareInfo {
  accessToken: string;
  canComment: boolean;
  expiresAt: string;
}

const SharedDraftModal: React.FC<SharedDraftModalProps> = ({
  isOpen,
  draftId,
  draftType,
  onClose,
}) => {
  const [canComment, setCanComment] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);
  const [sharedLink, setSharedLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingShare, setIsExistingShare] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  // Check for existing share on open
  useEffect(() => {
    if (isOpen) {
      checkExistingShare();
    }
  }, [isOpen, draftId]);

  const checkExistingShare = async () => {
    try {
      if (isExistingShare) return;
      setIsLoading(true);
      const response = await fetch(`/api/shared-draft/info?draftId=${draftId}`);
      if (response.ok) {
        const { shareInfo } = await response.json();
        console.log(shareInfo)
        if (shareInfo) {
          setIsExistingShare(true);
          setCanComment(shareInfo.canComment);
          const link = `${window.location.origin}/shared/${shareInfo.accessToken}`;
          setSharedLink(link);
        } else {
          setIsExistingShare(false);
          setSharedLink("");
        }
      }
      console.log(" whats happening here");
    } catch (err) {
      console.error("Error checking share status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdateShare = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shared-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId,
          draftType,
          canComment,
          expirationDays,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create shared draft");
      }

      const { sharedDraftId, isExisting } = await response.json();
      const link = `${window.location.origin}/shared/${sharedDraftId}`;
      setSharedLink(link);
      setIsExistingShare(isExisting);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeShare = async () => {
    try {
      setIsRevoking(true);
      const response = await fetch("/api/shared-draft", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draftId }),
      });

      if (!response.ok) {
        throw new Error("Failed to revoke share");
      }

      setIsExistingShare(false);
      setSharedLink("");
      setCanComment(false);
    } catch (err) {
      console.error("Error revoking share:", err);
      setError("Failed to revoke share access");
    } finally {
      setIsRevoking(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sharedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset states after animation
    setTimeout(() => {
      setError(null);
      if (!isExistingShare) {
        setSharedLink("");
        setCanComment(false);
      }
    }, 200);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-gray-900 rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Share Draft</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Share Settings */}
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <Checkbox
                  checked={canComment}
                  onCheckedChange={(checked) => setCanComment(!!checked)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <span className="text-sm font-medium block">
                    Allow comments
                  </span>
                  <span className="text-xs text-gray-400 block">
                    Let others add comments to your draft
                  </span>
                </div>
              </label>

              {!isExistingShare && !sharedLink && (
                <div className="space-y-1.5">
                  <span className="text-sm font-medium block">
                    Link expires in
                  </span>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={expirationDays}
                      onChange={(e) =>
                        setExpirationDays(Number(e.target.value))
                      }
                      min={1}
                      max={30}
                      className="w-20"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-400">days</span>
                  </div>
                </div>
              )}
            </div>

            {/* Share Link Section */}
            {sharedLink ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Share link</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRevokeShare}
                    disabled={isRevoking}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    {isRevoking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-xs">Revoke Access</span>
                    )}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    value={sharedLink}
                    readOnly
                    className="flex-1 bg-gray-800/50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className={copySuccess ? "text-green-500" : ""}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copySuccess && (
                  <p className="text-xs text-green-500">Copied to clipboard!</p>
                )}
              </div>
            ) : (
              <Button
                onClick={handleCreateOrUpdateShare}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Link...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link className="h-4 w-4" />
                    <span>Generate Shareable Link</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-800">
          <Button variant="ghost" onClick={handleClose}>
            {sharedLink ? "Done" : "Cancel"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharedDraftModal;

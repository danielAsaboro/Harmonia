// /components/editor/PublishingModal.tsx

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check, Send, X } from "lucide-react";

interface PublishingModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "publishing" | "success" | "error";
  error?: string | null;
  isThread?: boolean;
}

const CircularProgress: React.FC<{ progress: number }> = ({ progress }) => {
  const size = 64;
  const strokeWidth = 4;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={progressOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient
          id="progressGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#2563eb" /> {/* Blue */}
          <stop offset="100%" stopColor="#10b981" /> {/* Green */}
        </linearGradient>
      </defs>
    </svg>
  );
};

const PublishingModal: React.FC<PublishingModalProps> = ({
  isOpen,
  onClose,
  status,
  error,
  isThread = false,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "publishing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [status]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={status !== "publishing" ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Close button - only show if not publishing */}
        {status !== "publishing" && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {/* Status Icon */}
            <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
              {status === "publishing" && (
                <div className="absolute">
                  <CircularProgress progress={progress} />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Send className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              )}
              {status === "success" && (
                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="w-12 h-12 text-green-500" />
                </div>
              )}
              {status === "error" && (
                <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
              )}
            </div>

            {/* Status Text */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">
                {status === "publishing" &&
                  `Publishing ${isThread ? "Thread" : "Tweet"}...`}
                {status === "success" &&
                  `${isThread ? "Thread" : "Tweet"} Published!`}
                {status === "error" && "Publishing Failed"}
              </h3>
              <p className="text-gray-400">
                {status === "publishing" && "This may take a moment"}
                {status === "success" &&
                  "Your content has been published successfully"}
                {status === "error" &&
                  (error || "Failed to publish. Please try again.")}
              </p>
            </div>

            {/* Action Button - Only show for error state */}
            {status === "error" && (
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PublishingModal;

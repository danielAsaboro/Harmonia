import React from "react";

interface CharacterCountProps {
  content: string;
  maxLength?: number;
}

const CharacterCount: React.FC<CharacterCountProps> = ({
  content,
  maxLength = 280,
}) => {
  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20 && remainingChars >= 0;

  // Calculate progress for the circle (0 to 1)
  const progress = Math.min(content.length / maxLength, 1);

  // Circle properties
  const size = isOverLimit ? 25 : isNearLimit ? 24 : 16;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      {/* Background circle */}
      <svg className="w-6 h-6 absolute" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="#2f3336"
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* Progress circle */}
      <svg className="w-6 h-6 absolute -rotate-90" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke={isOverLimit ? "#f4212e" : isNearLimit ? "#f59e0b" : "#1d9bf0"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Text display for near limit or over limit */}
      {(isNearLimit || isOverLimit) && (
        <span
          className={`text-xs ${
            isOverLimit ? "text-red-500" : "text-amber-500"
          }`}
        >
          {Math.abs(remainingChars)}
        </span>
      )}
    </div>
  );
};

export default CharacterCount;

interface ThreadPositionProps {
  position: number;
  totalTweets: number; // Add this prop
}

const ThreadPosition: React.FC<ThreadPositionProps> = ({
  position,
  totalTweets,
}) => {
  if (totalTweets <= 1) return null;

  return (
    <div className="text-gray-500 text-sm flex items-center">#{position}</div>
  );
};

const AddTweetButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-6 h-6 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-full"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
};

export { ThreadPosition, AddTweetButton };

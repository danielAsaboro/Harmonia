import { Tweet, Thread,  } from "../types/tweet";

const MAX_TWEET_LENGTH = 280;

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// export const validateTweet = (content: string): ValidationResult => {
//   const errors: string[] = [];

//   if (!content) {
//     errors.push("Tweet content cannot be empty");
//   }

//   if (content.length > MAX_TWEET_LENGTH) {
//     errors.push(`Tweet exceeds ${MAX_TWEET_LENGTH} characters`);
//   }

//   return {
//     isValid: errors.length === 0,
//     errors,
//   };
// };

export const createNewTweet = (
  content: string,
  threadId?: string,
  position?: number
): Tweet => {
  return {
    id: generateId(),
    content,
    createdAt: new Date(),
    status: "draft",
    threadId,
    position,
    media: [],
  };
};

export const createNewThread = (): Thread => {
  return {
    id: generateId(),
    tweetIds: [],
    createdAt: new Date(),
    status: "draft",
  };
};

import { Tweet, Thread, TweetStatus, ComposerState } from "./tweet";

// Helper function to create dates
const createDate = (daysOffset: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

// All tweets, including both standalone and thread tweets
export const testTweets: Tweet[] = [
  // Standalone tweets
  {
    id: "tweet-1",
    content:
      "Just launched our new product! 🚀 Check out these amazing features that will revolutionize how you work. Super excited to share this with everyone!",
    media: ["product-demo.jpg"],
    createdAt: createDate(-2),
    status: "draft",
  },
  {
    id: "tweet-2",
    content:
      "The future of AI is not about replacing humans, but augmenting human capabilities. Here's why I believe collaboration is key to innovation.",
    createdAt: createDate(-1),
    status: "scheduled",
    scheduledFor: createDate(2),
  },
  {
    id: "tweet-3",
    content:
      "5 tips for better productivity:\n1. Start early\n2. Break tasks down\n3. Take regular breaks\n4. Stay hydrated\n5. Review progress daily",
    media: ["productivity-chart.png"],
    createdAt: createDate(-5),
    status: "published",
  },

  // Thread tweets
  {
    id: "tweet-4",
    content:
      "🧵 1/4 Let's talk about building successful startups. First principle: Always solve a real problem.",
    threadId: "thread-1",
    position: 1,
    createdAt: createDate(),
    status: "draft",
  },
  {
    id: "tweet-5",
    content:
      "2/4 Second principle: Focus on your core users. It's better to be loved by a few than liked by many.",
    threadId: "thread-1",
    position: 2,
    createdAt: createDate(),
    status: "draft",
  },
  {
    id: "tweet-6",
    content:
      "3/4 Third principle: Move fast and iterate. Perfect is the enemy of good enough.",
    threadId: "thread-1",
    position: 3,
    createdAt: createDate(),
    status: "draft",
  },
  {
    id: "tweet-7",
    content:
      "4/4 Finally: Build a great team. Your company is only as good as the people building it.",
    threadId: "thread-1",
    position: 4,
    createdAt: createDate(),
    status: "draft",
  },

  // Another thread
  {
    id: "tweet-8",
    content:
      "1/3 Here's my weekend project: built a new garden shed from scratch! 🏡",
    threadId: "thread-2",
    position: 1,
    media: ["shed-1.jpg"],
    createdAt: createDate(-1),
    status: "scheduled",
    scheduledFor: createDate(3),
  },
  {
    id: "tweet-9",
    content:
      "2/3 The building process took about 6 hours. Here's the frame coming together.",
    threadId: "thread-2",
    position: 2,
    media: ["shed-2.jpg"],
    createdAt: createDate(-1),
    status: "scheduled",
    scheduledFor: createDate(3),
  },
  {
    id: "tweet-10",
    content:
      "3/3 And here's the finished product! Really happy with how it turned out.",
    threadId: "thread-2",
    position: 3,
    media: ["shed-3.jpg"],
    createdAt: createDate(-1),
    status: "scheduled",
    scheduledFor: createDate(3),
  },
];

// Thread metadata
export const testThreads: Thread[] = [
  {
    id: "thread-1",
    tweetIds: ["tweet-4", "tweet-5", "tweet-6", "tweet-7"],
    createdAt: createDate(),
    status: "draft",
  },
  {
    id: "thread-2",
    tweetIds: ["tweet-8", "tweet-9", "tweet-10"],
    createdAt: createDate(-1),
    status: "scheduled",
    scheduledFor: createDate(3),
  },
];

// Combined posts for testing
// export const allPosts: (Tweet | Thread)[] = [...testTweets, ...testThreads];

// Sample validation results
export const sampleValidationResults = {
  valid: {
    isValid: true,
    errors: [],
  },
  invalid: {
    isValid: false,
    errors: ["Content exceeds maximum length", "Media file type not supported"],
  },
} as const;

// Sample composer states
export const sampleComposerStates: ComposerState[] = [
  {
    currentTweet: testTweets[0],
    currentThread: {},
    isThreadMode: false,
    isDirty: false,
  },
  {
    currentTweet: {},
    currentThread: testThreads[0],
    isThreadMode: true,
    isDirty: true,
  },
];

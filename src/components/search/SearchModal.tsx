import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tweet, Thread } from "@/types/tweet";
import { tweetStorage } from "@/utils/localStorage";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{
    tweets: Tweet[];
    threads: Thread[];
  }>({ tweets: [], threads: [] });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setResults({ tweets: [], threads: [] });
      return;
    }

    const normalizedQuery = query.toLowerCase();

    // Search tweets
    const tweets = tweetStorage.getTweets().filter(
      (tweet) =>
        tweet.content.toLowerCase().includes(normalizedQuery) && !tweet.threadId // Only standalone tweets
    );

    // Search threads
    const threads = tweetStorage.getThreads().filter((thread) => {
      const firstTweet = tweetStorage.getThreadPreview(thread.id);
      return firstTweet?.content.toLowerCase().includes(normalizedQuery);
    });

    setResults({ tweets, threads });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search drafts, scheduled posts..."
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {searchQuery.trim() && (
            <div className="p-4 space-y-6">
              {/* Tweets Section */}
              {results.tweets.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Tweets
                  </h3>
                  <div className="space-y-2">
                    {results.tweets.map((tweet) => (
                      <div
                        key={tweet.id}
                        className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <p className="text-white text-sm line-clamp-2">
                          {tweet.content}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(tweet.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Threads Section */}
              {results.threads.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Threads
                  </h3>
                  <div className="space-y-2">
                    {results.threads.map((thread) => {
                      const preview = tweetStorage.getThreadPreview(thread.id);
                      return (
                        <div
                          key={thread.id}
                          className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-400 text-xs">
                              🧵 Thread
                            </span>
                            <span className="text-gray-500 text-xs">
                              {thread.tweetIds.length} tweets
                            </span>
                          </div>
                          {preview && (
                            <p className="text-white text-sm line-clamp-2">
                              {preview.content}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.tweets.length === 0 && results.threads.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No results found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchModal;

import { Badge } from "@/components/ui/badge";
import React, {
  useState,
  useRef,
  KeyboardEvent,
  useEffect,
  useCallback,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUserAccount } from "./context/account";
import { useEditor } from "./context/Editor";
import { tweetStorage } from "@/utils/localStorage";
import { nanoid } from "nanoid";
import { motion, AnimatePresence } from "framer-motion";

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface DraftStats {
  wordCount: number;
  characterCount: number;
  readingTime: string;
  threadLength: number;
}

interface DraftMetadata {
  title: string;
  createdAt: Date;
  lastEdited: Date;
  tags: Tag[];
  stats: DraftStats;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const formatTimeAgo = (date: Date): string => {
  const minutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
  return `${minutes}m ago`;
};

const TagBadge: React.FC<{ tag: Tag }> = ({ tag }) => {
  const getTagIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "affiliate marketing":
        return "💰";
      case "build in public":
        return "🏗️";
      case "copywriting":
        return "✍️";
      default:
        return "🏷️";
    }
  };

  return (
    <Badge variant="secondary" className="mr-2 mb-2">
      {getTagIcon(tag.name)} {tag.name}
    </Badge>
  );
};

const UnifiedChecklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentInput.trim()) {
      setItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}`,
          text: currentInput.trim(),
          completed: false,
          createdAt: Date.now(),
        },
      ]);
      setCurrentInput("");
    }
  };

  const toggleItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <Card className="w-full max-w-md">
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={(e) => setCurrentInput(e.target.value)}
        onKeyUp={handleKeyPress}
        placeholder="Add a tip and press Enter..."
        className="w-full p-2 text-base bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
      />
      <CardContent>
        <div className="pt-2 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Checkbox
                id={item.id}
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <label
                htmlFor={item.id}
                className={`flex-grow text-sm ${
                  item.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {item.text}
              </label>
              <button
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const MetadataTab: React.FC = () => {
  const {
    editorState,
    loadDraft: loadDrafts,
    loadScheduledItem: loadScheduledItems,
    activeTab,
  } = useEditor();
  const [draftData, setDraftData] = useState<DraftMetadata>({
    title: "Draft title...",
    createdAt: new Date(Date.now() - 13 * 60000),
    lastEdited: new Date(Date.now() - tweetStorage.getLastSaveTime()),
    tags: [
      { id: "1", name: "Affiliate Marketing" },
      { id: "2", name: "Build In Public" },
      { id: "3", name: "Copywriting" },
    ],
    stats: {
      wordCount: 50,
      characterCount: 284,
      readingTime: "16s",
      threadLength: 0,
    },
  });

  // Calculate stats based on draft content
  const calculateStats = useCallback(
    (content: string): DraftMetadata["stats"] => {
      const words = content.trim().split(/\s+/).length;
      const chars = content.length;
      const readingTime = `${Math.ceil(words / 200)}m`; // Assuming 200 words per minute

      return {
        wordCount: words,
        characterCount: chars,
        readingTime,
        threadLength: 1,
      };
    },
    []
  );

  useEffect(() => {
    const getContentData = () => {
      const drafts =
        activeTab === "scheduled" ? loadScheduledItems() : loadDrafts();

      tweetStorage.getLastSaveTime();

      if (!drafts) return;

      // Handle both single tweets and threads
      const content =
        "tweets" in drafts
          ? drafts.tweets.map((t) => t.content).join("\n")
          : drafts.content;

      const stats = calculateStats(content);
      if ("tweets" in drafts) {
        stats.threadLength = drafts.tweets.length;
      }

      setDraftData({
        title: "Draft title...",
        createdAt: new Date(drafts.createdAt),
        lastEdited: new Date(),
        tags: [
          { id: "1", name: "Affiliate Marketing" },
          { id: "2", name: "Build In Public" },
          { id: "3", name: "Copywriting" },
        ],
        stats: stats,
      });
    };

    getContentData();
  }, [tweetStorage.getLastSaveTime()]);

  // // Add a new checklist item
  // const addChecklistItem = (text: string) => {
  //   const newItem: ChecklistItem = {
  //     id: nanoid(),
  //     text,
  //     completed: false,
  //     createdAt: new Date().getDate(),
  //   };
  //   setChecklistItems((prev) => [...prev, newItem]);
  // };

  // // Toggle checklist item completion
  // const toggleChecklistItem = (itemId: string) => {
  //   setChecklistItems((prev) =>
  //     prev.map((item) =>
  //       item.id === itemId ? { ...item, completed: !item.completed } : item
  //     )
  //   );
  // };

  // const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setText(e.target.value);

  //   // Split text by newlines and create checklist items
  //   const lines = e.target.value.split("\n").filter((line) => line.trim());
  //   const newItems = lines.map((line, index) => ({
  //     id: `item-${index}`,
  //     text: line,
  //     completed: false,
  //     createdAt: Date.now(),
  //   }));

  //   setChecklistItems(newItems);
  // };

  // const toggleItem = (itemId: string) => {
  //   setChecklistItems((prev) =>
  //     prev.map((item) =>
  //       item.id === itemId ? { ...item, completed: !item.completed } : item
  //     )
  //   );
  // };

  return (
    <Card className="w-full h-full max-w-xs rounded-none">
      <CardHeader className="pb-4 border-b border-neutral-50 ">
        <input
          type="text"
          placeholder={draftData.title}
          className="text-xl font-medium bg-transparent border-0 outline-none w-full focus:outline-none focus:ring-0"
        />
        <div className="flex flex-col space-y-1 text-sm text-gray-500 mt-1">
          <div className="flex justify-between w-full">
            <span>Created</span>
            <span>{formatTimeAgo(draftData.createdAt)}</span>
          </div>
          <div className="flex justify-between w-full">
            <span>Last edited</span>
            <span>{formatTimeAgo(draftData.lastEdited)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 border-b border-neutral-50 ">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Words</span>
            <span className="font-medium text-gray-500">
              {draftData.stats.wordCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Characters</span>
            <span className="font-medium text-gray-500">
              {draftData.stats.characterCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Reading time</span>
            <span className="font-medium text-gray-500">
              {draftData.stats.readingTime}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">No. of Tweets</span>
            <span className="font-medium text-gray-500">
              {draftData.stats.threadLength}
            </span>
          </div>
        </div>
      </CardContent>

      <CardContent className="py-2 border-b border-neutral-50 ">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Tags</p>
          <div className="flex flex-wrap">
            {draftData.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      </CardContent>

      <CardContent className="py-4">
        <UnifiedChecklist />
      </CardContent>
    </Card>
  );
};

export default MetadataTab;

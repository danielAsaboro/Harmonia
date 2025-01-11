// app/compose/twitter/page.tsx

"use client";

import { useState } from "react";
import DraftList from "@/components/composer/DraftList";
import SchedulePicker from "@/components/composer/SchedulePicker";
import { useComposer } from "@/components/composer/ComposerContext";
import ScheduledPostsList from "@/components/composer/ScheduledPostList";
import UnifiedTweetComposer from "@/components/composer/UnifiedTweetComposer";

export default function TwitterEditor() {
  const { activeTab } = useComposer();
  // const [isThreadMode, setIsThreadMode] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "drafts":
        return <UnifiedTweetComposer />;
      // return isThreadMode ? <ThreadComposer /> : <TweetComposer />;
      case "scheduled":
        return <DraftList />;
      case "posted":
        return <ScheduledPostsList />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mt-4 h-screen">{renderContent()}</div>
      </div>

      {showScheduler && (
        <SchedulePicker
          onSchedule={(date) => {
            // Handle scheduling
            setShowScheduler(false);
          }}
          onCancel={() => setShowScheduler(false)}
        />
      )}
    </main>
  );
}

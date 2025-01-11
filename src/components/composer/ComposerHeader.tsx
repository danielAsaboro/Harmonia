import React from "react";

type Tab = "drafts" | "scheduled" | "posted";

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function ComposerHeader({ activeTab, onTabChange }: Props) {
  return (
    <div className="border-b border-gray-800">
      <nav className="flex space-x-4">
        {(["drafts", "scheduled", "posted"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
    </div>
  );
}

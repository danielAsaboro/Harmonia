// /components/keyboard/KeyboardShortcutsDialog.tsx

import React from "react";
import { Command } from "lucide-react";

interface ShortcutProps {
  keys: string[];
  description: string;
}

const Shortcut: React.FC<ShortcutProps> = ({ keys, description }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-gray-300">{description}</span>
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="px-2 py-1 text-sm font-semibold bg-gray-800 border border-gray-700 rounded text-gray-300">
            {key}
          </kbd>
          {index < keys.length - 1 && <span className="text-gray-500">+</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsDialog({
  isOpen,
  onClose,
}: KeyboardShortcutsDialogProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ["⌘/Ctrl", "F"], description: "Search content" },
    { keys: ["⌘/Ctrl", "1"], description: "Switch to Drafts" },
    { keys: ["⌘/Ctrl", "2"], description: "Switch to Scheduled" },
    { keys: ["⌘/Ctrl", "3"], description: "Switch to Published" },
    { keys: ["⌘/Ctrl", "N"], description: "Create new draft" },
    { keys: ["⌘/Ctrl", "S"], description: "Schedule current draft" },
    { keys: ["⌘/Ctrl", "P"], description: "Publish current draft" },
    { keys: ["Esc"], description: "Close dialogs" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <Command className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">
            Keyboard Shortcuts
          </h2>
        </div>

        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <Shortcut
              key={index}
              keys={shortcut.keys}
              description={shortcut.description}
            />
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Press Esc to close
          </button>
        </div>
      </div>
    </div>
  );
}

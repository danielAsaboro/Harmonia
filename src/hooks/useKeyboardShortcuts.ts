// hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback } from 'react';
import { Tweet } from '@/types/tweet';

interface ShortcutHandlers {
  onSave: () => void;
  onNewTweet: (index: number) => void;
  onRemoveTweet: (index: number) => void;
  onMoveTweet: (fromIndex: number, toIndex: number) => void;
  onPreview: () => void;
  onSchedule: () => void;
  onPublish: () => void;
}

export const useKeyboardShortcuts = (
  tweets: Tweet[],
  activeIndex: number,
  handlers: ShortcutHandlers
) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Save - Cmd/Ctrl + S
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handlers.onSave();
    }

    // New tweet - Shift + Enter
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      handlers.onNewTweet(activeIndex);
    }

    // Remove tweet - Cmd/Ctrl + Backspace
    if ((e.metaKey || e.ctrlKey) && e.key === 'Backspace') {
      e.preventDefault();
      if (tweets.length > 1) {
        handlers.onRemoveTweet(activeIndex);
      }
    }

    // Move tweet up - Cmd/Ctrl + Shift + ↑
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex > 0) {
        handlers.onMoveTweet(activeIndex, activeIndex - 1);
      }
    }

    // Move tweet down - Cmd/Ctrl + Shift + ↓
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex < tweets.length - 1) {
        handlers.onMoveTweet(activeIndex, activeIndex + 1);
      }
    }

    // Preview - Cmd/Ctrl + P
    if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
      e.preventDefault();
      handlers.onPreview();
    }

    // Schedule - Cmd/Ctrl + Shift + S
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      handlers.onSchedule();
    }

    // Publish - Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handlers.onPublish();
    }
  }, [tweets, activeIndex, handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: {
      save: '⌘/Ctrl + S',
      newTweet: 'Shift + Enter',
      removeTweet: '⌘/Ctrl + Backspace',
      moveUp: '⌘/Ctrl + Shift + ↑',
      moveDown: '⌘/Ctrl + Shift + ↓',
      preview: '⌘/Ctrl + P',
      schedule: '⌘/Ctrl + Shift + S',
      publish: '⌘/Ctrl + Enter'
    }
  };
};
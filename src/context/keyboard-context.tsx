// /context/keyboard-context.tsx
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from "react";

interface KeyboardContextType {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(
  undefined
);

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  handler: () => void;
}

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  const [showSearch, setShowSearch] = React.useState(false);
  const [showShortcuts, setShowShortcuts] = React.useState(false);
  // const [isFocusMode, setIsFocusMode] = React.useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Show keyboard shortcuts (Cmd/Ctrl + K)
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setShowShortcuts(true);
      return;
    }

    // Search shortcut (Cmd/Ctrl + F)
    if (
      (e.metaKey || e.ctrlKey) &&
      !e.shiftKey &&
      e.key.toLowerCase() === "f"
    ) {
      e.preventDefault();
      setShowSearch(true);
      return;
    }

    // Tab switching shortcuts
    if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "3") {
      e.preventDefault();
      const tabMap: { [key: string]: "drafts" | "scheduled" | "published" } = {
        "1": "drafts",
        "2": "scheduled",
        "3": "published",
      };
      // We'll implement this handler in the Editor context
      window.dispatchEvent(
        new CustomEvent("switchTab", { detail: tabMap[e.key] })
      );
    }

    // Calendar view shortcuts
    if (!e.metaKey && !e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "m":
          window.dispatchEvent(
            new CustomEvent("calendarView", { detail: "month" })
          );
          break;
        case "w":
          window.dispatchEvent(
            new CustomEvent("calendarView", { detail: "week" })
          );
          break;
        case "t":
          window.dispatchEvent(new CustomEvent("calendarToday"));
          break;
        case "arrowleft":
          window.dispatchEvent(
            new CustomEvent("calendarNav", { detail: "prev" })
          );
          break;
        case "arrowright":
          window.dispatchEvent(
            new CustomEvent("calendarNav", { detail: "next" })
          );
          break;
      }
    }

    // Editor shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case "n": // New draft
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("newDraft"));
          break;
        case "s": // Schedule current draft
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("scheduleDraft"));
          break;
        case "p": // Publish current draft
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("publishDraft"));
          break;
      }
    }

    // Draft switching (Cmd + Option + Arrow)
    if (e.metaKey && e.altKey) {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          window.dispatchEvent(
            new CustomEvent("switchDraft", { detail: "prev" })
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          window.dispatchEvent(
            new CustomEvent("switchDraft", { detail: "next" })
          );
          break;
      }
    }

    // Handle sidebar toggle (Cmd/Ctrl + Shift + F)
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("toggleSidebar"));
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <KeyboardContext.Provider
      value={{
        showSearch,
        setShowSearch,
        showShortcuts,
        setShowShortcuts,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
}

export function useKeyboard() {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error("useKeyboard must be used within a KeyboardProvider");
  }
  return context;
}

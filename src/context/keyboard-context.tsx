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
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(
  undefined
);

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  const [showSearch, setShowSearch] = React.useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "f") {
      e.preventDefault();
      setShowSearch(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <KeyboardContext.Provider value={{ showSearch, setShowSearch }}>
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

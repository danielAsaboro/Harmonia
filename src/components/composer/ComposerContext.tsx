"use client";

import React, { createContext, useContext, useState } from "react";

type Tab = "drafts" | "scheduled" | "posted";

type ComposerContextType = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
};

const ComposerContext = createContext<ComposerContextType | undefined>(
  undefined
);

export function ComposerProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("drafts");

  return (
    <ComposerContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ComposerContext.Provider>
  );
}

export function useComposer() {
  const context = useContext(ComposerContext);
  if (context === undefined) {
    throw new Error("useComposer must be used within a ComposerProvider");
  }
  return context;
}

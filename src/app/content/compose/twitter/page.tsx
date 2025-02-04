// app/compose/twitter/page.tsx
"use client";

import {
  UserAccountProvider,
  useUserAccount,
} from "@/components/editor/context/account";
import { useEditor } from "@/components/editor/context/Editor";
import LoadingState from "@/components/editor/LoadingState";
import PlayGround from "@/components/editor/Main";
import { PenSquare } from "lucide-react";
import { useEffect } from "react";

function WelcomeScreen() {
  const { showEditor, refreshSidebar } = useEditor();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center space-y-6">
        <PenSquare size={48} className="text-blue-400 mx-auto" />
        <h1 className="text-2xl font-bold text-white">
          Create Your First Draft
        </h1>
        <p className="text-gray-400 max-w-md">
          Start composing your tweet or thread. Your drafts will be saved
          automatically.
        </p>
        <button
          onClick={() => showEditor()}
          className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium"
        >
          Create New Draft
        </button>
      </div>
    </div>
  );
}

function TwitterEditorContent() {
  const { editorState } = useEditor();
  const { isLoading } = useUserAccount();

  const userAccount = useUserAccount();
  console.log("User Account Context:", userAccount);

  useEffect(() => {
    console.log("Current user account loading state:", userAccount.isLoading);
  }, [userAccount]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        {editorState.isVisible ? (
          <PlayGround
            draftId={editorState.selectedDraftId}
            draftType={editorState.selectedDraftType}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
}

export default function TwitterEditor() {
  return (
    <UserAccountProvider>
      <TwitterEditorContent />
    </UserAccountProvider>
  );
}

// Content Studio

// Twitter Post Editor
// Telegram Response Templates
// Content Calendar
// Approval Workflow
// Post Analytics

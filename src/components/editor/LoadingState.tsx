// /components/editor/LoadingState.tsx
import { Twitter } from "lucide-react";

export default function EditorLoadingState() {
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
          <Twitter className="w-8 h-8 text-blue-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">Loading Editor</h3>
          <p className="text-sm text-gray-400">Preparing your workspace...</p>
        </div>
      </div>
    </div>
  );
}

// /app/auth/twitter/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Twitter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function TwitterAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TwitterAuthPageContent />
    </Suspense>
  );
}

function TwitterAuthPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/content/compose/twitter";

  const handleTwitterSignIn = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/twitter/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (error) {
      console.error("Failed to initialize Twitter auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center">
            <Twitter className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Connect Twitter</h2>
          <p className="text-slate-400 text-center">
            To use the content composer, please connect your Twitter account.
            This allows us to post tweets on your behalf.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleTwitterSignIn}
            disabled={isLoading}
            className="w-full py-6 bg-[#1DA1F2] hover:bg-[#1a8cd8] flex items-center justify-center gap-3 text-white rounded-xl text-lg font-semibold transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Twitter className="w-5 h-5" />
                Continue with Twitter
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              You&apos;ll be redirected back to the editor after connecting
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Image
              src="/icons/app-icon.svg"
              alt="Logo"
              width={20}
              height={20}
              className="opacity-50"
            />
            <span>Secured by Harmonia</span>
          </div>
        </div>
      </div>
    </div>
  );
}

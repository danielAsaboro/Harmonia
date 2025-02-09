// /components/auth/twitter.tsx
"use client";

import React, { useState } from "react";
import { Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

const TwitterSignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleTwitterSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get auth URL and store verifier in session
      const response = await fetch("/api/auth/twitter/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to initialize Twitter authentication"
        );
      }

      const { url } = await response.json();

      // Redirect to Twitter
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (error) {
      console.error("Failed to initialize Twitter auth:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during Twitter sign-in"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Image
            src="/icons/app-icon.svg"
            alt="Logo"
            width={48}
            height={48}
            className="mb-4"
          />
          <h2 className="text-2xl font-bold text-white">Connect Twitter</h2>
          <p className="mt-2 text-slate-400">Reconnect your Twitter account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="mt-8">
          <Button
            onClick={handleTwitterSignIn}
            disabled={isLoading}
            className="w-full py-6 bg-[#1DA1F2] hover:bg-[#1a8cd8] flex items-center justify-center gap-3 text-white rounded-lg text-lg font-semibold transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Twitter className="w-6 h-6" />
                Connect Twitter
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            By connecting, you agree to our{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwitterSignInPage;

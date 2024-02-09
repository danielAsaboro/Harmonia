// app/auth/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home or dashboard after a short delay
    const timer = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Successfully authenticated with Twitter!
        </h1>
        <p className="text-gray-600">Redirecting you back...</p>
      </div>
    </div>
  );
}

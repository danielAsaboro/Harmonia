// /app/(dashboard)/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/navigation/sidebar";
import Header from "@/components/navigation/header";
import { UserAccountProvider } from "@/components/editor/context/account";



export const metadata: Metadata = {
  title: "Harmonia Dashboard",
  description: "AI-Powered Community Management Dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <UserAccountProvider>
        <nav className="sticky top-0 max-h-screen">
          <Sidebar />
        </nav>
        <main className="flex-1 bg-background">
          <Header
            userName="Daniel Favour"
            className="sticky top-0 z-10 w-full bg-card border-b border-border "
          />
          <div className="p-6">{children}</div>
        </main>
      </UserAccountProvider>
    </div>
  );
}
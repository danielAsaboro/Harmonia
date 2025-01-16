// /app/(dashboard)/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/navigation/sidebar";
import Header from "@/components/navigation/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harmonia Dashboard",
  description: "AI-Powered Community Management Dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <nav className="h-screen">
        <Sidebar />
      </nav>
      <main className="flex-1 bg-background">
        <Header
          userName="Daniel"
          className="flex w-full bg-card border-b border-border"
        />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

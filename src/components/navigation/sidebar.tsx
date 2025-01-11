// File: /components/navigation/sidebar.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/ts-merge";
import {
  LayoutGrid,
  LineChart,
  BookOpen,
  Trophy,
  Target,
  Wallet,
  Plus,
  Settings,
  HelpCircle,
  LogOut,
  BanknoteIcon,
} from "lucide-react";
import Image from "next/image";
// import LogoutModal from "@/components/auth/LogoutModal";

const navigationItems = [
  {
    title: "Overview",
    icon: LayoutGrid,
    href: "/overview",
  },
  {
    title: "Members",
    icon: LineChart,
    href: "/members",
  },
  {
    title: "Knowledge",
    icon: BookOpen,
    href: "/knowledge",
  },
  {
    title: "Compose",
    icon: Trophy,
    href: "/compose",
  },
  // {
  //   title: "Learn",
  //   icon: Target,
  //   href: "/learn",
  // },
  //   {
  //     title: "My Donations",
  //     icon: Wallet,
  //     href: "/my-donations",
  //   },
  //   {
  //     title: "Withdraw Funds",
  //     icon: BanknoteIcon,
  //     href: "/withdraw",
  //   },
];

const bottomNavigationItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Support & FAQ",
    icon: HelpCircle,
    href: "/support",
  },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const NavItem = ({
    href,
    icon: Icon,
    title,
  }: {
    href: string;
    icon: React.ElementType;
    title: string;
  }) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-200 transition-colors",
          isActive ? "bg-green-400 text-white" : "hover:bg-slate-700"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{title}</span>
      </Link>
    );
  };

  return (
    <div
      className={cn("flex h-full w-64 flex-col bg-slate-800 p-4", className)}
    >
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Harmonia"
            className="h-16 w-24"
            width={8}
            height={8}
          />
        </Link>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            title={item.title}
          />
        ))}
      </nav>

      <Link
        href="/start-campaign"
        className={cn(
          "mt-6 flex items-center gap-2 rounded-lg px-3 py-2 outline-0",
          "border-2 border-green-400 bg-transparent text-green-400 hover:bg-green-400 hover:text-white",
          "transition-colors duration-200",
          pathname === "/start-campaign" &&
            "bg-green-400 text-white hover:bg-green-500"
        )}
      >
        <Plus className="h-5 w-5" />
        <span>Start a Campaign</span>
      </Link>

      <div className="mt-auto space-y-2">
        {bottomNavigationItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            title={item.title}
          />
        ))}

        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-700"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      /> */}
    </div>
  );
};

export default Sidebar;

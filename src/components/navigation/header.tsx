// File: /components/navigation/header.tsx

import { cn } from "@/utils/ts-merge";
import { Bell } from "lucide-react";

interface HeaderProps {
  userName: string;
  className?: string;
}

const Header = ({ userName, className }: HeaderProps) => {
  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b border-slate-700 bg-slate-800 px-6",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white">
          Welcome, {userName}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-slate-200 hover:bg-slate-700">
          <Bell className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-slate-700" />
      </div>
    </header>
  );
};

export default Header;

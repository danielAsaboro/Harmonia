// /components/editor/context/account.tsx
"use client";
import { createContext, useContext, useState, useEffect, JSX } from "react";
import { User, UserSquare2, Loader2 } from "lucide-react";

interface UserAccountType {
  name: string;
  handle: string;
  profileImageUrl: string;
  isLoading: boolean;
  error?: string;
  reloadUserData?: () => void;
  getAvatar: () => JSX.Element;
}

const UserAccountContext = createContext<UserAccountType | undefined>(
  undefined
);

export function UserAccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Loading avatar component
  const LoadingAvatar = () => (
    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center animate-pulse">
      <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
    </div>
  );

  // Error avatar component
  const ErrorAvatar = () => (
    <div className="w-12 h-12 rounded-full bg-red-900/20 border-2 border-red-500/20 flex items-center justify-center">
      <UserSquare2 className="w-6 h-6 text-red-500/50" />
    </div>
  );

  // Default avatar component
  const DefaultAvatar = () => (
    <div className="w-12 h-12 rounded-full bg-gray-800/50 border-2 border-gray-700 flex items-center justify-center">
      <User className="w-6 h-6 text-gray-600" />
    </div>
  );

  const [userAccount, setUserAccount] = useState<
    Omit<UserAccountType, "getAvatar">
  >({
    name: "Loading...",
    handle: "@...",
    profileImageUrl: "",
    isLoading: true,
  });

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/twitter/user");
      if (!response.ok) {
        throw new Error("Failed to get user data");
      }

      const userData = await response.json();

      setUserAccount({
        name: userData.name,
        handle: `@${userData.username}`,
        profileImageUrl: userData.profile_image_url,
        isLoading: false,
      });
    } catch (error) {
      setUserAccount((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to load user data",
      }));
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const getAvatar = () => {
    if (userAccount.isLoading) return <LoadingAvatar />;
    if (userAccount.error) return <ErrorAvatar />;
    if (!userAccount.profileImageUrl) return <DefaultAvatar />;

    return (
      <img
        src={userAccount.profileImageUrl}
        alt={userAccount.name}
        className="w-12 h-12 rounded-full border-2 border-gray-700 hover:border-blue-500 transition-colors duration-200"
      />
    );
  };

  const contextValue: UserAccountType = {
    ...userAccount,
    reloadUserData: fetchUserData,
    getAvatar,
  };

  return (
    <UserAccountContext.Provider value={contextValue}>
      {children}
    </UserAccountContext.Provider>
  );
}

export function useUserAccount() {
  const context = useContext(UserAccountContext);
  if (context === undefined) {
    throw new Error("useUserAccount must be used within a UserAccountProvider");
  }
  return context;
}

// /components/editor/context/account.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface UserAccountType {
  name: string;
  handle: string;
  profileImageUrl: string;
  isLoading: boolean;
  error?: string;
  reloadUserData?: () => void;
}

interface TwitterTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

const UserAccountContext = createContext<UserAccountType | undefined>(
  undefined
);

export function UserAccountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userAccount, setUserAccount] = useState<UserAccountType>({
    name: "",
    handle: "",
    profileImageUrl: "",
    isLoading: true,
  });

  const fetchUserData = async () => {
    try {
      // Get Twitter tokens from stored cookies/session
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

  return (
    <UserAccountContext.Provider
      value={{
        ...userAccount,
        reloadUserData: fetchUserData,
      }}
    >
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

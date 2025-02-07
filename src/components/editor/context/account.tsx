// /components/editor/context/account.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  JSX,
  useCallback,
} from "react";
import { User, UserSquare2, Loader2 } from "lucide-react";
import { tweetStorage } from "@/utils/localStorage";
import Image from "next/image";

interface UserAccountType {
  id: string;
  name: string;
  handle: string;
  profileImageUrl: string;
  verified: boolean;
  verifiedType: string | null;
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
  const [count, setCount] = useState(0);
  // Loading avatar component
  const LoadingAvatar = () => (
    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center animate-pulse">
      <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
    </div>
  );

  console.log("number of times user endpoint called, ", count);

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
    id: "",
    name: "",
    handle: "",
    profileImageUrl: "",
    verified: false,
    verifiedType: null,
    isLoading: true,
  });

  const fetchUserData = useCallback(async () => {
    try {
      // First check localStorage
      const cachedDetails = tweetStorage.getUserDetails();

      if (cachedDetails) {
        setUserAccount({
          id: cachedDetails.id,
          name: cachedDetails.name,
          handle: `@${cachedDetails.handle}`,
          profileImageUrl: cachedDetails.profileImageUrl,
          verified: cachedDetails.verified,
          verifiedType: cachedDetails.verifiedType,
          isLoading: false,
        });
        return;
      } else {
        console.log("no user found in cache, making request");
        const response = await fetch("/api/auth/twitter/user");
        setCount((prev) => prev + 1);
        if (!response.ok) {
          throw new Error("Failed to get user data");
        }

        const userData = await response.json();

        const userDetails = {
          id: userData.id,
          name: userData.name,
          handle: userData.username,
          profileImageUrl: userData.profile_image_url,
          verified: userData.verified,
          verifiedType: userData.verified_type,
        };

        // Save to localStorage
        tweetStorage.saveUserDetails(userDetails);

        setUserAccount({
          ...userDetails,
          handle: `@${userDetails.handle}`,
          isLoading: false,
        });
      }
    } catch (error) {
      setUserAccount((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to load user data",
      }));
    }
  }, []);

  // useEffect(() => {
  //   fetchUserData();
  // }, []);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const tokens = localStorage.getItem("twitter_tokens");
      if (!tokens) return;

      const parsedTokens = JSON.parse(tokens);
      const expiresAt = parsedTokens.expiresAt;

      // If token expires in less than 5 minutes, refresh it
      if (Date.now() >= expiresAt - 5 * 60 * 1000) {
        try {
          const response = await fetch("/api/auth/twitter/refresh", {
            method: "POST",
          });

          if (response.ok) {
            const newTokens = await response.json();
            localStorage.setItem("twitter_tokens", JSON.stringify(newTokens));
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      }
    };

    checkAndRefreshToken();
    const interval = setInterval(checkAndRefreshToken, 4 * 60 * 1000); // Check every 4 minutes

    return () => clearInterval(interval);
  }, []);

  const getAvatar = () => {
    if (userAccount.isLoading) return <LoadingAvatar />;
    if (userAccount.error) return <ErrorAvatar />;
    if (!userAccount.profileImageUrl) return <DefaultAvatar />;

    return (
      <Image
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

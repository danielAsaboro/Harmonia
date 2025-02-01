import { createContext, useContext, useState } from "react";

interface UserAccountType {
  name: string;
  handle: string;
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
    name: "Daniel Asaboro",
    handle: "@DanielAsaboro",
  });

  return (
    <UserAccountContext.Provider value={ userAccount }>
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

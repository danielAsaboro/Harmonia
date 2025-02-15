// lib/session.ts
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

export async function getSession(request: NextRequest) {
  const cookieStore = await cookies();

  return {
    get: (key: string) => {
      return cookieStore.get(key)?.value;
    },
    set: (key: string, value: string) => {
      cookieStore.set(key, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    },
    update: async (key: string, value: string) => {
      // Remove existing cookie first
      cookieStore.delete(key);

      // Set new value
      cookieStore.set(key, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    },
  };
}

export async function getUserFromSession(): Promise<TwitterUserData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("twitter_session");

  if (!sessionCookie?.value) return null;

  try {
    const sessionData = JSON.parse(sessionCookie.value) as TwitterSessionData;
    return sessionData.userData;
  } catch {
    return null;
  }
}

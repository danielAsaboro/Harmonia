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

// app/api/auth/twitter/oauth2/callback/route.ts
import { handleOAuth2Callback } from "@/lib/auth/twitter";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return handleOAuth2Callback(request);
}

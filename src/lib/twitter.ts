// // /lib/twitter.ts
import { TwitterApi } from "twitter-api-v2";
import { getSession } from "./session";
import { NextResponse, type NextRequest } from "next/server";


export async function getTwitterClient(
  sessionData: string,
  req?: NextRequest
): Promise<TwitterApi> {
  try {
    const { tokens } = JSON.parse(sessionData) as TwitterSessionData;

    // Check if token needs refresh
    if (Date.now() >= tokens.expiresAt && tokens.refreshToken) {
      const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID!,
        clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      });

      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      } = await client.refreshOAuth2Token(tokens.refreshToken);

      // Create updated session data
      const updatedSessionData: TwitterSessionData = {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresAt: Date.now() + expiresIn * 1000,
        },
        userData: JSON.parse(sessionData).userData, // Preserve existing user data
      };

      // Update session if request is provided
      if (req) {
        const session = await getSession(req);
        await session.update(
          "twitter_session",
          JSON.stringify(updatedSessionData)
        );

        // Create a response to update cookies
        const response = new NextResponse();
        response.cookies.set({
          name: "twitter_session",
          value: JSON.stringify(updatedSessionData),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
      }

      return new TwitterApi(newAccessToken);
    }

    return new TwitterApi(tokens.accessToken);
  } catch (error) {
    console.error("Error getting Twitter client:", error);
    throw new Error("Failed to initialize Twitter client");
  }
}

// types/twitter.ts
interface TwitterTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

interface TwitterUserData {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  verified?: boolean;
  verified_type?: string;
  fetchedAt: number; // timestamp when the data was fetched
}

interface TwitterSessionData {
  tokens: TwitterTokens;
  userData: TwitterUserData;
}

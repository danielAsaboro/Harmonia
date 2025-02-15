import { PrismaClient } from "@prisma/client";
import { UserTokens, TokenData } from "../schema";

export class PrismaUserTokensService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // Save or update user tokens
  async saveUserTokens(tokens: UserTokens): Promise<void> {
    try {
      // console.log("user tokens ", tokens)
      await this.prisma.user_tokens.upsert({
        where: { userId: tokens.userId },
        update: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt.toString(),
          username: tokens.username,
          name: tokens.name,
          profileImageUrl: tokens.profileImageUrl || null,
        },
        create: {
          userId: tokens.userId,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt.toString(),
          username: tokens.username,
          name: tokens.name,
          profileImageUrl: tokens.profileImageUrl || null,
        },
      });
    } catch (error) {
      console.error("Error saving user tokens:", error);
      throw new Error("Failed to save user tokens");
    }
  }

  // Retrieve user tokens
  async getUserTokens(userId: string): Promise<UserTokens | null> {
    try {
      const userTokens = await this.prisma.user_tokens.findUnique({
        where: { userId },
      });

      return userTokens
        ? {
            userId: userTokens.userId,
            accessToken: userTokens.accessToken,
            refreshToken: userTokens.refreshToken,
            expiresAt: userTokens.expiresAt,
            username: userTokens.username,
            name: userTokens.name,
            profileImageUrl: userTokens.profileImageUrl || undefined,
          }
        : null;
    } catch (error) {
      console.error("Error retrieving user tokens:", error);
      throw new Error("Failed to retrieve user tokens");
    }
  }

  // Update specific token fields (access token and expiration)
  async updateUserTokens(
    userId: string,
    accessToken: string,
    expiresAt: string
  ): Promise<void> {
    try {
      await this.prisma.user_tokens.update({
        where: { userId },
        data: {
          accessToken,
          expiresAt,
        },
      });
    } catch (error) {
      console.error("Error updating user tokens:", error);
      throw new Error("Failed to update user tokens");
    }
  }

  // Fully update user tokens (including refresh token)
  async refreshUserTokens(tokens: TokenData): Promise<void> {
    try {
      await this.prisma.user_tokens.update({
        where: { userId: tokens.userId },
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        },
      });
    } catch (error) {
      console.error("Error refreshing user tokens:", error);
      throw new Error("Failed to refresh user tokens");
    }
  }

  // Delete user tokens
  async deleteUserTokens(userId: string): Promise<void> {
    try {
      await this.prisma.user_tokens.delete({
        where: { userId },
      });
    } catch (error) {
      console.error("Error deleting user tokens:", error);
      throw new Error("Failed to delete user tokens");
    }
  }

  // Optional: Find user by access token
  async findUserByAccessToken(accessToken: string): Promise<UserTokens | null> {
    try {
      const userTokens = await this.prisma.user_tokens.findUnique({
        where: { accessToken },
      });

      return userTokens
        ? {
            userId: userTokens.userId,
            accessToken: userTokens.accessToken,
            refreshToken: userTokens.refreshToken,
            expiresAt: userTokens.expiresAt,
            username: userTokens.username,
            name: userTokens.name,
            profileImageUrl: userTokens.profileImageUrl || undefined,
          }
        : null;
    } catch (error) {
      console.error("Error finding user by access token:", error);
      throw new Error("Failed to find user by access token");
    }
  }
}

// Helper function to create the service with a singleton-like approach
export function createUserTokensService(prismaClient?: PrismaClient) {
  const client = prismaClient || new PrismaClient();
  return new PrismaUserTokensService(client);
}

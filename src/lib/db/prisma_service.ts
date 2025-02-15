// /lib/db/prisma_service.ts
import { PrismaClient } from "@prisma/client";

export class PrismaService {
  private static instance: PrismaService;
  public prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  // Get the PrismaClient instance
  getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  // Optional: Close the Prisma client connection when done
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Export the PrismaClient instance directly
export const prismaDb = PrismaService.getInstance().getPrismaClient();

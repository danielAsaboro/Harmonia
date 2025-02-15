import { PrismaClient } from "@prisma/client";
import { SharedDraftComment, CommentMetadata } from "../schema";

export class PrismaSharedDraftCommentsService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // Add a comment to a shared draft
  async addComment(comment: SharedDraftComment): Promise<void> {
    try {
      await this.prisma.shared_draft_comments.create({
        data: {
          id: comment.id,
          sharedDraftId: comment.sharedDraftId,
          content: comment.content,
          authorId: comment.authorId,
          authorName: comment.authorName,
          createdAt: comment.createdAt,
          position: comment.position,
          metadata: JSON.stringify(
            comment.metadata || {
              tweetId: "",
              highlightedContent: "",
              startOffset: 0,
              endOffset: 0,
            }
          ),
          resolved: comment.resolved || false,
          resolvedAt:
            comment.resolvedAt === null ? undefined : comment.resolvedAt,
          resolvedBy:
            comment.resolvedBy === null ? undefined : comment.resolvedBy,
        },
      });
    } catch (error) {
      console.error("Error adding shared draft comment:", error);
      throw new Error("Failed to add shared draft comment");
    }
  }

  // Resolve a comment
  async resolveComment(commentId: string, userId: string): Promise<void> {
    try {
      await this.prisma.shared_draft_comments.update({
        where: { id: commentId },
        data: {
          resolved: true,
          resolvedAt: new Date().toISOString(),
          resolvedBy: userId,
        },
      });
    } catch (error) {
      console.error("Error resolving shared draft comment:", error);
      throw new Error("Failed to resolve shared draft comment");
    }
  }

  // Delete a comment
  async deleteComment(commentId: string): Promise<void> {
    try {
      await this.prisma.shared_draft_comments.delete({
        where: { id: commentId },
      });
    } catch (error) {
      console.error("Error deleting shared draft comment:", error);
      throw new Error("Failed to delete shared draft comment");
    }
  }

  // Get comments for a shared draft
  async getComments(sharedDraftId: string): Promise<SharedDraftComment[]> {
    try {
      const comments = await this.prisma.shared_draft_comments.findMany({
        where: { sharedDraftId },
        orderBy: { createdAt: "desc" },
      });

      return comments.map((comment) => {
        // Parse metadata and ensure it matches CommentMetadata
        const parsedMetadata = comment.metadata
          ? (JSON.parse(comment.metadata) as CommentMetadata)
          : {
              tweetId: "",
              highlightedContent: "",
              startOffset: 0,
              endOffset: 0,
            };

        return {
          id: comment.id,
          sharedDraftId: comment.sharedDraftId,
          content: comment.content,
          authorId: comment.authorId,
          authorName: comment.authorName,
          createdAt: comment.createdAt,
          position: comment.position || undefined,
          metadata: parsedMetadata,
          resolved: comment.resolved,
          resolvedAt:
            comment.resolvedAt === null ? undefined : comment.resolvedAt,
          resolvedBy:
            comment.resolvedBy === null ? undefined : comment.resolvedBy,
        };
      });
    } catch (error) {
      console.error("Error retrieving shared draft comments:", error);
      throw new Error("Failed to retrieve shared draft comments");
    }
  }

  // Check if a user can modify a comment
  async canModifyComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const comment = await this.prisma.shared_draft_comments.findUnique({
        where: { id: commentId },
        include: { sharedDraft: true },
      });

      return comment
        ? comment.authorId === userId ||
            comment.sharedDraft.creatorId === userId
        : false;
    } catch (error) {
      console.error("Error checking comment modification permissions:", error);
      throw new Error("Failed to check comment modification permissions");
    }
  }
}

// Helper function to create the service with a singleton-like approach
export function createSharedDraftCommentsService(prismaClient?: PrismaClient) {
  const client = prismaClient || new PrismaClient();
  return new PrismaSharedDraftCommentsService(client);
}

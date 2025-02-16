import { PrismaClient } from "@prisma/client";
import {
  SharedDraft,
  SharedDraftComment,
  SharedDraftInfo,
  CommentMetadata,
} from "../schema";

export class PrismaSharedDraftsService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // Create a new shared draft
  async createSharedDraft(draft: SharedDraft): Promise<void> {
    await this.prisma.shared_drafts.create({
      data: {
        id: draft.id,
        draftId: draft.draftId,
        draftType: draft.draftType,
        createdAt: draft.createdAt,
        expiresAt: draft.expiresAt,
        canComment: draft.canComment,
        creatorId: draft.creatorId,
        accessToken: draft.accessToken,
        authorName: draft.authorName,
        authorHandle: draft.authorHandle,
        authorProfileUrl: draft.authorProfileUrl || null,
        shareState: draft.shareState,
      },
    });
  }

  // Get shared draft by access token
  async getSharedDraftByToken(
    accessToken: string
  ): Promise<SharedDraft | null> {
    const draft = await this.prisma.shared_drafts.findUnique({
      where: {
        accessToken,
        shareState: "active",
        expiresAt: {
          gt: new Date().toISOString(),
        },
      },
    });

    return draft
      ? {
          id: draft.id,
          draftId: draft.draftId,
          draftType: draft.draftType as "tweet" | "thread",
          createdAt: draft.createdAt,
          expiresAt: draft.expiresAt,
          canComment: draft.canComment,
          creatorId: draft.creatorId,
          accessToken: draft.accessToken,
          authorName: draft.authorName,
          authorHandle: draft.authorHandle,
          authorProfileUrl: draft.authorProfileUrl || undefined,
          shareState: draft.shareState as "active" | "expired" | "revoked",
        }
      : null;
  }

  // Add a comment to a shared draft
  async addComment(comment: SharedDraftComment): Promise<void> {
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
        resolvedAt: comment.resolvedAt || undefined,
        resolvedBy: comment.resolvedBy || undefined,
      },
    });
  }

  // Resolve a comment
  async resolveComment(commentId: string, userId: string): Promise<void> {
    await this.prisma.shared_draft_comments.update({
      where: { id: commentId },
      data: {
        resolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedBy: userId,
      },
    });
  }

  // Delete a comment
  async deleteComment(commentId: string): Promise<void> {
    await this.prisma.shared_draft_comments.delete({
      where: { id: commentId },
    });
  }

  // Get comments for a shared draft
  async getComments(sharedDraftId: string): Promise<SharedDraftComment[]> {
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
  }

  // Check if a user can modify a comment
  async canModifyComment(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.prisma.shared_draft_comments.findUnique({
      where: { id: commentId },
      include: { sharedDraft: true },
    });

    return comment
      ? comment.authorId === userId || comment.sharedDraft.creatorId === userId
      : false;
  }

  // Delete expired shared drafts (this might be better handled by a background job)
  async cleanupExpiredDrafts(): Promise<void> {
    const now = new Date().toISOString();
    await this.prisma.shared_drafts.deleteMany({
      where: {
        expiresAt: { lte: now },
        shareState: "active",
      },
    });
  }

  // Get existing shared draft info
  async getSharedDraftInfo(draftId: string): Promise<SharedDraftInfo | null> {
    const draft = await this.prisma.shared_drafts.findFirst({
      where: {
        draftId,
        shareState: "active",
        expiresAt: {
          gt: new Date().toISOString(),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return draft
      ? {
          id: draft.id,
          accessToken: draft.accessToken,
          canComment: draft.canComment,
          expiresAt: draft.expiresAt,
          shareState: draft.shareState as "active" | "expired" | "revoked",
        }
      : null;
  }

  // Update share settings
  async updateSharedDraftSettings(
    id: string,
    canComment: boolean
  ): Promise<void> {
    await this.prisma.shared_drafts.update({
      where: { id },
      data: { canComment },
    });
  }

  // Revoke a shared draft
  async revokeSharedDraft(id: string): Promise<void> {
    await this.prisma.shared_drafts.update({
      where: { id },
      data: { shareState: "revoked" },
    });
  }
}

// Helper function to create the service with a singleton-like approach
export function createSharedDraftsService(prismaClient?: PrismaClient) {
  const client = prismaClient || new PrismaClient();
  return new PrismaSharedDraftsService(client);
}

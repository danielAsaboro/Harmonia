// /lib/services/index.ts
import { prismaDb } from "../db/prisma_service";
import {
  createDraftTweetsService,
  PrismaDraftTweetsService,
} from "../db/services/draft_tweet";
import {
  createDraftThreadsService,
  PrismaDraftThreadsService,
} from "../db/services/draft_thread";
import {
  createUserTokensService,
  PrismaUserTokensService,
} from "../db/services/user_token";
import {
  createScheduledTweetsService,
  PrismaScheduledTweetsService,
} from "../db/services/scheduled_tweets";
import {
  createScheduledThreadsService,
  PrismaScheduledThreadsService,
} from "../db/services/scheduled_threads";
import {
  createSharedDraftsService,
  PrismaSharedDraftsService,
} from "../db/services/shared_draft";
import {
  createSharedDraftCommentsService,
  PrismaSharedDraftCommentsService,
} from "../db/services/shared_draft_comment";

// Service instances
let draftTweetsService: PrismaDraftTweetsService;
let draftThreadsService: PrismaDraftThreadsService;
let userTokensService: PrismaUserTokensService;
let scheduledTweetsService: PrismaScheduledTweetsService;
let scheduledThreadsService: PrismaScheduledThreadsService;
let sharedDraftsService: PrismaSharedDraftsService;
let sharedDraftCommentsService: PrismaSharedDraftCommentsService;

// Initialize all services
function initializeServices() {
  if (!draftTweetsService) {
    draftTweetsService = createDraftTweetsService(prismaDb);
  }
  if (!draftThreadsService) {
    draftThreadsService = createDraftThreadsService(prismaDb);
  }
  if (!userTokensService) {
    userTokensService = createUserTokensService(prismaDb);
  }
  if (!scheduledTweetsService) {
    scheduledTweetsService = createScheduledTweetsService(prismaDb);
  }
  if (!scheduledThreadsService) {
    scheduledThreadsService = createScheduledThreadsService(prismaDb);
  }
  if (!sharedDraftsService) {
    sharedDraftsService = createSharedDraftsService(prismaDb);
  }
  if (!sharedDraftCommentsService) {
    sharedDraftCommentsService = createSharedDraftCommentsService(prismaDb);
  }
}

// Initialize services on module import
initializeServices();

// Export initialized service instances
export {
  draftTweetsService,
  draftThreadsService,
  userTokensService,
  scheduledTweetsService,
  scheduledThreadsService,
  sharedDraftsService,
  sharedDraftCommentsService,
};

// Types export
export type {
  PrismaDraftTweetsService,
  PrismaDraftThreadsService,
  PrismaUserTokensService,
  PrismaScheduledTweetsService,
  PrismaScheduledThreadsService,
  PrismaSharedDraftsService,
  PrismaSharedDraftCommentsService,
};

// Optional: Export a function to reinitialize services (useful for testing)
export function reinitializeServices() {
  draftTweetsService = createDraftTweetsService(prismaDb);
  draftThreadsService = createDraftThreadsService(prismaDb);
  userTokensService = createUserTokensService(prismaDb);
  scheduledTweetsService = createScheduledTweetsService(prismaDb);
  scheduledThreadsService = createScheduledThreadsService(prismaDb);
  sharedDraftsService = createSharedDraftsService(prismaDb);
  sharedDraftCommentsService = createSharedDraftCommentsService(prismaDb);
}

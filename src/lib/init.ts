// /lib/init.ts
import { startScheduler } from "./cron/scheduler";

export function initializeServices() {
  // Start the scheduler
  startScheduler();

  console.log("📅 Tweet scheduler started");
}

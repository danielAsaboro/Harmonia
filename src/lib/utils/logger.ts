// /lib/utils/logger.ts
import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "twitter-publications.log");

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(LOG_FILE, logEntry);
  console.log(logEntry.trim()); // Also log to console
}

export function logError(error: any, context: string) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const logEntry = `[${timestamp}] ERROR - ${context}: ${errorMessage}\n`;

  fs.appendFileSync(LOG_FILE, logEntry);
  console.error(logEntry.trim()); // Also log to console
}

/**
 * core/lib/logger.ts — Structured app logger
 * Tuân thủ CLEANCODE.md rule 7: Debug có chủ đích qua logger.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  info(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.info(formatMessage("info", message, meta));
  },
  warn(message: string, meta?: unknown): void {
    console.warn(formatMessage("warn", message, meta));
  },
  error(message: string, meta?: unknown): void {
    console.error(formatMessage("error", message, meta));
  },
  debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug(formatMessage("debug", message, meta));
    }
  },
};

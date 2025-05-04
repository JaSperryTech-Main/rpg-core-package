import { Engine } from "@core/Engine";
import util from "node:util";

type LogLevel = "debug" | "info" | "warn" | "error" | "success";

interface LoggerOptions {
  level?: LogLevel;
  includeTimeStamp?: boolean;
  colors?: boolean;
  showMetadata?: boolean;
  align?: boolean;
}

const LOG_COLORS = {
  debug: "\x1b[38;5;111m", // Light blue
  info: "\x1b[38;5;40m", // Green
  warn: "\x1b[38;5;214m", // Orange
  error: "\x1b[38;5;196m", // Red
  timestamp: "\x1b[38;5;247m", // Gray
  success: "\x1b[38;5;34m", // Bright green
  reset: "\x1b[0m",
};

const LOG_SYMBOLS = {
  debug: "⚙",
  info: "ℹ",
  warn: "⚠",
  error: "✖",
  success: "✔",
};

export class RPGLogger {
  private level: LogLevel;
  private colors: boolean;
  private align: boolean;
  private showMetadata: boolean;
  private engine?: Engine;
  private includeTimestamp: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || "info";
    this.colors = options.colors ?? process.stdout.isTTY;
    this.align = options.align ?? true;
    this.showMetadata = options.showMetadata ?? true;
    this.includeTimestamp = options.includeTimeStamp ?? true;
  }

  setEngine(engine: Engine) {
    this.engine = engine;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatHeader(level: LogLevel): string {
    const symbol = LOG_SYMBOLS[level];
    const color = LOG_COLORS[level];
    const reset = LOG_COLORS.reset;

    const timestamp = this.colors
      ? `${LOG_COLORS.timestamp}${new Date().toLocaleTimeString()}${reset}`
      : new Date().toLocaleTimeString();

    const headerParts = [
      `${symbol} ${timestamp}`,
      `${level.toUpperCase()}:`.padEnd(7),
    ];

    if (this.colors) {
      headerParts[1] = `${color}${headerParts[1]}${reset}`;
    }

    return headerParts.join(" ");
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const parts: string[] = [];
    const header = this.formatHeader(level);

    parts.push(`${header} ${message}`);

    if (this.showMetadata && meta) {
      const metaString = util
        .inspect(meta, {
          colors: this.colors,
          depth: 3,
          compact: true,
        })
        .replace(/\n/g, "\n  ");
      parts.push(`\n  ↪ ${metaString}`);
    }

    return parts.join("");
  }

  private log(level: LogLevel, message: string, meta?: any) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, meta);
    console.log(formatted); // Remove the separate meta logging

    // Engine event emission remains
    this.engine?.eventManager.emit("log", {
      level:
        level === "info" && message.includes("success") ? "success" : level,
      message,
      timestamp: Date.now(),
      meta,
    });
  }

  debug(message: string, meta?: any) {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: any) {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: any) {
    this.log("warn", message, meta);
  }

  error(message: string, error?: Error) {
    this.log("error", message, error?.stack || error);
  }

  success(message: string, meta?: any) {
    const originalColors = { ...LOG_COLORS };
    const tempSymbols = { ...LOG_SYMBOLS };

    // Temporarily override for success message
    LOG_COLORS.info = LOG_COLORS.success;
    LOG_SYMBOLS.info = LOG_SYMBOLS.success;

    this.log("info", message, meta);

    // Restore original values
    LOG_COLORS.info = originalColors.info;
    LOG_SYMBOLS.info = tempSymbols.info;
  }

  static create(options?: LoggerOptions): RPGLogger {
    return new RPGLogger(options);
  }
}

export const logger = RPGLogger.create({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  colors: true,
  align: true,
  showMetadata: process.env.NODE_ENV !== "production",
  includeTimeStamp: true,
});

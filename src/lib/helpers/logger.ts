// src/lib/helpers/logger.ts

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

let isDebugEnabled = false;

// Attempt to read from environment variable or global object to set default
if (
  typeof process !== 'undefined' &&
  process.env &&
  (process.env.DEBUG === 'true' || process.env.DEBUG === '1')
) {
  isDebugEnabled = true;
} else if (
  typeof window !== 'undefined' &&
  ((window as unknown as Record<string, unknown>).DEBUG_LOG === true ||
    (window as unknown as Record<string, unknown>).DEBUG_LOG === 'true' ||
    (window as unknown as Record<string, unknown>).DEBUG_LOG === '1')
) {
  isDebugEnabled = true;
}

/**
 * Enable or disable debug logging.
 * @param value
 */
export function setDebug(value: boolean): void {
  isDebugEnabled = !!value;
}

/**
 * Check if debug logging is enabled.
 * @returns boolean
 */
export function isDebug(): boolean {
  return isDebugEnabled;
}

/**
 * Print a debug log message if debug mode is enabled.
 * @param module - The name of the module/file logging.
 * @param args - Log arguments.
 */
export function log(module: string, ...args: unknown[]): void {
  if (isDebugEnabled) {
    console.log(`[DEBUG][${module}]`, ...args);
  }
}

/**
 * Print a warning message.
 * @param module - The name of the module/file logging.
 * @param args - Warning arguments.
 */
export function warn(module: string, ...args: unknown[]): void {
  console.warn(`[WARN][${module}]`, ...args);
}

/**
 * Print an error message.
 * @param module - The name of the module/file logging.
 * @param args - Error arguments.
 */
export function error(module: string, ...args: unknown[]): void {
  console.error(`[ERROR][${module}]`, ...args);
}

/**
 * Centralized Logger per clean-code.md guidelines.
 */
export const Logger = {
  info: (ctx: string, msg: string, details?: unknown) =>
    formatAndLog('INFO', '✅', ctx, msg, details, console.log, true),
  warn: (ctx: string, msg: string, details?: unknown) =>
    formatAndLog('WARN', '⚠️', ctx, msg, details, console.warn, false),
  error: (ctx: string, msg: string, details?: unknown) =>
    formatAndLog('ERROR', '❌', ctx, msg, details, console.error, false),
  debug: (ctx: string, msg: string, details?: unknown) =>
    formatAndLog('DEBUG', '🔍', ctx, msg, details, console.log, true),
  perf: (ctx: string, msg: string, ms: number) =>
    formatAndLog('DEBUG', '⏱️', ctx, `${msg} (${ms}ms)`, undefined, console.log, true)
};

function formatAndLog(
  level: LogLevel,
  emoji: string,
  context: string,
  message: string,
  details?: unknown,
  logFn: (...data: unknown[]) => void = console.log,
  debugOnly = false
): void {
  if (debugOnly && !isDebugEnabled) return;
  const ctxStr = context.startsWith('[') && context.endsWith(']') ? context : `[${context}]`;
  const extra =
    details !== undefined
      ? typeof details === 'object' && details !== null
        ? `\n${JSON.stringify(details, null, 2)}`
        : ` ${details}`
      : '';
  logFn(`${emoji} [${level}] ${ctxStr} ${message}${extra}`);
}

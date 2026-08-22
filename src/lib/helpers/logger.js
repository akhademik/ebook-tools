// logger.js

let isDebugEnabled = false;

// Attempt to read from environment variable or global object to set default
if (typeof process !== 'undefined' && process.env && (process.env.DEBUG === 'true' || process.env.DEBUG === '1')) {
  isDebugEnabled = true;
} else if (typeof window !== 'undefined' && (window.DEBUG_LOG === true || window.DEBUG_LOG === 'true' || window.DEBUG_LOG === '1')) {
  isDebugEnabled = true;
}

/**
 * Enable or disable debug logging.
 * @param {boolean} value
 */
export function setDebug(value) {
  isDebugEnabled = !!value;
}

/**
 * Check if debug logging is enabled.
 * @returns {boolean}
 */
export function isDebug() {
  return isDebugEnabled;
}

/**
 * Print a debug log message if debug mode is enabled.
 * @param {string} module - The name of the module/file logging.
 * @param {...any} args - Log arguments.
 */
export function log(module, ...args) {
  if (isDebugEnabled) {
    console.log(`[DEBUG][${module}]`, ...args);
  }
}

/**
 * Print a warning message.
 * @param {string} module - The name of the module/file logging.
 * @param {...any} args - Warning arguments.
 */
export function warn(module, ...args) {
  console.warn(`[WARN][${module}]`, ...args);
}

/**
 * Print an error message.
 * @param {string} module - The name of the module/file logging.
 * @param {...any} args - Error arguments.
 */
export function error(module, ...args) {
  console.error(`[ERROR][${module}]`, ...args);
}

/**
 * Centralized Logger per clean-code.md guidelines.
 */
export const Logger = {
  info: (ctx, msg, details) => formatAndLog('INFO', '✅', ctx, msg, details, console.log, true),
  warn: (ctx, msg, details) => formatAndLog('WARN', '⚠️', ctx, msg, details, console.warn, false),
  error: (ctx, msg, details) => formatAndLog('ERROR', '❌', ctx, msg, details, console.error, false),
  debug: (ctx, msg, details) => formatAndLog('DEBUG', '🔍', ctx, msg, details, console.log, true),
  perf: (ctx, msg, ms) => formatAndLog('DEBUG', '⏱️', ctx, `${msg} (${ms}ms)`, undefined, console.log, true)
};

function formatAndLog(level, emoji, context, message, details, logFn = console.log, debugOnly = false) {
  if (debugOnly && !isDebugEnabled) return;
  const ctxStr = context.startsWith('[') && context.endsWith(']') ? context : `[${context}]`;
  const extra = details !== undefined
    ? (typeof details === 'object' && details !== null ? `\n${JSON.stringify(details, null, 2)}` : ` ${details}`)
    : '';
  logFn(`${emoji} [${level}] ${ctxStr} ${message}${extra}`);
}

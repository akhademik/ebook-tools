import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { setDebug, isDebug, log, warn, error } from '../src/lib/helpers/logger.js';

describe('logger tests', () => {
  let consoleLogSpy: MockInstance;
  let consoleWarnSpy: MockInstance;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setDebug(false);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should default to debug mode false', () => {
    expect(isDebug()).toBe(false);
  });

  it('should enable and disable debug mode', () => {
    setDebug(true);
    expect(isDebug()).toBe(true);
    setDebug(false);
    expect(isDebug()).toBe(false);
  });

  it('should not console.log in debug mode false', () => {
    log('test-module', 'hello world');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should console.log in debug mode true', () => {
    setDebug(true);
    log('test-module', 'hello world');
    expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG][test-module]', 'hello world');
  });

  it('should always console.warn and console.error regardless of debug setting', () => {
    setDebug(false);
    warn('test-module', 'warning msg');
    error('test-module', 'error msg');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN][test-module]', 'warning msg');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR][test-module]', 'error msg');

    consoleWarnSpy.mockClear();
    consoleErrorSpy.mockClear();

    setDebug(true);
    warn('test-module', 'warning msg');
    error('test-module', 'error msg');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN][test-module]', 'warning msg');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR][test-module]', 'error msg');
  });

  it('should initialize to true if process.env.DEBUG is set', async () => {
    vi.stubEnv('DEBUG', 'true');
    const tempLogger = await import(`../src/lib/helpers/logger.js?test=1`);
    expect(tempLogger.isDebug()).toBe(true);
    vi.unstubAllEnvs();
  });

  it('should initialize to true if window.DEBUG_LOG is set', async () => {
    (globalThis as any).window = { DEBUG_LOG: true };
    const tempLogger = await import(`../src/lib/helpers/logger.js?test=2`);
    expect(tempLogger.isDebug()).toBe(true);
    delete (globalThis as any).window;
  });
});

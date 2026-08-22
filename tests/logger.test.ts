import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { Logger, setDebug, isDebug } from '../src/lib/helpers/logger';

describe('logger tests', () => {
  let consoleLogSpy: MockInstance;
  let consoleWarnSpy: MockInstance;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    Logger.setDebug(false);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should default to debug mode false', () => {
    expect(Logger.isDebug()).toBe(false);
    expect(isDebug()).toBe(false);
  });

  it('should enable and disable debug mode', () => {
    Logger.setDebug(true);
    expect(Logger.isDebug()).toBe(true);
    expect(isDebug()).toBe(true);
    Logger.setDebug(false);
    expect(Logger.isDebug()).toBe(false);
    expect(isDebug()).toBe(false);

    setDebug(true);
    expect(Logger.isDebug()).toBe(true);
    setDebug(false);
    expect(Logger.isDebug()).toBe(false);
  });

  it('should not console.log in debug mode false for Logger.debug and Logger.info', () => {
    Logger.debug('test-module', 'hello world');
    Logger.info('test-module', 'info message');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should console.log in debug mode true for Logger.debug and Logger.info', () => {
    Logger.setDebug(true);
    Logger.debug('test-module', 'hello world');
    expect(consoleLogSpy).toHaveBeenCalledWith('🔍 [DEBUG] [test-module] hello world');

    Logger.info('test-module', 'info msg');
    expect(consoleLogSpy).toHaveBeenCalledWith('✅ [INFO] [test-module] info msg');
  });

  it('should format details and errors properly', () => {
    Logger.setDebug(true);
    Logger.debug('test-module', 'msg with object', { key: 'val' });
    expect(consoleLogSpy).toHaveBeenCalledWith('🔍 [DEBUG] [test-module] msg with object\n{\n  "key": "val"\n}');

    const testError = new Error('sample failure');
    Logger.error('test-module', 'error happened', testError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('❌ [ERROR] [test-module] error happened\nError: sample failure'));
  });

  it('should always console.warn and console.error regardless of debug setting', () => {
    Logger.setDebug(false);
    Logger.warn('test-module', 'warning msg');
    Logger.error('test-module', 'error msg');
    expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ [WARN] [test-module] warning msg');
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ [ERROR] [test-module] error msg');

    consoleWarnSpy.mockClear();
    consoleErrorSpy.mockClear();

    Logger.setDebug(true);
    Logger.warn('test-module', 'warning msg');
    Logger.error('test-module', 'error msg');
    expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ [WARN] [test-module] warning msg');
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ [ERROR] [test-module] error msg');
  });

  it('should format perf messages correctly', () => {
    Logger.setDebug(true);
    Logger.perf('test-module', 'render time', 42);
    expect(consoleLogSpy).toHaveBeenCalledWith('⏱️ [DEBUG] [test-module] render time (42ms)');
  });

  it('should initialize to true if process.env.DEBUG is set', async () => {
    vi.stubEnv('DEBUG', 'true');
    const tempLogger = await import(`../src/lib/helpers/logger.js?test=1`);
    expect(tempLogger.Logger.isDebug()).toBe(true);
    vi.unstubAllEnvs();
  });

  it('should initialize to true if window.DEBUG_LOG is set', async () => {
    (globalThis as any).window = { DEBUG_LOG: true };
    const tempLogger = await import(`../src/lib/helpers/logger.js?test=2`);
    expect(tempLogger.Logger.isDebug()).toBe(true);
    delete (globalThis as any).window;
  });
});

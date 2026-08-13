import { describe, expect, it, vi } from 'vitest';
import { createGracefulShutdownHandler } from '../utils/gracefulShutdown.js';

const flushAsyncWork = () => new Promise((resolve) => setImmediate(resolve));

const createDependencies = () => {
  const timer = { unref: vi.fn() };
  const setTimeoutFn = vi.fn(() => timer);
  const clearTimeoutFn = vi.fn();
  const forceExit = vi.fn();
  const setExitCode = vi.fn();
  const writeInfo = vi.fn();
  const writeWarn = vi.fn();
  const writeError = vi.fn();
  const pool = { end: vi.fn().mockResolvedValue() };
  const server = {
    close: vi.fn(),
    closeAllConnections: vi.fn(),
  };

  const shutdown = createGracefulShutdownHandler({
    server,
    pool,
    timeoutMs: 25_000,
    setTimeoutFn,
    clearTimeoutFn,
    forceExit,
    setExitCode,
    writeInfo,
    writeWarn,
    writeError,
  });

  return {
    timer,
    setTimeoutFn,
    clearTimeoutFn,
    forceExit,
    setExitCode,
    writeInfo,
    writeWarn,
    writeError,
    pool,
    server,
    shutdown,
  };
};

describe('graceful shutdown', () => {
  it('drains the server, closes the pool, and clears the timeout', async () => {
    const { server, pool, shutdown, timer, clearTimeoutFn, setExitCode } =
      createDependencies();
    server.close.mockImplementation((callback) => callback());

    shutdown('SIGTERM');
    await flushAsyncWork();

    expect(server.close).toHaveBeenCalledOnce();
    expect(pool.end).toHaveBeenCalledOnce();
    expect(timer.unref).toHaveBeenCalledOnce();
    expect(clearTimeoutFn).toHaveBeenCalledWith(timer);
    expect(setExitCode).toHaveBeenCalledWith(0);
  });

  it('forces shutdown after the drain deadline', () => {
    const { server, shutdown, setTimeoutFn, writeWarn, forceExit } =
      createDependencies();
    server.close.mockImplementation(() => {});

    shutdown('SIGTERM');
    const [timeoutCallback, timeoutMs] = setTimeoutFn.mock.calls[0];
    timeoutCallback();

    expect(timeoutMs).toBe(25_000);
    expect(writeWarn).toHaveBeenCalledWith('server.shutdown_timeout', {
      signal: 'SIGTERM',
      timeoutMs: 25_000,
    });
    expect(server.closeAllConnections).toHaveBeenCalledOnce();
    expect(forceExit).toHaveBeenCalledWith(1);
  });

  it('reports a failure exit code when pool cleanup fails', async () => {
    const { server, pool, shutdown, setExitCode, writeError } =
      createDependencies();
    server.close.mockImplementation((callback) => callback());
    pool.end.mockRejectedValueOnce(new Error('Database cleanup failed'));

    shutdown('SIGINT');
    await flushAsyncWork();

    expect(writeError).toHaveBeenCalledWith('server.shutdown_database_error', {
      signal: 'SIGINT',
      message: 'Database cleanup failed',
    });
    expect(setExitCode).toHaveBeenCalledWith(1);
  });

  it('runs shutdown only once when it receives repeated signals', () => {
    const { server, shutdown } = createDependencies();
    server.close.mockImplementation(() => {});

    shutdown('SIGTERM');
    shutdown('SIGINT');

    expect(server.close).toHaveBeenCalledOnce();
  });
});

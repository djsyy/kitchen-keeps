import { logError, logInfo, logWarn } from './logger.js';

const shutdownTimeoutMs = 25_000;

export const createGracefulShutdownHandler = ({
  server,
  pool,
  timeoutMs = shutdownTimeoutMs,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
  forceExit = process.exit,
  setExitCode = (code) => {
    process.exitCode = code;
  },
  writeInfo = logInfo,
  writeWarn = logWarn,
  writeError = logError,
}) => {
  let isShuttingDown = false;

  return (signal) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    writeInfo('server.shutdown_started', { signal });

    const timeout = setTimeoutFn(() => {
      writeWarn('server.shutdown_timeout', { signal, timeoutMs });
      server.closeAllConnections?.();
      forceExit(1);
    }, timeoutMs);
    timeout.unref?.();

    server.close(async (serverError) => {
      clearTimeoutFn(timeout);

      if (serverError) {
        writeError('server.shutdown_http_error', {
          signal,
          message: serverError.message,
        });
      }

      try {
        await pool.end();
        writeInfo('server.shutdown_completed', { signal });
        setExitCode(serverError ? 1 : 0);
      } catch (poolError) {
        writeError('server.shutdown_database_error', {
          signal,
          message: poolError.message,
        });
        setExitCode(1);
      }
    });
  };
};

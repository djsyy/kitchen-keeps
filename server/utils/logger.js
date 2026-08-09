import crypto from 'node:crypto';

const getRequestPath = (req) => req.originalUrl.split('?')[0];

const writeLog = (level, event, details = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details,
  };

  console[level](JSON.stringify(entry));
};

export const logInfo = (event, details) => writeLog('info', event, details);

export const logWarn = (event, details) => writeLog('warn', event, details);

export const logError = (event, details) => writeLog('error', event, details);

export const requestLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const requestId = crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logInfo('http.request_completed', {
      requestId,
      method: req.method,
      path: getRequestPath(req),
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
      userId: req.user?.userId ?? null,
    });
  });

  next();
};

export const logSecurityEvent = (event, req, details = {}) => {
  logWarn(event, {
    requestId: req.requestId,
    method: req.method,
    path: getRequestPath(req),
    ip: req.ip,
    userId: req.user?.userId ?? null,
    ...details,
  });
};

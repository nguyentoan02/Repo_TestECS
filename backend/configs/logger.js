import pino from "pino";
import pinoHttp from "pino-http";

const isProd = process.env.NODE_ENV === "production";
const level = process.env.LOG_LEVEL || (isProd ? "info" : "debug");

// redaction paths for PII/sensitive data
const redact = [
   "req.headers.authorization",
   "req.headers.cookie",
   "req.headers['x-api-key']",
   "res.headers['set-cookie']",
   "body.password",
   "password",
];

// central pino options
const pinoOptions = {
   level,
   timestamp: pino.stdTimeFunctions.isoTime,
   redact,
   serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
   },
   base: { pid: process.pid, env: process.env.NODE_ENV },
   transport: !isProd
      ? {
           target: "pino-pretty",
           options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
           },
        }
      : undefined,
};

// main logger instance
const logger = pino(pinoOptions);

// helper to create contextual child loggers
const createLogger = (serviceName, meta = {}) =>
   logger.child({ service: serviceName, ...meta });

// pino-http middleware configured for Express
const pinoMiddleware = pinoHttp({
   logger,
   autoLogging: false,
   serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
   },
   genReqId: (req) =>
      req.headers["x-request-id"] ||
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
});

// Express middleware that attaches req.log and emits structured finish logs
const httpLogger = (req, res, next) => {
   pinoMiddleware(req, res, () => {
      // attach a request-scoped child logger
      req.log = logger.child({
         reqId: req.id,
         ip: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "-")
            .toString()
            .split(",")[0]
            .trim(),
         method: req.method,
         url: req.originalUrl || req.url,
      });

      const start = process.hrtime.bigint();

      res.once("finish", () => {
         const diffMs = Number((process.hrtime.bigint() - start) / 1000000n);
         const length = res.getHeader("content-length") || "-";
         req.log.info(
            {
               status: res.statusCode,
               contentLength: Number(length) || undefined,
               responseTimeMs: diffMs,
               referrer:
                  req.headers.referer ||
                  req.headers.referrer ||
                  req.headers["x-referrer"] ||
                  "-",
               userAgent: req.headers["user-agent"] || "-",
               query: req.query,
            },
            `${req.method} ${req.originalUrl || req.url} ${
               res.statusCode
            } ${diffMs}ms`
         );
      });

      next();
   });
};

// exit handling: log then exit with appropriate code
const shutdownLogger = async (err, reason = "uncaughtError") => {
   try {
      if (err && err instanceof Error) {
         logger.fatal({ err, reason }, "Fatal error - shutting down");
      } else {
         logger.fatal({ reason, info: err }, "Fatal error - shutting down");
      }
      // flush pino (ensure write) then exit
      await new Promise(
         (resolve) => logger.flush?.(resolve) || setImmediate(resolve)
      );
   } finally {
      process.exit(1);
   }
};

// capture unhandled failures in production-friendly manner
process.on("uncaughtException", (err) =>
   shutdownLogger(err, "uncaughtException")
);
process.on("unhandledRejection", (reason) =>
   shutdownLogger(reason, "unhandledRejection")
);

export { logger, httpLogger, createLogger };

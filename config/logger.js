import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

// Structured JSON logs in production (for aggregation); readable colored logs in
// development. Verbosity is configurable via LOG_LEVEL.
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
    format: isProduction
        ? winston.format.combine(
              winston.format.timestamp(),
              winston.format.errors({ stack: true }),
              winston.format.json()
          )
        : winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
              winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
                  const metaStr = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
                  return `${timestamp} ${level}: ${stack || message}${metaStr}`;
              })
          ),
    transports: [new winston.transports.Console()],
});

export default logger;

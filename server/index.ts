import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import Logger from './logger';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  Logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      'accept': req.headers['accept']
    }
  });

  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logContext = {
      requestId,
      duration,
      statusCode: res.statusCode,
      responseSize: res.get('content-length'),
      response: capturedJsonResponse
    };

    if (res.statusCode >= 500) {
      Logger.error(`Request failed with status ${res.statusCode}`, undefined, logContext);
    } else if (res.statusCode >= 400) {
      Logger.warn(`Request completed with status ${res.statusCode}`, capturedJsonResponse, logContext);
    } else {
      Logger.info(`Request completed successfully`, logContext);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Global error handler
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      Logger.error('Unhandled error occurred', err, {
        requestId: req.headers['x-request-id'],
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        status
      });

      res.status(status).json({ 
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    // Development setup
    if (app.get("env") === "development") {
      await setupVite(app, server);
      Logger.info('Development mode enabled - Vite server configured');
    } else {
      serveStatic(app);
      Logger.info('Production mode - serving static files');
    }

    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      Logger.info(`Server started successfully`, {
        port,
        environment: app.get('env'),
        nodeVersion: process.version
      });
    });

  } catch (error) {
    Logger.error('Failed to start server', error as Error, {
      environment: app.get('env'),
      nodeVersion: process.version
    });
    process.exit(1);
  }
})();

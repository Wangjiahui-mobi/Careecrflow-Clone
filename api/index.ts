import "dotenv/config";
import express, { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import interviewProgressRouter from "../server/routes/interviewProgress";
import reactAgentsRouter from "../server/routes/reactAgents";
import topicPracticeStreamRouter from '../server/routes/topicPracticeStream';
import topicPracticeStreamResponseRouter from '../server/routes/topicPracticeStreamResponse';
import { testAuthRouter } from '../server/testAuth';

const app = express();

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth callback
registerOAuthRoutes(app);

// Interview progress SSE endpoint
app.use(interviewProgressRouter);

// ReAct Agent streaming endpoints
app.use(reactAgentsRouter);

// Topic Practice streaming endpoints
app.use(topicPracticeStreamRouter);

// Topic Practice stream response endpoints
app.use('/topic-practice', topicPracticeStreamResponseRouter);

// Test authentication endpoints (for E2E testing)
app.use('/test-auth', testAuthRouter);

// tRPC API
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Export for Vercel serverless
export default app;

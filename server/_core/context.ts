import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // In mock mode (no database), always return a mock user
  const MOCK_MODE = process.env.MOCK_MODE === 'true' || !process.env.DATABASE_URL;
  
  if (MOCK_MODE) {
    // Return mock user for testing without database
    user = {
      id: 1,
      openId: 'mock-user-001',
      name: 'Mock User',
      email: 'mock@example.com',
      loginMethod: 'mock',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as User;
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

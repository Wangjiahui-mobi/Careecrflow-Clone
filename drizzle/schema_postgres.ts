import { integer, pgEnum, pgTable, text, timestamp, varchar, json, numeric, serial } from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const sourceEnum = pgEnum("source", ["manual", "linkedin", "ai_generated"]);
export const statusEnum = pgEnum("status", ["pending", "in_progress", "completed"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);
export const questionTypeEnum = pgEnum("question_type", ["technical", "behavioral", "case"]);
export const difficultyEnum = pgEnum("difficulty", ["Easy", "Medium", "Hard"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User job preferences for matching
 */
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  employmentTypes: json("employmentTypes").$type<string[]>(),
  workMode: varchar("workMode", { length: 32 }),
  location: varchar("location", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Job recommendations matched for users
 */
export const jobRecommendations = pgTable("job_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  company: varchar("company", { length: 256 }).notNull(),
  companyId: varchar("companyId", { length: 64 }),
  companyLogo: varchar("companyLogo", { length: 512 }),
  position: varchar("position", { length: 256 }).notNull(),
  location: varchar("location", { length: 256 }),
  postedAt: timestamp("postedAt"),
  matchPercentage: integer("matchPercentage").default(0),
  salaryMin: numeric("salaryMin", { precision: 12, scale: 2 }),
  salaryMax: numeric("salaryMax", { precision: 12, scale: 2 }),
  jobType: varchar("jobType", { length: 64 }),
  workType: varchar("workType", { length: 64 }),
  experienceLevel: varchar("experienceLevel", { length: 64 }),
  industry: varchar("industry", { length: 128 }),
  description: text("description"),
  linkedinJobId: varchar("linkedinJobId", { length: 64 }),
  linkedinUrl: varchar("linkedinUrl", { length: 512 }),
  applyUrl: varchar("applyUrl", { length: 512 }),
  source: sourceEnum("source").default("manual"),
  scrapedAt: timestamp("scrapedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type JobRecommendation = typeof jobRecommendations.$inferSelect;
export type InsertJobRecommendation = typeof jobRecommendations.$inferInsert;

/**
 * Interview history records
 */
export const interviewHistory = pgTable("interview_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  question: text("question").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  score: integer("score"),
  audioDuration: varchar("audioDuration", { length: 32 }),
  audioUrl: varchar("audioUrl", { length: 512 }),
  aiFeedback: json("aiFeedback").$type<{
    scoreReason?: string;
    interviewerIntent?: string;
    capabilityAssessed?: string;
    whatToAnswer?: string;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type InterviewHistory = typeof interviewHistory.$inferSelect;
export type InsertInterviewHistory = typeof interviewHistory.$inferInsert;

/**
 * Mock interview sessions
 */
export const mockSessions = pgTable("mock_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  jobId: integer("jobId").notNull(),
  status: statusEnum("status").default("pending").notNull(),
  matchScore: integer("matchScore"),
  totalQuestions: integer("totalQuestions").default(6),
  currentQuestion: integer("currentQuestion").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MockSession = typeof mockSessions.$inferSelect;
export type InsertMockSession = typeof mockSessions.$inferInsert;

/**
 * Mock interview messages (conversation history)
 */
export const mockMessages = pgTable("mock_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  questionIndex: integer("questionIndex"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MockMessage = typeof mockMessages.$inferSelect;
export type InsertMockMessage = typeof mockMessages.$inferInsert;

/**
 * Assessment reports generated after mock interviews
 */
export const assessmentReports = pgTable("assessment_reports", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  userId: integer("userId").notNull(),
  jobId: integer("jobId").notNull(),
  matchScore: integer("matchScore").notNull(),
  strengths: json("strengths").$type<Array<{
    skill: string;
    description: string;
  }>>(),
  improvements: json("improvements").$type<Array<{
    skill: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>>(),
  suggestions: json("suggestions").$type<Array<{
    topic: string;
    resource: string;
    estimatedTime: string;
  }>>(),
  summary: text("summary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AssessmentReport = typeof assessmentReports.$inferSelect;
export type InsertAssessmentReport = typeof assessmentReports.$inferInsert;

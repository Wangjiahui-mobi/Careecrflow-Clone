import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  mockUser,
  mockPreferences,
  mockJobs,
  mockInterviews,
  mockMockSessions,
  mockMockMessages,
  mockBookmarks,
  mockAssessmentReports,
  mockKnowledgeBases,
  mockJobTrackerItems,
} from "./mockData";

// Mock router with all endpoints returning mock data
export const appRouter = router({
  system: systemRouter,
  
  // Bookmarked Questions
  bookmarks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return mockBookmarks;
    }),
    
    add: protectedProcedure
      .input(z.object({
        topic: z.string(),
        question: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
        targetPosition: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const newBookmark = {
          id: mockBookmarks.length + 1,
          userId: ctx.user?.id || 1,
          ...input,
          difficulty: input.difficulty || 'medium',
          category: "General",
          practiceCount: 0,
          lastPracticedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBookmarks.push(newBookmark);
        return newBookmark;
      }),
    
    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const index = mockBookmarks.findIndex(b => b.id === input.id);
        if (index > -1) {
          mockBookmarks.splice(index, 1);
        }
        return { success: true };
      }),
    
    practice: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const bookmark = mockBookmarks.find(b => b.id === input.id);
        if (bookmark) {
          bookmark.practiceCount++;
          bookmark.lastPracticedAt = new Date();
        }
        return bookmark;
      }),
    
    isBookmarked: protectedProcedure
      .input(z.object({
        topic: z.string(),
        question: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const exists = mockBookmarks.some(
          b => b.topic === input.topic && b.question === input.question
        );
        return { bookmarked: exists };
      }),
    
    updateNotes: protectedProcedure
      .input(z.object({
        id: z.number(),
        notes: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const bookmark = mockBookmarks.find(b => b.id === input.id);
        if (bookmark) {
          bookmark.notes = input.notes;
          bookmark.updatedAt = new Date();
        }
        return bookmark;
      }),
    
    updateCategory: protectedProcedure
      .input(z.object({
        id: z.number(),
        category: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const bookmark = mockBookmarks.find(b => b.id === input.id);
        if (bookmark) {
          bookmark.category = input.category;
          bookmark.updatedAt = new Date();
        }
        return bookmark;
      }),
    
    listByCategory: protectedProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ ctx, input }) => {
        return mockBookmarks.filter(b => b.category === input.category);
      }),
    
    categories: protectedProcedure.query(async ({ ctx }) => {
      const categories = [...new Set(mockBookmarks.map(b => b.category))];
      return categories.map(cat => ({ category: cat }));
    }),
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user || mockUser),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // User Preferences
  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return mockPreferences;
    }),

    save: protectedProcedure
      .input(z.object({
        employmentTypes: z.array(z.string()).optional(),
        workMode: z.string().optional(),
        location: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        Object.assign(mockPreferences, input, { updatedAt: new Date() });
        return mockPreferences;
      }),
  }),

  // Job Recommendations
  jobs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return mockJobs;
    }),

    generateRecommendations: protectedProcedure.mutation(async ({ ctx }) => {
      return { success: true, count: mockJobs.length, source: 'mock' as const };
    }),
    
    generateMock: protectedProcedure.mutation(async ({ ctx }) => {
      return { success: true, count: mockJobs.length };
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return mockJobs.find(j => j.id === input.id) || null;
      }),
  }),

  // Interview History
  interviews: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return mockInterviews;
    }),

    create: protectedProcedure
      .input(z.object({
        company: z.string(),
        position: z.string(),
        interviewDate: z.date(),
        status: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const newInterview = {
          id: mockInterviews.length + 1,
          userId: ctx.user?.id || 1,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockInterviews.push(newInterview);
        return newInterview;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return mockInterviews.find(i => i.id === input.id) || null;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const index = mockInterviews.findIndex(i => i.id === input.id);
        if (index > -1) {
          mockInterviews.splice(index, 1);
        }
        return { success: true };
      }),
  }),

  // Mock Interview Sessions
  mockInterview: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return mockMockSessions;
    }),

    create: protectedProcedure
      .input(z.object({
        topic: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        targetPosition: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const newSession = {
          id: mockMockSessions.length + 1,
          userId: ctx.user?.id || 1,
          ...input,
          status: 'in_progress',
          score: null,
          feedback: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockMockSessions.push(newSession);
        return newSession;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return mockMockSessions.find(s => s.id === input.id) || null;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.string().optional(),
        score: z.number().optional(),
        feedback: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = mockMockSessions.find(s => s.id === input.id);
        if (session) {
          Object.assign(session, input, { updatedAt: new Date() });
        }
        return session;
      }),

    messages: router({
      list: protectedProcedure
        .input(z.object({ sessionId: z.number() }))
        .query(async ({ ctx, input }) => {
          return mockMockMessages.filter(m => m.sessionId === input.sessionId);
        }),

      create: protectedProcedure
        .input(z.object({
          sessionId: z.number(),
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
          const newMessage = {
            id: mockMockMessages.length + 1,
            ...input,
            createdAt: new Date(),
          };
          mockMockMessages.push(newMessage);
          return newMessage;
        }),
    }),

    assessmentReport: router({
      get: protectedProcedure
        .input(z.object({ sessionId: z.number() }))
        .query(async ({ ctx, input }) => {
          return mockAssessmentReports.find(r => r.sessionId === input.sessionId) || null;
        }),

      list: protectedProcedure.query(async ({ ctx }) => {
        return mockAssessmentReports;
      }),

      create: protectedProcedure
        .input(z.object({
          sessionId: z.number(),
          overallScore: z.number(),
          technicalScore: z.number(),
          communicationScore: z.number(),
          problemSolvingScore: z.number(),
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          recommendations: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input }) => {
          const newReport = {
            id: mockAssessmentReports.length + 1,
            userId: ctx.user?.id || 1,
            ...input,
            createdAt: new Date(),
          };
          mockAssessmentReports.push(newReport);
          return newReport;
        }),
    }),
  }),

  // Onboarding
  onboarding: router({
    saveProfile: protectedProcedure
      .input(z.object({
        name: z.string(),
        targetRole: z.string(),
        experience: z.string(),
        skills: z.array(z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        return { success: true, ...input };
      }),

    parseResume: protectedProcedure
      .input(z.object({
        resumeText: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          skills: ["JavaScript", "React", "Node.js", "TypeScript"],
          experience: "5 years",
          education: "BS Computer Science",
        };
      }),
  }),

  // Knowledge Base
  knowledgeBase: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return mockKnowledgeBases;
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return mockKnowledgeBases.find(kb => kb.id === input.id) || null;
      }),

    getOrCreate: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let kb = mockKnowledgeBases.find(k => k.name === input.name);
        if (!kb) {
          kb = {
            id: mockKnowledgeBases.length + 1,
            userId: ctx.user?.id || 1,
            name: input.name,
            description: input.description || "",
            content: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockKnowledgeBases.push(kb);
        }
        return kb;
      }),

    search: protectedProcedure
      .input(z.object({
        query: z.string(),
        knowledgeBaseId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return {
          results: ["Result 1", "Result 2", "Result 3"],
          statistics: {
            totalSearches: 42,
            avgResponseTime: 150,
          },
        };
      }),
  }),

  // Topic Practice
  topicPractice: router({
    generateQuestion: protectedProcedure
      .input(z.object({
        topic: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          question: `Sample ${input.difficulty} question about ${input.topic}`,
          hints: ["Hint 1", "Hint 2"],
          solution: "Sample solution",
        };
      }),

    submitAnswer: protectedProcedure
      .input(z.object({
        questionId: z.string(),
        answer: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          correct: true,
          feedback: "Great job!",
          score: 95,
        };
      }),
  }),

  // Resume Parser
  resume: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return [
        {
          id: 1,
          userId: ctx.user?.id || 1,
          name: "Software Engineer Resume",
          content: "John Doe\nSoftware Engineer\n...",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 2,
          userId: ctx.user?.id || 1,
          name: "Senior Developer Resume",
          content: "John Doe\nSenior Developer\n...",
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ];
    }),

    parse: protectedProcedure
      .input(z.object({
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          skills: ["JavaScript", "React", "Node.js"],
          experience: ["Software Engineer at Tech Corp (2020-2023)"],
          education: ["BS Computer Science, University (2016-2020)"],
        };
      }),
  }),

  // Job Tracker
  jobTracker: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return mockJobTrackerItems;
    }),

    create: protectedProcedure
      .input(z.object({
        company: z.string(),
        position: z.string(),
        status: z.string(),
        appliedDate: z.date(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const newItem = {
          id: mockJobTrackerItems.length + 1,
          userId: ctx.user?.id || 1,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockJobTrackerItems.push(newItem);
        return newItem;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const item = mockJobTrackerItems.find(i => i.id === input.id);
        if (item) {
          Object.assign(item, input, { updatedAt: new Date() });
        }
        return item;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const index = mockJobTrackerItems.findIndex(i => i.id === input.id);
        if (index > -1) {
          mockJobTrackerItems.splice(index, 1);
        }
        return { success: true };
      }),
  }),

  // LinkedIn Integration
  linkedin: router({
    scrapeJobs: protectedProcedure
      .input(z.object({
        title: z.string(),
        location: z.string(),
        rows: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          success: true,
          jobs: mockJobs.slice(0, input.rows || 10),
        };
      }),

    scrapeCompany: protectedProcedure
      .input(z.object({
        companyUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          name: "Tech Company",
          description: "A leading technology company",
          industry: "Technology",
          size: "1000-5000 employees",
          website: "https://techcompany.com",
        };
      }),

    getAccountInfo: protectedProcedure.query(async ({ ctx }) => {
      return {
        configured: true,
        credits: 1000,
      };
    }),
  }),

  // JobHub Profile
  jobhProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return {
        id: 1,
        userId: ctx.user?.id || 1,
        name: "Demo User",
        title: "Software Engineer",
        bio: "Passionate about building great software",
        skills: ["JavaScript", "React", "Node.js"],
        experience: "5 years",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return {
        totalApplications: 12,
        activeApplications: 5,
        interviews: 3,
        offers: 1,
        responseRate: 42,
      };
    }),

    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        title: z.string().optional(),
        bio: z.string().optional(),
        skills: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          success: true,
          ...input,
        };
      }),
  }),

  // AI Toolbox
  aiToolbox: router({
    generateCoverLetter: protectedProcedure
      .input(z.object({
        jobDescription: z.string(),
        resume: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          coverLetter: "Dear Hiring Manager,\n\nI am excited to apply for this position...",
        };
      }),

    optimizeResume: protectedProcedure
      .input(z.object({
        resume: z.string(),
        jobDescription: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          optimizedResume: "Optimized resume content...",
          suggestions: ["Add more quantifiable achievements", "Highlight relevant skills"],
        };
      }),

    generateInterviewQuestions: protectedProcedure
      .input(z.object({
        position: z.string(),
        company: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          questions: [
            "Tell me about yourself",
            "Why do you want to work at this company?",
            "What are your strengths and weaknesses?",
          ],
        };
      }),
  }),

  // Skill Analysis
  skillAnalysis: router({
    analyze: protectedProcedure
      .input(z.object({
        skills: z.array(z.string()),
        targetRole: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return {
          matchScore: 85,
          matchedSkills: input.skills.slice(0, 3),
          missingSkills: ["Docker", "Kubernetes"],
          recommendations: ["Learn containerization", "Practice system design"],
        };
      }),

    getMarketTrends: protectedProcedure
      .input(z.object({
        skill: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return {
          skill: input.skill,
          demand: "High",
          trend: "Growing",
          averageSalary: "$120,000",
          topCompanies: ["Google", "Meta", "Amazon"],
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

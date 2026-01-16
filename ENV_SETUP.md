# Environment Setup Guide

## Overview

This document describes the environment configuration for running the application in **MOCK_MODE** - a special mode that allows the application to run without a database connection, using mock data for all API responses.

## Quick Start

### 1. Copy Environment Variables

```bash
cp .env.snapshot .env
```

### 2. Start Backend (with MOCK_MODE)

```bash
MOCK_MODE=true pnpm tsx server/railway.ts
```

### 3. Start Frontend

```bash
pnpm vite
```

### 4. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## Environment Variables Explained

### Database Configuration

```bash
DATABASE_URL=postgresql://...
```

**Status**: Not used in MOCK_MODE  
**Purpose**: PostgreSQL connection string for production use  
**Note**: When MOCK_MODE is enabled, this is ignored

### JWT Secret

```bash
JWT_SECRET=local-dev-secret-key-change-in-production
```

**Purpose**: Used for signing session tokens  
**Security**: Change this in production!

### OAuth Configuration

```bash
VITE_APP_ID=local-dev-app-id
OAUTH_SERVER_URL=http://localhost:5000
VITE_OAUTH_PORTAL_URL=http://localhost:5000/oauth
OWNER_OPEN_ID=local-dev-owner
OWNER_NAME=Local Developer
```

**Purpose**: Mock OAuth configuration for local development  
**Note**: In MOCK_MODE, authentication is bypassed and a mock user is automatically provided

### Manus Forge API (LLM Proxy)

```bash
BUILT_IN_FORGE_API_URL=https://api.manus.im/api/llm-proxy
BUILT_IN_FORGE_API_KEY=sk-akvwEWHtbi7SNPYVgpb8sG
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/api/llm-proxy
VITE_FRONTEND_FORGE_API_KEY=sk-akvwEWHtbi7SNPYVgpb8sG
```

**Purpose**: LLM API proxy for AI features  
**Used for**:
- Cover letter generation
- Email writing
- Resume optimization
- Interview preparation

### App Information

```bash
VITE_APP_TITLE=UHired - Local Dev
VITE_APP_LOGO=https://via.placeholder.com/150
```

**Purpose**: Branding and display information

### External API Keys

```bash
APIFY_API_TOKEN=your_apify_token_here
```

**Purpose**: Apify API for LinkedIn job scraping  
**Note**: Optional, cached data is used when not available

### Frontend API Configuration

**IMPORTANT**: `VITE_API_URL` is **NOT** set

**Reason**: 
- Allows Vite proxy to handle API requests
- Avoids CORS and network timeout issues
- See `vite.config.ts` for proxy configuration

---

## MOCK_MODE Details

### What is MOCK_MODE?

MOCK_MODE is a special runtime mode that allows the application to run without any database connection. All API endpoints return predefined mock data instead of querying a database.

### How to Enable

```bash
MOCK_MODE=true pnpm tsx server/railway.ts
```

Or set in environment:

```bash
export MOCK_MODE=true
pnpm tsx server/railway.ts
```

### What Happens in MOCK_MODE?

1. **Authentication Bypass**
   - All requests automatically get a mock user
   - No login required
   - All `protectedProcedure` endpoints are accessible

2. **Mock Data Responses**
   - All API endpoints return data from `server/mockData.ts`
   - No database queries are executed
   - Data is not persisted

3. **Automatic Detection**
   - MOCK_MODE is also enabled if `DATABASE_URL` is not set
   - See `server/_core/context.ts` for implementation

### Mock User

```typescript
{
  id: 1,
  openId: 'mock-user-001',
  name: 'Mock User',
  email: 'mock@example.com',
  loginMethod: 'mock',
  role: 'user',
}
```

### Available Mock Data

- **Users**: 1 mock user
- **Jobs**: 5 job recommendations (Google, Meta, Amazon, Microsoft, Apple)
- **Resumes**: 2 sample resumes
- **Job Tracker**: 2 tracked applications
- **Interviews**: 3 interview records
- **Mock Sessions**: 2 practice sessions
- **Bookmarks**: 5 bookmarked questions
- **Assessment Reports**: 2 evaluation reports
- **Knowledge Base**: 3 knowledge entries

### Limitations

- ❌ Data is not persisted (resets on server restart)
- ❌ Create/Update/Delete operations don't actually modify data
- ❌ No real authentication
- ❌ No database operations
- ✅ Perfect for UI development and testing
- ✅ No database setup required
- ✅ Fast startup and iteration

---

## Vite Proxy Configuration

The frontend uses Vite's proxy feature to forward API requests to the backend.

**File**: `vite.config.ts`

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

**How it works**:

1. Frontend makes request to `/api/trpc/...`
2. Vite intercepts the request
3. Vite forwards to `http://localhost:5000/api/trpc/...`
4. Backend responds with mock data
5. Vite returns response to frontend

**Benefits**:
- No CORS issues
- No need for absolute URLs
- Works in sandbox environments
- Simpler configuration

---

## Production Setup

For production deployment, you need to:

1. **Disable MOCK_MODE**
   ```bash
   unset MOCK_MODE
   # or ensure it's not set in production environment
   ```

2. **Set Real Database URL**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

3. **Configure Real OAuth**
   ```bash
   VITE_APP_ID=your-real-app-id
   OAUTH_SERVER_URL=https://oauth.yourapp.com
   VITE_OAUTH_PORTAL_URL=https://oauth.yourapp.com/portal
   ```

4. **Set Frontend API URL** (if needed)
   ```bash
   VITE_API_URL=https://api.yourapp.com
   ```

5. **Update JWT Secret**
   ```bash
   JWT_SECRET=your-secure-random-secret
   ```

---

## Troubleshooting

### Frontend shows loading spinner forever

**Cause**: API requests are timing out

**Solution**:
1. Ensure backend is running on port 5000
2. Check that `VITE_API_URL` is NOT set in `.env`
3. Verify Vite proxy is configured in `vite.config.ts`
4. Restart frontend: `pnpm vite`

### Backend returns authentication errors

**Cause**: MOCK_MODE is not enabled

**Solution**:
```bash
MOCK_MODE=true pnpm tsx server/railway.ts
```

### Cannot connect to database

**Cause**: Database URL is set but database is not accessible

**Solution**:
1. Enable MOCK_MODE to bypass database
2. Or fix database connection
3. Or remove `DATABASE_URL` from `.env`

### Changes to mock data not reflected

**Cause**: Mock data is loaded at startup

**Solution**:
1. Edit `server/mockData.ts`
2. Restart backend server
3. Refresh frontend

---

## File Structure

```
.
├── .env                      # Active environment variables (gitignored)
├── .env.snapshot             # Snapshot of working configuration
├── ENV_SETUP.md             # This file
├── vite.config.ts           # Vite configuration with proxy
├── server/
│   ├── mockData.ts          # Mock data definitions
│   ├── routers.ts           # API routes (mock version)
│   ├── routers.ts.original  # Original routes (backup)
│   ├── _core/
│   │   └── context.ts       # MOCK_MODE implementation
│   └── railway.ts           # Server entry point
└── client/
    └── src/
        ├── main.tsx         # Frontend entry with tRPC client
        └── const.ts         # Frontend constants
```

---

## Summary

- ✅ Use `.env.snapshot` as reference for environment setup
- ✅ Enable `MOCK_MODE=true` for development without database
- ✅ Do NOT set `VITE_API_URL` to use Vite proxy
- ✅ Start backend with `MOCK_MODE=true pnpm tsx server/railway.ts`
- ✅ Start frontend with `pnpm vite`
- ✅ All mock data is in `server/mockData.ts`
- ✅ Mock user is automatically provided in MOCK_MODE
- ✅ Perfect for UI development and testing

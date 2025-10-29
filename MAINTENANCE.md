# Maintenance Guide - Atiohaidar Portfolio Application

This guide provides comprehensive instructions for maintaining and developing the application across all three platforms: Backend, Frontend, and Mobile (Expo).

## Table of Contents

1. [Project Structure](#project-structure)
2. [Backend Maintenance](#backend-maintenance)
3. [Frontend Maintenance](#frontend-maintenance)
4. [Mobile App (Expo) Maintenance](#mobile-app-maintenance)
5. [Common Tasks](#common-tasks)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
atiohaidar.github.io/
├── backend/                 # Cloudflare Workers API (TypeScript)
│   ├── src/
│   │   ├── common/         # Shared utilities and base classes
│   │   ├── controllers/    # API route handlers
│   │   ├── services/       # Business logic layer
│   │   ├── models/         # Type definitions and schemas
│   │   ├── middlewares/    # Authentication and request processing
│   │   ├── routes/         # Route registration
│   │   └── index.ts        # Application entry point
│   ├── migrations/         # Database schema migrations
│   └── wrangler.jsonc      # Cloudflare Workers configuration
│
├── frontend/               # React web application (Vite + TypeScript)
│   ├── lib/
│   │   └── api/           # Consolidated API client (NEW)
│   │       ├── client.ts  # HTTP client and auth utilities
│   │       ├── services.ts # API service functions
│   │       └── types.ts   # TypeScript type definitions
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components
│   ├── contexts/         # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Feature-specific services
│   └── utils/            # Utility functions
│
└── expojs/               # React Native mobile app (Expo)
    ├── app/              # Expo Router file-based routing
    ├── screens/          # Screen components
    ├── components/       # Reusable mobile components
    ├── services/         # API service layer
    └── hooks/            # Custom mobile hooks
```

---

## Backend Maintenance

### Development Setup

```bash
cd backend
npm install
npm run dev      # Start local development server
```

### Key Concepts

#### 1. Controllers
Controllers handle HTTP requests and responses. They use OpenAPI Route for documentation.

**Location:** `backend/src/controllers/`

**New:** Controllers can now extend `BaseController` for common functionality:

```typescript
// backend/src/common/BaseController.ts
import { BaseController } from '../common/BaseController';

export class MyController extends BaseController {
  async handle(request: Request) {
    // Use helper methods
    return this.successResponse({ data: 'value' });
    // or
    return this.errorResponse('Error message', 400);
  }
}
```

#### 2. Services
Services contain business logic and database operations.

**Location:** `backend/src/services/`

**Pattern:**
```typescript
// services/myService.ts
export async function getItems(db: D1Database) {
  const result = await db
    .prepare('SELECT * FROM items')
    .all();
  return result.results;
}
```

#### 3. Common Schemas (NEW)
Reusable OpenAPI response schemas to reduce duplication.

**Location:** `backend/src/common/schemas.ts`

```typescript
import { CommonResponses } from '../common/schemas';

schema = {
  responses: {
    "200": { /* success response */ },
    ...CommonResponses  // Includes 400, 401, 403, 404, 500
  }
}
```

### Adding a New API Endpoint

1. **Create/Update Service** (`backend/src/services/`)
   ```typescript
   export async function myNewFunction(db: D1Database, params: any) {
     // Business logic here
   }
   ```

2. **Create/Update Controller** (`backend/src/controllers/`)
   ```typescript
   import { BaseController } from '../common/BaseController';
   
   export class MyController extends BaseController {
     schema = { /* OpenAPI schema */ };
     
     async handle(request: Request) {
       // Implementation
       return this.successResponse({ data });
     }
   }
   ```

3. **Register Route** (`backend/src/routes/index.ts`)
   ```typescript
   openapi.get("/api/my-endpoint", MyController);
   ```

### Database Migrations

**Location:** `backend/migrations/`

```bash
# Apply migrations locally
npm run seed

# Apply migrations to production
wrangler d1 execute DB --file=./migrations/001_init.sql --remote
```

### Deployment

```bash
cd backend
npm run deploy    # Deploy to Cloudflare Workers
```

### Testing

```bash
# Local testing
curl http://localhost:8787/api/endpoint

# Production testing
curl https://backend.atiohaidar.workers.dev/api/endpoint
```

---

## Frontend Maintenance

### Development Setup

```bash
cd frontend
npm install
npm run dev      # Start development server (http://localhost:5173)
```

### Key Concepts

#### 1. Consolidated API Module (NEW)

**Location:** `frontend/lib/api/`

The API client has been refactored to follow DRY principles:

```typescript
// Use the new consolidated API
import { authService, userService, taskService } from './lib/api';

// Services are organized by domain
await authService.login(credentials);
await userService.list();
await taskService.create(task);
```

**Old files** (`apiClient.ts`, `apiService.ts`) still work but are deprecated. They now re-export from the new location for backwards compatibility.

#### 2. Authentication

```typescript
import { auth } from './lib/api';

// Token management
auth.setToken(token);
auth.getToken();
auth.removeToken();

// User management
auth.setUser(user);
auth.getUser();

// Clear all auth data
auth.clear();
```

#### 3. Components Structure

- `components/` - Reusable UI components
- `pages/` - Full page components
- `contexts/` - React Context providers
- `hooks/` - Custom React hooks

### Adding a New Feature

1. **Add API Service** (if needed)
   ```typescript
   // frontend/lib/api/services.ts
   export const myFeatureService = {
     list: async () => { /* ... */ },
     create: async (data) => { /* ... */ },
   };
   ```

2. **Create Components**
   ```typescript
   // frontend/components/MyFeature.tsx
   import { myFeatureService } from '../lib/api';
   
   export function MyFeature() {
     // Component implementation
   }
   ```

3. **Add Page** (if needed)
   ```typescript
   // frontend/pages/MyFeaturePage.tsx
   export function MyFeaturePage() {
     return <MyFeature />;
   }
   ```

4. **Update Routing**
   ```typescript
   // frontend/App.tsx
   <Route path="/my-feature" element={<MyFeaturePage />} />
   ```

### Environment Variables

```bash
# .env.development
VITE_API_URL=http://localhost:8787

# .env.production
VITE_API_URL=https://backend.atiohaidar.workers.dev
```

### Building for Production

```bash
cd frontend
npm run build    # Creates dist/ folder
npm run preview  # Preview production build
```

### Deployment

The frontend is deployed via GitHub Pages. Push to main branch to trigger deployment.

---

## Mobile App (Expo) Maintenance

### Development Setup

```bash
cd expojs
npm install
npx expo start   # Start Expo development server
```

### Running on Devices

```bash
npx expo start --android   # Run on Android
npx expo start --ios       # Run on iOS
npx expo start --web       # Run on web browser
```

### Key Concepts

#### 1. API Service

**Location:** `expojs/services/api.ts`

Singleton service instance for all API calls:

```typescript
import apiService from '@/services/api';

// Authentication
await apiService.login(credentials);
await apiService.logout();

// API calls
const users = await apiService.listUsers();
const tasks = await apiService.listTasks();
```

#### 2. File-based Routing

Expo uses file-based routing. Files in `app/` become routes:

```
app/
├── (tabs)/          # Tab navigation
│   ├── index.tsx    # Home tab
│   ├── tasks.tsx    # Tasks tab
│   └── _layout.tsx  # Tab layout
├── (auth)/          # Auth screens
│   └── login.tsx    # Login screen
└── _layout.tsx      # Root layout
```

#### 3. Screens vs Components

- `screens/` - Full screen components with business logic
- `components/` - Reusable UI components

### Adding a New Screen

1. **Create Screen Component**
   ```typescript
   // expojs/screens/myfeature/MyFeatureScreen.tsx
   export default function MyFeatureScreen() {
     // Screen implementation
   }
   ```

2. **Add Route File**
   ```typescript
   // expojs/app/(tabs)/myfeature.tsx
   import MyFeatureScreen from '@/screens/myfeature/MyFeatureScreen';
   export default MyFeatureScreen;
   ```

3. **Update Tab Layout** (if adding to tabs)
   ```typescript
   // expojs/app/(tabs)/_layout.tsx
   <Tabs.Screen name="myfeature" options={{ title: 'My Feature' }} />
   ```

### Environment Variables

```bash
# .env or app.config.js
EXPO_PUBLIC_API_BASE_URL=https://backend.atiohaidar.workers.dev
```

Access in code:
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
```

### Building for Production

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both
eas build --platform all
```

---

## Common Tasks

### Adding a New Feature Across All Platforms

1. **Backend:**
   - Add service function
   - Add controller with OpenAPI schema
   - Register route

2. **Frontend:**
   - Add service function in `lib/api/services.ts`
   - Create UI components
   - Create page component
   - Add route

3. **Mobile:**
   - Add API method to `services/api.ts`
   - Create screen component
   - Add route file
   - Update navigation

### Updating Shared Types

Types should be consistent across all platforms:

1. **Backend:** `backend/src/models/types.ts`
2. **Frontend:** `frontend/apiTypes.ts`
3. **Mobile:** `expojs/types/api.ts`

When updating, ensure all three are synchronized.

### Authentication Flow

1. User logs in via frontend/mobile
2. Backend returns JWT token
3. Token stored in localStorage (web) or AsyncStorage (mobile)
4. Token included in all authenticated requests
5. Backend validates token in middleware

---

## Best Practices

### DRY Principles Applied

1. **Backend:**
   - Use `BaseController` for common response patterns
   - Use `CommonResponses` for OpenAPI schemas
   - Extract reusable logic to services

2. **Frontend:**
   - Use consolidated API module (`lib/api/`)
   - Create reusable hooks for common patterns
   - Extract shared UI components

3. **Mobile:**
   - Use singleton API service
   - Create reusable components
   - Extract common hooks

### Code Organization

```
✅ Good:
- Group by feature/domain
- Small, focused files
- Clear naming conventions

❌ Avoid:
- Large monolithic files
- Mixing concerns
- Duplicating code
```

### Error Handling

```typescript
// Backend
try {
  const result = await service.function();
  return this.successResponse({ result });
} catch (error) {
  return this.errorResponse(error.message, 500);
}

// Frontend/Mobile
try {
  const data = await apiService.function();
  // Handle success
} catch (error) {
  // Handle error
  console.error(error);
}
```

### Type Safety

- Always define TypeScript types
- Use Zod schemas for validation in backend
- Keep types synchronized across platforms

---

## Troubleshooting

### Backend Issues

**Problem:** Database connection error
```bash
# Check Wrangler configuration
cat backend/wrangler.jsonc

# Test database
wrangler d1 execute DB --command="SELECT 1" --local
```

**Problem:** CORS errors
```typescript
// backend/src/index.ts
app.use("*", cors({
  origin: "*",  // Adjust for production
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
```

### Frontend Issues

**Problem:** API connection refused
```bash
# Check if backend is running
curl http://localhost:8787/api/stats

# Check environment variables
cat frontend/.env.development
```

**Problem:** Build errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Mobile Issues

**Problem:** API not connecting on physical device
```typescript
// Use computer's local IP instead of localhost
const API_BASE_URL = 'http://192.168.1.100:8787';
```

**Problem:** Expo start fails
```bash
# Clear cache
npx expo start --clear

# Reset project
npm run reset-project
```

### Common Issues

**Problem:** TypeScript errors after refactoring
```bash
# Rebuild TypeScript
npm run build
# or
npx tsc --noEmit
```

**Problem:** Outdated dependencies
```bash
# Check for updates
npm outdated

# Update dependencies
npm update
```

---

## Quick Reference

### Development Commands

```bash
# Backend
cd backend && npm run dev          # Dev server
cd backend && npm run deploy       # Deploy to Cloudflare

# Frontend
cd frontend && npm run dev         # Dev server
cd frontend && npm run build       # Production build

# Mobile
cd expojs && npx expo start       # Dev server
cd expojs && eas build            # Production build
```

### Important URLs

- Backend Dev: http://localhost:8787
- Frontend Dev: http://localhost:5173
- Backend Prod: https://backend.atiohaidar.workers.dev
- Frontend Prod: https://atiohaidar.github.io

### File Locations

- API Client: `frontend/lib/api/`
- Backend Controllers: `backend/src/controllers/`
- Backend Services: `backend/src/services/`
- Frontend Components: `frontend/components/`
- Mobile Screens: `expojs/screens/`

---

## Need Help?

1. Check existing documentation in project root
2. Review example code in similar features
3. Check console/logs for error messages
4. Verify environment variables are correct
5. Ensure all dependencies are installed

For architecture decisions, refer to:
- `IMPLEMENTATION_SUMMARY.md` - Overall architecture
- `CHAT_DOCUMENTATION.md` - Chat feature details
- `DASHBOARD_GUIDE.md` - Dashboard functionality
- `MOBILE_APP_GUIDE.md` - Mobile app specifics

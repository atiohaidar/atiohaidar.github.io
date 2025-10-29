# System Architecture

## Overview

This document describes the architecture of the Atiohaidar Portfolio Application, a full-stack web and mobile application built with modern technologies.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │   Web Frontend   │              │   Mobile App     │     │
│  │  (React + Vite)  │              │  (React Native)  │     │
│  │                  │              │     (Expo)       │     │
│  └────────┬─────────┘              └────────┬─────────┘     │
│           │                                 │                │
│           └────────────┬────────────────────┘                │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ HTTPS/REST API
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                    Backend Layer                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│             ┌──────────────────────────┐                     │
│             │  Cloudflare Workers API  │                     │
│             │     (TypeScript)         │                     │
│             └──────────┬───────────────┘                     │
│                        │                                     │
│         ┌──────────────┼──────────────┐                     │
│         │              │              │                     │
│    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐                │
│    │Controllers│   │Services │   │  Models │                │
│    └─────────┘   └─────────┘   └─────────┘                │
│                                                               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ SQL
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   Data Layer                                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│                   ┌──────────────┐                           │
│                   │ Cloudflare D1│                           │
│                   │  (SQLite DB) │                           │
│                   └──────────────┘                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Cloudflare Workers (Edge Computing)
- **Language**: TypeScript
- **Framework**: Hono + Chanfana (OpenAPI)
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod

### Frontend (Web)
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State Management**: React Query (@tanstack/react-query)
- **Animations**: tsParticles, D3.js

### Mobile App
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind for RN)
- **Navigation**: Expo Router
- **HTTP Client**: Axios
- **State Management**: React Query

## Backend Architecture

### Layer Structure

```
backend/src/
├── common/              # Shared utilities (NEW)
│   ├── BaseController.ts
│   └── schemas.ts
├── controllers/         # Request handlers
│   ├── article.controller.ts
│   ├── task.controller.ts
│   └── ...
├── services/           # Business logic
│   ├── articles.ts
│   ├── tasks.ts
│   └── ...
├── models/             # Type definitions
│   └── types.ts
├── middlewares/        # Auth & validation
│   └── auth.ts
├── routes/            # Route registration
│   └── index.ts
└── index.ts           # Application entry
```

### Key Patterns

#### Controllers
Controllers handle HTTP requests and use OpenAPI for documentation:

```typescript
export class MyController extends BaseController {
  schema = { /* OpenAPI schema */ };
  
  async handle(request: Request, env: Env, ctx: AppContext) {
    // 1. Validate request
    // 2. Call service layer
    // 3. Return response
    return this.successResponse({ data });
  }
}
```

#### Services
Services contain business logic and database operations:

```typescript
export async function getItems(db: D1Database) {
  const result = await db
    .prepare('SELECT * FROM items')
    .all();
  return result.results;
}
```

#### Authentication Flow
1. User sends credentials to `/api/auth/login`
2. Backend validates and returns JWT token
3. Client stores token (localStorage/AsyncStorage)
4. Client includes token in `Authorization` header
5. Middleware validates token on protected routes

## Frontend Architecture

### Directory Structure

```
frontend/
├── lib/
│   └── api/           # Consolidated API client (NEW)
│       ├── client.ts      # HTTP client & auth
│       ├── services.ts    # API functions
│       └── types.ts       # TypeScript types
├── components/
│   ├── ui/            # Reusable UI components (NEW)
│   └── ...            # Feature components
├── pages/             # Page components
├── hooks/             # Custom React hooks (NEW)
│   ├── useApiData.ts
│   ├── useAuth.ts
│   └── useForm.ts
├── contexts/          # React contexts
├── services/          # Feature-specific services
└── utils/            # Utility functions
```

### Key Patterns

#### API Client (Consolidated)
New centralized API structure:

```typescript
// Use organized services
import { authService, userService, taskService } from './lib/api';

await authService.login(credentials);
await userService.list();
await taskService.create(data);
```

#### Custom Hooks
Reusable hooks for common patterns:

```typescript
// API calls with loading/error states
const { data, loading, error, refetch } = useApiCall(
  () => userService.list()
);

// Form handling
const { values, handleChange, handleSubmit } = useForm({
  initialValues,
  onSubmit: async (values) => { /* ... */ }
});

// Authentication state
const { user, isAuthenticated, login, logout } = useAuth();
```

#### UI Components
Standardized, reusable components:

```typescript
import { Button, Input, Card, Loading } from './components/ui';

<Button variant="primary" isLoading={loading}>
  Submit
</Button>
```

## Mobile App Architecture

### Structure

```
expojs/
├── app/              # File-based routing
│   ├── (tabs)/      # Tab navigation
│   ├── (auth)/      # Auth screens
│   └── _layout.tsx  # Root layout
├── screens/         # Screen components
├── components/      # Reusable components
├── services/        # API service
│   └── api.ts      # Singleton API client
├── hooks/          # Custom hooks
└── types/          # TypeScript types
```

### Key Patterns

#### File-Based Routing
Expo Router uses files as routes:

```
app/(tabs)/index.tsx     → /
app/(tabs)/tasks.tsx     → /tasks
app/(auth)/login.tsx     → /login
```

#### API Service
Singleton pattern for API calls:

```typescript
import apiService from '@/services/api';

// All API calls go through this instance
const data = await apiService.listTasks();
const user = await apiService.login(credentials);
```

## Data Flow

### Typical Request Flow

```
1. User Action
   └─> Component event handler
       └─> API service function
           └─> HTTP request to backend
               └─> Backend controller
                   └─> Middleware (auth)
                       └─> Service layer
                           └─> Database query
                               └─> Response back through layers
                                   └─> Component updates state
                                       └─> UI re-renders
```

### State Management

- **Local State**: React useState for component-level state
- **Global State**: React Context for auth, theme
- **Server State**: React Query for API data caching
- **Form State**: Custom useForm hook

## Database Schema

### Core Tables

- **users** - User accounts and authentication
- **tasks** - Task management system
- **articles** - Blog/article content
- **rooms** - Room booking system
- **bookings** - Room booking records
- **conversations** - Chat conversations
- **messages** - Chat messages
- **groups** - Group chats
- **group_members** - Group membership
- **anonymous_messages** - Anonymous chat messages

See `backend/migrations/` for detailed schemas.

## Security

### Authentication
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- Role-based access control (admin/user)

### API Security
- CORS configuration
- Input validation (Zod schemas)
- SQL injection protection (prepared statements)
- Rate limiting (Cloudflare)

### Data Protection
- Tokens stored securely (localStorage/AsyncStorage)
- Passwords never stored in plain text
- Sensitive data filtered in responses

## Deployment

### Backend
- **Platform**: Cloudflare Workers
- **Database**: Cloudflare D1
- **Deployment**: `wrangler deploy`
- **URL**: https://backend.atiohaidar.workers.dev

### Frontend
- **Platform**: GitHub Pages
- **Build**: Vite static build
- **Deployment**: Automatic via GitHub Actions
- **URL**: https://atiohaidar.github.io

### Mobile App
- **Platform**: Expo
- **Build**: EAS Build
- **Distribution**: App stores / Expo Go

## Development Workflow

1. **Local Development**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   
   # Mobile
   cd expojs && npx expo start
   ```

2. **Making Changes**
   - Follow DRY principles
   - Use existing patterns
   - Update types as needed
   - Test locally before deployment

3. **Deployment**
   - Backend: `npm run deploy` in backend/
   - Frontend: Push to main branch (auto-deploy)
   - Mobile: `eas build` in expojs/

## Performance Considerations

### Backend
- Edge computing (low latency worldwide)
- Efficient database queries
- Response caching where appropriate

### Frontend
- Code splitting
- Lazy loading
- Optimized images
- React Query caching

### Mobile
- Image optimization
- Lazy loading
- Efficient re-renders
- Native performance with Expo

## Scalability

### Current Scale
- Serverless architecture (auto-scaling)
- SQLite database (suitable for small-medium scale)
- CDN for static assets

### Future Considerations
- Consider migrating to PostgreSQL for larger scale
- Implement caching layer (Redis)
- Add queue system for background jobs
- Implement WebSocket for real-time features

## Monitoring & Debugging

### Backend
- Cloudflare Workers analytics
- Error logs in Cloudflare dashboard
- D1 query logs

### Frontend
- Browser DevTools
- React DevTools
- Network tab for API calls

### Mobile
- Expo DevTools
- React Native Debugger
- Console logs

## References

- [MAINTENANCE.md](../MAINTENANCE.md) - Complete maintenance guide
- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Implementation details
- Backend: [Hono](https://hono.dev/) | [Chanfana](https://github.com/cloudflare/chanfana)
- Frontend: [React](https://react.dev/) | [Vite](https://vitejs.dev/)
- Mobile: [Expo](https://expo.dev/) | [React Native](https://reactnative.dev/)

# Backend - Task & User Management API

This is a Cloudflare Workers API built with Hono and OpenAPI (chanfana) that provides task management and user authentication.

## 📁 Project Structure

```
src/
├── controllers/        # Request handlers (endpoints)
│   ├── authLogin.ts   # Authentication endpoint
│   ├── taskCreate.ts  # Create task
│   ├── taskDelete.ts  # Delete task
│   ├── taskFetch.ts   # Get single task
│   ├── taskList.ts    # List all tasks
│   ├── usersCreate.ts # Create user
│   ├── usersDelete.ts # Delete user
│   ├── usersList.ts   # List all users
│   └── usersUpdate.ts # Update user
├── services/          # Business logic & data access
│   ├── tasks.ts       # Task service
│   └── users.ts       # User service
├── middlewares/       # Authentication & middleware
│   └── auth.ts        # Token handling
├── models/           # Type definitions & schemas
│   └── types.ts      # Zod schemas and TypeScript types
├── routes/           # Route registration
│   └── index.ts      # Central route configuration
└── index.ts          # Application entry point
```

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# or
wrangler dev
```

### Deployment
```bash
npm run deploy
# or
wrangler deploy
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get access token

### Users
- `GET /api/users` - List all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:username` - Update user (Admin only)
- `DELETE /api/users/:username` - Delete user (Admin only)

### Tasks
- `GET /api/tasks` - List tasks with pagination
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:taskSlug` - Get specific task
- `DELETE /api/tasks/:taskSlug` - Delete task

## 🗄️ Database

This API uses Cloudflare D1 (SQLite) database. The database schema is defined in `migrations/001_init.sql`.

### Default Users
- Admin: `username: admin, password: admin123`
- Member: `username: user, password: user123`

## 🔐 Authentication

The API uses a simple Bearer token authentication. After logging in via `/api/auth/login`, include the token in subsequent requests:

```
Authorization: Bearer <token>
```

## 📖 API Documentation

When running the dev server, visit the root URL `/` to see the OpenAPI Swagger interface where you can try the endpoints.

## 🛠️ Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **OpenAPI**: chanfana
- **Database**: Cloudflare D1
- **Validation**: Zod
- **Language**: TypeScript

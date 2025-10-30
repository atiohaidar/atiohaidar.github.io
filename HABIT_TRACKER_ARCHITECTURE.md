# Habit Tracker Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │           DashboardHabitsPage.tsx                          │    │
│  │  ┌──────────────────────────────────────────────────┐     │    │
│  │  │  - Create Habit Form                             │     │    │
│  │  │  - Habit List with Cards                         │     │    │
│  │  │  - Completion Checkboxes                         │     │    │
│  │  │  - Statistics Display                            │     │    │
│  │  │  - Progress Bars                                 │     │    │
│  │  └──────────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↕                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              API Service (habitService)                    │    │
│  │  - list(), get(), create(), update(), delete()            │    │
│  │  - markComplete(), unmarkComplete()                        │    │
│  │  - getCompletions()                                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↕                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                  Type Definitions                          │    │
│  │  - HabitWithStats, HabitCreateInput, etc.                 │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/JSON API
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Cloudflare Workers + Hono)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Routes (8 REST Endpoints)                     │    │
│  │  GET    /api/habits                                        │    │
│  │  POST   /api/habits                                        │    │
│  │  GET    /api/habits/:id                                    │    │
│  │  PUT    /api/habits/:id                                    │    │
│  │  DELETE /api/habits/:id                                    │    │
│  │  GET    /api/habits/:id/completions                        │    │
│  │  POST   /api/habits/completions                            │    │
│  │  DELETE /api/habits/:id/completions                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↕                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Controllers (8 Classes)                       │    │
│  │  - Authentication & Authorization                          │    │
│  │  - Request Validation                                      │    │
│  │  - Error Handling                                          │    │
│  │  - OpenAPI Documentation                                   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↕                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │               Services (Business Logic)                    │    │
│  │  Habit CRUD:                                               │    │
│  │    - listHabits(), getHabit()                              │    │
│  │    - createHabit(), updateHabit(), deleteHabit()           │    │
│  │                                                             │    │
│  │  Completions:                                              │    │
│  │    - createHabitCompletion()                               │    │
│  │    - deleteHabitCompletion()                               │    │
│  │    - getHabitCompletions()                                 │    │
│  │                                                             │    │
│  │  Statistics:                                               │    │
│  │    - calculateHabitStats()                                 │    │
│  │      • Total periods                                       │    │
│  │      • Total completions                                   │    │
│  │      • Completion percentage                               │    │
│  │      • Current streak                                      │    │
│  │      • Is completed today                                  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              ↕                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │             Type Definitions (Zod Schemas)                 │    │
│  │  - Input validation                                        │    │
│  │  - Type safety                                             │    │
│  │  - OpenAPI schema generation                               │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                              ↕ SQL Queries
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE (Cloudflare D1 / SQLite)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                   habits table                             │    │
│  │  ┌──────────────────────────────────────────────────┐     │    │
│  │  │  id (PK)           TEXT                          │     │    │
│  │  │  user_username     TEXT (FK → users)             │     │    │
│  │  │  name              TEXT                          │     │    │
│  │  │  description       TEXT                          │     │    │
│  │  │  period_type       TEXT (daily/weekly/...)       │     │    │
│  │  │  period_days       INTEGER                       │     │    │
│  │  │  created_at        TEXT                          │     │    │
│  │  │  updated_at        TEXT                          │     │    │
│  │  └──────────────────────────────────────────────────┘     │    │
│  │  Indexes: user_username, created_at                       │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              habit_completions table                       │    │
│  │  ┌──────────────────────────────────────────────────┐     │    │
│  │  │  id (PK)           TEXT                          │     │    │
│  │  │  habit_id          TEXT (FK → habits)            │     │    │
│  │  │  user_username     TEXT (FK → users)             │     │    │
│  │  │  completion_date   TEXT (YYYY-MM-DD)             │     │    │
│  │  │  created_at        TEXT                          │     │    │
│  │  └──────────────────────────────────────────────────┘     │    │
│  │  Indexes: habit_id, user_username, completion_date        │    │
│  │  Constraint: UNIQUE(habit_id, completion_date)            │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Creating a Habit

```
User                Frontend               Backend               Database
 │                     │                      │                     │
 │  Fill form          │                      │                     │
 │  Click "Create"     │                      │                     │
 │─────────────────────>                      │                     │
 │                     │  POST /api/habits    │                     │
 │                     │  { name, type, ... } │                     │
 │                     │─────────────────────>│                     │
 │                     │                      │  Validate input     │
 │                     │                      │  Check auth         │
 │                     │                      │                     │
 │                     │                      │  INSERT INTO habits │
 │                     │                      │─────────────────────>
 │                     │                      │                     │
 │                     │                      │  <habit record>     │
 │                     │                      │<─────────────────────
 │                     │                      │                     │
 │                     │  { habit: {...} }    │                     │
 │                     │<─────────────────────│                     │
 │                     │                      │                     │
 │  Show success       │                      │                     │
 │  Refresh list       │                      │                     │
 │<─────────────────────                      │                     │
 │                     │                      │                     │
```

### 2. Marking Habit as Complete

```
User                Frontend               Backend               Database
 │                     │                      │                     │
 │  Click checkbox     │                      │                     │
 │─────────────────────>                      │                     │
 │                     │  POST /api/habits/   │                     │
 │                     │       completions    │                     │
 │                     │  { habit_id, date }  │                     │
 │                     │─────────────────────>│                     │
 │                     │                      │  Verify ownership   │
 │                     │                      │  Check duplicate    │
 │                     │                      │                     │
 │                     │                      │  INSERT INTO        │
 │                     │                      │  habit_completions  │
 │                     │                      │─────────────────────>
 │                     │                      │                     │
 │                     │                      │  <completion record>│
 │                     │                      │<─────────────────────
 │                     │                      │                     │
 │                     │  { completion:{...} }│                     │
 │                     │<─────────────────────│                     │
 │                     │                      │                     │
 │  Update UI          │                      │                     │
 │  Refresh stats      │                      │                     │
 │<─────────────────────                      │                     │
 │                     │                      │                     │
```

### 3. Loading Habits with Statistics

```
User                Frontend               Backend               Database
 │                     │                      │                     │
 │  Open page          │                      │                     │
 │─────────────────────>                      │                     │
 │                     │  GET /api/habits     │                     │
 │                     │─────────────────────>│                     │
 │                     │                      │  Check auth         │
 │                     │                      │                     │
 │                     │                      │  SELECT habits      │
 │                     │                      │  WHERE user=...     │
 │                     │                      │─────────────────────>
 │                     │                      │                     │
 │                     │                      │  <habits list>      │
 │                     │                      │<─────────────────────
 │                     │                      │                     │
 │                     │                      │  For each habit:    │
 │                     │                      │    Calculate stats  │
 │                     │                      │    - Count periods  │
 │                     │                      │    - Count compl.   │
 │                     │                      │    - Calc streak    │
 │                     │                      │                     │
 │                     │                      │  SELECT completions │
 │                     │                      │  WHERE habit_id=... │
 │                     │                      │─────────────────────>
 │                     │                      │                     │
 │                     │                      │  <completions>      │
 │                     │                      │<─────────────────────
 │                     │                      │                     │
 │                     │  { habits: [        │                     │
 │                     │    { ...habit,       │                     │
 │                     │      stats }         │                     │
 │                     │  ]}                  │                     │
 │                     │<─────────────────────│                     │
 │                     │                      │                     │
 │  Display habits     │                      │                     │
 │  with stats         │                      │                     │
 │<─────────────────────                      │                     │
 │                     │                      │                     │
```

## Statistics Calculation Algorithm

### Total Periods Calculation

```
For a habit created on date C, at current date N:

IF period_type = "daily":
    total_periods = days_between(C, N) + 1

ELSE IF period_type = "weekly":
    total_periods = floor(days_between(C, N) / 7) + 1

ELSE IF period_type = "monthly":
    total_periods = (N.year - C.year) * 12 + (N.month - C.month) + 1

ELSE IF period_type = "custom":
    total_periods = floor(days_between(C, N) / period_days) + 1
```

### Streak Calculation

```
completions = GET completions ORDER BY date DESC
current_streak = 0

IF completions is empty:
    RETURN 0

last_completion = completions[0].date
today = current_date()
days_diff = days_between(last_completion, today)

IF days_diff > 1:
    // Streak broken
    RETURN 0

current_streak = 1

FOR i = 1 to length(completions) - 1:
    prev = completions[i-1].date
    curr = completions[i].date
    diff = days_between(curr, prev)
    
    IF period_type = "daily":
        IF diff = 1:
            current_streak++
        ELSE:
            BREAK
    ELSE:
        IF diff <= period_days:
            current_streak++
        ELSE:
            BREAK

RETURN current_streak
```

## Security Flow

```
┌──────────────┐
│ HTTP Request │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│ Extract Bearer Token │
└──────┬───────────────┘
       │
       ↓
┌──────────────────┐     ┌─────────────┐
│ Verify Token     │────>│ REJECT 401  │
│ (JWT/Auth Check) │     │ Unauthorized│
└──────┬───────────┘     └─────────────┘
       │
       │ Valid Token
       ↓
┌──────────────────────┐
│ Extract Username     │
│ from Token Payload   │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Execute Controller   │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────────┐     ┌─────────────┐
│ Check Resource Ownership │────>│ REJECT 403  │
│ (habit.user = username)  │     │ Forbidden   │
└──────┬───────────────────┘     └─────────────┘
       │
       │ Authorized
       ↓
┌──────────────────┐
│ Process Request  │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│ Return Response  │
│ (200/201/204)    │
└──────────────────┘
```

## Component Hierarchy

```
App
└── BrowserRouter
    └── Routes
        └── Route: /dashboard
            └── DashboardPage
                └── DashboardLayout
                    ├── Sidebar Navigation
                    │   └── "Habit Tracker" ✅
                    │
                    └── Outlet
                        └── Route: /dashboard/habits
                            └── DashboardHabitsPage
                                ├── Header
                                │   └── "New Habit" Button
                                │
                                ├── Create Form (conditional)
                                │   ├── Name Input
                                │   ├── Description Textarea
                                │   ├── Period Type Select
                                │   ├── Period Days Input
                                │   └── Submit Button
                                │
                                └── Habits List
                                    └── Habit Card (for each habit)
                                        ├── Completion Checkbox
                                        ├── Habit Name
                                        ├── Period Label
                                        ├── Description
                                        ├── Statistics Row
                                        │   ├── Streak 🔥
                                        │   ├── Completed Count
                                        │   └── Success Rate
                                        ├── Progress Bar
                                        └── Delete Button
```

## Error Handling Flow

```
                        ┌─────────────────┐
                        │  API Request    │
                        └────────┬────────┘
                                 │
                                 ↓
                        ┌─────────────────┐
                        │  Try Block      │
                        └────────┬────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  │                             │
                  ↓                             ↓
         ┌─────────────────┐          ┌─────────────────┐
         │  Success Path   │          │  Error Path     │
         └────────┬────────┘          └────────┬────────┘
                  │                             │
                  ↓                             ↓
         ┌─────────────────┐          ┌─────────────────┐
         │ Return 200/201  │          │ Catch Error     │
         │ with data       │          └────────┬────────┘
         └─────────────────┘                   │
                                                ↓
                                       ┌─────────────────┐
                                       │ Identify Type   │
                                       └────────┬────────┘
                                                │
                        ┌───────────────────────┼───────────────────────┐
                        │                       │                       │
                        ↓                       ↓                       ↓
              ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
              │ Validation Error │   │ Not Found Error  │   │ Unknown Error    │
              │ Return 400       │   │ Return 404       │   │ Return 400/500   │
              └──────────────────┘   └──────────────────┘   └──────────────────┘
```

## Key Design Decisions

### 1. Period Reset Strategy
- **Decision**: Don't automatically delete old completions
- **Rationale**: Preserve historical data for analytics
- **Implementation**: Calculate stats dynamically based on period type

### 2. Streak Calculation
- **Decision**: Consecutive periods must be completed without gaps
- **Rationale**: Encourages consistency and true habit formation
- **Implementation**: Check date differences between completions

### 3. Statistics Calculation
- **Decision**: Calculate stats on-demand rather than pre-compute
- **Rationale**: 
  - Simpler implementation
  - Always accurate
  - Low user volume makes performance acceptable
- **Trade-off**: Could be optimized with caching for high-volume scenarios

### 4. Completion Date Format
- **Decision**: Store as ISO date string (YYYY-MM-DD)
- **Rationale**: 
  - Simple to work with
  - Easy to query and compare
  - No timezone issues (uses local date)

### 5. User Isolation
- **Decision**: Strict user isolation - users can only access their own habits
- **Rationale**: Privacy and data security
- **Implementation**: Filter by username in all queries + authorization checks

This architecture provides a solid foundation for the habit tracking feature while maintaining scalability, security, and maintainability.

# Mobile App Implementation Updates

## Overview
This document describes the implementation of TanStack Query (React Query), centralized styling, and profile editing functionality in the Expo mobile application.

## Features Implemented

### 1. TanStack Query Integration

**Purpose**: Replace manual state management with an efficient data fetching and caching library.

**Benefits**:
- Automatic background refetching
- Built-in caching with configurable stale times
- Optimistic updates
- Pull-to-refresh support
- Loading and error states management
- Automatic retry on failure

**Files Created**:
- `expojs/services/queryClient.ts` - Query client configuration
- `expojs/hooks/useApi.ts` - Custom hooks for all API operations

**Configuration**:
```typescript
// Query defaults
- staleTime: 5 minutes
- cacheTime: 10 minutes  
- retry: 2 attempts
- refetchOnWindowFocus: false
- refetchOnReconnect: true
```

**Usage Example**:
```typescript
import { useStats } from '@/hooks/useApi';

const { data, isLoading, refetch, isRefetching } = useStats();
```

### 2. Centralized Color Configuration

**Purpose**: Ensure consistent theming across the entire mobile app.

**File**: `expojs/constants/colors.ts`

**Features**:
- Single source of truth for all colors
- Predefined color palette for different use cases
- Separate light and dark mode color sets
- Status colors (success, warning, error, info)
- Stat card colors for dashboard

**Usage Example**:
```typescript
import { AppColors } from '@/constants/colors';

<Avatar.Icon 
  style={{ backgroundColor: AppColors.primary }}
/>
```

### 3. NativeWind (Tailwind CSS for React Native)

**Purpose**: Enable utility-first styling consistent with modern web development.

**Configuration**: `expojs/tailwind.config.js`

**Benefits**:
- Consistent styling system
- Easy to maintain
- Smaller bundle size
- Better developer experience

### 4. Profile Editing Feature

**Purpose**: Allow users to update their profile information.

**Files**:
- `expojs/screens/ProfileScreen.tsx` - Profile UI
- `expojs/app/(tabs)/profile.tsx` - Profile tab route
- `backend/src/controllers/user.controller.ts` - Backend controller
- `backend/src/routes/index.ts` - API route

**Features**:
- Edit name and password
- Form validation
- Loading states during updates
- Success/error feedback
- Logout functionality
- Avatar display with initials

**API Endpoint**:
```
PUT /api/profile
Body: { name?: string, password?: string }
```

### 5. Screen Migrations

#### HomeScreen
- Replaced `useState` + `useEffect` with `useStats()` hook
- Added pull-to-refresh with `refetch()`
- Improved loading states

#### TasksScreen
- Migrated to use `useTasks()`, `useUpdateTask()`, `useCreateTask()`, `useDeleteTask()`
- Automatic cache invalidation on mutations
- Better error handling with Alert dialogs
- Pull-to-refresh support

## API Hooks Available

All hooks are exported from `expojs/hooks/useApi.ts`:

### Query Hooks (Data Fetching)
- `useCurrentUser()` - Get current user
- `useStats()` - Dashboard statistics
- `useUsers()` - List all users (admin)
- `useUser(username)` - Get specific user
- `useTasks()` - List all tasks
- `useTask(slug)` - Get specific task
- `useArticles()` - List all articles
- `useArticle(slug)` - Get specific article
- `useRooms(available?)` - List rooms
- `useRoom(roomId)` - Get specific room
- `useBookings()` - List bookings
- `useBooking(bookingId)` - Get specific booking
- `useConversations()` - List conversations
- `useConversationMessages(id)` - Get messages
- `useGroups()` - List group chats
- `useGroupMessages(id)` - Get group messages

### Mutation Hooks (Data Modification)
- `useLogin()` - Login user
- `useLogout()` - Logout user
- `useUpdateSelfProfile()` - Update own profile
- `useCreateTask()` - Create task
- `useUpdateTask()` - Update task
- `useDeleteTask()` - Delete task
- `useCreateArticle()` - Create article
- `useUpdateArticle()` - Update article
- `useDeleteArticle()` - Delete article
- `useCreateBooking()` - Create booking
- `useUpdateBooking()` - Update booking
- `useCancelBooking()` - Cancel booking
- `useSendMessage()` - Send message
- `useCreateGroup()` - Create group
- And more...

## Pull-to-Refresh Implementation

All screens now support pull-to-refresh:

```typescript
<ScrollView
  refreshControl={
    <RefreshControl 
      refreshing={isRefetching} 
      onRefresh={() => refetch()} 
    />
  }
>
  {/* Content */}
</ScrollView>
```

## UX Improvements

1. **Loading States**: ActivityIndicator shown during initial load
2. **Error Handling**: Alert dialogs with descriptive messages
3. **Optimistic Updates**: UI updates before server confirmation
4. **Form Validation**: Client-side validation before submission
5. **Disabled States**: Buttons and inputs disabled during operations
6. **Success Feedback**: Alert dialogs on successful operations
7. **Consistent Colors**: Using centralized color configuration

## Backend Updates

### New Endpoint
```typescript
PUT /api/profile
Authorization: Bearer <token>
Body: {
  name?: string,      // Optional new name
  password?: string   // Optional new password (min 6 chars)
}
Response: {
  success: boolean,
  user: User
}
```

### Security
- Uses existing JWT token authentication
- Only allows users to update their own profile
- Password is hashed before storage
- Admin privileges not required

## Next Steps

To complete the migration:

1. Migrate ArticlesScreen to use TanStack Query
2. Migrate BookingsScreen to use TanStack Query
3. Migrate ChatScreen to use TanStack Query
4. Add integration tests
5. Test on physical device or emulator
6. Consider adding React Query Devtools for development

## Testing

To test the implementation:

1. Start the backend: `cd backend && npm run dev`
2. Start the Expo app: `cd expojs && npm start`
3. Test profile editing with valid/invalid data
4. Test pull-to-refresh on Home and Tasks screens
5. Verify error handling by disconnecting network
6. Check loading states during operations

## Color Reference

All colors are defined in `expojs/constants/colors.ts`:

- **Primary**: #6200ee (Purple)
- **Secondary**: #03dac6 (Teal)
- **Success**: #4caf50 (Green)
- **Warning**: #ff9800 (Orange)
- **Error**: #b00020 (Red)
- **Info**: #2196f3 (Blue)

Dashboard stat card colors:
- Blue: #2196F3
- Green: #4CAF50
- Orange: #FF9800
- Purple: #9C27B0
- Red: #F44336

## Dependencies Added

```json
{
  "@tanstack/react-query": "latest",
  "nativewind": "latest",
  "tailwindcss": "latest"
}
```

## Configuration Files

- `expojs/tailwind.config.js` - Tailwind configuration
- `expojs/services/queryClient.ts` - React Query configuration
- `expojs/constants/colors.ts` - Color configuration
- `expojs/constants/paperTheme.ts` - Material Design theme (updated)

# Mobile App Implementation Guide

## 📱 Overview

This is a comprehensive React Native mobile application built with Expo that integrates with all backend APIs. The app features a modern Material Design interface, role-based access control, and complete CRUD operations for all entities.

## 🏗️ Architecture

### Technology Stack

- **Framework**: Expo SDK 54 (React Native 0.81)
- **UI Library**: React Native Paper 5.x (Material Design 3)
- **Navigation**: Expo Router 6.x (file-based routing)
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Local Storage**: AsyncStorage
- **Language**: TypeScript with strict mode

### Project Structure

```
expojs/
├── app/                         # Expo Router pages
│   ├── (auth)/                 # Authentication group
│   │   ├── _layout.tsx         # Auth stack navigator
│   │   └── login.tsx           # Login screen route
│   ├── (tabs)/                 # Main app tabs group
│   │   ├── _layout.tsx         # Tab navigator
│   │   ├── index.tsx           # Home/Dashboard route
│   │   ├── tasks.tsx           # Tasks route
│   │   ├── articles.tsx        # Articles route
│   │   ├── bookings.tsx        # Bookings route
│   │   └── chat.tsx            # Chat route
│   ├── _layout.tsx             # Root layout with providers
│   └── modal.tsx               # Modal example
├── screens/                     # Screen components
│   ├── auth/
│   │   └── LoginScreen.tsx     # Login UI
│   ├── tasks/
│   │   └── TasksScreen.tsx     # Tasks management
│   ├── articles/
│   │   └── ArticlesScreen.tsx  # Articles management
│   ├── bookings/
│   │   └── BookingsScreen.tsx  # Room bookings
│   ├── chat/
│   │   └── ChatScreen.tsx      # Chat interface
│   └── HomeScreen.tsx          # Dashboard with stats
├── services/
│   └── api.ts                  # API service (Axios instance)
├── contexts/
│   └── AuthContext.tsx         # Authentication state
├── types/
│   └── api.ts                  # TypeScript type definitions
├── constants/
│   ├── paperTheme.ts           # Material Design theme
│   └── theme.ts                # Expo theme colors
├── components/                  # Reusable components
│   ├── ui/                     # UI components
│   └── common/                 # Common components
└── assets/                      # Images, fonts, etc.
```

## 🎨 UI/UX Features

### Design Principles

1. **Material Design 3**: Modern, accessible components from React Native Paper
2. **Consistent Layout**: Card-based layouts with proper elevation
3. **Color Coding**: Status-based color indicators (approved=green, pending=orange, etc.)
4. **Responsive**: Adapts to different screen sizes
5. **Loading States**: Activity indicators during async operations
6. **Error Handling**: User-friendly error messages with HelperText
7. **Pull-to-Refresh**: All list screens support refresh gesture
8. **Haptic Feedback**: Tactile response on interactions

### Key Components

- **Cards**: Elevated cards for content display
- **FAB**: Floating action buttons for primary actions
- **Dialogs**: Modal dialogs for forms and confirmations
- **Chips**: Status indicators and metadata display
- **TextInput**: Outlined inputs with icons and validation
- **Buttons**: Multiple variants (contained, outlined, text)
- **Avatar**: User/group identifiers
- **SegmentedButtons**: Toggle between views

## 🔐 Authentication Flow

### Login Process

1. User enters credentials on LoginScreen
2. ApiService.login() sends POST to `/api/auth/login`
3. Backend validates and returns token + user data
4. Token saved to AsyncStorage
5. User data stored in AuthContext
6. Router redirects to main app (tabs)

### Token Management

- **Storage**: AsyncStorage (persists between app launches)
- **Injection**: Axios request interceptor adds Bearer token
- **Refresh**: Automatic logout on 401 responses
- **Logout**: Clears AsyncStorage and resets context

### Route Protection

```typescript
// In _layout.tsx
useEffect(() => {
  if (!isAuthenticated && !inAuthGroup) {
    router.replace('/(auth)/login');
  } else if (isAuthenticated && inAuthGroup) {
    router.replace('/(tabs)');
  }
}, [isAuthenticated, loading, segments, router]);
```

## 📡 API Integration

### Base Configuration

```typescript
// In services/api.ts
const API_BASE_URL = 'https://api.atiohaidar.workers.dev';
```

### API Methods

All CRUD operations are implemented for:

- **Auth**: login, logout, getCurrentUser
- **Stats**: getStats
- **Users**: list, get, create, update, delete
- **Tasks**: list, get, create, update, delete
- **Articles**: list, get, create, update, delete
- **Rooms**: list, get, create, update, delete
- **Bookings**: list, get, create, updateStatus, cancel
- **Conversations**: list, getOrCreate, getMessages
- **Messages**: send
- **Groups**: list, get, create, update, delete, getMessages, getMembers, addMember, removeMember, updateMemberRole
- **Anonymous**: listMessages, sendMessage

### Request Interceptor

```typescript
this.api.interceptors.request.use(
  async (config) => {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('authToken');
    }
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor

```typescript
this.api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await this.logout(); // Clear auth state
    }
    return Promise.reject(error);
  }
);
```

## 📱 Screen Details

### HomeScreen (Dashboard)

- Displays dashboard statistics
- Stats cards with icons and colors
- Different views for admin vs member
- Pull-to-refresh support
- Quick actions guide

**Stats Shown**:
- Total Users (admin only)
- Total/Completed Tasks
- Total/Published Articles
- Total Rooms (admin only)
- Total/Pending/Approved Bookings

### TasksScreen

- List all tasks with completion status
- Checkbox to toggle completion
- Create/edit/delete tasks
- Role-based editing (owner or admin)
- Due date and owner display
- Search and filter (future)

**Fields**:
- Slug (unique identifier)
- Name
- Description
- Completed (boolean)
- Due Date
- Owner

### ArticlesScreen

- List all articles
- Published/draft status indicators
- Create/edit/delete articles
- Role-based editing
- Content preview
- Created date display

**Fields**:
- Slug (unique identifier)
- Title
- Content (markdown support future)
- Published (boolean)
- Owner

### BookingsScreen

- List all bookings
- Room selection
- Status management (pending/approved/rejected/cancelled)
- Admin approval workflow
- Date/time selection
- Conflict detection (backend)

**Features**:
- Admin can approve/reject pending bookings
- Users can cancel their own bookings
- Color-coded status chips
- Room details display

### ChatScreen

- Two modes: Direct Messages & Group Chats
- Segmented button to switch modes
- Create new group chats
- Send/receive messages
- Message history
- Reply functionality (future)

**Direct Messages**:
- List of conversations
- Get or create conversation with user
- Send messages in conversation

**Group Chats**:
- List of groups
- Create new groups
- Send messages in groups
- View group members
- Admin actions (future)

## 🎯 Best Practices Implemented

### Code Quality

1. **TypeScript**: Full type safety with strict mode
2. **ESLint**: Code linting with Expo config
3. **Path Aliases**: Use `@/` for clean imports
4. **Separation of Concerns**: Services, contexts, screens
5. **DRY Principle**: Reusable components and utilities

### Performance

1. **Lazy Loading**: Screens loaded on demand
2. **Memoization**: React.memo for expensive components (future)
3. **Optimistic Updates**: Immediate UI feedback
4. **Efficient Rendering**: FlatList for large lists (future)

### Security

1. **Token Storage**: Secure AsyncStorage
2. **No Sensitive Data**: Never log tokens or passwords
3. **HTTPS Only**: API calls over secure connection
4. **Input Validation**: Form validation before submission
5. **XSS Prevention**: Proper escaping of user content

### User Experience

1. **Loading States**: Clear feedback during operations
2. **Error Messages**: User-friendly error handling
3. **Pull-to-Refresh**: Intuitive data refresh
4. **Form Validation**: Immediate feedback
5. **Haptic Feedback**: Physical response to actions
6. **Accessibility**: Proper labels and contrast

## 🚀 Development Workflow

### Running the App

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser
```

### Testing

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Future: Unit tests
npm test
```

### Building

```bash
# Development build
eas build --profile development

# Production build
eas build --profile production
```

## 📝 Environment Configuration

### API URL

Update in `services/api.ts`:

```typescript
const API_BASE_URL = 'https://your-api-url.com';
```

### App Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png"
    }
  }
}
```

## 🔮 Future Enhancements

### Priority Features

1. **Real-time Updates**: WebSocket integration for live chat
2. **Offline Support**: Local database with sync
3. **Push Notifications**: FCM integration
4. **Image Uploads**: Cloudinary/S3 integration
5. **Advanced Forms**: Date pickers, time pickers
6. **Search/Filter**: Comprehensive search functionality
7. **Pagination**: Infinite scroll for large datasets
8. **User Profile**: View and edit profile
9. **Anonymous Chat**: Public chat integration
10. **Dark Mode Toggle**: Manual theme switching

### Technical Improvements

1. **State Management**: Redux Toolkit or Zustand
2. **Form Library**: React Hook Form for complex forms
3. **Testing**: Jest + React Native Testing Library
4. **E2E Tests**: Detox or Maestro
5. **CI/CD**: GitHub Actions for automated builds
6. **Error Tracking**: Sentry integration
7. **Analytics**: Firebase Analytics
8. **Performance Monitoring**: Firebase Performance
9. **Code Splitting**: Lazy loading with Suspense
10. **Animations**: React Native Reanimated 3

## 🐛 Troubleshooting

### Common Issues

1. **Module not found**: Clear cache with `expo start -c`
2. **TypeScript errors**: Run `npx tsc --noEmit` to check
3. **Linting errors**: Run `npm run lint` to fix
4. **Build failures**: Check Expo SDK compatibility
5. **API errors**: Verify backend URL and CORS settings

### Debug Tips

```typescript
// Enable network debugging
console.log('API Request:', request);
console.log('API Response:', response);

// Check AsyncStorage
AsyncStorage.getAllKeys().then(keys => console.log(keys));

// Verify auth state
console.log('User:', user, 'Token:', token);
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://reactnativepaper.com/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## 📄 License

Same as parent project.

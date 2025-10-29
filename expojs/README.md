# Mobile App with Expo

This is a comprehensive mobile application built with Expo that implements all backend APIs with a modern mobile design and best practices.

## 🚀 Features

- **Authentication**: Login, logout, and session management
- **Task Management**: Create, read, update, and delete tasks with completion tracking
- **Article Management**: Manage articles with draft/published status
- **Room Booking System**: Browse rooms and create bookings with status management
- **Chat System**: 
  - Direct messaging between users
  - Group chats with member management
  - Anonymous public chat
- **Dashboard Statistics**: Real-time stats for all modules
- **Role-Based Access**: Admin and member roles with appropriate permissions

## 📱 Tech Stack

- **Framework**: Expo (React Native)
- **UI Library**: React Native Paper (Material Design 3)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage for token persistence
- **TypeScript**: Full type safety

## 🏗️ Architecture

### Folder Structure

```
expojs/
├── app/                      # File-based routing
│   ├── (auth)/              # Authentication screens
│   │   └── login.tsx
│   └── (tabs)/              # Main app tabs
│       ├── index.tsx        # Home/Dashboard
│       ├── tasks.tsx        # Task management
│       ├── articles.tsx     # Article management
│       ├── bookings.tsx     # Room bookings
│       └── chat.tsx         # Chat interface
├── screens/                 # Screen components
│   ├── auth/
│   ├── tasks/
│   ├── articles/
│   ├── bookings/
│   └── chat/
├── services/                # API service layer
│   └── api.ts              # Axios instance & API methods
├── contexts/                # React contexts
│   └── AuthContext.tsx     # Authentication state
├── types/                   # TypeScript types
│   └── api.ts              # API type definitions
└── constants/              # Theme & configuration
    └── paperTheme.ts       # Material Design theme
```

## 🎨 Design Features

- **Material Design 3**: Modern UI components from React Native Paper
- **Dark Mode**: Automatic theme switching
- **Pull-to-Refresh**: All lists support refresh
- **Loading States**: Activity indicators during data fetch
- **Error Handling**: User-friendly error messages
- **Responsive Cards**: Elevated cards with proper spacing
- **FAB Actions**: Floating action buttons for create actions
- **Modal Dialogs**: Forms in dialogs for better UX
- **Status Chips**: Color-coded status indicators
- **Haptic Feedback**: Tactile feedback on tab switches

## 🔧 Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API URL**:
   Update the `API_BASE_URL` in `services/api.ts` to point to your backend:
   ```typescript
   const API_BASE_URL = 'https://api.atiohaidar.workers.dev';
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - iOS: Press `i` or scan QR with Expo Go
   - Android: Press `a` or scan QR with Expo Go
   - Web: Press `w`

## 🔐 Authentication

The app uses token-based authentication:

1. User logs in with credentials
2. Backend returns JWT token
3. Token is stored in AsyncStorage
4. All subsequent requests include the token
5. Automatic logout on 401 responses

### Demo Credentials

- **Admin**: `admin` / `admin123`
- **User**: `user` / `user123`

## 📡 API Integration

All backend APIs are fully integrated:

### Authentication
- `POST /api/auth/login` - User login

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:username` - Update user
- `DELETE /api/users/:username` - Delete user

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:slug` - Get task
- `PUT /api/tasks/:slug` - Update task
- `DELETE /api/tasks/:slug` - Delete task

### Articles
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article
- `GET /api/articles/:slug` - Get article
- `PUT /api/articles/:slug` - Update article
- `DELETE /api/articles/:slug` - Delete article

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room (admin)
- `GET /api/rooms/:id` - Get room
- `PUT /api/rooms/:id` - Update room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update status (admin)
- `DELETE /api/bookings/:id` - Cancel booking

### Chat
- `GET /api/conversations` - List conversations
- `GET /api/conversations/:username` - Get/create conversation
- `GET /api/conversations/:id/messages` - Get messages
- `POST /api/messages` - Send message

### Groups
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `GET /api/groups/:id/messages` - Get group messages
- `GET /api/groups/:id/members` - Get members
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:username` - Remove member

### Statistics
- `GET /api/stats` - Dashboard statistics

## 🎯 Best Practices Implemented

1. **Type Safety**: Full TypeScript coverage with strict types
2. **Error Handling**: Try-catch blocks with user-friendly messages
3. **Loading States**: Indicators for all async operations
4. **Refresh Control**: Pull-to-refresh on all lists
5. **Optimistic Updates**: Immediate UI feedback
6. **Token Management**: Automatic token injection and refresh
7. **Navigation Guards**: Auth-based route protection
8. **Code Organization**: Separation of concerns (screens, services, contexts)
9. **Reusable Components**: Shared UI components
10. **Responsive Design**: Adapts to different screen sizes

## 🚧 Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Offline support with local database
- [ ] Push notifications
- [ ] Image uploads for articles and user profiles
- [ ] Calendar picker for bookings
- [ ] Search and filter functionality
- [ ] Pagination for large lists
- [ ] Form validation with react-hook-form
- [ ] Unit and integration tests
- [ ] E2E tests with Detox

## 📱 Screenshots

The app features a modern, clean design with:
- Bottom tab navigation for main features
- Card-based layouts for content
- Material Design 3 components
- Smooth animations and transitions
- Color-coded status indicators
- Intuitive form dialogs

## 🤝 Contributing

This mobile app is part of the atiohaidar.github.io project and follows the same contribution guidelines.

## 📄 License

Same as the parent project.


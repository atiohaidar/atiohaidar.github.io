# Public Articles Feature with Sidebar Navigation

## Overview

This document describes the implementation of the public articles viewing feature with sidebar navigation for the Expo mobile application. The feature allows unauthenticated users to view published articles without logging in.

## Changes Made

### Backend Changes

#### 1. Public Article Controller (`backend/src/controllers/publicArticle.controller.ts`)

Added two new controller classes for public (unauthenticated) access to articles:

- **`PublicArticleList`**: Returns a list of published articles without requiring authentication
  - Endpoint: `GET /api/public/articles`
  - Query params: `page` (optional, for pagination)
  - Only returns articles where `published = true`

- **`PublicArticleGet`**: Returns a single published article by slug
  - Endpoint: `GET /api/public/articles/:slug`
  - Only returns the article if it's published, returns 404 otherwise

#### 2. Routes Update (`backend/src/routes/index.ts`)

Added the public routes at the top of the route registration:
```typescript
openapi.get("/api/public/articles", PublicArticleList);
openapi.get("/api/public/articles/:slug", PublicArticleGet);
```

### Mobile App Changes

#### 1. API Service Updates (`expojs/services/api.ts`)

Added two new methods for accessing public articles:

- `listPublicArticles()`: Fetches published articles without authentication
- `getPublicArticle(slug)`: Fetches a single published article without authentication

#### 2. Public Articles Screen (`expojs/screens/articles/PublicArticlesScreen.tsx`)

Created a new screen component that displays published articles:
- Shows list of published articles
- Pull-to-refresh functionality
- Loading states
- Card-based layout with Material Design
- Displays article title, content preview, owner, and creation date
- No edit/delete functionality (read-only)

#### 3. Navigation Structure Updates

##### a. New Public Route Group (`expojs/app/(public)/`)

Created a new route group for public (unauthenticated) pages:
- `_layout.tsx`: Drawer navigation layout for public pages
- `articles.tsx`: Public articles page route

##### b. Updated Root Layout (`expojs/app/_layout.tsx`)

- Changed default anchor from `(tabs)` to `(public)`
- Updated routing logic to redirect unauthenticated users to `/(public)/articles` instead of login
- Added `(public)` screen to the Stack navigator
- Modified authentication flow:
  - If not authenticated and not in auth or public group → redirect to public articles
  - If authenticated and in auth or public group → redirect to authenticated tabs

##### c. Updated Tabs Layout (`expojs/app/(tabs)/_layout.tsx`)

Converted from bottom tabs to drawer navigation:
- Changed from `Tabs` to `Drawer` component from `expo-router/drawer`
- Added `@react-navigation/drawer` package
- Sidebar appears on the left side
- Includes all main app features: Home, Tasks, Articles, Bookings, Chat, Profile
- Each drawer item has an icon and label
- Logout button in header

##### d. Public Layout (`expojs/app/(public)/_layout.tsx`)

Created drawer navigation for public pages:
- Articles menu item
- Login button in header to navigate to login screen

#### 4. Layout Components

##### a. SidebarLayout (`expojs/components/SidebarLayout.tsx`)

Reusable layout component for public pages with:
- AppBar/Navbar at the top
- Collapsible sidebar on the left
- Menu toggle button
- Navigation menu items
- Theme icon (for future manual theme switching)
- Main content area
- Responsive design (sticky sidebar on web)

##### b. AuthenticatedSidebarLayout (`expojs/components/AuthenticatedSidebarLayout.tsx`)

Similar to SidebarLayout but for authenticated users:
- Includes logout button
- Optional FAB (Floating Action Button) support
- All authenticated navigation items
- Admin-specific features (for future use)

## Features Implemented

### ✅ Completed Features

1. **Public Article Access**: Unauthenticated users can view published articles
2. **Sidebar Navigation**: Left-side drawer navigation for both public and authenticated views
3. **Navbar**: Top navigation bar with menu toggle and action buttons
4. **Content Layout**: Main content positioned below navbar and next to sidebar
5. **FAB Support**: Floating action buttons for primary actions (already existed in ArticlesScreen)
6. **Dark/Light Mode**: Full support for both themes (already existed, verified compatibility)
7. **Responsive Design**: Adapts to different screen sizes
8. **Material Design 3**: Uses React Native Paper components
9. **Pull-to-Refresh**: All article lists support refresh gesture
10. **Loading States**: Proper loading indicators during data fetch

### Navigation Flow

#### For Unauthenticated Users:
1. App opens → Redirects to public articles page
2. User sees published articles in a sidebar layout
3. Can navigate to login from the header button
4. After login → Redirects to authenticated tabs

#### For Authenticated Users:
1. App opens → Shows authenticated drawer navigation
2. User can access all features from the sidebar
3. Each screen has appropriate actions (FAB, etc.)
4. Can logout from any screen via header button

## Technical Details

### Dependencies Added
- `@react-navigation/drawer@^7.7.1`: Provides drawer navigation functionality

### File Structure
```
backend/
└── src/
    ├── controllers/
    │   └── publicArticle.controller.ts (NEW)
    └── routes/
        └── index.ts (MODIFIED)

expojs/
├── app/
│   ├── (public)/             (NEW)
│   │   ├── _layout.tsx
│   │   └── articles.tsx
│   ├── (tabs)/
│   │   └── _layout.tsx       (MODIFIED - Tabs → Drawer)
│   └── _layout.tsx           (MODIFIED - Routing logic)
├── components/
│   ├── AuthenticatedSidebarLayout.tsx (NEW)
│   └── SidebarLayout.tsx     (NEW)
├── screens/
│   └── articles/
│       └── PublicArticlesScreen.tsx (NEW)
└── services/
    └── api.ts                (MODIFIED - Added public methods)
```

## Testing Recommendations

To test the implementation:

1. **Backend API Testing**:
   - Test `GET /api/public/articles` without authentication
   - Test `GET /api/public/articles/:slug` without authentication
   - Verify only published articles are returned
   - Verify 404 for unpublished articles via public endpoint

2. **Mobile App Testing**:
   - Open app without logging in → Should show public articles
   - Verify sidebar navigation works
   - Test pull-to-refresh functionality
   - Verify articles display correctly
   - Test login navigation from header
   - After login, verify redirect to authenticated view
   - Test sidebar navigation in authenticated view
   - Verify dark/light mode switching works
   - Test on different screen sizes

3. **UI/UX Verification**:
   - Sidebar should be on the left
   - Navbar should be at the top
   - Content should be in the main area
   - FAB should appear in bottom-right (on screens that use it)
   - Theme colors should be consistent
   - Icons should be appropriate for each menu item

## Known Limitations

1. The web platform may have styling differences due to React Native Web limitations
2. Sidebar is always visible on larger screens (no responsive hide on small screens yet)
3. Manual theme toggle button is present but not yet functional (uses system preference)

## Future Enhancements

1. Add article detail view (full article page)
2. Implement search and filter for articles
3. Add pagination/infinite scroll for article lists
4. Add manual theme toggle functionality
5. Make sidebar responsive (hide on small screens, show on large)
6. Add article categories/tags
7. Add sharing functionality
8. Add reading time estimate
9. Add bookmarking feature
10. Add comments section (for authenticated users)

## Security Considerations

- Public endpoints are intentionally not authenticated
- Only published articles are accessible via public endpoints
- Draft articles remain protected and require authentication
- All authenticated endpoints remain protected
- No sensitive information is exposed in public article data

## Conclusion

The implementation successfully adds public article viewing with a modern sidebar navigation layout. The app now provides a good user experience for both authenticated and unauthenticated users, with consistent navigation patterns and Material Design 3 styling.

# Chat System Documentation

## Overview
This document describes the chat system implementation including user-to-user chat, group chat, and anonymous chat features.

## Features

### 1. User-to-User Chat (Direct Messages)
- Private conversations between two authenticated users
- Message history persistence
- Reply to messages (WhatsApp-style)
- Non-realtime with manual refresh

### 2. Group Chat
- Create and manage chat groups
- Multiple members per group
- Admin and member roles
- Group admins can:
  - Add/remove members
  - Promote/demote members
  - Update group details
  - Delete groups
- Message replies supported
- Non-realtime with manual refresh

### 3. Anonymous Chat
- Public anonymous chat accessible from landing page
- No authentication required
- Anonymous sender IDs stored in browser
- Reply to messages
- Non-realtime with manual refresh

## Database Schema

### Tables Created (migration 005_add_chat_system.sql)

1. **conversations** - Direct message conversations
   - id (TEXT, PRIMARY KEY)
   - user1_username (TEXT, FK to users)
   - user2_username (TEXT, FK to users)
   - created_at (TEXT)
   - updated_at (TEXT)

2. **messages** - All chat messages (direct and group)
   - id (TEXT, PRIMARY KEY)
   - conversation_id (TEXT, FK to conversations, nullable)
   - group_id (TEXT, FK to group_chats, nullable)
   - sender_username (TEXT, FK to users)
   - content (TEXT)
   - reply_to_id (TEXT, FK to messages, nullable)
   - created_at (TEXT)

3. **group_chats** - Group chat metadata
   - id (TEXT, PRIMARY KEY)
   - name (TEXT)
   - description (TEXT, nullable)
   - created_by (TEXT, FK to users)
   - created_at (TEXT)
   - updated_at (TEXT)

4. **group_members** - Group membership
   - group_id (TEXT, FK to group_chats)
   - user_username (TEXT, FK to users)
   - role (TEXT: 'admin' or 'member')
   - joined_at (TEXT)
   - PRIMARY KEY (group_id, user_username)

5. **anonymous_messages** - Anonymous chat messages
   - id (TEXT, PRIMARY KEY)
   - sender_id (TEXT)
   - content (TEXT)
   - reply_to_id (TEXT, FK to anonymous_messages, nullable)
   - created_at (TEXT)

## API Endpoints

### Direct Messages

#### GET /api/conversations
Get list of user's conversations
- Auth: Required
- Returns: List of conversations with last message

#### GET /api/conversations/:username
Get or create conversation with another user
- Auth: Required
- Params: username (string)
- Returns: Conversation object

#### GET /api/conversations/:conversationId/messages
Get messages in a conversation
- Auth: Required
- Params: conversationId (string)
- Returns: List of messages

### Messages

#### POST /api/messages
Send a message
- Auth: Required
- Body:
  ```json
  {
    "conversation_id": "string (optional)",
    "group_id": "string (optional)",
    "content": "string",
    "reply_to_id": "string (optional)"
  }
  ```
- Returns: Created message

### Groups

#### GET /api/groups
Get list of user's groups
- Auth: Required
- Returns: List of groups with member count and last message

#### POST /api/groups
Create a new group
- Auth: Required
- Body:
  ```json
  {
    "name": "string",
    "description": "string (optional)"
  }
  ```
- Returns: Created group

#### GET /api/groups/:groupId
Get group details
- Auth: Required (must be group member)
- Params: groupId (string)
- Returns: Group object

#### PUT /api/groups/:groupId
Update group details
- Auth: Required (must be group admin)
- Params: groupId (string)
- Body:
  ```json
  {
    "name": "string (optional)",
    "description": "string (optional)"
  }
  ```

#### DELETE /api/groups/:groupId
Delete a group
- Auth: Required (must be group admin)
- Params: groupId (string)

#### GET /api/groups/:groupId/messages
Get messages in a group
- Auth: Required (must be group member)
- Params: groupId (string)
- Returns: List of messages

#### GET /api/groups/:groupId/members
Get group members
- Auth: Required (must be group member)
- Params: groupId (string)
- Returns: List of members with roles

#### POST /api/groups/:groupId/members
Add member to group
- Auth: Required (must be group admin)
- Params: groupId (string)
- Body:
  ```json
  {
    "user_username": "string",
    "role": "admin | member (optional, default: member)"
  }
  ```

#### DELETE /api/groups/:groupId/members/:username
Remove member from group
- Auth: Required (must be group admin)
- Params: groupId (string), username (string)

#### PUT /api/groups/:groupId/members/:username/role
Update member role
- Auth: Required (must be group admin)
- Params: groupId (string), username (string)
- Body:
  ```json
  {
    "role": "admin | member"
  }
  ```

### Anonymous Chat

#### GET /api/anonymous/messages
Get all anonymous messages
- Auth: Not required
- Returns: List of anonymous messages

#### POST /api/anonymous/messages
Send anonymous message
- Auth: Not required
- Body:
  ```json
  {
    "sender_id": "string",
    "content": "string",
    "reply_to_id": "string (optional)"
  }
  ```
- Returns: Created message

## Frontend Components

### Dashboard Chat (DashboardChatPage.tsx)
Located at `/dashboard/chat`
- Two tabs: Direct Chats and Groups
- Conversation/group list sidebar
- Message view with refresh button
- Send message with reply support
- Group management button (for groups tab)

### Group Management Modal (GroupManagementModal.tsx)
- Create new groups
- Manage existing groups (admin only)
- Add/remove members
- Update member roles
- Delete groups

### Anonymous Chat Modal (AnonymousChatModal.tsx)
Accessible from landing page via floating button
- View anonymous messages
- Send anonymous messages
- Reply to messages
- Manual refresh

## Usage

### Running Migrations
To apply the chat system migration:
```bash
cd backend
wrangler d1 execute DB --file=./migrations/005_add_chat_system.sql --local
```

For production:
```bash
wrangler d1 execute DB --file=./migrations/005_add_chat_system.sql --remote
```

### Development
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Building
```bash
# Backend
cd backend
npm run deploy

# Frontend
cd frontend
npm run build
```

## Security Considerations

1. **Authentication**: All authenticated endpoints verify user tokens
2. **Authorization**: 
   - Users can only access their own conversations
   - Group operations require membership/admin status
   - Group admins cannot remove themselves if they're the last admin
3. **Anonymous Chat**: 
   - No sensitive data should be shared
   - Sender IDs are generated client-side
   - Messages are public and not deletable

## Future Enhancements

Potential improvements (not included in current implementation):
- Real-time chat using WebSockets
- Message editing and deletion
- File/image sharing
- Read receipts
- Typing indicators
- Search functionality
- Message pagination
- User blocking
- Notification system

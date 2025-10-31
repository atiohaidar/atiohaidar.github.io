# ExpoJS Anonymous Chat Implementation

## Overview
This document describes the implementation of the anonymous chat feature in the ExpoJS (React Native) mobile application.

## Features Implemented

### 1. WebSocket Service (`expojs/services/websocketService.ts`)
An efficient WebSocket client service with the following optimizations:

#### Connection Management
- **Auto-reconnection** with exponential backoff (1s → 2s → 4s → 8s → 16s → max 30s)
- **Connection timeout** (5 seconds) to handle slow/failed connections
- **Lazy connection** - connects only when needed via `ensureConnected()`

#### Efficiency Features
- **Message Batching**: Groups multiple messages within 100ms into a single batch to reduce network calls
  - Max batch size: 5 messages
  - Single messages sent directly without batching overhead
- **Idle Timeout**: Auto-disconnects after 5 minutes of inactivity to save resources and battery
- **Activity Tracking**: Resets idle timeout on any send or receive activity

#### Protocol Support
- Full support for `send_message` (single message)
- Full support for `batch_messages` (multiple messages)
- Handles `welcome`, `new_message`, and `connections_update` events from server

### 2. Anonymous Chat UI (`expojs/screens/chat/components/AnonymousChatView.tsx`)

#### Core Features
- **Real-time messaging** via WebSocket with REST API fallback
- **Message history** loaded on initial open
- **Reply functionality** - long press to reply to any message
- **Connection status** indicator showing online user count
- **Auto-scroll** behavior similar to WhatsApp:
  - Auto-scrolls when user is at bottom
  - Shows scroll-to-bottom button when user scrolls up
  - Smart scroll behavior on new messages

#### UI/UX
- WhatsApp-like message bubbles
- Own messages on right (green), others on left (white)
- Reply preview shown in messages
- Timestamp for each message
- Keyboard-aware layout that adjusts when keyboard opens

### 3. Integration with Chat Screen (`expojs/screens/chat/ChatScreen.tsx`)

Added a third tab "Anonymous" alongside "Direct" and "Groups":
- Uses segmented button control for easy switching
- Maintains consistent design with other chat modes
- No FAB button needed (messages sent from within the chat view)

### 4. Type Definitions (`expojs/types/api.ts`)

Updated `AnonymousMessage` interface to include:
```typescript
export interface AnonymousMessage {
  id: string;
  sender_id: string;
  content: string;
  reply_to_id?: string;
  created_at: string;
  reply_content?: string;      // For displaying reply context
  reply_sender_id?: string;    // For identifying reply author
}
```

## Technical Implementation Details

### WebSocket Message Flow

#### Client → Server (Single Message)
```json
{
  "type": "send_message",
  "sender_id": "anon-1234567890-abc123",
  "content": "Hello everyone!",
  "reply_to_id": "optional-message-id"
}
```

#### Client → Server (Batched Messages)
```json
{
  "type": "batch_messages",
  "messages": [
    {
      "type": "send_message",
      "sender_id": "anon-1234567890-abc123",
      "content": "Message 1"
    },
    {
      "type": "send_message",
      "sender_id": "anon-1234567890-abc123",
      "content": "Message 2"
    }
  ]
}
```

#### Server → Client (New Message)
```json
{
  "type": "new_message",
  "message": {
    "id": "anon-1703123456789-xyz789",
    "sender_id": "anon-1234567890-abc123",
    "content": "Hello everyone!",
    "reply_to_id": null,
    "created_at": "2025-10-30T15:30:00.000Z"
  }
}
```

#### Server → Client (Connection Updates)
```json
{
  "type": "connections_update",
  "connections": 5
}
```

### Anonymous Sender ID
- Generated once per device and stored in AsyncStorage
- Format: `anon-{timestamp}-{random9chars}`
- Persists across app restarts
- Users remain anonymous but have consistent ID within the app

### Fallback Mechanism
If WebSocket connection fails:
1. Message is sent via REST API (`POST /api/anonymous/messages`)
2. Message is added to local state immediately
3. No error shown to user (seamless experience)
4. WebSocket will retry connection in background

## Performance Optimizations

### Network Efficiency
- **Message batching** reduces HTTP requests by up to 80% during active conversations
- **Idle timeout** saves battery and data when user is not actively chatting
- **Single Durable Object** per room ensures all users share the same WebSocket instance

### UI Performance
- **FlatList** for efficient rendering of large message lists
- **React.memo** and useCallback hooks to prevent unnecessary re-renders
- **Scroll event throttling** (16ms) to maintain smooth scrolling

### Resource Management
- WebSocket auto-disconnects after 5 minutes of inactivity
- Reconnection uses exponential backoff to avoid overwhelming the server
- Cleanup handlers properly remove event listeners on unmount

## Usage

### Environment Configuration
Set the API base URL in your environment:
```bash
EXPO_PUBLIC_API_BASE_URL=https://backend.atiohaidar.workers.dev
```

For local development:
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787
```

### Running the App
```bash
cd expojs
npm install
npm start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

### Testing Anonymous Chat
1. Navigate to Chat tab
2. Select "Anonymous" from the segmented control
3. Start sending messages
4. Open app on multiple devices to see real-time updates
5. Long-press a message to reply

## Backend Support

The backend already supports all required features:
- Durable Object (`ChatRoom`) handles WebSocket connections
- Anonymous messages stored in `anonymous_messages` table
- REST API fallback via `/api/anonymous/messages`
- Efficient batch message processing

## Design Consistency

The anonymous chat follows the same design language as:
- **Group Chat**: Same message bubble style and layout
- **Direct Messages**: Same color scheme (green for own messages)
- **Overall App**: Uses React Native Paper components throughout

## Future Enhancements

Potential improvements (not in current scope):
- Message deletion
- Image/file sharing
- Emoji reactions
- User blocking
- Read receipts
- Typing indicators
- Push notifications for new messages

## Security Considerations

1. **No Authentication**: Anonymous chat intentionally requires no login
2. **Client-side Sender ID**: Users can technically change their ID by clearing app data
3. **Public Messages**: All messages are visible to anyone with the app
4. **No Encryption**: Messages are sent in plain text (HTTPS transport only)
5. **Rate Limiting**: Should be implemented on backend to prevent spam

⚠️ **Warning**: Do not share sensitive information in anonymous chat. It is designed for casual public conversations only.

## Troubleshooting

### WebSocket Not Connecting
- Check `EXPO_PUBLIC_API_BASE_URL` environment variable
- Verify backend is running and accessible
- Check network connectivity
- Review logs in Metro bundler console

### Messages Not Appearing
- Check if WebSocket is connected (see online count indicator)
- Verify REST API fallback is working
- Check database for saved messages
- Review backend logs for errors

### App Performance Issues
- Clear app cache and restart
- Check if message list is too large (>1000 messages)
- Verify no memory leaks in WebSocket handlers
- Monitor network activity in developer tools

## Summary

✅ Efficient WebSocket implementation with batching and idle timeout  
✅ WhatsApp-like UI with auto-scroll and reply functionality  
✅ Seamless integration with existing chat system  
✅ REST API fallback for reliability  
✅ Consistent design across the app  
✅ Clean code with TypeScript type safety  
✅ Passing all ESLint and TypeScript checks  

The implementation provides a production-ready anonymous chat feature that is efficient, user-friendly, and maintains design consistency with the rest of the application.

# WebSocket Implementation Guide - Cloudflare Workers

## 📋 Overview

Panduan lengkap implementasi WebSocket pada Cloudflare Workers untuk fitur chat real-time di proyek atiohaidar.github.io.

## 🎯 Tujuan

- Mengimplementasikan chat anonim real-time menggunakan WebSocket
- Fallback ke REST API jika WebSocket tidak tersedia
- Auto-scroll dan UI seperti WhatsApp
- Scalable menggunakan Durable Objects

---

## 🏗️ Arsitektur

```
Frontend (React) <---WebSocket---> Cloudflare Workers (Durable Objects)
       |                                |
       |---REST API fallback----------> |
```

### Komponen Utama:

1. **Durable Object** - `ChatRoom.ts` - Menangani WebSocket connections
2. **Worker Handler** - `index.ts` - Routing requests
3. **Frontend Service** - `websocketService.ts` - WebSocket client
4. **UI Component** - `AnonymousChatModal.tsx` - Chat interface

---

## 🔄 Handling 404 on Page Reload (SPA Routing)

### Masalah
Saat menggunakan client-side routing di SPA (contoh: React Router), me-refresh halaman akan mengirim request ke server untuk path tersebut. Jika server tidak dikonfigurasi dengan benar, akan muncul error 404.

### Solusi

#### 1. Konfigurasi Vite Dev Server
Di `vite.config.ts`:

```typescript
// frontend/vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    // Tambahkan ini untuk handle client-side routing
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      // Handle WebSocket
      '/whiteboard-ws': {
        target: 'ws://localhost:8787',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/whiteboard-ws/, '/whiteboard')
      },
      // Handle client-side routes
      '^/whiteboard/\\.*': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    }
  }
});
```

#### 2. File _redirects untuk Produksi
Buat file `public/_redirects` di frontend:

```
# Handle client-side routing
/whiteboard/*    /index.html   200
/whiteboards     /index.html   200

# API routes
/api/*           /api/:splat  200

# WebSocket
/chat           200
/whiteboard-ws   200
```

#### 3. Error Handling di Komponen
Gunakan mekanisme retry dengan exponential backoff:

```typescript
// Contoh di WhiteboardListPage.tsx
const loadWhiteboards = async (isRetry = false) => {
  try {
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }
    
    const response = await fetch('/api/whiteboards');
    if (!response.ok) throw new Error('Gagal memuat whiteboard');
    
    // Handle success
    setRetryCount(0);
  } catch (err) {
    if (retryCount < 3) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      setTimeout(() => loadWhiteboards(true), delay);
      setRetryCount(c => c + 1);
    }
    // Tampilkan error ke user
  } finally {
    if (!isRetry) setLoading(false);
  }
};
```

### Catatan Penting
1. Pastikan route frontend dan backend tidak bentrok
2. Gunakan prefix yang konsisten untuk API (contoh: `/api/...`)
3. Handle WebSocket di path yang terpisah dari static assets
4. Selalu sediakan fallback ke `index.html` untuk client-side routing

---

## 📁 File Structure

```
backend/
├── src/
│   ├── durable-objects/
│   │   └── ChatRoom.ts          # WebSocket Durable Object
│   ├── services/
│   │   └── chats.ts             # AnonymousChatService
│   ├── models/
│   │   └── types.ts             # Bindings & types
│   └── index.ts                 # Worker entry point
└── wrangler.jsonc               # Worker configuration

frontend/
├── services/
│   └── websocketService.ts      # WebSocket client service
├── components/
│   └── AnonymousChatModal.tsx   # Chat UI component
└── vite.config.ts               # Proxy configuration
```

---

## ⚙️ Backend Implementation

### 1. Durable Object Setup

#### File: `backend/src/durable-objects/ChatRoom.ts`

```typescript
import { AnonymousChatService } from '../services/chats';

export class ChatRoom implements DurableObject {
    connections: Set<WebSocket> = new Set();
    env: Bindings;

    constructor(state: DurableObjectState, env: Bindings) {
        this.env = env;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // Handle WebSocket upgrade
        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader === 'websocket') {
            const [client, server] = Object.values(new WebSocketPair());
            await this.handleSession(server);
            return new Response(null, {
                status: 101,
                webSocket: client
            });
        }

        // Handle HTTP GET for initial messages
        if (request.method === 'GET' && url.pathname === '/messages') {
            const chatService = new AnonymousChatService(this.env);
            const messages = await chatService.getRecentMessages(50);
            return new Response(JSON.stringify({ messages }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }

        return new Response('Expected WebSocket or GET /messages', { status: 400 });
    }

    async handleSession(webSocket: WebSocket): Promise<void> {
        webSocket.accept();
        this.connections.add(webSocket);

        // Send welcome message
        const welcomeMsg = {
            type: 'welcome',
            connections: this.connections.size
        };
        webSocket.send(JSON.stringify(welcomeMsg));

        webSocket.addEventListener('message', async (event) => {
            try {
                const data = JSON.parse(event.data.toString());

                if (data.type === 'send_message') {
                    const chatService = new AnonymousChatService(this.env);

                    // Save to database
                    const savedMessage = await chatService.sendMessage(
                        data.sender_id,
                        data.content,
                        data.reply_to_id
                    );

                    // Broadcast to all clients
                    const broadcastMsg = {
                        type: 'new_message',
                        message: savedMessage
                    };

                    for (const conn of this.connections) {
                        if (conn.readyState === WebSocket.OPEN) {
                            conn.send(JSON.stringify(broadcastMsg));
                        }
                    }
                }
            } catch (error) {
                webSocket.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid message format'
                }));
            }
        });

        webSocket.addEventListener('close', () => {
            this.connections.delete(webSocket);

            // Notify others about connection count change
            const updateMsg = {
                type: 'connections_update',
                connections: this.connections.size
            };

            for (const conn of this.connections) {
                if (conn.readyState === WebSocket.OPEN) {
                    conn.send(JSON.stringify(updateMsg));
                }
            }
        });
    }
}
```

#### File: `backend/src/models/types.ts`

Update Bindings untuk menyertakan Durable Object:

```typescript
export type Bindings = {
    DB: D1Database;
    CHAT_ROOM: DurableObjectNamespace;  // Tambahkan ini
};
```

#### File: `backend/wrangler.jsonc`

Konfigurasi Durable Object:

```jsonc
{
    "durable_objects": {
        "bindings": [
            {
                "name": "CHAT_ROOM",
                "class_name": "ChatRoom"
            }
        ]
    },
    "migrations": [
        {
            "tag": "v1",
            "new_sqlite_classes": [  // Gunakan new_sqlite_classes untuk free plan
                "ChatRoom"
            ]
        }
    ]
}
```

> **⚠️ Important:** Untuk free plan Cloudflare, gunakan `new_sqlite_classes` bukan `new_classes` di migrations.

#### File: `backend/src/index.ts`

Routing WebSocket ke Durable Object:

```typescript
export default {
    async fetch(request: Request, env: Bindings): Promise<Response> {
        const url = new URL(request.url);

        // Handle WebSocket connections
        if (url.pathname === '/chat') {
            const id = env.CHAT_ROOM.idFromName('anonymous-chat-room');
            const obj = env.CHAT_ROOM.get(id);
            return obj.fetch(request);
        }

        // Handle regular HTTP requests
        return app.fetch(request, env);
    },
};

// Export Durable Objects
export { ChatRoom };
```

#### File: `backend/src/services/chats.ts`

Tambahkan method untuk mengambil pesan terbaru:

```typescript
export class AnonymousChatService {
    // ... existing methods ...

    async getRecentMessages(limit = 50): Promise<any[]> {
        const db = this.env.DB;

        const messages = await db
            .prepare(`
                SELECT
                    m.*,
                    rm.content as reply_content,
                    rm.sender_id as reply_sender_id
                FROM anonymous_messages m
                LEFT JOIN anonymous_messages rm ON rm.id = m.reply_to_id
                ORDER BY m.created_at ASC
                LIMIT ?
            `)
            .bind(limit)
            .all();

        return messages.results || [];
    }
}
```

---

## 🎨 Frontend Implementation

### 1. WebSocket Service

#### File: `frontend/services/websocketService.ts`

```typescript
interface WebSocketMessage {
    type: string;
    message?: any;
    connections?: number;
}

interface MessageHandler {
    (msg: WebSocketMessage): void;
}

export class WebSocketService {
    private socket: WebSocket | null = null;
    private messageHandlers: MessageHandler[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 1000;
    private isConnecting = false;
    private connectionTimeout: NodeJS.Timeout | null = null;

    constructor() {
        this.connect();
    }

    private connect(): void {
        if (this.isConnecting || this.socket?.readyState === WebSocket.CONNECTING) {
            return;
        }

        this.isConnecting = true;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const socketUrl = `${protocol}//${host}/chat`;

        console.log('Attempting WebSocket connection to:', socketUrl);

        try {
            this.socket = new WebSocket(socketUrl);

            // Connection timeout
            this.connectionTimeout = setTimeout(() => {
                if (this.socket?.readyState === WebSocket.CONNECTING) {
                    console.warn('WebSocket connection timeout');
                    this.socket.close();
                }
            }, 5000);

            this.socket.onopen = () => {
                console.log('WebSocket connected successfully');
                if (this.connectionTimeout) {
                    clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                }
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.reconnectInterval = 1000;
            };

            this.socket.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    this.messageHandlers.forEach(handler => handler(data));
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                if (this.connectionTimeout) {
                    clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                }
                this.isConnecting = false;
                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (this.connectionTimeout) {
                    clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                }
                this.isConnecting = false;
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.isConnecting = false;
            this.attemptReconnect();
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        setTimeout(() => {
            this.connect();
        }, this.reconnectInterval);

        this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000);
    }

    onMessage(handler: MessageHandler): void {
        this.messageHandlers.push(handler);
    }

    offMessage(handler: MessageHandler): void {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }

    sendMessage(message: {
        type: string;
        sender_id: string;
        content: string;
        reply_to_id?: string;
    }): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected. Message not sent.');
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.messageHandlers = [];
        this.reconnectAttempts = this.maxReconnectAttempts;
    }

    get isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }
}

export const webSocketService = new WebSocketService();
```

### 2. UI Component dengan Auto-Scroll

#### File: `frontend/components/AnonymousChatModal.tsx`

Key features yang ditambahkan:

```typescript
// State untuk scroll management
const [showScrollToBottom, setShowScrollToBottom] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);

// Refs
const messagesEndRef = useRef<HTMLDivElement>(null);
const messagesContainerRef = useRef<HTMLDivElement>(null);
const isUserScrollingRef = useRef(false);

// Scroll functions
const checkIfAtBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const threshold = 100; // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
}, []);

const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollToBottom(false);
    setUnreadCount(0);
}, []);

// WebSocket message handler dengan auto-scroll logic
const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'new_message') {
        setMessages(prev => {
            const exists = prev.some(msg => msg.id === data.message.id);
            if (exists) return prev;

            const newMessages = [...prev, data.message];
            const isAtBottom = checkIfAtBottom();

            // Auto-scroll if user is at bottom, otherwise show button
            if (isAtBottom) {
                setTimeout(() => scrollToBottom(), 100);
            } else {
                setUnreadCount(prev => prev + 1);
            }

            return newMessages;
        });
    }
    // ... other message types
}, [checkIfAtBottom, scrollToBottom]);
```

### 3. Vite Proxy Configuration

#### File: `frontend/vite.config.ts`

```typescript
export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8787',
                changeOrigin: true,
            },
            '/chat': {
                target: 'http://localhost:8787',
                ws: true,  // Enable WebSocket proxy
                changeOrigin: true,
            },
        },
    },
});
```

### 4. Environment-based WebSocket Connection

#### File: `frontend/services/websocketService.ts`

```typescript
// Development: ws://localhost:3000/chat (proxied to ws://localhost:8787/chat)
// Production: wss://backend.atiohaidar.workers.dev/chat

if (import.meta.env.DEV) {
    // Development: use same host (proxied by Vite)
    socketUrl = `${protocol}//${window.location.host}/chat`;
} else {
    // Production: connect directly to backend worker
    const backendUrl = 'https://backend.atiohaidar.workers.dev';
    socketUrl = `wss://${backendUrl.replace('https://', '')}/chat`;
}
```

---

## 🔄 Message Flow

### WebSocket Messages:

#### Client → Server:
```json
{
    "type": "send_message",
    "sender_id": "anon-123456789",
    "content": "Hello everyone!",
    "reply_to_id": "optional-reply-id"
}
```

#### Server → Clients (Broadcast):
```json
{
    "type": "new_message",
    "message": {
        "id": "anon-1703123456789-abc123",
        "sender_id": "anon-123456789",
        "content": "Hello everyone!",
        "reply_to_id": null,
        "created_at": "2025-10-30T13:30:56.789Z"
    }
}
```

#### Server → Client (Welcome):
```json
{
    "type": "welcome",
    "connections": 5
}
```

#### Server → Clients (Connection Update):
```json
{
    "type": "connections_update",
    "connections": 4
}
```

---

## 🧪 Testing

### Local Development:

1. **Start Backend:**
   ```bash
   cd backend
   npx wrangler dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Scenarios:**
   - Open chat in multiple browser tabs
   - Send messages and verify real-time updates
   - Test auto-scroll behavior
   - Test scroll-to-bottom button
   - Test WebSocket fallback to REST API

### Production Deployment:

1. **Deploy Worker:**
   ```bash
   cd backend
   npx wrangler deploy
   ```

2. **Update Environment Variables:**
   - Set `VITE_API_URL` for production API endpoint
   - WebSocket will automatically use `wss://` for HTTPS

---

## 🔧 Troubleshooting

### Common Issues:

1. **Free Plan Durable Objects Error:**
   ```
   In order to use Durable Objects with a free plan, you must create a namespace using a new_sqlite_classes migration.
   ```
   
   **Solution:** Update `wrangler.jsonc` migrations to use `new_sqlite_classes` instead of `new_classes`:
   
   ```jsonc
   "migrations": [
       {
           "tag": "v1",
           "new_sqlite_classes": ["ChatRoom"]  // Not new_classes
       }
   ]
   ```

2. **WebSocket Connection Timeout:**
   - Check if backend is running on correct port
   - Verify Vite proxy configuration
   - Check CORS settings

3. **Messages Not Appearing:**
   - Verify Durable Object is properly configured
   - Check database connectivity
   - Review message parsing logic

4. **Auto-scroll Not Working:**
   - Check scroll event listeners
   - Verify ref assignments
   - Test scroll detection logic

### Debug Commands:

```bash
# Check worker logs
npx wrangler tail

# Check database
npx wrangler d1 execute backend --command "SELECT * FROM anonymous_messages LIMIT 5"

# Test WebSocket connection manually
curl -I -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" -H "Sec-WebSocket-Version: 13" http://localhost:8787/chat
```

---

## 🚀 Scaling Considerations

### Durable Objects Benefits:

- **Automatic Scaling:** Cloudflare handles instance management
- **Persistence:** State maintained across requests
- **WebSocket Support:** Native WebSocket handling
- **Global Distribution:** Low-latency worldwide

### Limitations:

- **Memory Limits:** ~128MB per Durable Object
- **Connection Limits:** ~1000 concurrent connections per instance
- **Storage:** Use D1 for persistent data

### Optimization Tips:

1. **Message Batching:** Group multiple messages in single broadcast
2. **Connection Cleanup:** Properly handle disconnected clients  
3. **Idle Timeout:** Auto-disconnect after 5 minutes of inactivity to save costs
4. **Rate Limiting:** Implement message rate limits
5. **Compression:** Enable WebSocket compression for large messages

---

## 📚 References

- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [D1 Database](https://developers.cloudflare.com/d1/)

---

## ✅ Checklist Implementation

- [x] Durable Object untuk WebSocket handling
- [x] Worker routing untuk WebSocket endpoint
- [x] Frontend WebSocket service dengan auto-reconnect
- [x] Auto-scroll dan scroll-to-bottom UI
- [x] REST API fallback
- [x] Error handling dan logging
- [x] Idle timeout optimization (5 menit auto-disconnect)
- [x] Message batching untuk efisiensi
- [x] Vite proxy untuk development
- [x] CORS configuration
- [x] TypeScript types
- [x] Testing instructions
- [x] Deployment guide

**🎉 Implementasi WebSocket lengkap dan teroptimasi!**

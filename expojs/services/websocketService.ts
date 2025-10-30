/**
 * WebSocket Service for Anonymous Chat in React Native (ExpoJS)
 * Efficient WebSocket client with:
 * - Auto-reconnection with exponential backoff
 * - Message batching to reduce network calls
 * - Idle timeout to save resources
 * - Connection pooling for single room
 */

interface WebSocketMessage {
  type: string;
  message?: any;
  messages?: any[];
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
  private reconnectInterval = 1000; // Start with 1 second
  private isConnecting = false;
  private connectionTimeout: NodeJS.Timeout | null = null;

  // Message batching properties
  private messageQueue: any[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 100; // 100ms delay for batching
  private readonly MAX_BATCH_SIZE = 5; // Max 5 messages per batch

  // Idle timeout properties
  private idleTimeout: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private readonly IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes idle timeout

  constructor() {
    // Don't auto-connect, connect when needed
  }

  private connect(): void {
    if (this.isConnecting || this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.isConnecting = true;
    
    // Get WebSocket URL from environment or default
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://backend.atiohaidar.workers.dev';
    const protocol = API_BASE_URL.startsWith('https') ? 'wss:' : 'ws:';
    const host = API_BASE_URL.replace(/^https?:\/\//, '');
    const socketUrl = `${protocol}//${host}/chat`;

    console.log('[WebSocket] Connecting to:', socketUrl);

    try {
      this.socket = new WebSocket(socketUrl);

      // Set connection timeout (5 seconds)
      this.connectionTimeout = setTimeout(() => {
        if (this.socket?.readyState === WebSocket.CONNECTING) {
          console.warn('[WebSocket] Connection timeout');
          this.socket.close();
        }
      }, 5000);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectInterval = 1000;
        this.startIdleTimeout();
      };

      this.socket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.resetIdleTimeout(); // Reset idle timer on any message
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('[WebSocket] Disconnected');
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.isConnecting = false;
        this.clearIdleTimeout();
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocket] Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);

    // Exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
    this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000);
  }

  /**
   * Subscribe to WebSocket messages
   */
  onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Unsubscribe from WebSocket messages
   */
  offMessage(handler: MessageHandler): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  /**
   * Ensure WebSocket is connected
   */
  ensureConnected(): void {
    if (!this.isConnected && !this.isConnecting) {
      this.connect();
    }
  }

  /**
   * Send message with batching for efficiency
   * Messages are queued and sent in batches to reduce network overhead
   */
  sendMessage(message: {
    type: string;
    sender_id: string;
    content: string;
    reply_to_id?: string;
  }): void {
    this.resetIdleTimeout(); // Reset idle timer on send

    // Add to queue
    this.messageQueue.push(message);

    // If queue is full, flush immediately
    if (this.messageQueue.length >= this.MAX_BATCH_SIZE) {
      this.flushBatch();
      return;
    }

    // If no timeout set, create one to batch messages
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.flushBatch();
      }, this.BATCH_DELAY);
    }
  }

  /**
   * Flush batched messages
   */
  private flushBatch(): void {
    if (this.messageQueue.length === 0) return;

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    // Clear timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    // Send batch if connected
    if (this.socket?.readyState === WebSocket.OPEN) {
      // If only one message, send directly
      if (messages.length === 1) {
        this.socket.send(JSON.stringify(messages[0]));
      } else {
        // Send as batch
        this.socket.send(JSON.stringify({
          type: 'batch_messages',
          messages: messages
        }));
      }
    } else {
      console.warn('[WebSocket] Not connected. Messages not sent.');
    }
  }

  /**
   * Disconnect WebSocket and cleanup
   */
  disconnect(): void {
    console.log('[WebSocket] Disconnecting...');
    
    // Clear idle timeout
    this.clearIdleTimeout();

    // Flush any pending messages before disconnecting
    this.flushBatch();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.messageHandlers = [];
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent further reconnections
  }

  /**
   * Start idle timeout - disconnect after inactivity to save resources
   */
  private startIdleTimeout(): void {
    this.clearIdleTimeout();
    this.idleTimeout = setTimeout(() => {
      console.log('[WebSocket] Idle timeout reached, disconnecting...');
      this.disconnect();
    }, this.IDLE_TIMEOUT);
  }

  /**
   * Reset idle timeout on activity
   */
  private resetIdleTimeout(): void {
    this.lastActivity = Date.now();
    if (this.idleTimeout) {
      this.startIdleTimeout(); // Restart timeout
    }
  }

  /**
   * Clear idle timeout
   */
  private clearIdleTimeout(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Get number of active subscribers
   */
  get subscriberCount(): number {
    return this.messageHandlers.length;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();

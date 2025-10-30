import { WebSocketMessage, AnonymousMessage } from '@/types/api';

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
  private connectionPromise: Promise<void> | null = null;

  // Message batching properties
  private messageQueue: any[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 100; // 100ms delay
  private readonly MAX_BATCH_SIZE = 5; // Max 5 messages per batch

  // Idle timeout properties
  private idleTimeout: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private readonly IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes idle timeout

  constructor() {
    // Remove auto-connect from constructor
  }

  private connect(): void {
    if (this.isConnecting || this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.isConnecting = true;
    
    // Use localhost for development, production for production
    const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
    const wsUrl = isDevelopment 
      ? (process.env.EXPO_PUBLIC_WS_BASE_URL || 'ws://localhost:8787')
      : (process.env.EXPO_PUBLIC_WS_BASE_URL || 'wss://backend.atiohaidar.workers.dev');

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectInterval = 1000; // Reset interval
        this.notifyHandlers({ type: 'connected' });
        this.startIdleTimeout();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.socket = null;
        this.notifyHandlers({ type: 'disconnected' });

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleMessage(data: any): void {
    this.resetIdleTimeout();

    // Handle message batching
    if (Array.isArray(data)) {
      this.messageQueue.push(...data);
    } else {
      this.messageQueue.push(data);
    }

    this.processMessageQueue();
  }

  private processMessageQueue(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      if (this.messageQueue.length > 0) {
        // Process messages in batches
        const batchSize = Math.min(this.MAX_BATCH_SIZE, this.messageQueue.length);
        const batch = this.messageQueue.splice(0, batchSize);

        batch.forEach(message => {
          this.notifyHandlers(message);
        });

        // If there are more messages, process them in the next batch
        if (this.messageQueue.length > 0) {
          this.processMessageQueue();
        }
      }
    }, this.BATCH_DELAY);
  }

  private notifyHandlers(message: WebSocketMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startIdleTimeout(): void {
    this.resetIdleTimeout();
  }

  private resetIdleTimeout(): void {
    this.lastActivity = Date.now();

    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }

    this.idleTimeout = setTimeout(() => {
      if (Date.now() - this.lastActivity >= this.IDLE_TIMEOUT) {
        console.log('WebSocket idle timeout, disconnecting...');
        this.disconnect();
      }
    }, this.IDLE_TIMEOUT);
  }

  public async ensureConnection(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const checkConnection = () => {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.connectionPromise = null;
          resolve();
        } else if (this.socket?.readyState === WebSocket.CLOSED) {
          this.connectionPromise = null;
          reject(new Error('WebSocket connection failed'));
        } else {
          // Still connecting, check again in 100ms
          setTimeout(checkConnection, 100);
        }
      };

      this.connect();
      setTimeout(checkConnection, 100);
    });

    return this.connectionPromise;
  }

  public connectToAnonymousChat(): Promise<void> {
    return this.ensureConnection();
  }

  public sendAnonymousMessage(content: string, replyToId?: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'anonymous_message',
        content,
        reply_to_id: replyToId,
      };
      this.socket.send(JSON.stringify(message));
      this.resetIdleTimeout();
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  public subscribe(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  public unsubscribe(handler: MessageHandler): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  public disconnect(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Client disconnecting');
      this.socket = null;
    }

    this.messageHandlers = [];
    this.reconnectAttempts = 0;
  }

  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

export const webSocketService = new WebSocketService();

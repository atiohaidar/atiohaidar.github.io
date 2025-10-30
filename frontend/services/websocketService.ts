interface WebSocketMessage {
	type: string;
	message?: any;
	connections?: number;
}

interface AnonymousMessage {
	id: string;
	sender_id: string;
	content: string;
	reply_to_id?: string;
	created_at: string;
	reply_content?: string;
	reply_sender_id?: string;
}

interface MessageHandler {
	(msg: WebSocketMessage): void;
}

class WebSocketService {
	private static instance: WebSocketService;
	private socket: WebSocket | null = null;
	private messageHandlers: MessageHandler[] = [];
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectInterval = 1000;
	private isConnecting = false;
	private connectionTimeout: NodeJS.Timeout | null = null;
	private connectionPromise: Promise<void> | null = null;
	private isInitialized = false;

	// Message batching properties
	private messageQueue: any[] = [];
	private batchTimeout: NodeJS.Timeout | null = null;
	private readonly BATCH_DELAY = 100; // 100ms delay
	private readonly MAX_BATCH_SIZE = 5; // Max 5 messages per batch

	// Idle timeout properties
	private idleTimeout: NodeJS.Timeout | null = null;
	private lastActivity = Date.now();
	private readonly IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes idle timeout

	private constructor() {}

	public static getInstance(): WebSocketService {
		if (!WebSocketService.instance) {
			WebSocketService.instance = new WebSocketService();
		}
		return WebSocketService.instance;
	}

	public ensureConnected() {
		if (!this.isInitialized) {
			this.initialize();
		} else if (!this.isConnected && !this.isConnecting) {
			this.connect();
		}
	}

	private initialize() {
		if (this.isInitialized) return;
		this.isInitialized = true;
		this.connect();
	}

	private connect(): void {
		// Jika sudah terhubung atau sedang mencoba terhubung, jangan buat koneksi baru
		if (this.isConnecting || 
			this.socket?.readyState === WebSocket.CONNECTING || 
			this.socket?.readyState === WebSocket.OPEN) {
			return;
		}

		this.isConnecting = true;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		
		// Determine WebSocket URL based on environment
		let socketUrl: string;
		
		if (import.meta.env.DEV) {
			// Development: use same host (proxied by Vite)
			const host = window.location.host;
			socketUrl = `${protocol}//${host}/chat-ws`;
		} else {
			// Production: connect directly to backend worker
			const backendUrl = import.meta.env.VITE_API_URL || 'https://backend.atiohaidar.workers.dev';
			const backendProtocol = backendUrl.startsWith('https') ? 'wss:' : 'ws:';
			const backendHost = backendUrl.replace(/^https?:\/\//, '');
			socketUrl = `${backendProtocol}//${backendHost}/chat-ws`;
		}

		console.log('Attempting WebSocket connection to:', socketUrl);

		try {
			this.socket = new WebSocket(socketUrl);

			// Set connection timeout
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
				this.startIdleTimeout();
			};

			this.socket.onmessage = (event) => {
				try {
					const data: WebSocketMessage = JSON.parse(event.data);
					this.resetIdleTimeout(); // Reset idle on any message
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

		// Exponential backoff
		this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000);
	}

	onMessage(handler: (msg: WebSocketMessage) => void): () => void {
		this.messageHandlers.push(handler);
		// Return unsubscribe function
		return () => {
			this.offMessage(handler);
		};
	}

	offMessage(handler: (msg: WebSocketMessage) => void): void {
		this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
	}

	sendMessage(message: any): void {
		if (!this.isConnected) {
			console.warn('WebSocket not connected. Message not sent:', message);
			return;
		}

		// Reset idle on send
		this.resetIdleTimeout();

		// Add to batch queue
		this.messageQueue.push(message);

		// If we've reached max batch size, send immediately
		if (this.messageQueue.length >= this.MAX_BATCH_SIZE) {
			this.flushMessageQueue();
		}
		// Otherwise, set a timeout to send the batch
		else if (!this.batchTimeout) {
			this.batchTimeout = setTimeout(() => {
				this.flushMessageQueue();
			}, this.BATCH_DELAY);
		}
	}

	private flushMessageQueue(): void {
		if (this.batchTimeout) {
			clearTimeout(this.batchTimeout);
			this.batchTimeout = null;
		}

		if (this.messageQueue.length === 0 || !this.isConnected) {
			return;
		}

		const messagesToSend = [...this.messageQueue];
		this.messageQueue = [];

		try {
			this.socket?.send(JSON.stringify(messagesToSend));
		} catch (error) {
			console.error('Failed to send WebSocket message:', error);
			// Requeue messages on failure
			this.messageQueue.unshift(...messagesToSend);
		}
	}

	disconnect(): void {
		// Clear idle timeout
		this.clearIdleTimeout();

		// Flush any pending messages before disconnecting
		this.flushMessageQueue();

		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
		this.messageHandlers = [];
		this.reconnectAttempts = this.maxReconnectAttempts; // Prevent further reconnections
	}

	private startIdleTimeout(): void {
		this.clearIdleTimeout();
		this.idleTimeout = setTimeout(() => {
			console.log('WebSocket idle timeout reached, disconnecting...');
			this.disconnect();
		}, this.IDLE_TIMEOUT);
	}

	private resetIdleTimeout(): void {
		this.lastActivity = Date.now();
		if (this.idleTimeout) {
			this.startIdleTimeout(); // Restart timeout
		}
	}

	private clearIdleTimeout(): void {
		if (this.idleTimeout) {
			clearTimeout(this.idleTimeout);
			this.idleTimeout = null;
		}
	}

	get isConnected(): boolean {
		return this.socket?.readyState === WebSocket.OPEN;
	}
}

// Ekspor instance tunggal
export const webSocketService = WebSocketService.getInstance();

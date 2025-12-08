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
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

		// Determine WebSocket URL based on environment
		let socketUrl: string;

		if (import.meta.env.DEV) {
			// Development: use same host (proxied by Vite)
			const host = window.location.host;
			socketUrl = `${protocol}//${host}/chat`;
		} else {
			// Production: connect directly to backend worker
			const backendUrl = import.meta.env.VITE_API_URL || 'https://backend.atiohaidar.workers.dev';
			const backendProtocol = backendUrl.startsWith('https') ? 'wss:' : 'ws:';
			const backendHost = backendUrl.replace(/^https?:\/\//, '');
			socketUrl = `${backendProtocol}//${backendHost}/chat`;
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

	onMessage(handler: MessageHandler): void {
		// Prevent duplicate handlers
		if (!this.messageHandlers.includes(handler)) {
			this.messageHandlers.push(handler);
		}
	}

	ensureConnected(): void {
		if (!this.isConnected && !this.isConnecting) {
			this.connect();
		}
	}

	offMessage(handler: MessageHandler): void {
		const index = this.messageHandlers.indexOf(handler);
		if (index > -1) {
			this.messageHandlers.splice(index, 1);
		}
	}

	// Check if a handler is already registered
	hasHandler(handler: MessageHandler): boolean {
		return this.messageHandlers.includes(handler);
	}

	// Get current handler count (useful for debugging)
	get handlerCount(): number {
		return this.messageHandlers.length;
	}

	sendMessage(message: {
		type: string;
		sender_id: string;
		content: string;
		reply_to_id?: string;
	}): void {
		this.resetIdleTimeout(); // Reset idle on send

		// Add to queue
		this.messageQueue.push(message);

		// If queue is full, flush immediately
		if (this.messageQueue.length >= this.MAX_BATCH_SIZE) {
			this.flushBatch();
			return;
		}

		// If no timeout set, create one
		if (!this.batchTimeout) {
			this.batchTimeout = setTimeout(() => {
				this.flushBatch();
			}, this.BATCH_DELAY);
		}
	}

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
			this.socket.send(JSON.stringify({
				type: 'batch_messages',
				messages: messages
			}));
		} else {
			console.warn('WebSocket is not connected. Batch not sent.');
		}
	}

	disconnect(): void {
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

export const webSocketService = new WebSocketService();

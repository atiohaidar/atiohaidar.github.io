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

		// Exponential backoff
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
			this.socket.send(JSON.stringify({
				type: 'send_message',
				...message
			}));
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
		this.reconnectAttempts = this.maxReconnectAttempts; // Prevent further reconnections
	}

	get isConnected(): boolean {
		return this.socket?.readyState === WebSocket.OPEN;
	}
}

export const webSocketService = new WebSocketService();

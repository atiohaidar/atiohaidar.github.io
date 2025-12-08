import { AnonymousChatService } from '../services/chats';
import type { Bindings } from '../models/types';

interface WebSocketAttachment {
	connectedAt: number;
}

interface CachedMessages {
	messages: any[];
	cachedAt: number;
}

// Rate limit config
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_MESSAGES = 30; // Max 30 messages per minute per user
const MESSAGE_CACHE_TTL_MS = 5000; // Cache messages for 5 seconds

export class ChatRoom implements DurableObject {
	private state: DurableObjectState;
	private env: Bindings;
	private chatService: AnonymousChatService;

	// In-memory rate limiting (resets on DO restart, which is acceptable)
	private messageRateLimits: Map<string, number[]> = new Map();

	// In-memory message cache for fast retrieval
	private messageCache: CachedMessages | null = null;

	constructor(state: DurableObjectState, env: Bindings) {
		this.state = state;
		this.env = env;
		// Cache the service instance to avoid repeated instantiation
		this.chatService = new AnonymousChatService(env);
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Handle WebSocket upgrade using Hibernatable WebSockets
		const upgradeHeader = request.headers.get('Upgrade');
		if (upgradeHeader === 'websocket') {
			const [client, server] = Object.values(new WebSocketPair());

			// Use Hibernatable WebSocket API - this allows DO to hibernate while maintaining connections
			// Significantly reduces costs for idle connections
			this.state.acceptWebSocket(server);

			// Store attachment data using serializeAttachment (for retrieval via deserializeAttachment)
			server.serializeAttachment({ connectedAt: Date.now() } as WebSocketAttachment);

			// Send welcome message with current connections count
			const connections = this.state.getWebSockets();
			const welcomeMsg = {
				type: 'welcome',
				connections: connections.length
			};
			server.send(JSON.stringify(welcomeMsg));

			// Notify all clients about updated connections count
			this.broadcastConnectionsUpdate();

			return new Response(null, {
				status: 101,
				webSocket: client
			});
		}

		// Handle HTTP GET requests for initial messages with caching
		if (request.method === 'GET' && url.pathname === '/messages') {
			const messages = await this.getCachedMessages();
			return new Response(JSON.stringify({ messages }), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type'
				}
			});
		}

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type'
				}
			});
		}

		return new Response('Expected WebSocket or GET /messages', { status: 400 });
	}

	// Get messages with caching for reduced database load
	private async getCachedMessages(): Promise<any[]> {
		const now = Date.now();

		// Check if cache is valid
		if (this.messageCache && (now - this.messageCache.cachedAt) < MESSAGE_CACHE_TTL_MS) {
			return this.messageCache.messages;
		}

		// Cache miss or expired - fetch from database
		const messages = await this.chatService.getRecentMessages(50);

		// Update cache
		this.messageCache = {
			messages,
			cachedAt: now
		};

		return messages;
	}

	// Invalidate message cache when new messages are added
	private invalidateMessageCache(): void {
		this.messageCache = null;
	}

	// Check if a sender is rate limited
	private isRateLimited(senderId: string): boolean {
		const now = Date.now();
		const timestamps = this.messageRateLimits.get(senderId) || [];

		// Filter to only keep timestamps within the rate limit window
		const recentTimestamps = timestamps.filter(t => (now - t) < RATE_LIMIT_WINDOW_MS);

		// Check if over limit
		if (recentTimestamps.length >= RATE_LIMIT_MAX_MESSAGES) {
			// Update the map with cleaned timestamps
			this.messageRateLimits.set(senderId, recentTimestamps);
			return true;
		}

		// Not rate limited - add current timestamp
		recentTimestamps.push(now);
		this.messageRateLimits.set(senderId, recentTimestamps);

		// Periodically clean up old entries (every 100 checks)
		if (Math.random() < 0.01) {
			this.cleanupRateLimits();
		}

		return false;
	}

	// Get remaining rate limit for a sender
	private getRateLimitRemaining(senderId: string): number {
		const now = Date.now();
		const timestamps = this.messageRateLimits.get(senderId) || [];
		const recentTimestamps = timestamps.filter(t => (now - t) < RATE_LIMIT_WINDOW_MS);
		return Math.max(0, RATE_LIMIT_MAX_MESSAGES - recentTimestamps.length);
	}

	// Cleanup old rate limit entries to prevent memory bloat
	private cleanupRateLimits(): void {
		const now = Date.now();
		for (const [senderId, timestamps] of this.messageRateLimits.entries()) {
			const recentTimestamps = timestamps.filter(t => (now - t) < RATE_LIMIT_WINDOW_MS);
			if (recentTimestamps.length === 0) {
				this.messageRateLimits.delete(senderId);
			} else {
				this.messageRateLimits.set(senderId, recentTimestamps);
			}
		}
	}

	// Hibernatable WebSocket message handler
	// This method is called when a message is received on any WebSocket
	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
		try {
			const messageStr = typeof message === 'string' ? message : new TextDecoder().decode(message);
			const data = JSON.parse(messageStr);

			if (data.type === 'batch_messages') {
				// Handle batched messages using optimized batch insert
				await this.handleBatchMessages(data.messages, ws);
			} else if (data.type === 'send_message') {
				// Check rate limit before processing
				if (this.isRateLimited(data.sender_id)) {
					ws.send(JSON.stringify({
						type: 'error',
						code: 'RATE_LIMITED',
						message: 'Too many messages. Please wait before sending more.',
						remaining: this.getRateLimitRemaining(data.sender_id),
						retryAfter: RATE_LIMIT_WINDOW_MS / 1000
					}));
					return;
				}

				// Save message to database
				const savedMessage = await this.chatService.sendMessage(
					data.sender_id,
					data.content,
					data.reply_to_id
				);

				// Invalidate cache since we added a new message
				this.invalidateMessageCache();

				// Broadcast to all connected clients in parallel
				await this.broadcastMessage({
					type: 'new_message',
					message: savedMessage
				});
			}
		} catch (error) {
			console.error('WebSocket message error:', error);
			ws.send(JSON.stringify({
				type: 'error',
				code: 'INVALID_FORMAT',
				message: 'Invalid message format'
			}));
		}
	}

	// Hibernatable WebSocket close handler
	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
		// WebSocket is automatically removed from state.getWebSockets()
		// Notify remaining clients about connection count change
		this.broadcastConnectionsUpdate();
	}

	// Hibernatable WebSocket error handler
	async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
		console.error('WebSocket error:', error);
		// Close the WebSocket gracefully
		try {
			ws.close(1011, 'Unexpected error');
		} catch {
			// Already closed
		}
	}

	private async handleBatchMessages(messages: any[], ws: WebSocket): Promise<void> {
		if (!messages || messages.length === 0) return;

		// Check rate limit for the sender of the batch (use first message's sender_id)
		const senderId = messages[0]?.sender_id;
		if (senderId) {
			// For batch, check if there's enough quota for all messages
			const remaining = this.getRateLimitRemaining(senderId);
			if (remaining < messages.length) {
				ws.send(JSON.stringify({
					type: 'error',
					code: 'RATE_LIMITED',
					message: `Cannot send ${messages.length} messages. Only ${remaining} messages allowed.`,
					remaining,
					retryAfter: RATE_LIMIT_WINDOW_MS / 1000
				}));
				return;
			}

			// Add timestamps for all messages in batch
			const now = Date.now();
			const timestamps = this.messageRateLimits.get(senderId) || [];
			for (let i = 0; i < messages.length; i++) {
				timestamps.push(now);
			}
			this.messageRateLimits.set(senderId, timestamps);
		}

		try {
			// Use batch insert for much better performance
			const savedMessages = await this.chatService.sendMessagesBatch(
				messages.map(m => ({
					sender_id: m.sender_id,
					content: m.content,
					reply_to_id: m.reply_to_id
				}))
			);

			// Invalidate cache since we added new messages
			this.invalidateMessageCache();

			// Broadcast all saved messages in parallel
			const broadcastPromises = savedMessages.map(savedMessage =>
				this.broadcastMessage({
					type: 'new_message',
					message: savedMessage
				})
			);

			await Promise.all(broadcastPromises);
		} catch (error) {
			console.error('Error handling batch messages:', error);
		}
	}

	private async broadcastMessage(msg: object): Promise<void> {
		const connections = this.state.getWebSockets();
		const msgStr = JSON.stringify(msg);

		// Send to all connections in parallel for better performance
		await Promise.all(
			connections.map(async (ws) => {
				try {
					ws.send(msgStr);
				} catch (error) {
					// Connection might be closed, ignore
					console.error('Error sending to WebSocket:', error);
				}
			})
		);
	}

	private broadcastConnectionsUpdate(): void {
		const connections = this.state.getWebSockets();
		const updateMsg = JSON.stringify({
			type: 'connections_update',
			connections: connections.length
		});

		for (const ws of connections) {
			try {
				ws.send(updateMsg);
			} catch {
				// Connection might be closed, ignore
			}
		}
	}
}

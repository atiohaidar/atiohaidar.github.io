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

		// Handle HTTP GET requests for initial messages
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

	async handleSession(webSocket: WebSocket): Promise<void> {
		webSocket.accept();
		this.connections.add(webSocket);

		// Send welcome message with current connections count
		const welcomeMsg = {
			type: 'welcome',
			connections: this.connections.size
		};
		webSocket.send(JSON.stringify(welcomeMsg));

		webSocket.addEventListener('message', async (event) => {
			try {
				const data = JSON.parse(event.data.toString());

				if (data.type === 'batch_messages') {
					// Handle batched messages
					await this.handleBatchMessages(data.messages);
				} else if (data.type === 'send_message') {
					const chatService = new AnonymousChatService(this.env);

					// Save message to database
					const savedMessage = await chatService.sendMessage(
						data.sender_id,
						data.content,
						data.reply_to_id
					);

					// Broadcast to all connected clients
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
				console.error('WebSocket message error:', error);
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

		webSocket.addEventListener('error', (error) => {
			console.error('WebSocket error:', error);
			this.connections.delete(webSocket);
		});
	}

	private async handleBatchMessages(messages: any[]): Promise<void> {
		const chatService = new AnonymousChatService(this.env);
		const savedMessages: any[] = [];

		// Process all messages in batch
		for (const message of messages) {
			try {
				const savedMessage = await chatService.sendMessage(
					message.sender_id,
					message.content,
					message.reply_to_id
				);
				savedMessages.push(savedMessage);
			} catch (error) {
				console.error('Error saving batched message:', error);
			}
		}

		// Broadcast all saved messages
		for (const savedMessage of savedMessages) {
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
	}
}

import type { Bindings } from '../models/types';

interface WhiteboardUser {
    userId: string;
    username: string;
    color: string;
}

interface ConnectedUser {
    socket: WebSocket;
    user: WhiteboardUser;
}

export class WhiteboardRoom implements DurableObject {
    connections: Map<string, ConnectedUser> = new Map();
    env: Bindings;
    whiteboardId: string = '';

    constructor(state: DurableObjectState, env: Bindings) {
        this.env = env;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        
        // Extract whiteboard ID from URL
        const pathParts = url.pathname.split('/');
        this.whiteboardId = pathParts[pathParts.length - 1] || '';

        // Handle WebSocket upgrade
        const upgradeHeader = request.headers.get('Upgrade');
        if (upgradeHeader === 'websocket') {
            const [client, server] = Object.values(new WebSocketPair());
            await this.handleSession(server, request);
            return new Response(null, {
                status: 101,
                webSocket: client
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

        return new Response('Expected WebSocket', { status: 400 });
    }

    async handleSession(webSocket: WebSocket, request: Request): Promise<void> {
        webSocket.accept();

        // Parse user info from query params
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId') || `user-${Date.now()}`;
        const username = url.searchParams.get('username') || 'Anonymous';
        const color = url.searchParams.get('color') || this.generateColor();

        const user: WhiteboardUser = {
            userId,
            username,
            color
        };

        this.connections.set(userId, { socket: webSocket, user });

        // Send welcome message
        const welcomeMsg = {
            type: 'welcome',
            userId,
            users: Array.from(this.connections.values()).map(c => c.user),
            whiteboardId: this.whiteboardId
        };
        webSocket.send(JSON.stringify(welcomeMsg));

        // Notify others about new user
        const joinMsg = {
            type: 'user_joined',
            user,
            users: Array.from(this.connections.values()).map(c => c.user)
        };
        this.broadcastToOthers(userId, joinMsg);

        webSocket.addEventListener('message', async (event) => {
            try {
                const data = JSON.parse(event.data.toString());

                switch (data.type) {
                    case 'draw':
                        // Broadcast drawing stroke to all other clients
                        this.broadcastToOthers(userId, {
                            type: 'draw',
                            userId,
                            username,
                            color: user.color,
                            stroke: data.stroke
                        });
                        break;

                    case 'cursor':
                        // Broadcast cursor position to all other clients
                        this.broadcastToOthers(userId, {
                            type: 'cursor',
                            userId,
                            username,
                            color: user.color,
                            x: data.x,
                            y: data.y
                        });
                        break;

                    case 'clear':
                        // Broadcast clear action to all clients
                        this.broadcast({
                            type: 'clear',
                            userId,
                            username
                        });
                        break;

                    case 'undo':
                        // Broadcast undo to all clients
                        this.broadcast({
                            type: 'undo',
                            userId,
                            strokeId: data.strokeId
                        });
                        break;
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
            this.connections.delete(userId);

            // Notify others about user leaving
            const leaveMsg = {
                type: 'user_left',
                userId,
                users: Array.from(this.connections.values()).map(c => c.user)
            };
            this.broadcast(leaveMsg);
        });

        webSocket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            this.connections.delete(userId);
        });
    }

    private broadcast(message: any): void {
        const msgStr = JSON.stringify(message);
        for (const conn of this.connections.values()) {
            if (conn.socket.readyState === WebSocket.OPEN) {
                conn.socket.send(msgStr);
            }
        }
    }

    private broadcastToOthers(excludeUserId: string, message: any): void {
        const msgStr = JSON.stringify(message);
        for (const [userId, conn] of this.connections.entries()) {
            if (userId !== excludeUserId && conn.socket.readyState === WebSocket.OPEN) {
                conn.socket.send(msgStr);
            }
        }
    }

    private generateColor(): string {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

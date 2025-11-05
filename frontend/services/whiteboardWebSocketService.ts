interface WhiteboardMessage {
    type: string;
    userId?: string;
    username?: string;
    color?: string;
    stroke?: any;
    x?: number;
    y?: number;
    users?: any[];
    strokeId?: string;
}

interface MessageHandler {
    (msg: WhiteboardMessage): void;
}

export class WhiteboardWebSocketService {
    private socket: WebSocket | null = null;
    private messageHandlers: MessageHandler[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 1000;
    private isConnecting = false;
    private connectionTimeout: NodeJS.Timeout | null = null;
    private whiteboardId: string = '';
    private userId: string = '';
    private username: string = '';
    private userColor: string = '';

    constructor(whiteboardId: string, userId: string, username: string, color: string) {
        this.whiteboardId = whiteboardId;
        this.userId = userId;
        this.username = username;
        this.userColor = color;
        this.connect();
    }

    private connect(): void {
        if (this.isConnecting || this.socket?.readyState === WebSocket.CONNECTING) {
            return;
        }

        this.isConnecting = true;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        // Menggunakan path /whiteboard-ws/ untuk menghindari konflik dengan rute halaman
        const socketUrl = `${protocol}//${host}/whiteboard-ws/${this.whiteboardId}?userId=${this.userId}&username=${encodeURIComponent(this.username)}&color=${encodeURIComponent(this.userColor)}`;

        console.log('Attempting WhiteboardWebSocket connection to:', socketUrl);

        try {
            this.socket = new WebSocket(socketUrl);

            // Connection timeout
            this.connectionTimeout = setTimeout(() => {
                if (this.socket?.readyState === WebSocket.CONNECTING) {
                    console.warn('WhiteboardWebSocket connection timeout');
                    this.socket.close();
                }
            }, 5000);

            this.socket.onopen = () => {
                console.log('WhiteboardWebSocket connected successfully');
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
                    if (!event.data || typeof event.data !== 'string') {
                        console.warn('Invalid WebSocket event data:', event.data);
                        return;
                    }
                    
                    const data: WhiteboardMessage = JSON.parse(event.data);
                    
                    // Validasi data yang diterima
                    if (!data || typeof data !== 'object') {
                        console.warn('Invalid parsed WebSocket message:', data);
                        return;
                    }
                    
                    if (!data.type) {
                        console.warn('WebSocket message missing type property:', data);
                        return;
                    }
                    
                    this.messageHandlers.forEach(handler => {
                        try {
                            handler(data);
                        } catch (handlerError) {
                            console.error('Error in WebSocket message handler:', handlerError);
                        }
                    });
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data);
                }
            };

            this.socket.onclose = () => {
                console.log('WhiteboardWebSocket disconnected');
                if (this.connectionTimeout) {
                    clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                }
                this.isConnecting = false;
                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                console.error('WhiteboardWebSocket error:', error);
                if (this.connectionTimeout) {
                    clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                }
                this.isConnecting = false;
            };
        } catch (error) {
            console.error('Failed to create WhiteboardWebSocket connection:', error);
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

    sendDraw(stroke: any): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'draw',
                stroke
            }));
        } else {
            console.warn('WhiteboardWebSocket is not connected. Draw not sent.');
        }
    }

    sendCursor(x: number, y: number): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'cursor',
                x,
                y
            }));
        }
    }

    sendClear(): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'clear'
            }));
        }
    }

    sendUndo(strokeId: string): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'undo',
                strokeId
            }));
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

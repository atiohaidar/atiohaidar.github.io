import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WhiteboardWebSocketService } from '../services/whiteboardWebSocketService';
import { COLORS } from '../utils/styles';

interface Point {
    x: number;
    y: number;
}

interface Stroke {
    id: string;
    points: Point[];
    color: string;
    width: number;
    userId: string;
    username?: string;
}

interface User {
    userId: string;
    username: string;
    color: string;
}

interface CursorPosition {
    x: number;
    y: number;
    color: string;
    username: string;
}

const WhiteboardPage: React.FC = () => {
    const { whiteboardId } = useParams<{ whiteboardId: string }>();
    const navigate = useNavigate();
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [selectedColor, setSelectedColor] = useState('#FF6B6B');
    const [selectedWidth, setSelectedWidth] = useState(3);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [users, setUsers] = useState<User[]>([]);
    const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
    const [wsService, setWsService] = useState<WhiteboardWebSocketService | null>(null);
    const [userId] = useState(`user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const [username, setUsername] = useState('');
    const [showUsernameModal, setShowUsernameModal] = useState(true);
    const [whiteboard, setWhiteboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas size
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
                redrawCanvas();
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        setCtx(context);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Load whiteboard data
    useEffect(() => {
        if (!whiteboardId) return;

        const loadWhiteboard = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
                const response = await fetch(`${apiUrl}/api/whiteboards/${whiteboardId}`);
                
                if (!response.ok) {
                    throw new Error('Whiteboard not found');
                }
                
                const data = await response.json();
                setWhiteboard(data);

                // Load existing strokes
                const strokesResponse = await fetch(`${apiUrl}/api/whiteboards/${whiteboardId}/strokes`);
                if (strokesResponse.ok) {
                    const strokesData = await strokesResponse.json();
                    const loadedStrokes = strokesData.strokes.map((s: any) => ({
                        ...JSON.parse(s.stroke_data),
                        id: s.id
                    }));
                    setStrokes(loadedStrokes);
                }
            } catch (err) {
                console.error('Failed to load whiteboard:', err);
                alert('Failed to load whiteboard. Redirecting...');
                navigate('/whiteboards');
            } finally {
                setLoading(false);
            }
        };

        loadWhiteboard();
    }, [whiteboardId, navigate]);

    const [joined, setJoined] = useState(false);
    
    // Initialize WebSocket setelah user join
    useEffect(() => {
        if (!joined || !whiteboardId || !username) return;

        console.log('Initializing WebSocket connection for joined user...');
        
        const service = new WhiteboardWebSocketService(
            whiteboardId,
            userId,
            username.trim(),
            selectedColor
        );
        
        // Handler untuk pesan WebSocket
        const handleMessage = (msg: any) => {
            console.log('Received WebSocket message:', msg);
            
            // Validasi pesan
            if (!msg || typeof msg !== 'object') {
                console.warn('Invalid WebSocket message received:', msg);
                return;
            }
            
            if (!msg.type) {
                console.warn('WebSocket message missing type property:', msg);
                return;
            }
            
            switch (msg.type) {
                case 'welcome':
                    console.log('Welcome message received:', msg.users);
                    setUsers(msg.users || []);
                    break;
                case 'user_joined':
                    console.log('User joined:', msg.users);
                    setUsers(msg.users || []);
                    break;
                case 'user_left':
                    console.log('User left:', msg.userId);
                    setUsers(msg.users || []);
                    setCursors(prev => {
                        const newCursors = new Map(prev);
                        newCursors.delete(msg.userId || '');
                        return newCursors;
                    });
                    break;
                case 'draw':
                    console.log('Draw message received:', msg.stroke);
                    if (msg.stroke && msg.userId !== userId) {
                        console.log('Adding stroke to canvas from:', msg.username);
                        setStrokes(prev => [...prev, {
                            ...msg.stroke,
                            userId: msg.userId || '',
                            username: msg.username || 'Anonymous',
                        }]);
                    } else {
                        console.log('Ignoring own stroke or invalid stroke');
                    }
                    break;
                case 'cursor':
                    if (msg.userId !== userId) {
                        setCursors(prev => {
                            const newCursors = new Map(prev);
                            newCursors.set(msg.userId || '', {
                                x: msg.x,
                                y: msg.y,
                                color: msg.color || '#000000',
                                username: msg.username || 'Anonymous',
                            });
                            return newCursors;
                        });
                    }
                    break;
                case 'clear':
                    console.log('Clear message received');
                    setStrokes([]);
                    break;
                case 'undo':
                    if (msg.strokeId) {
                        console.log('Undo message received:', msg.strokeId);
                        setStrokes(prev => prev.filter(s => s.id !== msg.strokeId));
                    }
                    break;
            }
        };
        
        // Simpan service ke state
        setWsService(service);
        
        // Daftarkan handler pesan
        service.onMessage(handleMessage);
        
        console.log('WebSocket service initialized and handler registered');
        
        // Cleanup function
        return () => {
            console.log('Cleaning up WebSocket connection');
            service.offMessage(handleMessage);
            service.disconnect();
        };
    }, [joined, whiteboardId, userId, username, selectedColor]);

    const handleUsernameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;
        
        console.log('Joining whiteboard as:', username);
        setJoined(true);
        setShowUsernameModal(false);
    };

    // Redraw canvas
    const redrawCanvas = useCallback(() => {
        if (!ctx || !canvasRef.current) return;

        const canvas = canvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all strokes
        strokes.forEach(stroke => {
            drawStroke(stroke.points, stroke.color, stroke.width);
        });

        // Draw current stroke
        if (currentStroke.length > 0) {
            drawStroke(currentStroke, tool === 'eraser' ? '#FFFFFF' : selectedColor, selectedWidth);
        }
    }, [ctx, strokes, currentStroke, selectedColor, selectedWidth, tool]);

    useEffect(() => {
        redrawCanvas();
    }, [redrawCanvas]);

    const drawStroke = (points: Point[], color: string, width: number) => {
        if (!ctx || points.length < 2) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.stroke();
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const pos = getMousePos(e);
        setCurrentStroke([pos]);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getMousePos(e);

        // Send cursor position
        if (wsService) {
            wsService.sendCursor(pos.x, pos.y);
        }

        if (!isDrawing) return;

        setCurrentStroke(prev => [...prev, pos]);
    };

    const handleMouseUp = () => {
        if (!isDrawing || currentStroke.length < 2) {
            setIsDrawing(false);
            setCurrentStroke([]);
            return;
        }

        const strokeId = `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newStroke: Stroke = {
            id: strokeId,
            points: currentStroke,
            color: tool === 'eraser' ? '#FFFFFF' : selectedColor,
            width: selectedWidth,
            userId,
            username
        };

        setStrokes(prev => [...prev, newStroke]);

        // Send stroke via WebSocket
        if (wsService) {
            wsService.sendDraw(newStroke);
        }

        setIsDrawing(false);
        setCurrentStroke([]);
    };

    const handleClear = () => {
        if (!confirm('Clear the entire whiteboard?')) return;
        
        setStrokes([]);
        if (wsService) {
            wsService.sendClear();
        }
    };

    const handleUndo = () => {
        if (strokes.length === 0) return;
        
        const lastStroke = strokes[strokes.length - 1];
        setStrokes(prev => prev.slice(0, -1));
        
        if (wsService && lastStroke.userId === userId) {
            wsService.sendUndo(lastStroke.id);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${COLORS.BG_PRIMARY} flex items-center justify-center`}>
                <div className={`text-xl ${COLORS.TEXT_PRIMARY}`}>Loading whiteboard...</div>
            </div>
        );
    }

    return (
        <div className={`h-screen flex flex-col ${COLORS.BG_PRIMARY}`}>
            {/* Header */}
            <div className={`${COLORS.BG_SECONDARY} border-b ${COLORS.BORDER} px-4 py-3`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/whiteboards')}
                            className={`px-3 py-1 rounded ${COLORS.TEXT_SECONDARY} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
                        >
                            ← Back
                        </button>
                        <h1 className={`text-xl font-bold ${COLORS.TEXT_PRIMARY}`}>
                            {whiteboard?.title || 'Whiteboard'}
                        </h1>
                    </div>

                    {/* Users Online */}
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${COLORS.TEXT_SECONDARY}`}>
                            {users.length} user{users.length !== 1 ? 's' : ''} online
                        </span>
                        <div className="flex -space-x-2">
                            {users.slice(0, 5).map((user) => (
                                <div
                                    key={user.userId}
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: user.color }}
                                    title={user.username}
                                >
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className={`${COLORS.BG_SECONDARY} border-b ${COLORS.BORDER} px-4 py-3`}>
                <div className="flex items-center gap-4">
                    {/* Tool Selection */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTool('pen')}
                            className={`px-4 py-2 rounded-lg ${tool === 'pen' ? COLORS.BUTTON_PRIMARY + ' ' + COLORS.TEXT_ON_ACCENT : COLORS.TEXT_SECONDARY + ' hover:bg-black/5 dark:hover:bg-white/10'} transition-colors`}
                        >
                            ✏️ Pen
                        </button>
                        <button
                            onClick={() => setTool('eraser')}
                            className={`px-4 py-2 rounded-lg ${tool === 'eraser' ? COLORS.BUTTON_PRIMARY + ' ' + COLORS.TEXT_ON_ACCENT : COLORS.TEXT_SECONDARY + ' hover:bg-black/5 dark:hover:bg-white/10'} transition-colors`}
                        >
                            🧹 Eraser
                        </button>
                    </div>

                    {/* Color Picker */}
                    <div className="flex gap-2">
                        {colors.map(color => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-gray-800 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600'} transition-transform`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>

                    {/* Width Selector */}
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${COLORS.TEXT_SECONDARY}`}>Size:</span>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={selectedWidth}
                            onChange={(e) => setSelectedWidth(Number(e.target.value))}
                            className="w-24"
                        />
                        <span className={`text-sm ${COLORS.TEXT_SECONDARY} w-8`}>{selectedWidth}px</span>
                    </div>

                    <div className="flex-1" />

                    {/* Actions */}
                    <button
                        onClick={handleUndo}
                        className={`px-4 py-2 rounded-lg ${COLORS.TEXT_SECONDARY} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
                    >
                        ↶ Undo
                    </button>
                    <button
                        onClick={handleClear}
                        className={`px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
                    >
                        🗑️ Clear
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden">
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="absolute inset-0 cursor-crosshair bg-white"
                />
                
                {/* Remote Cursors */}
                {Array.from(cursors.entries()).map(([cursorUserId, cursor]) => (
                    <div
                        key={cursorUserId}
                        className="absolute pointer-events-none"
                        style={{
                            left: cursor.x,
                            top: cursor.y,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: cursor.color }}
                        />
                        <span
                            className="text-xs font-semibold px-2 py-1 rounded ml-2 whitespace-nowrap"
                            style={{
                                backgroundColor: cursor.color,
                                color: 'white'
                            }}
                        >
                            {cursor.username}
                        </span>
                    </div>
                ))}
            </div>

            {/* Username Modal */}
            {showUsernameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className={`${COLORS.BG_SECONDARY} w-full max-w-md rounded-xl border ${COLORS.BORDER} p-6 shadow-2xl`}>
                        <h2 className={`text-2xl font-semibold mb-4 ${COLORS.TEXT_PRIMARY}`}>
                            Enter Your Name
                        </h2>
                        <p className={`${COLORS.TEXT_SECONDARY} mb-6`}>
                            Choose a name to identify yourself on the whiteboard
                        </p>
                        <form onSubmit={handleUsernameSubmit}>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Your name"
                                className={`w-full px-4 py-3 rounded-lg border ${COLORS.BORDER} ${COLORS.BG_PRIMARY} ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-coral-pink mb-4`}
                                required
                                autoFocus
                            />
                            <button
                                type="submit"
                                className={`w-full px-4 py-3 rounded-lg font-semibold ${COLORS.BUTTON_PRIMARY} ${COLORS.TEXT_ON_ACCENT} hover:opacity-90 transition-opacity`}
                            >
                                Join Whiteboard
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhiteboardPage;

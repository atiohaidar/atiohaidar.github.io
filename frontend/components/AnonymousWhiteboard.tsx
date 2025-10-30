import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { webSocketService } from '../services/websocketService';
import { COLORS } from '../utils/styles';

interface Cursor {
    userId: string;
    x: number;
    y: number;
    color: string;
}

interface WhiteboardProps {
    isOpen: boolean;
    onClose: () => void;
}

const AnonymousWhiteboard: React.FC<WhiteboardProps> = ({ isOpen, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState<any[]>([[]]);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(2);
    const [cursors, setCursors] = useState<Map<string, Cursor>>(new Map());
    const [userId] = useState(() => 
        localStorage.getItem('whiteboard_user_id') || 
        `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
    const [isConnected, setIsConnected] = useState(false);

    // User colors for cursor display
    const userColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

    useEffect(() => {
        localStorage.setItem('whiteboard_user_id', userId);
    }, [userId]);

    // Initialize Fabric canvas
    useEffect(() => {
        if (!canvasRef.current || !isOpen) return;

        // Dispose existing canvas if any
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
            isDrawingMode: true,
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
        });

        // Set initial brush properties
        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.color = color;
            canvas.freeDrawingBrush.width = brushSize;
        }

        fabricCanvasRef.current = canvas;

        // Handle drawing events
        canvas.on('path:created', (e: any) => {
            const path = e.path;
            if (!path) return;

            const pathData = path.toJSON();

            // Send drawing data via WebSocket
            if (webSocketService.isConnected) {
                webSocketService.sendMessage({
                    type: 'whiteboard_draw',
                    user_id: userId,
                    page: currentPage,
                    data: pathData,
                });
            }
        });

        // Handle mouse move for cursor tracking
        canvas.on('mouse:move', (e: any) => {
            const pointer = canvas.getPointer(e.e);
            if (webSocketService.isConnected) {
                webSocketService.sendMessage({
                    type: 'whiteboard_cursor',
                    user_id: userId,
                    x: pointer.x,
                    y: pointer.y,
                });
            }
        });

        return () => {
            canvas.dispose();
            fabricCanvasRef.current = null;
        };
    }, [isOpen, userId, currentPage]);

    // Update brush settings
    useEffect(() => {
        if (!fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;
        if (tool === 'pen') {
            canvas.isDrawingMode = true;
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.color = color;
                canvas.freeDrawingBrush.width = brushSize;
            }
        } else if (tool === 'eraser') {
            canvas.isDrawingMode = true;
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.color = '#ffffff';
                canvas.freeDrawingBrush.width = brushSize * 3;
            }
        }
    }, [tool, color, brushSize]);

    // Handle WebSocket messages
    const handleWebSocketMessage = useCallback((data: any) => {
        setIsConnected(true);

        if (data.type === 'whiteboard_draw') {
            // Render drawing from other users
            if (data.user_id !== userId && data.page === currentPage && fabricCanvasRef.current) {
                fabric.util.enlivenObjects([data.data]).then((objects) => {
                    objects.forEach(obj => {
                        fabricCanvasRef.current?.add(obj);
                    });
                    fabricCanvasRef.current?.renderAll();
                });
            }
        } else if (data.type === 'whiteboard_cursor') {
            // Update cursor position
            if (data.user_id !== userId) {
                setCursors(prev => {
                    const newCursors = new Map(prev);
                    const colorIndex = Array.from(newCursors.keys()).indexOf(data.user_id);
                    const userColor = userColors[colorIndex % userColors.length];

                    newCursors.set(data.user_id, {
                        userId: data.user_id,
                        x: data.x,
                        y: data.y,
                        color: userColor,
                    });
                    return newCursors;
                });

                // Remove cursor after 3 seconds of inactivity
                setTimeout(() => {
                    setCursors(prev => {
                        const newCursors = new Map(prev);
                        newCursors.delete(data.user_id);
                        return newCursors;
                    });
                }, 3000);
            }
        } else if (data.type === 'whiteboard_clear_page') {
            if (data.page === currentPage && fabricCanvasRef.current) {
                fabricCanvasRef.current.clear();
                fabricCanvasRef.current.backgroundColor = '#ffffff';
                fabricCanvasRef.current.renderAll();
            }
        } else if (data.type === 'whiteboard_reset') {
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.clear();
                fabricCanvasRef.current.backgroundColor = '#ffffff';
                fabricCanvasRef.current.renderAll();
            }
            setPages([[]]);
            setCurrentPage(0);
        }
    }, [userId, currentPage, userColors]);

    // Setup WebSocket
    useEffect(() => {
        if (isOpen) {
            webSocketService.ensureConnected();
            webSocketService.onMessage(handleWebSocketMessage);
            setIsConnected(webSocketService.isConnected);

            return () => {
                webSocketService.offMessage(handleWebSocketMessage);
            };
        }
    }, [isOpen, handleWebSocketMessage]);

    // Add new page
    const addPage = () => {
        setPages(prev => [...prev, []]);
        setCurrentPage(pages.length);
    };

    // Clear current page
    const clearPage = () => {
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.clear();
            fabricCanvasRef.current.backgroundColor = '#ffffff';
            fabricCanvasRef.current.renderAll();
        }

        if (webSocketService.isConnected) {
            webSocketService.sendMessage({
                type: 'whiteboard_clear_page',
                user_id: userId,
                page: currentPage,
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className={`${COLORS.BG_SECONDARY} rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden`}>
                {/* Header */}
                <div className={`p-3 ${COLORS.BORDER_ACCENT} flex justify-between items-center bg-[#00a884]`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                            🎨
                        </div>
                        <div>
                            <h2 className={`text-base font-medium text-white`}>Papan Tulis Anonim</h2>
                            <p className="text-xs text-white/80 flex items-center gap-2">
                                Halaman {currentPage + 1} dari {pages.length}
                                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                {isConnected ? 'Terhubung' : 'Menghubungkan...'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full text-white hover:bg-white/10 transition-colors`}
                        title="Tutup"
                    >
                        ✕
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-3 bg-gray-800 flex items-center gap-3 flex-wrap border-b border-gray-700">
                    {/* Tool Selection */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTool('pen')}
                            className={`px-3 py-2 rounded ${tool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            ✏️ Pena
                        </button>
                        <button
                            onClick={() => setTool('eraser')}
                            className={`px-3 py-2 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            🧹 Hapus
                        </button>
                    </div>

                    {/* Color Picker */}
                    <div className="flex items-center gap-2">
                        <label className="text-white text-sm">Warna:</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                        />
                    </div>

                    {/* Brush Size */}
                    <div className="flex items-center gap-2">
                        <label className="text-white text-sm">Ukuran:</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-24"
                        />
                        <span className="text-white text-sm">{brushSize}px</span>
                    </div>

                    {/* Page Controls */}
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={clearPage}
                            className="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                            🗑️ Bersihkan
                        </button>
                        <button
                            onClick={addPage}
                            className="px-3 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                        >
                            ➕ Halaman Baru
                        </button>
                    </div>
                </div>

                {/* Canvas Container */}
                <div className="flex-1 overflow-auto bg-gray-900 p-4 flex items-center justify-center relative">
                    <div className="relative">
                        <canvas ref={canvasRef} className="border border-gray-700 shadow-lg" />
                        
                        {/* Render other users' cursors */}
                        {Array.from(cursors.values()).map(cursor => (
                            <div
                                key={cursor.userId}
                                className="absolute pointer-events-none"
                                style={{
                                    left: cursor.x,
                                    top: cursor.y,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div
                                    className="w-4 h-4 rounded-full border-2 border-white"
                                    style={{ backgroundColor: cursor.color }}
                                />
                                <div
                                    className="text-xs text-white bg-black/50 px-2 py-1 rounded mt-1 whitespace-nowrap"
                                    style={{ backgroundColor: cursor.color }}
                                >
                                    {cursor.userId.substring(0, 8)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Page Navigation */}
                {pages.length > 1 && (
                    <div className="p-3 bg-gray-800 flex items-center justify-center gap-2 border-t border-gray-700">
                        {pages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(index)}
                                className={`px-3 py-1 rounded ${currentPage === index ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnonymousWhiteboard;

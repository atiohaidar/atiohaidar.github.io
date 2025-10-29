import React, { useState, useEffect } from 'react';
import { DASHBOARD_THEME } from '../utils/styles';
import { useTheme } from '../contexts/ThemeContext';
import { getStoredUser } from '../apiClient';
import GroupManagementModal from '../components/GroupManagementModal';
import {
    getConversations,
    getGroups,
    getConversationMessages,
    getGroupMessages,
    getOrCreateConversation,
    sendMessage,
    type Conversation,
    type GroupChat,
    type Message,
} from '../services/chatService';

interface ChatPageProps {}

const ChatPage: React.FC<ChatPageProps> = () => {
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];
    const user = getStoredUser();

    const [activeTab, setActiveTab] = useState<'direct' | 'group'>('direct');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [groups, setGroups] = useState<GroupChat[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [chatType, setChatType] = useState<'conversation' | 'group' | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageContent, setMessageContent] = useState('');
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGroupManagementOpen, setIsGroupManagementOpen] = useState(false);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [newChatUsername, setNewChatUsername] = useState('');
    const [newChatLoading, setNewChatLoading] = useState(false);
    const [newChatError, setNewChatError] = useState<string | null>(null);
    const [isMobileChatListOpen, setIsMobileChatListOpen] = useState(true);

    useEffect(() => {
        loadChats();
    }, [activeTab]);

    useEffect(() => {
        if (selectedChat) {
            loadMessages();
        }
    }, [selectedChat, chatType]);

    const loadChats = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'direct') {
                const data = await getConversations();
                setConversations(data);
            } else {
                const data = await getGroups();
                setGroups(data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (options?: { id: string; type: 'conversation' | 'group' }) => {
        const targetId = options?.id ?? selectedChat;
        const targetType = options?.type ?? chatType;
        if (!targetId || !targetType) return;

        setLoading(true);
        setError(null);
        try {
            let data: Message[];
            if (targetType === 'conversation') {
                data = await getConversationMessages(targetId);
            } else {
                data = await getGroupMessages(targetId);
            }
            setMessages(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageContent.trim() || !selectedChat || !chatType) return;

        setError(null);
        try {
            const data: any = {
                content: messageContent.trim(),
            };

            if (chatType === 'conversation') {
                data.conversation_id = selectedChat;
            } else {
                data.group_id = selectedChat;
            }

            if (replyTo) {
                data.reply_to_id = replyTo.id;
            }

            await sendMessage(data);
            setMessageContent('');
            setReplyTo(null);
            await loadMessages();
        } catch (err: any) {
            setError(err.message || 'Failed to send message');
        }
    };

    const selectChat = (id: string, type: 'conversation' | 'group') => {
        setSelectedChat(id);
        setChatType(type);
        setMessages([]);
        setReplyTo(null);
        setIsMobileChatListOpen(false); // Close mobile chat list when selecting a chat
    };

    const handleReply = (message: Message) => {
        setReplyTo(message);
    };

    const cancelReply = () => {
        setReplyTo(null);
    };

    const getChatName = () => {
        if (!selectedChat || !chatType) return '';
        if (chatType === 'conversation') {
            const conv = conversations.find(c => c.id === selectedChat);
            return conv?.other_name || conv?.other_username || '';
        } else {
            const group = groups.find(g => g.id === selectedChat);
            return group?.name || '';
        }
    };

    const openNewChatModal = () => {
        setNewChatUsername('');
        setNewChatError(null);
        setIsNewChatModalOpen(true);
    };

    const closeNewChatModal = () => {
        if (newChatLoading) return;
        setIsNewChatModalOpen(false);
        setNewChatUsername('');
        setNewChatError(null);
    };

    const handleStartNewChat = async () => {
        if (!user) {
            setNewChatError('Pengguna tidak ditemukan. Silakan login ulang.');
            return;
        }

        const target = newChatUsername.trim();
        if (!target) {
            setNewChatError('Username wajib diisi');
            return;
        }

        if (target.toLowerCase() === user.username.toLowerCase()) {
            setNewChatError('Tidak dapat memulai chat dengan diri sendiri');
            return;
        }

        setNewChatLoading(true);
        setNewChatError(null);

        try {
            const conversation = await getOrCreateConversation(target);
            const otherUsername = conversation.user1_username === user.username
                ? conversation.user2_username
                : conversation.user1_username;

            const enrichedConversation: Conversation = {
                ...conversation,
                other_username: otherUsername,
                other_name: conversation.other_name ?? otherUsername,
            };

            setActiveTab('direct');
            setConversations((prev) => {
                const filtered = prev.filter((item) => item.id !== enrichedConversation.id);
                return [enrichedConversation, ...filtered];
            });

            setSelectedChat(enrichedConversation.id);
            setChatType('conversation');
            setMessages([]);

            await loadMessages({ id: enrichedConversation.id, type: 'conversation' });

            setIsNewChatModalOpen(false);
            setNewChatUsername('');
        } catch (err: any) {
            const rawMessage = err?.message || 'Gagal memulai percakapan';
            if (rawMessage.includes('Cannot create conversation with yourself')) {
                setNewChatError('Tidak dapat memulai chat dengan diri sendiri');
            } else if (rawMessage.includes('not found') || rawMessage.includes('tidak ditemukan')) {
                setNewChatError('Username tidak ditemukan');
            } else {
                setNewChatError(rawMessage);
            }
        } finally {
            setNewChatLoading(false);
        }
    };

    return (
        <div className={`flex-1 min-h-0 h-full flex flex-col md:flex-row ${palette.surface} rounded-lg shadow-lg`}>
            {/* Chat List Sidebar */}
            <div className={`${isMobileChatListOpen ? 'flex' : 'hidden'} md:flex w-full md:w-80 ${palette.sidebar.bg} ${palette.sidebar.border} flex-col min-h-0`}>
                {/* Tabs */}
                <div className={`flex ${palette.sidebar.border}`}>
                    <button
                        className={`flex-1 py-3 px-4 font-medium transition-colors ${
                            activeTab === 'direct'
                                ? `${theme === 'dark' ? 'bg-[#111b21] text-[#00a884]' : 'bg-white text-[#00a884]'} border-b-2 border-[#00a884]`
                                : `${palette.sidebar.textMuted} hover:${palette.sidebar.hover}`
                        }`}
                        onClick={() => setActiveTab('direct')}
                    >
                        💬 Chat Langsung
                    </button>
                    <button
                        className={`flex-1 py-3 px-4 font-medium transition-colors ${
                            activeTab === 'group'
                                ? `${theme === 'dark' ? 'bg-[#111b21] text-[#00a884]' : 'bg-white text-[#00a884]'} border-b-2 border-[#00a884]`
                                : `${palette.sidebar.textMuted} hover:${palette.sidebar.hover}`
                        }`}
                        onClick={() => setActiveTab('group')}
                    >
                        👥 Grup
                    </button>
                </div>

                {/* Refresh Button */}
                <div className="p-3 space-y-2">
                    <button
                        onClick={loadChats}
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-lg bg-[#00a884] text-white hover:bg-[#008069] transition-colors disabled:opacity-50`}
                    >
                        {loading ? '⟳ Memuat ulang...' : '🔄 Muat Ulang'}
                    </button>
                    <button
                        onClick={openNewChatModal}
                        className={`w-full py-2 px-4 rounded-lg ${theme === 'dark' ? 'bg-[#2a3942] text-white hover:bg-[#374850]' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors`}
                    >
                        ➕ Chat Baru
                    </button>
                    {activeTab === 'group' && (
                        <button
                            onClick={() => setIsGroupManagementOpen(true)}
                            className={`w-full py-2 px-4 rounded-lg ${theme === 'dark' ? 'bg-[#2a3942] text-white hover:bg-[#374850]' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors`}
                        >
                            ⚙️ Kelola Grup
                        </button>
                    )}
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'direct' ? (
                        <div>
                            {conversations.length === 0 ? (
                                <div className={`p-4 text-center ${palette.sidebar.textMuted}`}>
                                    Belum ada percakapan
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        className={`p-3 cursor-pointer transition-colors ${palette.sidebar.border} flex items-center gap-3 ${
                                            selectedChat === conv.id && chatType === 'conversation'
                                                ? palette.sidebar.active
                                                : `hover:${palette.sidebar.hover}`
                                        }`}
                                        onClick={() => selectChat(conv.id, 'conversation')}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${theme === 'dark' ? 'bg-[#2a3942]' : 'bg-gray-400'}`}>
                                            {(conv.other_name || conv.other_username).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{conv.other_name || conv.other_username}</div>
                                            {conv.last_message && (
                                                <div className={`text-sm ${palette.sidebar.textMuted} truncate`}>
                                                    {conv.last_message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div>
                            {groups.length === 0 ? (
                                <div className={`p-4 text-center ${palette.sidebar.textMuted}`}>
                                    Belum ada grup
                                </div>
                            ) : (
                                groups.map((group) => (
                                    <div
                                        key={group.id}
                                        className={`p-3 cursor-pointer transition-colors ${palette.sidebar.border} flex items-center gap-3 ${
                                            selectedChat === group.id && chatType === 'group'
                                                ? palette.sidebar.active
                                                : `hover:${palette.sidebar.hover}`
                                        }`}
                                        onClick={() => selectChat(group.id, 'group')}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${theme === 'dark' ? 'bg-[#2a3942]' : 'bg-gray-400'}`}>
                                            👥
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{group.name}</div>
                                            <div className={`text-sm ${palette.sidebar.textMuted}`}>
                                                {group.member_count} anggota
                                            </div>
                                            {group.last_message && (
                                                <div className={`text-sm ${palette.sidebar.textMuted} truncate`}>
                                                    {group.last_message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${!isMobileChatListOpen || !selectedChat ? 'flex' : 'hidden'} md:flex flex-1 min-h-0 flex-col overflow-hidden`}>
                {selectedChat && chatType ? (
                    <>
                        {/* Chat Header */}
                        <div className={`flex-shrink-0 p-3 ${palette.sidebar.border} flex justify-between items-center ${theme === 'dark' ? 'bg-[#1f2c34]' : 'bg-[#f0f2f5]'}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                    onClick={() => setIsMobileChatListOpen(true)}
                                    className="md:hidden text-xl"
                                >
                                    ←
                                </button>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${theme === 'dark' ? 'bg-[#2a3942]' : 'bg-gray-400'}`}>
                                    {chatType === 'group' ? '👥' : getChatName().charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base font-medium truncate">{getChatName()}</h2>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {chatType === 'group' ? 'Grup chat' : 'Online'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => loadMessages()}
                                disabled={loading}
                                className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'} transition-colors disabled:opacity-50`}
                                title="Muat ulang pesan"
                            >
                                {loading ? '⟳' : '🔄'}
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-2" style={{ backgroundColor: theme === 'dark' ? '#0a1014' : '#e5ddd5' }}>
                            {error && (
                                <div className="bg-red-500 text-white p-3 rounded">
                                    {error}
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_username === user?.username ? 'justify-end' : 'justify-start'} mb-1`}
                                >
                                    <div className="flex flex-col max-w-[70%] md:max-w-md">
                                        {msg.sender_username !== user?.username && chatType === 'group' && (
                                            <div className={`text-xs font-medium mb-1 ml-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {msg.sender_name}
                                            </div>
                                        )}
                                        <div
                                            className={`relative p-2 px-3 shadow-sm ${
                                                msg.sender_username === user?.username
                                                    ? 'bg-[#005c4b] text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                                                    : theme === 'dark' ? 'bg-[#1f2c34] text-gray-100 rounded-tl-lg rounded-tr-lg rounded-br-lg' : 'bg-white text-gray-900 rounded-tl-lg rounded-tr-lg rounded-br-lg'
                                            }`}
                                        >
                                            {msg.reply_to_id && msg.reply_content && (
                                                <div className={`text-xs p-2 mb-2 rounded border-l-4 ${msg.sender_username === user?.username ? 'bg-[#004a3d] border-[#00a884]' : theme === 'dark' ? 'bg-[#182229] border-[#00a884]' : 'bg-gray-100 border-[#00a884]'}`}>
                                                    <div className="font-medium text-[#00a884]">{msg.reply_sender_name}</div>
                                                    <div className="truncate opacity-80">{msg.reply_content}</div>
                                                </div>
                                            )}
                                            <div className="break-words">{msg.content}</div>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[10px] opacity-60">
                                                    {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        {msg.sender_username !== user?.username && (
                                            <button
                                                onClick={() => handleReply(msg)}
                                                className={`text-[10px] mt-1 ml-3 hover:underline ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                                            >
                                                Balas
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className={`flex-shrink-0 p-3 ${palette.sidebar.border}`} style={{ backgroundColor: theme === 'dark' ? '#1f2c34' : '#f0f2f5' }}>
                            {replyTo && (
                                <div className={`mb-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-[#2a3942]' : 'bg-white'} flex justify-between items-start border-l-4 border-[#00a884]`}>
                                    <div className="flex-1">
                                        <div className="text-xs font-medium text-[#00a884]">Membalas {replyTo.sender_name}</div>
                                        <div className="text-sm truncate opacity-80">{replyTo.content}</div>
                                    </div>
                                    <button
                                        onClick={cancelReply}
                                        className="ml-2 text-gray-400 hover:text-red-500"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Ketik pesan..."
                                    className={`flex-1 px-4 py-3 rounded-full ${theme === 'dark' ? 'bg-[#2a3942] text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-[#00a884] focus:outline-none`}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!messageContent.trim() || loading}
                                    className={`p-3 rounded-full bg-[#00a884] text-white hover:bg-[#008069] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                    title="Kirim"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#0a1014' : '#e5ddd5' }}>
                        <div className={`text-center ${palette.sidebar.textMuted}`}>
                            <div className="text-6xl mb-4">💬</div>
                            <div className="text-lg font-medium mb-2">Chattingan</div>
                            <div className="text-sm opacity-70">Pilih percakapan untuk mulai mengirim pesan</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Group Management Modal */}
            <GroupManagementModal
                isOpen={isGroupManagementOpen}
                onClose={() => setIsGroupManagementOpen(false)}
                onGroupCreated={() => {
                    loadChats();
                }}
            />

            {isNewChatModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`${palette.surface} rounded-lg shadow-2xl max-w-md w-full`}
                    >
                        <div className={`p-4 ${palette.sidebar.border} flex justify-between items-center`}>
                            <h2 className="text-lg font-semibold">Mulai Percakapan Baru</h2>
                            <button
                                onClick={closeNewChatModal}
                                className="text-2xl leading-none hover:text-red-500"
                                aria-label="Tutup"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Username Tujuan</label>
                                <input
                                    type="text"
                                    value={newChatUsername}
                                    onChange={(e) => setNewChatUsername(e.target.value)}
                                    placeholder="Masukkan username pengguna"
                                    className={`w-full px-4 py-2 rounded ${palette.input} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                                />
                            </div>
                            {newChatError && (
                                <div className="text-sm text-red-500">
                                    {newChatError}
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={closeNewChatModal}
                                    disabled={newChatLoading}
                                    className={`px-4 py-2 rounded ${palette.buttons?.ghost ?? 'border border-gray-300 text-gray-600 hover:border-accent-blue hover:text-accent-blue'} disabled:opacity-50`}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleStartNewChat}
                                    disabled={newChatLoading}
                                    className={`px-4 py-2 rounded ${palette.button.primary} text-white hover:opacity-90 transition-opacity disabled:opacity-50`}
                                >
                                    {newChatLoading ? 'Memulai...' : 'Mulai Chat'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;

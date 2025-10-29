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
        <div className={`h-full flex ${palette.surface} rounded-lg shadow-lg`}>
            {/* Chat List Sidebar */}
            <div className={`w-80 ${palette.sidebar.bg} ${palette.sidebar.border} flex flex-col`}>
                {/* Tabs */}
                <div className={`flex ${palette.sidebar.border}`}>
                    <button
                        className={`flex-1 py-3 px-4 font-medium transition-colors ${
                            activeTab === 'direct'
                                ? `${palette.button.primary} text-white`
                                : `${palette.sidebar.textMuted} hover:${palette.sidebar.hover}`
                        }`}
                        onClick={() => setActiveTab('direct')}
                    >
                        💬 Direct Chats
                    </button>
                    <button
                        className={`flex-1 py-3 px-4 font-medium transition-colors ${
                            activeTab === 'group'
                                ? `${palette.button.primary} text-white`
                                : `${palette.sidebar.textMuted} hover:${palette.sidebar.hover}`
                        }`}
                        onClick={() => setActiveTab('group')}
                    >
                        👥 Groups
                    </button>
                </div>

                {/* Refresh Button */}
                <div className="p-3 space-y-2">
                    <button
                        onClick={loadChats}
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded ${palette.button.primary} text-white hover:opacity-90 transition-opacity disabled:opacity-50`}
                    >
                        {loading ? '⟳ Refreshing...' : '🔄 Refresh'}
                    </button>
                    <button
                        onClick={openNewChatModal}
                        className={`w-full py-2 px-4 rounded ${palette.button.secondary} hover:opacity-90 transition-opacity`}
                    >
                        ➕ Start New Chat
                    </button>
                    {activeTab === 'group' && (
                        <button
                            onClick={() => setIsGroupManagementOpen(true)}
                            className={`w-full py-2 px-4 rounded ${palette.button.secondary} hover:opacity-90 transition-opacity`}
                        >
                            ⚙️ Manage Groups
                        </button>
                    )}
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'direct' ? (
                        <div>
                            {conversations.length === 0 ? (
                                <div className={`p-4 text-center ${palette.sidebar.textMuted}`}>
                                    No conversations yet
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        className={`p-4 cursor-pointer transition-colors ${palette.sidebar.border} ${
                                            selectedChat === conv.id && chatType === 'conversation'
                                                ? palette.sidebar.active
                                                : `hover:${palette.sidebar.hover}`
                                        }`}
                                        onClick={() => selectChat(conv.id, 'conversation')}
                                    >
                                        <div className="font-medium">{conv.other_name || conv.other_username}</div>
                                        {conv.last_message && (
                                            <div className={`text-sm ${palette.sidebar.textMuted} truncate`}>
                                                {conv.last_message}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div>
                            {groups.length === 0 ? (
                                <div className={`p-4 text-center ${palette.sidebar.textMuted}`}>
                                    No groups yet
                                </div>
                            ) : (
                                groups.map((group) => (
                                    <div
                                        key={group.id}
                                        className={`p-4 cursor-pointer transition-colors ${palette.sidebar.border} ${
                                            selectedChat === group.id && chatType === 'group'
                                                ? palette.sidebar.active
                                                : `hover:${palette.sidebar.hover}`
                                        }`}
                                        onClick={() => selectChat(group.id, 'group')}
                                    >
                                        <div className="font-medium">{group.name}</div>
                                        <div className={`text-sm ${palette.sidebar.textMuted}`}>
                                            {group.member_count} members
                                        </div>
                                        {group.last_message && (
                                            <div className={`text-sm ${palette.sidebar.textMuted} truncate`}>
                                                {group.last_message}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedChat && chatType ? (
                    <>
                        {/* Chat Header */}
                        <div className={`p-4 ${palette.sidebar.border} flex justify-between items-center`}>
                            <h2 className="text-xl font-bold">{getChatName()}</h2>
                            <button
                                onClick={() => loadMessages()}
                                disabled={loading}
                                className={`py-1 px-3 rounded ${palette.button.secondary} hover:opacity-90 transition-opacity disabled:opacity-50`}
                            >
                                {loading ? '⟳' : '🔄'}
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {error && (
                                <div className="bg-red-500 text-white p-3 rounded">
                                    {error}
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_username === user?.username ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-md p-3 rounded-lg ${
                                            msg.sender_username === user?.username
                                                ? `${palette.button.primary} text-white`
                                                : palette.surface
                                        }`}
                                    >
                                        {msg.sender_username !== user?.username && (
                                            <div className="font-medium text-sm mb-1">{msg.sender_name}</div>
                                        )}
                                        {msg.reply_to_id && msg.reply_content && (
                                            <div className={`text-xs p-2 mb-2 rounded ${msg.sender_username === user?.username ? 'bg-black bg-opacity-20' : 'bg-gray-200'}`}>
                                                <div className="font-medium">{msg.reply_sender_name}</div>
                                                <div className="truncate">{msg.reply_content}</div>
                                            </div>
                                        )}
                                        <div>{msg.content}</div>
                                        <div className="text-xs mt-1 opacity-70">
                                            {new Date(msg.created_at).toLocaleTimeString()}
                                        </div>
                                        {msg.sender_username !== user?.username && (
                                            <button
                                                onClick={() => handleReply(msg)}
                                                className="text-xs mt-1 hover:underline"
                                            >
                                                Reply
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className={`p-4 ${palette.sidebar.border}`}>
                            {replyTo && (
                                <div className={`mb-2 p-2 rounded ${palette.surface} flex justify-between items-start`}>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Replying to {replyTo.sender_name}</div>
                                        <div className="text-sm truncate">{replyTo.content}</div>
                                    </div>
                                    <button
                                        onClick={cancelReply}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-2">
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
                                    placeholder="Type a message..."
                                    className={`flex-1 px-4 py-2 rounded ${palette.input} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!messageContent.trim() || loading}
                                    className={`py-2 px-6 rounded ${palette.button.primary} text-white hover:opacity-90 transition-opacity disabled:opacity-50`}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className={`text-center ${palette.sidebar.textMuted}`}>
                            <div className="text-4xl mb-4">💬</div>
                            <div>Select a chat to start messaging</div>
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

import React, { useState, useEffect } from 'react';
import { getStoredUser } from '../apiClient';
import {
    createGroup,
    getGroups,
    getGroupMembers,
    addGroupMember,
    removeGroupMember,
    updateMemberRole,
    deleteGroup,
    type GroupChat,
    type GroupMember,
} from '../services/chatService';
import { Card, Button, Input, Select, Heading, Typography, Text } from './ui';
import { COLORS } from '../utils/styles';

interface GroupManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGroupCreated?: () => void;
}

const GroupManagementModal: React.FC<GroupManagementModalProps> = ({ isOpen, onClose, onGroupCreated }) => {
    const user = getStoredUser();

    const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
    const [groups, setGroups] = useState<GroupChat[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create group form
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');

    // Add member form
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member');

    useEffect(() => {
        if (isOpen && activeTab === 'manage') {
            loadGroups();
        }
    }, [isOpen, activeTab]);

    useEffect(() => {
        if (selectedGroup) {
            loadMembers();
        }
    }, [selectedGroup]);

    const loadGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getGroups();
            const adminGroups = data.filter(g => g.user_role === 'admin');
            setGroups(adminGroups);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat grup');
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async () => {
        if (!selectedGroup) return;

        setLoading(true);
        setError(null);
        try {
            const data = await getGroupMembers(selectedGroup);
            setMembers(data);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat anggota');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            setError('Nama grup wajib diisi');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await createGroup({
                name: groupName.trim(),
                description: groupDescription.trim() || undefined,
            });
            setGroupName('');
            setGroupDescription('');
            if (onGroupCreated) {
                onGroupCreated();
            }
            setActiveTab('manage');
            await loadGroups();
        } catch (err: any) {
            setError(err.message || 'Gagal membuat grup');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!selectedGroup || !newMemberUsername.trim()) {
            setError('Username wajib diisi');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await addGroupMember(selectedGroup, {
                user_username: newMemberUsername.trim(),
                role: newMemberRole,
            });
            setNewMemberUsername('');
            setNewMemberRole('member');
            await loadMembers();
        } catch (err: any) {
            setError(err.message || 'Gagal menambah anggota');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (username: string) => {
        if (!selectedGroup) return;

        if (!confirm(`Apakah Anda yakin ingin menghapus ${username}?`)) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await removeGroupMember(selectedGroup, username);
            await loadMembers();
        } catch (err: any) {
            setError(err.message || 'Gagal menghapus anggota');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (username: string, newRole: 'admin' | 'member') => {
        if (!selectedGroup) return;

        setLoading(true);
        setError(null);
        try {
            await updateMemberRole(selectedGroup, username, newRole);
            await loadMembers();
        } catch (err: any) {
            setError(err.message || 'Gagal memperbarui peran');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!selectedGroup) return;

        const group = groups.find(g => g.id === selectedGroup);
        if (!confirm(`Apakah Anda yakin ingin menghapus grup "${group?.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await deleteGroup(selectedGroup);
            setSelectedGroup(null);
            setMembers([]);
            await loadGroups();
        } catch (err: any) {
            setError(err.message || 'Gagal menghapus grup');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card variant="glass" className="max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
                {/* Tape deco */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-blue-100/40 dark:bg-blue-900/10 rotate-1 z-20"></div>

                {/* Header */}
                <div className={`p-6 border-b-2 border-dashed ${COLORS.BORDER} flex justify-between items-center bg-white/40 dark:bg-black/20`}>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">👥</span>
                        <Heading level={2} className={`${COLORS.TEXT_PRIMARY}`}>Manajemen Grup</Heading>
                    </div>
                    <button
                        onClick={onClose}
                        className={`${COLORS.TEXT_SECONDARY} hover:text-red-500 text-2xl p-1 transition-colors`}
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex border-b-2 border-dashed ${COLORS.BORDER} bg-white/20 dark:bg-black/10`}>
                    <button
                        className={`flex-1 py-4 px-6 font-patrick text-xl font-bold transition-all relative ${activeTab === 'create'
                            ? `${COLORS.TEXT_PRIMARY}`
                            : `${COLORS.TEXT_SECONDARY} opacity-50 hover:opacity-80`
                            }`}
                        onClick={() => setActiveTab('create')}
                    >
                        Buat Grup Baru
                        {activeTab === 'create' && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500/50"></div>
                        )}
                    </button>
                    <button
                        className={`flex-1 py-4 px-6 font-patrick text-xl font-bold transition-all relative ${activeTab === 'manage'
                            ? `${COLORS.TEXT_PRIMARY}`
                            : `${COLORS.TEXT_SECONDARY} opacity-50 hover:opacity-80`
                            }`}
                        onClick={() => setActiveTab('manage')}
                    >
                        Kelola Grup Anda
                        {activeTab === 'manage' && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500/50"></div>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 notebook-lines">
                    {error && (
                        <div className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-dashed border-red-300 rounded-xl flex items-center gap-3 transform -rotate-1">
                            <span className="text-xl">⚠️</span>
                            <Typography variant="body" className="text-red-800 dark:text-red-200 font-bold font-patrick">{error}</Typography>
                        </div>
                    )}

                    {activeTab === 'create' ? (
                        <div className="max-w-xl mx-auto space-y-6 py-4">
                            <Input
                                label="Nama Grup *"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Misal: Tim Sukses"
                                fullWidth
                                variant="glass"
                                className="font-patrick text-lg"
                            />

                            <div className="space-y-1">
                                <label className={`block text-sm font-bold font-patrick mb-1 ${COLORS.TEXT_PRIMARY}`}>
                                    Deskripsi (Opsional)
                                </label>
                                <textarea
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    placeholder="Jelaskan tujuan grup ini..."
                                    rows={4}
                                    className={`w-full px-4 py-3 rounded-xl border-2 border-dashed ${COLORS.BORDER} bg-white/50 dark:bg-black/20 ${COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-patrick text-lg`}
                                />
                            </div>

                            <Button
                                onClick={handleCreateGroup}
                                disabled={!groupName.trim() || loading}
                                isLoading={loading}
                                fullWidth
                                size="lg"
                                className="font-patrick text-xl transform hover:-rotate-1 shadow-md"
                            >
                                Buat Grup Sekarang ✨
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groups.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center gap-4 opacity-50">
                                    <span className="text-6xl grayscale">🏜️</span>
                                    <Typography variant="h4" className={`${COLORS.TEXT_SECONDARY} font-caveat`}>
                                        Anda belum mengelola grup apapun.
                                    </Typography>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-8 items-start">
                                    {/* Group List */}
                                    <div className="space-y-4">
                                        <Heading level={3} className={`${COLORS.TEXT_PRIMARY} border-b-2 border-dashed ${COLORS.BORDER} pb-2 font-caveat text-3xl`}>
                                            Daftar Grup
                                        </Heading>
                                        <div className="space-y-3">
                                            {groups.map((group) => (
                                                <div
                                                    key={group.id}
                                                    className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer transform hover:scale-[1.02] ${selectedGroup === group.id
                                                        ? 'bg-blue-50/80 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 -rotate-1 shadow-sm'
                                                        : `bg-white/40 dark:bg-black/20 ${COLORS.BORDER} hover:border-blue-200 dark:hover:border-blue-800`
                                                        }`}
                                                    onClick={() => setSelectedGroup(group.id)}
                                                >
                                                    <div className="font-patrick text-xl font-bold">{group.name}</div>
                                                    <div className={`${COLORS.TEXT_SECONDARY} text-sm font-patrick italic opacity-70`}>
                                                        {group.member_count} anggota aktif
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Group Members */}
                                    <div className="space-y-4">
                                        {selectedGroup ? (
                                            <>
                                                <div className="flex justify-between items-center border-b-2 border-dashed ${COLORS.BORDER} pb-2">
                                                    <Heading level={3} className={`${COLORS.TEXT_PRIMARY} font-caveat text-3xl`}>
                                                        Anggota
                                                    </Heading>
                                                    <button
                                                        onClick={handleDeleteGroup}
                                                        className="text-sm font-patrick font-bold text-red-500 hover:text-red-700 underline decoration-dashed transition-colors"
                                                    >
                                                        Hapus Grup
                                                    </button>
                                                </div>

                                                {/* Add Member Form */}
                                                <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-black/40 border-2 border-dashed ${COLORS.BORDER} space-y-4">
                                                    <div className="font-patrick font-bold text-blue-600 dark:text-blue-400">Tambah Anggota Baru</div>
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <div className="flex-1">
                                                            <Input
                                                                value={newMemberUsername}
                                                                onChange={(e) => setNewMemberUsername(e.target.value)}
                                                                placeholder="Username"
                                                                variant="glass"
                                                                className="font-patrick py-1 h-10"
                                                            />
                                                        </div>
                                                        <div className="w-full sm:w-32">
                                                            <Select
                                                                options={[
                                                                    { label: 'Member', value: 'member' },
                                                                    { label: 'Admin', value: 'admin' },
                                                                ]}
                                                                value={newMemberRole}
                                                                onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'member')}
                                                                className="font-patrick h-10 py-1"
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={handleAddMember}
                                                        disabled={!newMemberUsername.trim() || loading}
                                                        isLoading={loading}
                                                        size="sm"
                                                        fullWidth
                                                        className="font-patrick"
                                                    >
                                                        Tambah ➕
                                                    </Button>
                                                </div>

                                                {/* Members List */}
                                                <div className="space-y-3 pt-2">
                                                    {members.map((member) => (
                                                        <div
                                                            key={member.user_username}
                                                            className={`p-4 rounded-xl bg-white/60 dark:bg-black/30 border-2 border-dashed ${COLORS.BORDER} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">👤</div>
                                                                <div>
                                                                    <div className="font-patrick font-bold text-lg">{member.name}</div>
                                                                    <div className={`${COLORS.TEXT_SECONDARY} text-sm font-mono opacity-60`}>
                                                                        @{member.user_username}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                                <div className="flex-1 sm:w-28">
                                                                    <Select
                                                                        options={[
                                                                            { label: 'Member', value: 'member' },
                                                                            { label: 'Admin', value: 'admin' },
                                                                        ]}
                                                                        value={member.role}
                                                                        onChange={(e) => handleUpdateRole(member.user_username, e.target.value as 'admin' | 'member')}
                                                                        disabled={member.user_username === user?.username}
                                                                        className="font-patrick h-9 py-0 text-sm"
                                                                    />
                                                                </div>
                                                                {member.user_username !== user?.username && (
                                                                    <button
                                                                        onClick={() => handleRemoveMember(member.user_username)}
                                                                        className="text-red-500 hover:text-red-700 text-sm font-bold font-patrick p-1"
                                                                        title="Hapus Anggota"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-12 flex flex-col items-center gap-4 opacity-50">
                                                <span className="text-4xl">👆</span>
                                                <Typography variant="h4" className={`${COLORS.TEXT_SECONDARY} font-caveat`}>
                                                    Pilih grup untuk mengelola anggota
                                                </Typography>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default GroupManagementModal;


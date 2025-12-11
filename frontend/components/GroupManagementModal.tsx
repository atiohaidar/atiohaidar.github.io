import React, { useState, useEffect } from 'react';
import { DASHBOARD_THEME } from '../utils/styles';
import { useTheme } from '../contexts/ThemeContext';
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

interface GroupManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGroupCreated?: () => void;
}

const GroupManagementModal: React.FC<GroupManagementModalProps> = ({ isOpen, onClose, onGroupCreated }) => {
    const { theme } = useTheme();
    const palette = DASHBOARD_THEME[theme];
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
            // Filter to only show groups where user is admin
            const adminGroups = data.filter(g => g.user_role === 'admin');
            setGroups(adminGroups);
        } catch (err: any) {
            setError(err.message || 'Failed to load groups');
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
            setError(err.message || 'Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            setError('Group name is required');
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
            setError(err.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!selectedGroup || !newMemberUsername.trim()) {
            setError('Username is required');
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
            setError(err.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (username: string) => {
        if (!selectedGroup) return;

        if (!confirm(`Are you sure you want to remove ${username}?`)) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await removeGroupMember(selectedGroup, username);
            await loadMembers();
        } catch (err: any) {
            setError(err.message || 'Failed to remove member');
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
            setError(err.message || 'Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!selectedGroup) return;

        const group = groups.find(g => g.id === selectedGroup);
        if (!confirm(`Are you sure you want to delete the group "${group?.name}"? This action cannot be undone.`)) {
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
            setError(err.message || 'Failed to delete group');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`${palette.surface} rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col`}>
                {/* Header */}
                <div className={`p-4 ${palette.sidebar.border} flex justify-between items-center`}>
                    <h2 className="text-xl font-bold">👥 Group Management</h2>
                    <button
                        onClick={onClose}
                        className="hover:text-red-500 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex ${palette.sidebar.border}`}>
                    <button
                        className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'create'
                                ? `${palette.button.primary} text-white`
                                : `${palette.sidebar.textMuted} hover:${palette.sidebar.hover}`
                            }`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create Group
                    </button>
                    <button
                        className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'manage'
                                ? `${palette.button.primary} text-white`
                                : `${palette.sidebar.textMuted} hover:${palette.sidebar.hover}`
                            }`}
                        onClick={() => setActiveTab('manage')}
                    >
                        Manage Groups
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {error && (
                        <div className={`${palette.badges.danger} p-3 rounded mb-4`}>
                            {error}
                        </div>
                    )}

                    {activeTab === 'create' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 font-medium">Group Name *</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Enter group name"
                                    className={`w-full px-4 py-2 rounded ${palette.input} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Description (Optional)</label>
                                <textarea
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    placeholder="Enter group description"
                                    rows={3}
                                    className={`w-full px-4 py-2 rounded ${palette.input} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                                />
                            </div>
                            <button
                                onClick={handleCreateGroup}
                                disabled={!groupName.trim() || loading}
                                className={`w-full py-2 px-4 rounded ${palette.button.primary} text-white hover:opacity-90 transition-opacity disabled:opacity-50`}
                            >
                                {loading ? 'Creating...' : 'Create Group'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {groups.length === 0 ? (
                                <div className={`text-center py-8 ${palette.sidebar.textMuted}`}>
                                    You don't manage any groups yet. Create one to get started!
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Group List */}
                                    <div>
                                        <h3 className="font-bold mb-3">Your Groups</h3>
                                        <div className="space-y-2">
                                            {groups.map((group) => (
                                                <div
                                                    key={group.id}
                                                    className={`p-3 rounded cursor-pointer transition-colors ${selectedGroup === group.id
                                                            ? palette.sidebar.active
                                                            : `${palette.surface} hover:${palette.sidebar.hover}`
                                                        }`}
                                                    onClick={() => setSelectedGroup(group.id)}
                                                >
                                                    <div className="font-medium">{group.name}</div>
                                                    <div className={`text-sm ${palette.sidebar.textMuted}`}>
                                                        {group.member_count} members
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Group Members */}
                                    <div>
                                        {selectedGroup ? (
                                            <>
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-bold">Members</h3>
                                                    <button
                                                        onClick={handleDeleteGroup}
                                                        className="text-sm text-red-500 hover:text-red-700"
                                                    >
                                                        Delete Group
                                                    </button>
                                                </div>

                                                {/* Add Member Form */}
                                                <div className={`p-3 rounded ${palette.surface} mb-3`}>
                                                    <div className="text-sm font-medium mb-2">Add Member</div>
                                                    <div className="flex gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={newMemberUsername}
                                                            onChange={(e) => setNewMemberUsername(e.target.value)}
                                                            placeholder="Username"
                                                            className={`flex-1 px-3 py-1 text-sm rounded ${palette.input} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                                                        />
                                                        <select
                                                            value={newMemberRole}
                                                            onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'member')}
                                                            className={`px-3 py-1 text-sm rounded ${palette.input} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                                                        >
                                                            <option value="member">Member</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        onClick={handleAddMember}
                                                        disabled={!newMemberUsername.trim() || loading}
                                                        className={`w-full py-1 px-3 text-sm rounded ${palette.button.primary} text-white hover:opacity-90 transition-opacity disabled:opacity-50`}
                                                    >
                                                        Add
                                                    </button>
                                                </div>

                                                {/* Members List */}
                                                <div className="space-y-2">
                                                    {members.map((member) => (
                                                        <div
                                                            key={member.user_username}
                                                            className={`p-3 rounded ${palette.surface} flex justify-between items-center`}
                                                        >
                                                            <div>
                                                                <div className="font-medium">{member.name}</div>
                                                                <div className={`text-sm ${palette.sidebar.textMuted}`}>
                                                                    @{member.user_username}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <select
                                                                    value={member.role}
                                                                    onChange={(e) => handleUpdateRole(member.user_username, e.target.value as 'admin' | 'member')}
                                                                    disabled={member.user_username === user?.username}
                                                                    className={`px-2 py-1 text-sm rounded ${palette.input} focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50`}
                                                                >
                                                                    <option value="member">Member</option>
                                                                    <option value="admin">Admin</option>
                                                                </select>
                                                                {member.user_username !== user?.username && (
                                                                    <button
                                                                        onClick={() => handleRemoveMember(member.user_username)}
                                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className={`text-center py-8 ${palette.sidebar.textMuted}`}>
                                                Select a group to manage members
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupManagementModal;

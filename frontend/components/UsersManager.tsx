/**
 * @file Users management component
 */
import React, { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/useApi';
import { COLORS } from '../utils/styles';
import type { UserCreate, UserUpdate } from '../apiTypes';

const UsersManager: React.FC = () => {
    const { data: users, isLoading, error } = useUsers();
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    
    const [newUser, setNewUser] = useState<UserCreate>({
        username: '',
        name: '',
        password: '',
        role: 'member',
    });

    const [updateData, setUpdateData] = useState<UserUpdate>({
        name: '',
        password: '',
    });

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUserMutation.mutateAsync(newUser);
            setNewUser({ username: '', name: '', password: '', role: 'member' });
            setShowCreateForm(false);
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleUpdateUser = async (username: string) => {
        try {
            await updateUserMutation.mutateAsync({ username, updates: updateData });
            setEditingUser(null);
            setUpdateData({ name: '', password: '' });
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleDeleteUser = async (username: string) => {
        if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            try {
                await deleteUserMutation.mutateAsync(username);
            } catch (error) {
                // Error handled by mutation
            }
        }
    };

    if (isLoading) {
        return <div className="text-center py-8 text-light-slate">Loading users...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold ${COLORS.TEXT_ACCENT}`}>Users Management</h3>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className={`px-4 py-2 ${COLORS.BG_ACCENT} text-deep-navy font-semibold rounded-lg hover:opacity-90 transition-opacity`}
                >
                    {showCreateForm ? 'Cancel' : 'Create User'}
                </button>
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreateUser} className="bg-light-navy p-6 rounded-lg space-y-4">
                    <h4 className="text-lg font-semibold text-light-slate">Create New User</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className="px-4 py-2 bg-deep-navy border border-soft-gray/30 rounded-lg text-light-slate focus:outline-none focus:ring-2 focus:ring-accent-blue"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            className="px-4 py-2 bg-deep-navy border border-soft-gray/30 rounded-lg text-light-slate focus:outline-none focus:ring-2 focus:ring-accent-blue"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="px-4 py-2 bg-deep-navy border border-soft-gray/30 rounded-lg text-light-slate focus:outline-none focus:ring-2 focus:ring-accent-blue"
                            required
                        />
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'member' })}
                            className="px-4 py-2 bg-deep-navy border border-soft-gray/30 rounded-lg text-light-slate focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={createUserMutation.isPending}
                        className={`px-6 py-2 ${COLORS.BG_ACCENT} text-deep-navy font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`}
                    >
                        {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                    </button>

                    {createUserMutation.isError && (
                        <p className="text-red-400 text-sm">{createUserMutation.error?.message}</p>
                    )}
                </form>
            )}

            <div className="space-y-3">
                {users?.map((user) => (
                    <div key={user.username} className="bg-light-navy p-4 rounded-lg">
                        {editingUser === user.username ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="New name"
                                        value={updateData.name}
                                        onChange={(e) => setUpdateData({ ...updateData, name: e.target.value })}
                                        className="px-3 py-2 bg-deep-navy border border-soft-gray/30 rounded text-light-slate focus:outline-none focus:ring-2 focus:ring-accent-blue"
                                    />
                                    <input
                                        type="password"
                                        placeholder="New password"
                                        value={updateData.password}
                                        onChange={(e) => setUpdateData({ ...updateData, password: e.target.value })}
                                        className="px-3 py-2 bg-deep-navy border border-soft-gray/30 rounded text-light-slate focus:outline-none focus:ring-2 focus:ring-accent-blue"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdateUser(user.username)}
                                        disabled={updateUserMutation.isPending}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingUser(null);
                                            setUpdateData({ name: '', password: '' });
                                        }}
                                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-light-slate font-semibold">{user.name}</h4>
                                    <p className="text-soft-gray text-sm">
                                        @{user.username} • {user.role}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingUser(user.username)}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.username)}
                                        disabled={deleteUserMutation.isPending}
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsersManager;

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
    Card,
    Text,
    Button,
    ActivityIndicator,
    Searchbar,
    Chip,
    IconButton,
    Portal,
    Dialog,
    TextInput,
    SegmentedButtons,
} from 'react-native-paper';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useApi';
import { AppColors } from '@/constants/colors';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import * as Types from '@/types/api';

export default function UsersScreen() {
    const { user: currentUser } = useAuth();
    const { data: users, isLoading, refetch, isRefetching } = useUsers();
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();

    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Types.User | null>(null);

    // Form states
    const [formUsername, setFormUsername] = useState('');
    const [formName, setFormName] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRole, setFormRole] = useState<'admin' | 'member'>('member');

    const isAdmin = currentUser?.role === 'admin';

    const filteredUsers = users?.filter(
        (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

    const resetForm = () => {
        setFormUsername('');
        setFormName('');
        setFormPassword('');
        setFormRole('member');
        setSelectedUser(null);
    };

    const handleCreateUser = async () => {
        if (!formUsername.trim() || !formName.trim() || !formPassword.trim()) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        try {
            await createUserMutation.mutateAsync({
                username: formUsername.trim(),
                name: formName.trim(),
                password: formPassword,
                role: formRole,
            });
            Alert.alert('Success', 'User created successfully');
            setIsCreateDialogOpen(false);
            resetForm();
            refetch();
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create user');
        }
    };

    const handleEditUser = async () => {
        if (!selectedUser || !formName.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        try {
            const updates: Types.UserUpdate = { name: formName.trim(), role: formRole };
            if (formPassword.trim()) {
                updates.password = formPassword;
            }

            await updateUserMutation.mutateAsync({
                username: selectedUser.username,
                updates,
            });
            Alert.alert('Success', 'User updated successfully');
            setIsEditDialogOpen(false);
            resetForm();
            refetch();
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update user');
        }
    };

    const handleDeleteUser = (user: Types.User) => {
        if (user.username === currentUser?.username) {
            Alert.alert('Error', 'You cannot delete your own account');
            return;
        }

        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete user "${user.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUserMutation.mutateAsync(user.username);
                            Alert.alert('Success', 'User deleted successfully');
                            refetch();
                        } catch (error) {
                            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    };

    const openEditDialog = (user: Types.User) => {
        setSelectedUser(user);
        setFormName(user.name);
        setFormRole(user.role as 'admin' | 'member');
        setFormPassword('');
        setIsEditDialogOpen(true);
    };

    const renderUserItem = ({ item }: { item: Types.User }) => (
        <GlassCard style={styles.userCard} mode="elevated">
            <Card.Content>
                <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                        <Text variant="titleMedium" style={styles.userName}>
                            {item.name}
                        </Text>
                        <Text variant="bodySmall" style={styles.userUsername}>
                            @{item.username}
                        </Text>
                    </View>
                    <Chip
                        mode="flat"
                        style={[
                            styles.roleChip,
                            item.role === 'admin' ? styles.adminChip : styles.memberChip,
                        ]}
                        textStyle={styles.chipText}
                    >
                        {item.role === 'admin' ? 'Admin' : 'Member'}
                    </Chip>
                </View>

                {item.balance !== undefined && (
                    <View style={styles.balanceRow}>
                        <Text variant="bodySmall" style={styles.balanceLabel}>
                            Balance:
                        </Text>
                        <Text variant="bodyMedium" style={styles.balanceValue}>
                            Rp {item.balance.toLocaleString('id-ID')}
                        </Text>
                    </View>
                )}

                {isAdmin && item.username !== currentUser?.username && (
                    <View style={styles.actionButtons}>
                        <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => openEditDialog(item)}
                        />
                        <IconButton
                            icon="delete"
                            size={20}
                            iconColor={AppColors.error}
                            onPress={() => handleDeleteUser(item)}
                        />
                    </View>
                )}
            </Card.Content>
        </GlassCard>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!isAdmin) {
        return (
            <View style={styles.centerContainer}>
                <Text variant="headlineSmall" style={styles.accessDenied}>
                    Access Denied
                </Text>
                <Text variant="bodyMedium" style={styles.accessDeniedText}>
                    You need admin privileges to view this page.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search users..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            />

            <Button
                mode="contained"
                onPress={() => setIsCreateDialogOpen(true)}
                icon="plus"
                style={styles.addButton}
            >
                Add User
            </Button>

            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.username}
                renderItem={renderUserItem}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge">No users found</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />

            {/* Create User Dialog */}
            <Portal>
                <Dialog visible={isCreateDialogOpen} onDismiss={() => setIsCreateDialogOpen(false)}>
                    <Dialog.Title>Create New User</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Username"
                            value={formUsername}
                            onChangeText={setFormUsername}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Name"
                            value={formName}
                            onChangeText={setFormName}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Password"
                            value={formPassword}
                            onChangeText={setFormPassword}
                            secureTextEntry
                            mode="outlined"
                            style={styles.input}
                        />
                        <SegmentedButtons
                            value={formRole}
                            onValueChange={(value) => setFormRole(value as 'admin' | 'member')}
                            buttons={[
                                { value: 'member', label: 'Member' },
                                { value: 'admin', label: 'Admin' },
                            ]}
                            style={styles.segmentedButtons}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => { setIsCreateDialogOpen(false); resetForm(); }}>Cancel</Button>
                        <Button onPress={handleCreateUser} loading={createUserMutation.isPending}>
                            Create
                        </Button>
                    </Dialog.Actions>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog visible={isEditDialogOpen} onDismiss={() => setIsEditDialogOpen(false)}>
                    <Dialog.Title>Edit User</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodySmall" style={styles.dialogUsername}>
                            @{selectedUser?.username}
                        </Text>
                        <TextInput
                            label="Name"
                            value={formName}
                            onChangeText={setFormName}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="New Password (optional)"
                            value={formPassword}
                            onChangeText={setFormPassword}
                            secureTextEntry
                            mode="outlined"
                            style={styles.input}
                        />
                        <SegmentedButtons
                            value={formRole}
                            onValueChange={(value) => setFormRole(value as 'admin' | 'member')}
                            buttons={[
                                { value: 'member', label: 'Member' },
                                { value: 'admin', label: 'Admin' },
                            ]}
                            style={styles.segmentedButtons}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => { setIsEditDialogOpen(false); resetForm(); }}>Cancel</Button>
                        <Button onPress={handleEditUser} loading={updateUserMutation.isPending}>
                            Save
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        marginBottom: 12,
    },
    addButton: {
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 16,
    },
    userCard: {
        marginBottom: 12,
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontWeight: 'bold',
    },
    userUsername: {
        color: AppColors.textSecondaryLight,
        marginTop: 2,
    },
    roleChip: {
        height: 28,
    },
    adminChip: {
        backgroundColor: AppColors.primary + '30',
    },
    memberChip: {
        backgroundColor: AppColors.info + '30',
    },
    chipText: {
        fontSize: 12,
    },
    balanceRow: {
        flexDirection: 'row',
        marginTop: 12,
        alignItems: 'center',
    },
    balanceLabel: {
        color: AppColors.textSecondaryLight,
        marginRight: 8,
    },
    balanceValue: {
        fontWeight: '600',
        color: AppColors.success,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    accessDenied: {
        color: AppColors.error,
        marginBottom: 8,
    },
    accessDeniedText: {
        color: AppColors.textSecondaryLight,
        textAlign: 'center',
    },
    input: {
        marginBottom: 12,
    },
    segmentedButtons: {
        marginTop: 8,
    },
    dialogUsername: {
        color: AppColors.textSecondaryLight,
        marginBottom: 16,
    },
});

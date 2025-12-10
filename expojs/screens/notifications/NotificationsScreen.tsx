import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
    Card,
    Text,
    ActivityIndicator,
    Badge,
    IconButton,
} from 'react-native-paper';
import { useNotifications, useMarkNotificationRead } from '@/hooks/useApi';
import { AppColors } from '@/constants/colors';
import { GlassCard } from '@/components/GlassCard';
import * as Types from '@/types/api';

export default function NotificationsScreen() {
    const { data: notifications, isLoading, refetch, isRefetching } = useNotifications();
    const markReadMutation = useMarkNotificationRead();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
        });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message':
                return 'message';
            case 'task':
                return 'checkbox-marked-circle';
            case 'event':
                return 'calendar-star';
            case 'ticket':
                return 'ticket';
            case 'transfer':
                return 'bank-transfer';
            default:
                return 'bell';
        }
    };

    const handleMarkRead = async (notification: Types.Notification) => {
        if (notification.read) return;
        try {
            await markReadMutation.mutateAsync(notification.id);
            refetch();
        } catch (error) {
            // Silent fail
        }
    };

    const renderNotificationItem = ({ item }: { item: Types.Notification }) => (
        <GlassCard
            style={[styles.notificationCard, !item.read && styles.unreadCard]}
            mode="elevated"
            onPress={() => handleMarkRead(item)}
        >
            <Card.Content>
                <View style={styles.notificationHeader}>
                    <View style={styles.iconContainer}>
                        <IconButton
                            icon={getNotificationIcon(item.type)}
                            size={24}
                            iconColor={item.read ? AppColors.textSecondaryLight : AppColors.primary}
                        />
                        {!item.read && <Badge size={8} style={styles.unreadBadge} />}
                    </View>
                    <View style={styles.contentContainer}>
                        <Text
                            variant="titleSmall"
                            style={[styles.title, !item.read && styles.unreadTitle]}
                        >
                            {item.title}
                        </Text>
                        <Text variant="bodySmall" style={styles.message}>
                            {item.message}
                        </Text>
                        <Text variant="labelSmall" style={styles.time}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>
                </View>
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

    const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

    return (
        <View style={styles.container}>
            {unreadCount > 0 && (
                <View style={styles.headerContainer}>
                    <Text variant="bodyMedium" style={styles.unreadCountText}>
                        {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                    </Text>
                </View>
            )}

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNotificationItem}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <IconButton icon="bell-off" size={48} iconColor={AppColors.textSecondaryLight} />
                        <Text variant="bodyLarge" style={styles.emptyText}>
                            No notifications yet
                        </Text>
                        <Text variant="bodySmall" style={styles.emptySubtext}>
                            You'll see notifications here when you receive them
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
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
    headerContainer: {
        marginBottom: 12,
    },
    unreadCountText: {
        color: AppColors.primary,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 16,
        flexGrow: 1,
    },
    notificationCard: {
        marginBottom: 8,
    },
    unreadCard: {
        borderLeftWidth: 3,
        borderLeftColor: AppColors.primary,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        position: 'relative',
        marginRight: 8,
    },
    unreadBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: AppColors.error,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        marginBottom: 4,
    },
    unreadTitle: {
        fontWeight: 'bold',
    },
    message: {
        color: AppColors.textSecondaryLight,
        marginBottom: 4,
    },
    time: {
        color: AppColors.textSecondaryLight,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        color: AppColors.textSecondaryLight,
        marginTop: 8,
    },
    emptySubtext: {
        color: AppColors.textSecondaryLight,
        textAlign: 'center',
        marginTop: 4,
    },
});

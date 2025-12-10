import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
    Card,
    Text,
    ActivityIndicator,
    Chip,
    SegmentedButtons,
    Divider,
} from 'react-native-paper';
import { useTransactionHistory } from '@/hooks/useApi';
import { AppColors } from '@/constants/colors';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import * as Types from '@/types/api';

type FilterType = 'all' | 'transfer' | 'topup';

export default function TransactionHistoryScreen() {
    const { user } = useAuth();
    const { data: transactions, isLoading, refetch, isRefetching } = useTransactionHistory();
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredTransactions = transactions?.filter((tx) => {
        if (filter === 'all') return true;
        return tx.type === filter;
    }) ?? [];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTransactionIcon = (tx: Types.Transaction) => {
        if (tx.type === 'topup') return '↓';
        if (tx.from_username === user?.username) return '↑';
        return '↓';
    };

    const getTransactionColor = (tx: Types.Transaction) => {
        if (tx.type === 'topup') return AppColors.success;
        if (tx.from_username === user?.username) return AppColors.error;
        return AppColors.success;
    };

    const getAmountPrefix = (tx: Types.Transaction) => {
        if (tx.type === 'topup') return '+';
        if (tx.from_username === user?.username) return '-';
        return '+';
    };

    const renderTransactionItem = ({ item }: { item: Types.Transaction }) => {
        const isOutgoing = item.from_username === user?.username && item.type !== 'topup';
        const amountColor = getTransactionColor(item);
        const prefix = getAmountPrefix(item);

        return (
            <GlassCard style={styles.txCard} mode="elevated">
                <Card.Content>
                    <View style={styles.txHeader}>
                        <View style={styles.txIconContainer}>
                            <Text style={[styles.txIcon, { color: amountColor }]}>
                                {getTransactionIcon(item)}
                            </Text>
                        </View>
                        <View style={styles.txInfo}>
                            <Text variant="titleSmall" style={styles.txTitle}>
                                {item.type === 'topup'
                                    ? 'Top Up'
                                    : isOutgoing
                                        ? `Transfer to @${item.to_username}`
                                        : `Received from @${item.from_username}`}
                            </Text>
                            <Text variant="bodySmall" style={styles.txDate}>
                                {formatDate(item.created_at)}
                            </Text>
                            {item.description && (
                                <Text variant="bodySmall" style={styles.txDescription}>
                                    {item.description}
                                </Text>
                            )}
                        </View>
                        <View style={styles.txAmountContainer}>
                            <Text variant="titleMedium" style={[styles.txAmount, { color: amountColor }]}>
                                {prefix}Rp {item.amount.toLocaleString('id-ID')}
                            </Text>
                            <Chip
                                mode="flat"
                                style={[
                                    styles.typeChip,
                                    item.type === 'topup' ? styles.topupChip : styles.transferChip,
                                ]}
                                textStyle={styles.chipText}
                            >
                                {item.type === 'topup' ? 'Top Up' : 'Transfer'}
                            </Chip>
                        </View>
                    </View>
                </Card.Content>
            </GlassCard>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GlassCard style={styles.balanceCard} mode="elevated">
                <Card.Content>
                    <Text variant="bodyMedium" style={styles.balanceLabel}>
                        Current Balance
                    </Text>
                    <Text variant="headlineMedium" style={styles.balanceAmount}>
                        Rp {(user?.balance ?? 0).toLocaleString('id-ID')}
                    </Text>
                </Card.Content>
            </GlassCard>

            <SegmentedButtons
                value={filter}
                onValueChange={(value) => setFilter(value as FilterType)}
                buttons={[
                    { value: 'all', label: 'All' },
                    { value: 'transfer', label: 'Transfers' },
                    { value: 'topup', label: 'Top Ups' },
                ]}
                style={styles.filterButtons}
            />

            <FlatList
                data={filteredTransactions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTransactionItem}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge" style={styles.emptyText}>
                            No transactions found
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    balanceCard: {
        marginBottom: 16,
    },
    balanceLabel: {
        color: AppColors.textSecondaryLight,
    },
    balanceAmount: {
        fontWeight: 'bold',
        color: AppColors.primary,
        marginTop: 4,
    },
    filterButtons: {
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 16,
    },
    txCard: {
        marginBottom: 8,
    },
    txHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    txIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: AppColors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    txIcon: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    txInfo: {
        flex: 1,
    },
    txTitle: {
        fontWeight: '600',
    },
    txDate: {
        color: AppColors.textSecondaryLight,
        marginTop: 2,
    },
    txDescription: {
        color: AppColors.textSecondaryLight,
        marginTop: 4,
        fontStyle: 'italic',
    },
    txAmountContainer: {
        alignItems: 'flex-end',
    },
    txAmount: {
        fontWeight: 'bold',
    },
    typeChip: {
        marginTop: 4,
        height: 24,
    },
    topupChip: {
        backgroundColor: AppColors.success + '30',
    },
    transferChip: {
        backgroundColor: AppColors.primary + '30',
    },
    chipText: {
        fontSize: 10,
    },
    separator: {
        height: 4,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: AppColors.textSecondaryLight,
    },
});

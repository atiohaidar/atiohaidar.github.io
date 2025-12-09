import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

export default function TransferScreen() {
    const { user, refreshUser } = useAuth(); // Assuming refreshUser exists, if not we rely on next app start or manual refresh logic
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const [toUsername, setToUsername] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTransfer = async () => {
        if (!toUsername || !amount) {
            Alert.alert('Error', 'Please fill in username and amount');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            Alert.alert('Error', 'Invalid amount');
            return;
        }

        if (amountNum > (user?.balance || 0)) {
            Alert.alert('Error', 'Insufficient balance');
            return;
        }

        setLoading(true);
        try {
            await apiService.transferBalance(toUsername, amountNum, description);
            Alert.alert('Success', 'Transfer successful', [
                { text: 'OK', onPress: () => router.back() }
            ]);
            // Attempt to refresh user balance if method available
            // @ts-ignore
            if (typeof refreshUser === 'function') refreshUser();
        } catch (error: any) {
            Alert.alert('Transfer Failed', error.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: 'Transfer Balance', headerBackTitle: 'Back' }} />
            <ScrollView
                contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 16 }]}
                keyboardShouldPersistTaps="handled"
            >
                <GlassCard style={styles.balanceCard}>
                    <View style={styles.balanceContent}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>Current Balance</Text>
                        <Text variant="headlineLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                            Rp {(user?.balance ?? 0).toLocaleString('id-ID')}
                        </Text>
                    </View>
                </GlassCard>

                <GlassCard style={styles.formCard}>
                    <View style={styles.formContent}>
                        <TextInput
                            label="Recipient Username"
                            value={toUsername}
                            onChangeText={setToUsername}
                            mode="outlined"
                            style={styles.input}
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="account" />}
                        />

                        <TextInput
                            label="Amount (Rp)"
                            value={amount}
                            onChangeText={setAmount}
                            mode="outlined"
                            keyboardType="numeric"
                            style={styles.input}
                            left={<TextInput.Icon icon="cash" />}
                        />

                        <TextInput
                            label="Description (Optional)"
                            value={description}
                            onChangeText={setDescription}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="text" />}
                        />

                        <Button
                            mode="contained"
                            onPress={handleTransfer}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                        >
                            Transfer Now
                        </Button>
                    </View>
                </GlassCard>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },
    balanceCard: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceContent: {
        alignItems: 'center',
        gap: 8,
    },
    formCard: {
        padding: 16,
    },
    formContent: {
        gap: 16,
    },
    input: {
        backgroundColor: 'transparent',
    },
    button: {
        marginTop: 8,
        backgroundColor: AppColors.primary,
    },
    buttonContent: {
        paddingVertical: 6,
    },
});

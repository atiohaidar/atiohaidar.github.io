import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

export default function TopUpScreen() {
    const { user } = useAuth();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const [targetUsername, setTargetUsername] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTopUp = async () => {
        if (!targetUsername || !amount) {
            Alert.alert('Error', 'Please fill in username and amount');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            Alert.alert('Error', 'Invalid amount');
            return;
        }

        setLoading(true);
        try {
            await apiService.topUpBalance(targetUsername, amountNum, description);
            Alert.alert('Success', 'Top Up successful', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Top Up Failed', error.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={{ color: theme.colors.error }}>Access Denied. Admin only.</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: 'Admin Top Up', headerBackTitle: 'Back' }} />
            <ScrollView
                contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 16 }]}
                keyboardShouldPersistTaps="handled"
            >
                <GlassCard style={styles.formCard}>
                    <View style={styles.formContent}>
                        <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
                            Top Up User Balance
                        </Text>

                        <TextInput
                            label="Target Username"
                            value={targetUsername}
                            onChangeText={setTargetUsername}
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
                            onPress={handleTopUp}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                        >
                            Top Up Balance
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: AppColors.statPurple,
    },
    buttonContent: {
        paddingVertical: 6,
    },
});

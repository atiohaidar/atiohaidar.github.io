import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService from '@/services/api';

export default function ForgotPasswordScreen() {
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleResetPassword = async () => {
        // Validation
        if (!username.trim() || !newPassword || !confirmPassword) {
            setError('Semua field harus diisi');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Password tidak sama');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await apiService.forgotPassword(username.trim(), newPassword);
            setSuccess(true);

            // Navigate to login after 1.5 seconds
            setTimeout(() => {
                router.replace('/login');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Reset password gagal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>Masukkan username dan password baru</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    {/* Username Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#F59E0B" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            placeholderTextColor="#94A3B8"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* New Password Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#F59E0B" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password Baru"
                            placeholderTextColor="#94A3B8"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#94A3B8"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#F59E0B" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Konfirmasi Password Baru"
                            placeholderTextColor="#94A3B8"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons
                                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#94A3B8"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Success Message */}
                    {success && (
                        <View style={styles.successContainer}>
                            <Text style={styles.successText}>Password berhasil direset! Mengalihkan ke login...</Text>
                        </View>
                    )}

                    {/* Reset Button */}
                    <TouchableOpacity
                        style={[styles.resetButton, isLoading && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#000" size="small" />
                        ) : (
                            <Text style={styles.resetButtonText}>Reset Password</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText}>Ingat password? </Text>
                        <TouchableOpacity onPress={() => router.replace('/login')}>
                            <Text style={styles.linkAction}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        marginBottom: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: 24,
        padding: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#475569',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 56,
        color: '#fff',
        fontSize: 16,
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
    },
    successContainer: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    successText: {
        color: '#22C55E',
        textAlign: 'center',
    },
    resetButton: {
        backgroundColor: '#F59E0B',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    resetButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    linkText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    linkAction: {
        color: '#F59E0B',
        fontSize: 14,
        fontWeight: '600',
    },
});

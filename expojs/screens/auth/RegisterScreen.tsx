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

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRegister = async () => {
        // Validation
        if (!username.trim() || !name.trim() || !password || !confirmPassword) {
            setError('Semua field harus diisi');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        if (password !== confirmPassword) {
            setError('Password tidak sama');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await apiService.register(username.trim(), name.trim(), password);
            setSuccess(true);

            // Navigate to login after 1.5 seconds
            setTimeout(() => {
                router.replace('/login');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Registrasi gagal');
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Daftar untuk membuat akun baru</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    {/* Username Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#22C55E" style={styles.inputIcon} />
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

                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="id-card-outline" size={20} color="#22C55E" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nama Lengkap"
                            placeholderTextColor="#94A3B8"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#22C55E" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#94A3B8"
                            value={password}
                            onChangeText={setPassword}
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
                        <Ionicons name="lock-closed-outline" size={20} color="#22C55E" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Konfirmasi Password"
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
                            <Text style={styles.successText}>Registrasi berhasil! Mengalihkan ke login...</Text>
                        </View>
                    )}

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.registerButtonText}>Daftar</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText}>Sudah punya akun? </Text>
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
    registerButton: {
        backgroundColor: '#22C55E',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: '#fff',
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
        color: '#22C55E',
        fontSize: 14,
        fontWeight: '600',
    },
});

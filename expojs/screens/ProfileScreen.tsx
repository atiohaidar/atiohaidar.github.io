import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  Avatar,
  ActivityIndicator,
  useTheme,
  Divider,
} from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateSelfProfile } from '@/hooks/useApi';
import { AppColors } from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const updateProfileMutation = useUpdateSelfProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updates: any = {
        name: formData.name,
      };

      // Only include password if it was changed
      if (formData.password) {
        updates.password = formData.password;
      }

      await updateProfileMutation.mutateAsync(updates);

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          {/* Avatar and Username Section */}
          <View style={styles.avatarSection}>
            <Avatar.Text
              size={80}
              label={user.name?.substring(0, 2).toUpperCase() || user.username.substring(0, 2).toUpperCase()}
              style={{ backgroundColor: AppColors.primary }}
            />
            <Text variant="headlineSmall" style={styles.username}>
              @{user.username}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
            >
              {user.role === 'admin' ? 'Administrator' : 'Member'}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Profile Information */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Profile Information
            </Text>

            <TextInput
              label="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              disabled={!isEditing}
              error={!!errors.name}
              style={styles.input}
              mode="outlined"
            />
            {errors.name && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.name}
              </Text>
            )}

            <TextInput
              label="Username"
              value={user.username}
              disabled
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Role"
              value={user.role === 'admin' ? 'Administrator' : 'Member'}
              disabled
              style={styles.input}
              mode="outlined"
            />
          </View>

          {isEditing && (
            <>
              <Divider style={styles.divider} />

              {/* Change Password Section */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Change Password (Optional)
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}
                >
                  Leave blank to keep current password
                </Text>

                <TextInput
                  label="New Password"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                  error={!!errors.password}
                  style={styles.input}
                  mode="outlined"
                  autoCapitalize="none"
                />
                {errors.password && (
                  <Text variant="bodySmall" style={styles.errorText}>
                    {errors.password}
                  </Text>
                )}

                <TextInput
                  label="Confirm New Password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                  error={!!errors.confirmPassword}
                  style={styles.input}
                  mode="outlined"
                  autoCapitalize="none"
                />
                {errors.confirmPassword && (
                  <Text variant="bodySmall" style={styles.errorText}>
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>
            </>
          )}

          <Divider style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {!isEditing ? (
              <>
                <Button
                  mode="contained"
                  onPress={() => setIsEditing(true)}
                  style={styles.button}
                  icon="pencil"
                >
                  Edit Profile
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleLogout}
                  style={styles.button}
                  icon="logout"
                  textColor={AppColors.error}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={updateProfileMutation.isPending}
                  disabled={updateProfileMutation.isPending}
                  style={styles.button}
                  icon="content-save"
                >
                  Save Changes
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  disabled={updateProfileMutation.isPending}
                  style={styles.button}
                  icon="cancel"
                >
                  Cancel
                </Button>
              </>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Account Information Card */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account Information
          </Text>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Username:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {user.username}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>
              Account Type:
            </Text>
            <Text variant="bodyMedium" style={styles.infoValue}>
              {user.role === 'admin' ? 'Administrator' : 'Standard Member'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  username: {
    marginTop: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: AppColors.error,
    marginBottom: 8,
    marginLeft: 12,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontWeight: '600',
  },
  infoValue: {
    color: AppColors.textSecondaryLight,
  },
});

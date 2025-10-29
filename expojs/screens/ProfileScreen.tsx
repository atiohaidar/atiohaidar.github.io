import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateSelfProfile } from '@/hooks/useApi';
import { AppColors } from '@/constants/colors';
import { ProfileHeader } from './profile/components/ProfileHeader';
import { ProfileInfoSection } from './profile/components/ProfileInfoSection';
import { PasswordSection } from './profile/components/PasswordSection';
import { ProfileFormData, ProfileFormErrors } from './profile/types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const updateProfileMutation = useUpdateSelfProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  const roleLabel = useMemo(() => {
    if (!user) return '';
    return user.role === 'admin' ? 'Administrator' : 'Member';
  }, [user]);

  const handleFormChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: ProfileFormErrors = {};

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
      const updates: { name: string; password?: string } = {
        name: formData.name,
      };

      if (formData.password) {
        updates.password = formData.password;
      }

      await updateProfileMutation.mutateAsync(updates);

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
      setFormData((prev) => ({
        name: prev.name,
        password: '',
        confirmPassword: '',
      }));
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
          <ProfileHeader user={user} />

          <Divider style={styles.divider} />

          <ProfileInfoSection
            formData={formData}
            errors={errors}
            isEditing={isEditing}
            username={user.username}
            roleLabel={roleLabel}
            onChange={handleFormChange}
          />

          {isEditing && (
            <>
              <Divider style={styles.divider} />

              <PasswordSection
                formData={formData}
                errors={errors}
                onChange={handleFormChange}
              />
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
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
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

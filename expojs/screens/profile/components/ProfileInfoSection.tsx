import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { ProfileFormData, ProfileFormErrors } from '../types';

interface ProfileInfoSectionProps {
  formData: ProfileFormData;
  errors: ProfileFormErrors;
  isEditing: boolean;
  username: string;
  roleLabel: string;
  onChange: (field: keyof ProfileFormData, value: string) => void;
}

export const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({
  formData,
  errors,
  isEditing,
  username,
  roleLabel,
  onChange,
}) => {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Profile Information
      </Text>

      <TextInput
        label="Full Name"
        value={formData.name}
        onChangeText={(text) => onChange('name', text)}
        disabled={!isEditing}
        error={Boolean(errors.name)}
        style={styles.input}
        mode="outlined"
      />
      {errors.name ? (
        <Text variant="bodySmall" style={styles.errorText}>
          {errors.name}
        </Text>
      ) : null}

      <TextInput
        label="Username"
        value={username}
        disabled
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Role"
        value={roleLabel}
        disabled
        style={styles.input}
        mode="outlined"
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 8,
    marginLeft: 12,
    color: '#d32f2f',
  },
});

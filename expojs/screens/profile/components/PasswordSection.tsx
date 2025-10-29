import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';

import { ProfileFormData, ProfileFormErrors } from '../types';

interface PasswordSectionProps {
  formData: ProfileFormData;
  errors: ProfileFormErrors;
  onChange: (field: keyof ProfileFormData, value: string) => void;
}

export const PasswordSection: React.FC<PasswordSectionProps> = ({ formData, errors, onChange }) => {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Change Password (Optional)
      </Text>
      <Text variant="bodySmall" style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
        Leave blank to keep current password
      </Text>

      <TextInput
        label="New Password"
        value={formData.password}
        onChangeText={(text) => onChange('password', text)}
        secureTextEntry
        error={Boolean(errors.password)}
        style={styles.input}
        mode="outlined"
        autoCapitalize="none"
      />
      {errors.password ? (
        <Text variant="bodySmall" style={styles.errorText}>
          {errors.password}
        </Text>
      ) : null}

      <TextInput
        label="Confirm New Password"
        value={formData.confirmPassword}
        onChangeText={(text) => onChange('confirmPassword', text)}
        secureTextEntry
        error={Boolean(errors.confirmPassword)}
        style={styles.input}
        mode="outlined"
        autoCapitalize="none"
      />
      {errors.confirmPassword ? (
        <Text variant="bodySmall" style={styles.errorText}>
          {errors.confirmPassword}
        </Text>
      ) : null}
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
  helperText: {
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

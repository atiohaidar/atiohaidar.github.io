import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';

import { AppColors } from '@/constants/colors';
import { User } from '@/types/api';

interface ProfileHeaderProps {
  user: User;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const theme = useTheme();
  const initials = user.name?.substring(0, 2).toUpperCase() ?? user.username.substring(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <Avatar.Text size={80} label={initials} style={{ backgroundColor: AppColors.primary }} />
      <Text variant="headlineSmall" style={styles.username}>
        @{user.username}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
        {user.role === 'admin' ? 'Administrator' : 'Member'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  username: {
    marginTop: 12,
    fontWeight: 'bold',
  },
});

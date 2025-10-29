import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';

import type { LoginRequest } from '@/types/api';

interface SavedAccountsListProps {
  accounts: LoginRequest[];
  loading: boolean;
  onLogin: (account: LoginRequest) => void;
  onRemove: (username: string) => void;
}

export const SavedAccountsList: React.FC<SavedAccountsListProps> = ({
  accounts,
  loading,
  onLogin,
  onRemove,
}) => {
  if (accounts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="titleSmall" style={styles.title}>
        Quick login
      </Text>
      {accounts.map((account) => (
        <View key={account.username} style={styles.row}>
          <Button
            mode="outlined"
            onPress={() => onLogin(account)}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {account.username}
          </Button>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => onRemove(account.username)}
            disabled={loading}
            accessibilityLabel={`Remove ${account.username}`}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    gap: 8,
  },
  title: {
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginRight: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },
});

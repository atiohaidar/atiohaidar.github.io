import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, IconButton, Text, useTheme } from 'react-native-paper';

interface ChatHeaderProps {
  name: string;
  subtitle: string;
  avatarLabel: string;
  onBack: () => void;
  onReload: () => void;
  loading?: boolean;
}

export function ChatHeader({ name, subtitle, avatarLabel, onBack, onReload, loading }: ChatHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <IconButton icon="arrow-left" onPress={onBack} accessibilityLabel="Back to chats" />
      <View style={styles.infoContainer}>
        <Avatar.Text size={40} label={avatarLabel} />
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.chatName}>
            {name}
          </Text>
          <Text variant="bodySmall" style={[styles.chatSubtitle, { color: theme.colors.onSurfaceVariant }] }>
            {subtitle}
          </Text>
        </View>
      </View>
      <IconButton
        icon="refresh"
        onPress={onReload}
        disabled={loading}
        accessibilityLabel="Reload messages"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 4,
  },
  textContainer: {
    marginLeft: 8,
  },
  chatName: {
    fontWeight: '600',
  },
  chatSubtitle: {
    color: '#6c6c6c',
  },
});

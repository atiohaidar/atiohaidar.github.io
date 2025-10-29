import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';

interface ChatListHeaderProps<TMode extends string> {
  mode: TMode;
  onModeChange: (mode: TMode) => void;
  options?: { value: TMode; label: string; icon: string }[];
}

const defaultOptions = [
  { value: 'conversations', label: 'Direct Messages', icon: 'account' },
  { value: 'groups', label: 'Groups', icon: 'account-group' },
] as const;

export function ChatListHeader<TMode extends string>({ mode, onModeChange, options }: ChatListHeaderProps<TMode>) {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Chat
      </Text>
      <SegmentedButtons
        value={mode}
        onValueChange={(value) => onModeChange(value as TMode)}
        buttons={(options ?? (defaultOptions as unknown as { value: TMode; label: string; icon: string }[]))}
        style={styles.segmentedButtons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
});

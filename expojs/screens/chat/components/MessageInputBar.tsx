import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

interface MessageInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  bottomInset?: number;
}

export function MessageInputBar({ value, onChangeText, onSend, disabled, bottomInset = 12 }: MessageInputBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(bottomInset, 12),
          borderTopColor: theme.colors.outline,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Type a message"
        mode="outlined"
        style={styles.input}
        disabled={disabled}
        right={<TextInput.Icon icon="send" onPress={onSend} disabled={disabled} />}
        onSubmitEditing={onSend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
  },
});

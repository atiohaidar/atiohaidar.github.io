import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { Message } from '@/types/api';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text variant="labelSmall" style={[styles.sender, isOwn && styles.mySender]}>
        {message.sender_username}
      </Text>
      <Text variant="bodyMedium" style={styles.body}>
        {message.content}
      </Text>
      <Text variant="labelSmall" style={styles.time}>
        {message.created_at ? new Date(message.created_at).toLocaleString() : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1266f1',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2f3640',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#4b4e57',
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#ffffff',
  },
  mySender: {
    color: '#ffffff',
  },
  body: {
    lineHeight: 20,
    color: '#ffffff',
  },
  time: {
    marginTop: 4,
    opacity: 0.85,
    fontSize: 11,
    color: '#f0f0f0',
  },
});

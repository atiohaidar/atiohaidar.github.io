import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { Message } from '@/types/api';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // Display sender name - use sender_id for anonymous, sender_username for regular
  const senderName = message.sender_id || message.sender_username;
  
  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text variant="labelSmall" style={[styles.sender, isOwn && styles.mySender]}>
        {senderName}
      </Text>
      
      {/* Reply context */}
      {message.reply_to_id && message.reply_content && (
        <View style={styles.replyContainer}>
          <View style={styles.replyBar} />
          <View style={styles.replyContent}>
            <Text variant="labelSmall" style={styles.replyLabel}>
              {message.reply_sender_name || 'Someone'}
            </Text>
            <Text variant="bodySmall" style={styles.replyText} numberOfLines={2}>
              {message.reply_content}
            </Text>
          </View>
        </View>
      )}
      
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
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  replyBar: {
    width: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  replyText: {
    color: '#ffffff',
    opacity: 0.7,
    fontStyle: 'italic',
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

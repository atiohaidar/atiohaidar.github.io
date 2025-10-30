import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AnonymousMessage } from '@/types/api';
import { useTheme } from '@/hooks/useTheme';

interface MessageItemProps {
  message: AnonymousMessage;
  onReply?: (message: AnonymousMessage) => void;
  isCurrentUser?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onReply,
  isCurrentUser = false,
}) => {
  const { colors } = useTheme();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUserContainer]}>
      <View
        style={[
          styles.messageBubble,
          isCurrentUser
            ? [styles.currentUserBubble, { backgroundColor: colors.primary }]
            : [styles.otherUserBubble, { backgroundColor: colors.surface }],
        ]}
      >
        {/* Reply indicator */}
        {message.reply_content && (
          <View style={[styles.replyContainer, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.replySender, { color: colors.primary }]}>
              {message.reply_sender_id || 'Anonymous'}
            </Text>
            <Text style={[styles.replyText, { color: colors.textSecondary }]}>
              {message.reply_content}
            </Text>
          </View>
        )}

        {/* Message content */}
        <Text
          style={[
            styles.messageText,
            { color: isCurrentUser ? colors.surface : colors.text },
          ]}
        >
          {message.content}
        </Text>

        {/* Message footer */}
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timestamp,
              { color: isCurrentUser ? colors.surface : colors.textSecondary },
            ]}
          >
            {formatTime(message.created_at)}
          </Text>

          {/* Reply button */}
          {onReply && !isCurrentUser && (
            <TouchableOpacity
              onPress={() => onReply(message)}
              style={styles.replyButton}
            >
              <Text style={[styles.replyButtonText, { color: colors.primary }]}>
                Reply
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  currentUserContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserBubble: {
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    borderBottomLeftRadius: 4,
  },
  replyContainer: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 8,
    paddingVertical: 4,
  },
  replySender: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  replyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

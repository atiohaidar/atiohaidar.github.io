import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AnonymousMessage } from '@/types/api';
import { useTheme } from '@/hooks/useTheme';

interface MessageInputProps {
  onSendMessage: (content: string, replyToId?: string) => void;
  replyTo?: AnonymousMessage | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), replyTo?.id);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleCancelReply = () => {
    onCancelReply?.();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Reply indicator */}
      {replyTo && (
        <View style={[styles.replyIndicator, { backgroundColor: colors.surface }]}>
          <View style={[styles.replyContent, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.replyLabel, { color: colors.textSecondary }]}>
              Replying to {replyTo.sender_id || 'Anonymous'}
            </Text>
            <Text style={[styles.replyText, { color: colors.text }]} numberOfLines={1}>
              {replyTo.content}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCancelReply}
            style={styles.cancelReplyButton}
          >
            <Text style={[styles.cancelReplyText, { color: colors.primary }]}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input area */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim() || disabled}
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.sendButtonDisabled,
            { backgroundColor: (!message.trim() || disabled) ? colors.disabled : colors.primary },
          ]}
        >
          <Text style={[styles.sendButtonText, { color: colors.surface }]}>
            {disabled ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  replyContent: {
    flex: 1,
    borderLeftWidth: 3,
    paddingLeft: 8,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 14,
  },
  cancelReplyButton: {
    padding: 4,
    marginLeft: 8,
  },
  cancelReplyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

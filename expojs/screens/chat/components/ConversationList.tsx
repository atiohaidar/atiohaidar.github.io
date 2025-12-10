import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Card, Text, useTheme } from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import type { Conversation } from '@/types/api';

interface ConversationListProps {
  conversations: Conversation[];
  currentUsername?: string;
  onSelect: (conversation: Conversation, displayName: string) => void;
}

export function ConversationList({ conversations, currentUsername, onSelect }: ConversationListProps) {
  const theme = useTheme();

  if (conversations.length === 0) {
    return (
      <GlassCard style={styles.emptyCard}>
        <Card.Content>
          <Text variant="bodyLarge" style={styles.emptyText}>
            No conversations yet.
          </Text>
        </Card.Content>
      </GlassCard>
    );
  }

  return (
    <View>
      {conversations.map((conv) => {
        const otherUsername = conv.user1_username === currentUsername ? conv.user2_username : conv.user1_username;
        const updatedAt = conv.updated_at ? new Date(conv.updated_at).toLocaleDateString() : 'No messages';

        return (
          <GlassCard
            key={conv.id}
            style={styles.chatCard}
            mode="elevated"
            onPress={() => onSelect(conv, otherUsername)}
          >
            <Card.Content>
              <View style={styles.chatItem}>
                <Avatar.Text
                  size={48}
                  label={otherUsername.substring(0, 2).toUpperCase()}
                />
                <View style={styles.chatInfo}>
                  <Text variant="titleMedium">{otherUsername}</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {updatedAt}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </GlassCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  chatCard: {
    marginBottom: 12,
    elevation: 2,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInfo: {
    marginLeft: 12,
    flex: 1,
  },
});

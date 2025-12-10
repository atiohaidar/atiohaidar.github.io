import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Card, Chip, Text, useTheme } from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import type { GroupChat } from '@/types/api';

interface GroupListProps {
  groups: GroupChat[];
  onSelect: (group: GroupChat) => void;
}

export function GroupList({ groups, onSelect }: GroupListProps) {
  const theme = useTheme();

  if (groups.length === 0) {
    return (
      <GlassCard style={styles.emptyCard}>
        <Card.Content>
          <Text variant="bodyLarge" style={styles.emptyText}>
            No groups yet. Create your first group!
          </Text>
        </Card.Content>
      </GlassCard>
    );
  }

  return (
    <View>
      {groups.map((group) => {
        const isAnonymous = group.id === 'anonymous';
        return (
          <GlassCard
            key={group.id}
            style={styles.chatCard}
            mode="elevated"
            onPress={() => onSelect(group)}
          >
            <Card.Content>
              <View style={styles.chatItem}>
                <Avatar.Text
                  size={48}
                  label={group.name.substring(0, 2).toUpperCase()}
                  style={isAnonymous ? { backgroundColor: '#9C27B0' } : undefined}
                />
                <View style={styles.chatInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text variant="titleMedium">{group.name}</Text>
                    {isAnonymous && (
                      <Chip icon="incognito" compact style={styles.anonymousChip}>
                        Public
                      </Chip>
                    )}
                  </View>
                  {group.description && (
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.onSurfaceVariant }}
                      numberOfLines={1}
                    >
                      {group.description}
                    </Text>
                  )}
                  {!isAnonymous && (
                    <Chip icon="account" compact style={styles.chip}>
                      Created by {group.created_by}
                    </Chip>
                  )}
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
  chip: {
    height: 24,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  anonymousChip: {
    height: 24,
    marginLeft: 8,
    backgroundColor: '#9C27B0',
  },
});

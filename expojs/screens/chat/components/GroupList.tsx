import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Card, Chip, Text, useTheme } from 'react-native-paper';
import type { GroupChat } from '@/types/api';

interface GroupListProps {
  groups: GroupChat[];
  onSelect: (group: GroupChat) => void;
}

export function GroupList({ groups, onSelect }: GroupListProps) {
  const theme = useTheme();

  if (groups.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Card.Content>
          <Text variant="bodyLarge" style={styles.emptyText}>
            No groups yet. Create your first group!
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View>
      {groups.map((group) => (
        <Card
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
              />
              <View style={styles.chatInfo}>
                <Text variant="titleMedium">{group.name}</Text>
                {group.description && (
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                    numberOfLines={1}
                  >
                    {group.description}
                  </Text>
                )}
                <Chip icon="account" compact style={styles.chip}>
                  Created by {group.created_by}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
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
});

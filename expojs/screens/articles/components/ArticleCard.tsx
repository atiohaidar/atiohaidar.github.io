import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, IconButton, useTheme } from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import { Article } from '@/types/api';

export type ArticleScope = 'private' | 'public';

interface ArticleCardProps {
  article: Article;
  scope: ArticleScope;
  onPress: (article: Article) => void;
  canEdit?: boolean;
  onEdit?: (article: Article) => void;
  onDelete?: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  scope,
  onPress,
  canEdit = false,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  const handleEdit = () => {
    if (canEdit && onEdit) {
      onEdit(article);
    }
  };

  const handleDelete = () => {
    if (canEdit && onDelete) {
      onDelete(article);
    }
  };

  const showStatusChip = scope === 'private';

  return (
    <GlassCard style={styles.card} mode="elevated" onPress={() => onPress(article)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text variant="titleLarge" style={styles.title}>
              {article.title}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.summary, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={3}
            >
              {article.content}
            </Text>
            <View style={styles.meta}>
              {showStatusChip && (
                <Chip
                  icon={article.published ? 'check-circle' : 'circle-outline'}
                  compact
                  style={[styles.chip, article.published ? styles.publishedChip : styles.draftChip]}
                >
                  {article.published ? 'Published' : 'Draft'}
                </Chip>
              )}
              {article.owner && (
                <Chip icon="account" compact style={styles.chip}>
                  {article.owner}
                </Chip>
              )}
              {article.created_at && (
                <Chip icon="calendar" compact style={styles.chip}>
                  {new Date(article.created_at).toLocaleDateString()}
                </Chip>
              )}
            </View>
          </View>
          {canEdit && (
            <View style={styles.actions}>
              <IconButton icon="pencil" size={20} onPress={handleEdit} accessibilityLabel="Edit article" />
              <IconButton icon="delete" size={20} onPress={handleDelete} accessibilityLabel="Delete article" />
            </View>
          )}
        </View>
      </Card.Content>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summary: {
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8,
  },
  chip: {
    height: 28,
  },
  publishedChip: {
    backgroundColor: '#4CAF50',
  },
  draftChip: {
    backgroundColor: '#FF9800',
  },
  actions: {
    flexDirection: 'row',
  },
});

export default ArticleCard;

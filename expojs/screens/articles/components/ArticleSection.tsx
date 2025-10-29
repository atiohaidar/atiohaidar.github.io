import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Article } from '@/types/api';
import ArticleCard, { ArticleScope } from './ArticleCard';

interface ArticleSectionProps {
  title: string;
  articles: Article[];
  scope: ArticleScope;
  emptyMessage: string;
  onArticlePress: (article: Article) => void;
  canEdit?: (article: Article) => boolean;
  onEdit?: (article: Article) => void;
  onDelete?: (article: Article) => void;
}

const ArticleSection: React.FC<ArticleSectionProps> = ({
  title,
  articles,
  scope,
  emptyMessage,
  onArticlePress,
  canEdit,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {title}
      </Text>

      {articles.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.emptyText}>
              {emptyMessage}
            </Text>
          </Card.Content>
        </Card>
      ) : (
        articles.map((article) => (
          <ArticleCard
            key={article.slug}
            article={article}
            scope={scope}
            onPress={onArticlePress}
            canEdit={canEdit?.(article)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default ArticleSection;

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  useTheme,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { GlassCard } from '@/components/GlassCard';
import ApiService from '@/services/api';
import { Article } from '@/types/api';

export default function PublicArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await ApiService.listPublicArticles();
      setArticles(data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadArticles();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Published Articles
        </Text>

        {articles.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No published articles yet.
              </Text>
            </Card.Content>
          </GlassCard>
        ) : (
          articles.map((article) => (
            <GlassCard key={article.slug} style={styles.articleCard} mode="elevated">
              <Card.Content>
                <View style={styles.articleInfo}>
                  <Text variant="titleLarge" style={styles.articleTitle}>
                    {article.title}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                    numberOfLines={3}
                  >
                    {article.content}
                  </Text>
                  <View style={styles.articleMeta}>
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
              </Card.Content>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  articleCard: {
    marginBottom: 12,
    elevation: 2,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    height: 28,
  },
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SectionList, RefreshControl } from 'react-native';
import { Text, FAB, ActivityIndicator, Portal, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Article, ArticleCreate, ArticleUpdate } from '@/types/api';
import ArticleCard, { ArticleScope } from './components/ArticleCard';
import { GlassCard } from '@/components/GlassCard';
import ArticleFormDialog, { ArticleFormData } from './components/ArticleFormDialog';

export default function ArticlesScreen() {
  const [ownArticles, setOwnArticles] = useState<Article[]>([]);
  const [publicArticles, setPublicArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    slug: '',
    title: '',
    content: '',
    published: false,
  });
  const [formLoading, setFormLoading] = useState(false);

  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const canEdit = (article: Article) => isAdmin || article.owner === user?.username;

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const [managed, published] = await Promise.all([
        ApiService.listArticles(),
        ApiService.listPublicArticles(),
      ]);

      const ownedList = managed ?? [];
      const publicList = (published ?? []).filter((article) => !canEdit(article));

      setOwnArticles(ownedList);
      setPublicArticles(publicList);
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

  const handleDelete = async (article: Article) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await ApiService.deleteArticle(article.slug);
      setOwnArticles((prev) => prev.filter((a) => a.slug !== article.slug));
      setPublicArticles((prev) => prev.filter((a) => a.slug !== article.slug));
    } catch (error: any) {
      console.error('Failed to delete article:', error);
      alert(error.message || 'Failed to delete article');
    }
  };

  const openCreateDialog = () => {
    setEditingArticle(null);
    setFormData({
      slug: '',
      title: '',
      content: '',
      published: false,
    });
    setDialogVisible(true);
  };

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      slug: article.slug,
      title: article.title,
      content: article.content,
      published: article.published,
    });
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert('Please enter title and content');
      return;
    }

    setFormLoading(true);

    try {
      if (editingArticle) {
        const updates: ArticleUpdate = {
          title: formData.title,
          content: formData.content,
          published: formData.published,
        };
        const updated = await ApiService.updateArticle(editingArticle.slug, updates);
        setOwnArticles((prev) => prev.map((a) => (a.slug === editingArticle.slug ? updated : a)));
        setPublicArticles((prev) => {
          const withoutCurrent = prev.filter((a) => a.slug !== editingArticle.slug);
          if (!canEdit(updated) && updated.published) {
            return [updated, ...withoutCurrent];
          }
          return withoutCurrent;
        });
      } else {
        if (!formData.slug) {
          alert('Please enter an article slug');
          setFormLoading(false);
          return;
        }
        const newArticle: ArticleCreate = {
          slug: formData.slug,
          title: formData.title,
          content: formData.content,
          published: formData.published,
        };
        const created = await ApiService.createArticle(newArticle);
        setOwnArticles((prev) => [created, ...prev]);
      }
      setDialogVisible(false);
    } catch (error: any) {
      console.error('Failed to save article:', error);
      alert(error.message || 'Failed to save article');
    } finally {
      setFormLoading(false);
    }
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
      <SectionList
        sections={[
          { title: 'Your Articles', data: ownArticles, scope: 'private' as const, emptyMessage: 'No articles yet. Create your first article!' },
          { title: 'Published Articles', data: publicArticles, scope: 'public' as const, emptyMessage: 'No additional published articles available.' },
        ]}
        keyExtractor={(item) => item.slug}
        renderItem={({ item, section }) => (
          <ArticleCard
            article={item}
            scope={section.scope}
            onPress={(article) =>
              router.push({
                pathname: '/article/[slug]',
                params: { slug: article.slug, scope: section.scope },
              })
            }
            canEdit={canEdit(item)}
            onEdit={openEditDialog}
            onDelete={handleDelete}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {title}
          </Text>
        )}
        renderSectionFooter={({ section }) => {
          if (section.data.length === 0) {
            return (
              <GlassCard style={styles.emptyCard}>
                <Card.Content>
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    {section.emptyMessage}
                  </Text>
                </Card.Content>
              </GlassCard>
            );
          }
          return <View style={styles.sectionSpacing} />;
        }}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <Text variant="headlineMedium" style={styles.title}>
            Articles
          </Text>
        }
        stickySectionHeadersEnabled={false}
      />

      <FAB icon="plus" style={styles.fab} onPress={openCreateDialog} label="New Article" />

      <Portal>
        <ArticleFormDialog
          visible={dialogVisible}
          loading={formLoading}
          editingArticle={editingArticle}
          formData={formData}
          onChange={(changes) => setFormData((prev) => ({ ...prev, ...changes }))}
          onDismiss={() => setDialogVisible(false)}
          onSubmit={handleSubmit}
        />
      </Portal>
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
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 12,
  },
  sectionSpacing: {
    height: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  emptyCard: {
    marginTop: 8,
    marginBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});

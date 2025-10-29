import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, FAB, ActivityIndicator, Portal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Article, ArticleCreate, ArticleUpdate } from '@/types/api';
import ArticleSection from './components/ArticleSection';
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Articles
        </Text>

        <ArticleSection
          title="Your Articles"
          articles={ownArticles}
          scope="private"
          emptyMessage="No articles yet. Create your first article!"
          onArticlePress={(article) =>
            router.push({
              pathname: '/article/[slug]',
              params: { slug: article.slug, scope: 'private' },
            })
          }
          canEdit={canEdit}
          onEdit={openEditDialog}
          onDelete={handleDelete}
        />

        <View style={styles.sectionSpacing}>
          <ArticleSection
            title="Published Articles"
            articles={publicArticles}
            scope="public"
            emptyMessage="No additional published articles available."
            onArticlePress={(article) =>
              router.push({
                pathname: '/article/[slug]',
                params: { slug: article.slug, scope: 'public' },
              })
            }
          />
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

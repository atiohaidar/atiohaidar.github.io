import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  FAB,
  IconButton,
  useTheme,
  ActivityIndicator,
  Chip,
  Portal,
  Dialog,
  Button,
  TextInput,
  Checkbox,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';
import { Article, ArticleCreate, ArticleUpdate } from '@/types/api';

export default function ArticlesScreen() {
  const [ownArticles, setOwnArticles] = useState<Article[]>([]);
  const [publicArticles, setPublicArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    published: false,
  });
  const [formLoading, setFormLoading] = useState(false);

  const { user, isAdmin } = useAuth();
  const theme = useTheme();
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

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Your Articles
        </Text>

        {ownArticles.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No articles yet. Create your first article!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          ownArticles.map((article) => (
            <Card
              key={article.slug}
              style={styles.articleCard}
              mode="elevated"
              onPress={() =>
                router.push({
                  pathname: '/article/[slug]',
                  params: { slug: article.slug, scope: 'private' },
                })
              }
            >
              <Card.Content>
                <View style={styles.articleHeader}>
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
                      <Chip
                        icon={article.published ? 'check-circle' : 'circle-outline'}
                        compact
                        style={[
                          styles.chip,
                          article.published ? styles.publishedChip : styles.draftChip,
                        ]}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </Chip>
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
                  {canEdit(article) && (
                    <View style={styles.articleActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => openEditDialog(article)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDelete(article)}
                      />
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}

        <Text variant="titleMedium" style={[styles.sectionTitle, styles.sectionSpacing]}>
          Published Articles
        </Text>

        {publicArticles.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No additional published articles available.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          publicArticles.map((article) => (
            <Card
              key={article.slug}
              style={styles.articleCard}
              mode="elevated"
              onPress={() =>
                router.push({
                  pathname: '/article/[slug]',
                  params: { slug: article.slug, scope: 'public' },
                })
              }
            >
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
            </Card>
          ))
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={openCreateDialog} label="New Article" />

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>{editingArticle ? 'Edit Article' : 'Create Article'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {!editingArticle && (
                <TextInput
                  label="Slug (URL-friendly ID)"
                  value={formData.slug}
                  onChangeText={(text) => setFormData({ ...formData, slug: text })}
                  mode="outlined"
                  style={styles.input}
                  disabled={formLoading}
                />
              )}
              <TextInput
                label="Title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                mode="outlined"
                style={styles.input}
                disabled={formLoading}
              />
              <TextInput
                label="Content"
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                mode="outlined"
                multiline
                numberOfLines={10}
                style={styles.input}
                disabled={formLoading}
              />
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={formData.published ? 'checked' : 'unchecked'}
                  onPress={() =>
                    setFormData({ ...formData, published: !formData.published })
                  }
                  disabled={formLoading}
                />
                <Text variant="bodyLarge">Publish article</Text>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onPress={handleSubmit} loading={formLoading} disabled={formLoading}>
              {editingArticle ? 'Update' : 'Create'}
            </Button>
          </Dialog.Actions>
        </Dialog>
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
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionSpacing: {
    marginTop: 24,
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
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  publishedChip: {
    backgroundColor: '#4CAF50',
  },
  draftChip: {
    backgroundColor: '#FF9800',
  },
  articleActions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  dialog: {
    maxHeight: '80%',
  },
  input: {
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

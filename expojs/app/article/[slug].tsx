import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, IconButton, Chip, useTheme } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import ApiService from '@/services/api';

export default function ArticleDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { slug = '', scope = 'private' } = useLocalSearchParams<{ slug?: string; scope?: string }>();
  const isPublic = scope === 'public';

  const {
    data: article,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['article-detail', slug, scope],
    queryFn: async () => {
      if (!slug) {
        throw new Error('Article slug is required');
      }
      return isPublic ? ApiService.getPublicArticle(slug) : ApiService.getArticle(slug);
    },
    enabled: !!slug,
  });

  const formattedDate = useMemo(() => {
    if (!article?.created_at) return undefined;
    return new Date(article.created_at).toLocaleString();
  }, [article?.created_at]);

  const publishedChipColor = article?.published
    ? theme.colors.secondaryContainer
    : theme.colors.surfaceDisabled;

  const publishedChipText = article?.published
    ? theme.colors.onSecondaryContainer
    : theme.colors.onSurfaceVariant;

  const markdownStyles = useMemo(() => {
    const baseTextColor = theme.colors.onBackground;
    const blockBackground = theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    return StyleSheet.create({
      body: {
        fontSize: 16,
        lineHeight: 24,
        color: baseTextColor,
      },
      heading1: {
        fontSize: 28,
        fontWeight: '700',
        marginVertical: 12,
        color: baseTextColor,
      },
      heading2: {
        fontSize: 24,
        fontWeight: '700',
        marginVertical: 10,
        color: baseTextColor,
      },
      heading3: {
        fontSize: 20,
        fontWeight: '700',
        marginVertical: 8,
        color: baseTextColor,
      },
      code_inline: {
        backgroundColor: blockBackground,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        color: baseTextColor,
      },
      fence: {
        backgroundColor: blockBackground,
        padding: 12,
        borderRadius: 6,
        color: baseTextColor,
      },
      list_item: {
        marginVertical: 4,
        color: baseTextColor,
      },
      bullet_list_icon: {
        color: baseTextColor,
      },
      ordered_list_icon: {
        color: baseTextColor,
      },
    });
  }, [theme.colors.onBackground, theme.colors.onSurface, theme.colors.onSurfaceVariant, theme.colors.onSecondaryContainer, theme.colors.secondaryContainer, theme.colors.surfaceDisabled, theme.dark]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>        
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <IconButton icon="arrow-left" accessibilityLabel="Back" onPress={() => router.back()} />
        <View style={styles.headerInfo}>
          <Text variant="titleMedium" style={styles.headerTitle} numberOfLines={1}>
            {article?.title ?? 'Article'}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
            {article?.owner ? `By ${article.owner}` : isPublic ? 'Public article' : 'Private article'}
          </Text>
        </View>
        <IconButton icon="refresh" accessibilityLabel="Reload" onPress={() => refetch()} disabled={isLoading} />
      </View>

      <View style={[styles.contentWrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>        
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading article…
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text variant="bodyLarge" style={styles.errorText}>
              Failed to load article.
            </Text>
            <Text variant="bodySmall" style={styles.errorText}>
              {(error as Error).message}
            </Text>
          </View>
        ) : article ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.metaContainer}>
              <Chip
                icon={article.published ? 'check' : 'clock-outline'}
                style={[styles.statusChip, { backgroundColor: publishedChipColor }]}
                textStyle={{ color: publishedChipText }}
              >
                {article.published ? 'Published' : 'Draft'}
              </Chip>
              {formattedDate && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Created at {formattedDate}
                </Text>
              )}
            </View>

            <Text variant="headlineMedium" style={styles.title}>
              {article.title}
            </Text>

            <Markdown style={markdownStyles}>{article.content}</Markdown>
          </ScrollView>
        ) : (
          <View style={styles.centerContent}>
            <Text variant="bodyLarge">Article not found.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontWeight: '600',
  },
  contentWrapper: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    opacity: 0.7,
  },
  errorText: {
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  metaContainer: {
    gap: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  title: {
    fontWeight: '700',
  },
});

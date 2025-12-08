import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Articles screen for viewing and managing articles
class ArticlesScreen extends StatefulWidget {
  const ArticlesScreen({super.key});

  @override
  State<ArticlesScreen> createState() => _ArticlesScreenState();
}

class _ArticlesScreenState extends State<ArticlesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ArticlesProvider>().loadArticles();
    });
  }

  @override
  Widget build(BuildContext context) {
    final articlesProvider = context.watch<ArticlesProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Articles'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Navigate to create article screen
        },
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _buildBody(articlesProvider, isDark),
    );
  }

  Widget _buildBody(ArticlesProvider provider, bool isDark) {
    if (provider.isLoading && provider.articles.isEmpty) {
      return const LoadingIndicator(message: 'Loading articles...');
    }

    if (provider.error != null && provider.articles.isEmpty) {
      return ErrorDisplay(
        message: provider.error!,
        onRetry: () => provider.loadArticles(),
      );
    }

    if (provider.articles.isEmpty) {
      return const EmptyState(
        icon: Icons.article_outlined,
        title: 'No articles yet',
        subtitle: 'Create your first article to share knowledge',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadArticles(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.articles.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final article = provider.articles[index];
          return _buildArticleCard(article, isDark);
        },
      ),
    );
  }

  Widget _buildArticleCard(Article article, bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (article.thumbnail != null)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: Image.network(
                article.thumbnail!,
                height: 160,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  height: 160,
                  color: isDark ? Colors.black26 : Colors.grey.shade200,
                  child: Icon(Icons.image_not_supported, color: isDark ? Colors.white24 : Colors.grey),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryBlue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        article.category ?? 'Uncategorized',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryBlue,
                        ),
                      ),
                    ),
                    if (article.published)
                      const Icon(Icons.public, size: 16, color: AppColors.success)
                    else
                      const Icon(Icons.lock_outline, size: 16, color: Colors.grey),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  article.title,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  article.excerpt ?? '',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
                    height: 1.4,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 12,
                      backgroundColor: Colors.grey.shade300,
                      child: Text(
                        article.author.name[0].toUpperCase(),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      article.author.name,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      article.createdAt != null 
                          ? DateFormat('MMM d, y').format(DateTime.parse(article.createdAt!))
                          : '',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

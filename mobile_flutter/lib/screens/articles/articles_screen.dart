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
        onPressed: () => _showCreateArticleDialog(context),
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _buildBody(articlesProvider, isDark),
    );
  }

  void _showCreateArticleDialog(BuildContext context) {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    bool isPublished = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.borderMedium
                          : Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Create New Article',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'Title',
                    hintText: 'Article title',
                  ),
                  autofocus: true,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: contentController,
                  decoration: const InputDecoration(
                    labelText: 'Content',
                    hintText: 'Write your article content...',
                  ),
                  maxLines: 6,
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text('Publish immediately'),
                  value: isPublished,
                  onChanged: (val) => setState(() => isPublished = val),
                  contentPadding: EdgeInsets.zero,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    if (titleController.text.trim().isNotEmpty &&
                        contentController.text.trim().isNotEmpty) {
                      final provider = context.read<ArticlesProvider>();
                      final title = titleController.text.trim();
                      final slug =
                          title.toLowerCase().replaceAll(RegExp(r'\s+'), '-');

                      final success =
                          await provider.createArticle(ArticleCreate(
                        title: title,
                        slug: slug,
                        content: contentController.text.trim(),
                        published: isPublished,
                      ));

                      if (success && context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Article created successfully')),
                        );
                      }
                    }
                  },
                  child: const Text('Publish Article'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
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
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryBlue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Article',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryBlue,
                        ),
                      ),
                    ),
                    if (article.published)
                      const Icon(Icons.public,
                          size: 16, color: AppColors.success)
                    else
                      const Icon(Icons.lock_outline,
                          size: 16, color: Colors.grey),
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
                  article
                      .content, // Using content as excerpt for now since no explicit excerpt field
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark
                        ? AppColors.textSecondary
                        : AppColors.lightTextSecondary,
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
                        (article.owner ?? 'U')[0].toUpperCase(),
                        style: const TextStyle(
                            fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      article.owner ?? 'Unknown',
                      style: TextStyle(
                        fontSize: 12,
                        color:
                            isDark ? AppColors.textMuted : Colors.grey.shade600,
                      ),
                    ),
                    const Spacer(),
                    if (article.createdAt != null)
                      Text(
                        DateFormat('MMM d, y')
                            .format(DateTime.parse(article.createdAt!)),
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark
                              ? AppColors.textMuted
                              : Colors.grey.shade600,
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

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Discussions screen for forum discussions
class DiscussionsScreen extends StatefulWidget {
  const DiscussionsScreen({super.key});

  @override
  State<DiscussionsScreen> createState() => _DiscussionsScreenState();
}

class _DiscussionsScreenState extends State<DiscussionsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DiscussionsProvider>().loadDiscussions();
    });
  }

  @override
  Widget build(BuildContext context) {
    final discussionsProvider = context.watch<DiscussionsProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Text(
          'Diskusi Forum',
          style: TextStyle(
            color: isDark ? AppColors.textPrimary : AppColors.lightText,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () => discussionsProvider.loadDiscussions(),
        child: _buildBody(discussionsProvider, isDark),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateDiscussionDialog(context),
        backgroundColor: AppColors.primaryBlue,
        icon: const Icon(Icons.add, color: Colors.white),
        label:
            const Text('Diskusi Baru', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _buildBody(DiscussionsProvider provider, bool isDark) {
    if (provider.isLoading && provider.discussions.isEmpty) {
      return const LoadingIndicator(message: 'Memuat diskusi...');
    }

    if (provider.error != null) {
      return ErrorDisplay(
        message: provider.error!,
        onRetry: provider.loadDiscussions,
      );
    }

    if (provider.discussions.isEmpty) {
      return const EmptyState(
        icon: Icons.forum_outlined,
        title: 'Belum ada diskusi',
        subtitle: 'Mulai percakapan dengan membuat diskusi baru',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16).copyWith(bottom: 80),
      itemCount: provider.discussions.length,
      itemBuilder: (context, index) {
        final discussion = provider.discussions[index];
        return _buildDiscussionCard(discussion, isDark);
      },
    );
  }

  Widget _buildDiscussionCard(Discussion discussion, bool isDark) {
    return GlassCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      onTap: () =>
          context.push('/discussions/${discussion.id}', extra: discussion),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: discussion.isAnonymous
                    ? Colors.grey.withOpacity(0.2)
                    : AppColors.primaryBlue.withOpacity(0.2),
                child: Icon(
                  discussion.isAnonymous ? Icons.person_outline : Icons.person,
                  size: 18,
                  color: discussion.isAnonymous
                      ? Colors.grey
                      : AppColors.primaryBlue,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      discussion.creatorName,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isDark
                            ? AppColors.textPrimary
                            : AppColors.lightText,
                      ),
                    ),
                    Text(
                      _formatDate(discussion.createdAt),
                      style: TextStyle(
                        fontSize: 11,
                        color:
                            isDark ? AppColors.textMuted : Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            discussion.title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimary : AppColors.lightText,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            discussion.content,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 14,
              color: isDark ? AppColors.textSecondary : Colors.grey.shade700,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(
                Icons.comment_outlined,
                size: 16,
                color: isDark ? AppColors.textMuted : Colors.grey.shade500,
              ),
              const SizedBox(width: 4),
              Text(
                '${discussion.replyCount ?? 0} balasan',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                ),
              ),
              const Spacer(),
              Icon(
                Icons.chevron_right,
                color: isDark ? AppColors.textMuted : Colors.grey.shade400,
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m lalu';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}j lalu';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}h lalu';
    } else {
      return DateFormat('MMM d').format(date);
    }
  }

  void _showCreateDiscussionDialog(BuildContext context) {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    final nameController = TextEditingController();
    final authProvider = context.read<AuthProvider>();

    // Pre-fill name if user is authenticated
    if (authProvider.isAuthenticated && authProvider.user != null) {
      nameController.text = authProvider.user!.name;
    }

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Diskusi Baru'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Judul',
                  hintText: 'Apa yang ingin Anda diskusikan?',
                  border: OutlineInputBorder(),
                ),
                textCapitalization: TextCapitalization.sentences,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: contentController,
                decoration: const InputDecoration(
                  labelText: 'Konten',
                  hintText: 'Berikan detail lebih lanjut...',
                  border: OutlineInputBorder(),
                ),
                maxLines: 4,
                textCapitalization: TextCapitalization.sentences,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Nama Anda (Opsional)',
                  hintText: 'Biarkan kosong untuk memposting secara anonim',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => _submitDiscussion(
              dialogContext,
              titleController,
              contentController,
              nameController,
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBlue,
            ),
            child: const Text('Posting'),
          ),
        ],
      ),
    );
  }

  Future<void> _submitDiscussion(
    BuildContext dialogContext,
    TextEditingController titleController,
    TextEditingController contentController,
    TextEditingController nameController,
  ) async {
    // Validate input fields
    if (titleController.text.trim().isEmpty ||
        contentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Harap isi judul dan konten'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final discussionsProvider = context.read<DiscussionsProvider>();
    final data = DiscussionCreate(
      title: titleController.text,
      content: contentController.text,
      creatorName: nameController.text.isEmpty ? null : nameController.text,
    );

    Navigator.of(dialogContext).pop();

    final success = await discussionsProvider.createDiscussion(data);
    if (success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Diskusi berhasil dibuat'),
          backgroundColor: AppColors.success,
        ),
      );
    } else if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(discussionsProvider.error ?? 'Gagal membuat diskusi'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Discussion detail screen with replies
class DiscussionDetailScreen extends StatefulWidget {
  final String discussionId;
  final Discussion? discussion;

  const DiscussionDetailScreen({
    super.key,
    required this.discussionId,
    this.discussion,
  });

  @override
  State<DiscussionDetailScreen> createState() => _DiscussionDetailScreenState();
}

class _DiscussionDetailScreenState extends State<DiscussionDetailScreen> {
  final _replyController = TextEditingController();
  final _nameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DiscussionsProvider>().loadDiscussion(widget.discussionId);

      // Pre-fill name if user is authenticated
      final authProvider = context.read<AuthProvider>();
      if (authProvider.isAuthenticated && authProvider.user != null) {
        _nameController.text = authProvider.user!.name;
      }
    });
  }

  @override
  void dispose() {
    _replyController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final discussionsProvider = context.watch<DiscussionsProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Discussion'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _buildBody(discussionsProvider, isDark),
    );
  }

  Widget _buildBody(DiscussionsProvider provider, bool isDark) {
    if (provider.isLoading && provider.selectedDiscussion == null) {
      return const LoadingIndicator(message: 'Loading discussion...');
    }

    if (provider.error != null) {
      return ErrorDisplay(
        message: provider.error!,
        onRetry: () => provider.loadDiscussion(widget.discussionId),
      );
    }

    final discussionWithReplies = provider.selectedDiscussion;
    if (discussionWithReplies == null) {
      return const EmptyState(
        icon: Icons.forum_outlined,
        title: 'Discussion not found',
      );
    }

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDiscussionHeader(
                    discussionWithReplies.discussion, isDark),
                const SizedBox(height: 24),
                _buildRepliesSection(discussionWithReplies.replies, isDark),
              ],
            ),
          ),
        ),
        _buildReplyInput(isDark),
      ],
    );
  }

  Widget _buildDiscussionHeader(Discussion discussion, bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: discussion.isAnonymous
                    ? Colors.grey.withOpacity(0.2)
                    : AppColors.primaryBlue.withOpacity(0.2),
                child: Icon(
                  discussion.isAnonymous ? Icons.person_outline : Icons.person,
                  size: 22,
                  color: discussion.isAnonymous
                      ? Colors.grey
                      : AppColors.primaryBlue,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      discussion.creatorName,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isDark
                            ? AppColors.textPrimary
                            : AppColors.lightText,
                      ),
                    ),
                    Text(
                      DateFormat('MMM d, yyyy • h:mm a')
                          .format(discussion.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color:
                            isDark ? AppColors.textMuted : Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            discussion.title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimary : AppColors.lightText,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            discussion.content,
            style: TextStyle(
              fontSize: 15,
              color: isDark ? AppColors.textSecondary : Colors.grey.shade700,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRepliesSection(List<DiscussionReply> replies, bool isDark) {
    if (replies.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(
              Icons.chat_bubble_outline,
              size: 48,
              color: isDark ? AppColors.textMuted : Colors.grey.shade400,
            ),
            const SizedBox(height: 12),
            Text(
              'No replies yet',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppColors.textMuted : Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Be the first to reply!',
              style: TextStyle(
                fontSize: 12,
                color: isDark ? AppColors.textMuted : Colors.grey.shade500,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Replies (${replies.length})',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimary : AppColors.lightText,
          ),
        ),
        const SizedBox(height: 12),
        ...replies.map((reply) => _buildReplyCard(reply, isDark)),
      ],
    );
  }

  Widget _buildReplyCard(DiscussionReply reply, bool isDark) {
    return GlassCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: reply.isAnonymous
                    ? Colors.grey.withOpacity(0.2)
                    : AppColors.primaryBlue.withOpacity(0.2),
                child: Icon(
                  reply.isAnonymous ? Icons.person_outline : Icons.person,
                  size: 18,
                  color:
                      reply.isAnonymous ? Colors.grey : AppColors.primaryBlue,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      reply.creatorName,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isDark
                            ? AppColors.textPrimary
                            : AppColors.lightText,
                      ),
                    ),
                    Text(
                      _formatDate(reply.createdAt),
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
            reply.content,
            style: TextStyle(
              fontSize: 14,
              color: isDark ? AppColors.textSecondary : Colors.grey.shade700,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReplyInput(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSurface.withOpacity(0.95)
            : Colors.white.withOpacity(0.95),
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.borderLight : Colors.grey.shade200,
          ),
        ),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Your Name (Optional)',
                hintText: 'Leave empty to reply anonymously',
                border: const OutlineInputBorder(),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                labelStyle: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                ),
              ),
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: TextField(
                    controller: _replyController,
                    decoration: InputDecoration(
                      hintText: 'Write a reply...',
                      border: const OutlineInputBorder(),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 12),
                      hintStyle: TextStyle(
                        color:
                            isDark ? AppColors.textMuted : Colors.grey.shade500,
                      ),
                    ),
                    maxLines: 3,
                    minLines: 1,
                    textCapitalization: TextCapitalization.sentences,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.gradientBlue, AppColors.gradientCyan],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    onPressed: _submitReply,
                    icon: const Icon(Icons.send, color: Colors.white),
                    tooltip: 'Send reply',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    } else {
      return DateFormat('MMM d').format(date);
    }
  }

  Future<void> _submitReply() async {
    if (_replyController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a reply'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final discussionsProvider = context.read<DiscussionsProvider>();
    final data = DiscussionReplyCreate(
      content: _replyController.text.trim(),
      creatorName: _nameController.text.isEmpty ? null : _nameController.text,
    );

    final success =
        await discussionsProvider.addReply(widget.discussionId, data);

    if (success && mounted) {
      _replyController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Reply posted successfully'),
          backgroundColor: AppColors.success,
        ),
      );
      // Scroll to bottom to show new reply
      Future.delayed(const Duration(milliseconds: 300), () {
        if (mounted) {
          Scrollable.ensureVisible(
            context,
            alignment: 1.0,
            duration: const Duration(milliseconds: 300),
          );
        }
      });
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(discussionsProvider.error ?? 'Failed to post reply'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
}

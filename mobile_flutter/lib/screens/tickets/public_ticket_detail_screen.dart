import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../services/services.dart';
import '../../models/models.dart';
import '../../widgets/widgets.dart';

/// Public Ticket Detail Screen - View ticket by token
class PublicTicketDetailScreen extends StatefulWidget {
  final String token;

  const PublicTicketDetailScreen({super.key, required this.token});

  @override
  State<PublicTicketDetailScreen> createState() =>
      _PublicTicketDetailScreenState();
}

class _PublicTicketDetailScreenState extends State<PublicTicketDetailScreen> {
  final _commentController = TextEditingController();

  Ticket? _ticket;
  List<TicketComment> _comments = [];
  bool _isLoading = true;
  bool _isSendingComment = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTicket();
  }

  Future<void> _loadTicket() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final ticket = await ApiService.getPublicTicketByToken(widget.token);
      final comments = await ApiService.getPublicTicketComments(widget.token);
      setState(() {
        _ticket = ticket;
        _comments = comments;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _addComment() async {
    if (_commentController.text.trim().isEmpty) return;

    setState(() => _isSendingComment = true);

    try {
      await ApiService.addPublicTicketComment(
        widget.token,
        _commentController.text.trim(),
      );
      _commentController.clear();
      await _loadTicket();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      setState(() => _isSendingComment = false);
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Ticket Status'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: _buildBody(isDark),
    );
  }

  Widget _buildBody(bool isDark) {
    if (_isLoading) {
      return const LoadingIndicator(message: 'Loading ticket...');
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                'Ticket not found',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Please check your token and try again.',
                style: TextStyle(
                  color: isDark
                      ? AppColors.textSecondary
                      : AppColors.lightTextSecondary,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildTicketCard(isDark),
              const SizedBox(height: 16),
              _buildCommentsSection(isDark),
            ],
          ),
        ),
        _buildCommentInput(isDark),
      ],
    );
  }

  Widget _buildTicketCard(bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  _ticket!.title,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
              ),
              _buildStatusBadge(_ticket!.status),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _ticket!.description,
            style: TextStyle(
              color: isDark
                  ? AppColors.textSecondary
                  : AppColors.lightTextSecondary,
            ),
          ),
          if (_ticket!.createdAt != null) ...[
            const SizedBox(height: 12),
            Text(
              'Submitted: ${DateFormat('MMM d, y HH:mm').format(DateTime.parse(_ticket!.createdAt!).toLocal())}',
              style: TextStyle(
                fontSize: 12,
                color: isDark ? AppColors.textMuted : Colors.grey.shade600,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusBadge(TicketStatus status) {
    Color color;
    switch (status) {
      case TicketStatus.open:
        color = AppColors.info;
        break;
      case TicketStatus.inProgress:
        color = AppColors.warning;
        break;
      case TicketStatus.waiting:
        color = AppColors.purple;
        break;
      case TicketStatus.solved:
        color = AppColors.success;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color),
      ),
      child: Text(
        status.value.toUpperCase().replaceAll('_', ' '),
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildCommentsSection(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Comments',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimary : AppColors.lightText,
          ),
        ),
        const SizedBox(height: 12),
        if (_comments.isEmpty)
          Text(
            'No comments yet',
            style: TextStyle(
              color: isDark
                  ? AppColors.textSecondary
                  : AppColors.lightTextSecondary,
            ),
          )
        else
          ...(_comments.map((c) => _buildCommentCard(c, isDark))),
      ],
    );
  }

  Widget _buildCommentCard(TicketComment comment, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  comment.commenterName,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: comment.commenterType == 'staff'
                        ? AppColors.primaryBlue.withOpacity(0.1)
                        : Colors.grey.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    comment.commenterType.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      color: comment.commenterType == 'staff'
                          ? AppColors.primaryBlue
                          : AppColors.textMuted,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              comment.commentText,
              style: TextStyle(
                color: isDark
                    ? AppColors.textSecondary
                    : AppColors.lightTextSecondary,
              ),
            ),
            if (comment.createdAt != null) ...[
              const SizedBox(height: 8),
              Text(
                DateFormat('MMM d, y HH:mm')
                    .format(DateTime.parse(comment.createdAt!).toLocal()),
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCommentInput(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.borderLight : Colors.grey.shade200,
          ),
        ),
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _commentController,
                decoration: const InputDecoration(
                  hintText: 'Add a comment...',
                  border: InputBorder.none,
                ),
                maxLines: 2,
                minLines: 1,
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              onPressed: _isSendingComment ? null : _addComment,
              icon: _isSendingComment
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.send, color: AppColors.primaryBlue),
            ),
          ],
        ),
      ),
    );
  }
}

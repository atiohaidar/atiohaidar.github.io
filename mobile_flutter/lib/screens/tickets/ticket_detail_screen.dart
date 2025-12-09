import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../services/services.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

class TicketDetailScreen extends StatefulWidget {
  final int ticketId;
  final Ticket? ticket;

  const TicketDetailScreen({
    super.key,
    required this.ticketId,
    this.ticket,
  });

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  final TextEditingController _commentController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.ticket == null) {
        // Load ticket details if not passed
      }
      // Load comments
    });
  }

  @override
  void dispose() {
    _commentController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Determine the ticket to display (either passed or from provider)
    // For now, assuming ticket is passed or handled via provider
    final ticket = widget.ticket;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (ticket == null) {
      return Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: const Text('Ticket Details'),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Text('Ticket #${ticket.id}'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (value) {
              if (value == 'edit') {
                _showEditTicketDialog(ticket);
              } else if (value == 'delete') {
                _showDeleteConfirmation(ticket);
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'edit',
                child: Row(
                  children: [
                    Icon(Icons.edit, size: 20),
                    SizedBox(width: 8),
                    Text('Edit'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete, size: 20, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Delete', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTicketHeader(ticket, isDark),
                  const SizedBox(height: 16),
                  _buildTicketDescription(ticket, isDark),
                  const SizedBox(height: 24),
                  _buildCommentsSection(isDark),
                ],
              ),
            ),
          ),
          _buildCommentInput(isDark),
        ],
      ),
    );
  }

  void _showEditTicketDialog(Ticket ticket) {
    final titleController = TextEditingController(text: ticket.title);
    final descController = TextEditingController(text: ticket.description);
    TicketStatus selectedStatus = ticket.status;
    TicketPriority selectedPriority = ticket.priority;
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Edit Ticket',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(labelText: 'Title'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descController,
                  decoration: const InputDecoration(labelText: 'Description'),
                  maxLines: 3,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<TicketStatus>(
                  value: selectedStatus,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: TicketStatus.values
                      .map((s) => DropdownMenuItem(
                            value: s,
                            child: Text(s.value.replaceAll('_', ' ')),
                          ))
                      .toList(),
                  onChanged: (v) => setState(() => selectedStatus = v!),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<TicketPriority>(
                  value: selectedPriority,
                  decoration: const InputDecoration(labelText: 'Priority'),
                  items: TicketPriority.values
                      .map((p) => DropdownMenuItem(
                            value: p,
                            child: Text(p.value),
                          ))
                      .toList(),
                  onChanged: (v) => setState(() => selectedPriority = v!),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      Navigator.pop(context);
                      final provider = context.read<TicketsProvider>();
                      final update = TicketUpdate(
                        title: titleController.text.trim(),
                        description: descController.text.trim(),
                        status: selectedStatus,
                        priority: selectedPriority,
                      );
                      final success =
                          await provider.updateTicket(ticket.id, update);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(success
                                ? 'Ticket updated'
                                : provider.error ?? 'Update failed'),
                            backgroundColor:
                                success ? AppColors.success : AppColors.error,
                          ),
                        );
                      }
                    },
                    child: const Text('Save Changes'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showDeleteConfirmation(Ticket ticket) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Ticket'),
        content: Text('Are you sure you want to delete ticket #${ticket.id}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              // Delete ticket via API
              try {
                await ApiService.deleteTicket(ticket.id);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Ticket deleted'),
                      backgroundColor: AppColors.success,
                    ),
                  );
                  context.pop();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to delete: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketHeader(Ticket ticket, bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStatusBadge(ticket.status),
              _buildPriorityBadge(ticket.priority),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            ticket.title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimary : AppColors.lightText,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                Icons.person_outline,
                size: 16,
                color: isDark
                    ? AppColors.textSecondary
                    : AppColors.lightTextSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                'Created by you', // Replace with creator name if available
                style: TextStyle(
                  fontSize: 14,
                  color: isDark
                      ? AppColors.textSecondary
                      : AppColors.lightTextSecondary,
                ),
              ),
              const SizedBox(width: 16),
              Icon(
                Icons.access_time,
                size: 16,
                color: isDark
                    ? AppColors.textSecondary
                    : AppColors.lightTextSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                ticket.createdAt != null
                    ? DateFormat('MMM d, y HH:mm')
                        .format(DateTime.parse(ticket.createdAt!))
                    : 'Unknown date',
                style: TextStyle(
                  fontSize: 14,
                  color: isDark
                      ? AppColors.textSecondary
                      : AppColors.lightTextSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTicketDescription(Ticket ticket, bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Description',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimary : AppColors.lightText,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            ticket.description,
            style: TextStyle(
              fontSize: 15,
              height: 1.5,
              color: isDark
                  ? AppColors.textSecondary
                  : AppColors.lightTextSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommentsSection(bool isDark) {
    // Placeholder for comments
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
        const SizedBox(height: 16),
        const Center(
          child: Text('No comments yet'),
        ),
      ],
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
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _commentController,
              decoration: InputDecoration(
                hintText: 'Add a comment...',
                filled: true,
                fillColor: isDark ? AppColors.deepNavy : Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 10,
                ),
              ),
              maxLines: null,
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: _isSubmitting ? null : _submitComment,
            icon: _isSubmitting
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.send),
            color: AppColors.primaryBlue,
          ),
        ],
      ),
    );
  }

  void _submitComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    setState(() => _isSubmitting = true);

    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));

    if (mounted) {
      setState(() {
        _isSubmitting = false;
        _commentController.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Comment posted')),
      );
    }
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
        color = Colors.orange;
        break;
      case TicketStatus.solved:
        color = AppColors.success;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        status.value.replaceAll('_', ' ').toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }

  Widget _buildPriorityBadge(TicketPriority priority) {
    Color color;
    switch (priority) {
      case TicketPriority.low:
        color = Colors.green;
        break;
      case TicketPriority.medium:
        color = Colors.blue;
        break;
      case TicketPriority.high:
        color = Colors.orange;
        break;
      case TicketPriority.critical:
        color = Colors.red;
        break;
    }

    return Row(
      children: [
        Icon(Icons.flag, size: 16, color: color),
        const SizedBox(width: 4),
        Text(
          priority.value.toUpperCase(),
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }
}

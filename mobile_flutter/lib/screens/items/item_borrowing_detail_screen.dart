import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/services.dart';
import '../../models/models.dart';
import '../../widgets/widgets.dart';

/// Item Borrowing Detail Screen
class ItemBorrowingDetailScreen extends StatefulWidget {
  final String borrowingId;
  final ItemBorrowing? borrowing;

  const ItemBorrowingDetailScreen({
    super.key,
    required this.borrowingId,
    this.borrowing,
  });

  @override
  State<ItemBorrowingDetailScreen> createState() =>
      _ItemBorrowingDetailScreenState();
}

class _ItemBorrowingDetailScreenState extends State<ItemBorrowingDetailScreen> {
  ItemBorrowing? _borrowing;
  Item? _item;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _borrowing = widget.borrowing;
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      if (_borrowing == null) {
        _borrowing = await ApiService.getItemBorrowing(widget.borrowingId);
      }
      _item = await ApiService.getItem(_borrowing!.itemId);
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Borrowing Details'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: _buildBody(isDark),
    );
  }

  Widget _buildBody(bool isDark) {
    if (_isLoading) {
      return const LoadingIndicator(message: 'Loading details...');
    }

    if (_error != null) {
      return ErrorDisplay(
        message: _error!,
        onRetry: _loadData,
      );
    }

    if (_borrowing == null) {
      return const EmptyState(
        icon: Icons.assignment_outlined,
        title: 'Borrowing not found',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildStatusCard(isDark),
            const SizedBox(height: 16),
            _buildItemCard(isDark),
            const SizedBox(height: 16),
            _buildDetailsCard(isDark),
            const SizedBox(height: 24),
            if (_borrowing!.status == ItemBorrowingStatus.pending ||
                _borrowing!.status == ItemBorrowingStatus.approved)
              _buildCancelButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(bool isDark) {
    Color statusColor;
    IconData statusIcon;
    String statusText;

    switch (_borrowing!.status) {
      case ItemBorrowingStatus.approved:
        statusColor = AppColors.success;
        statusIcon = Icons.check_circle;
        statusText = 'Approved';
        break;
      case ItemBorrowingStatus.pending:
        statusColor = AppColors.warning;
        statusIcon = Icons.schedule;
        statusText = 'Pending Approval';
        break;
      case ItemBorrowingStatus.returned:
        statusColor = AppColors.info;
        statusIcon = Icons.assignment_return;
        statusText = 'Returned';
        break;
      case ItemBorrowingStatus.rejected:
        statusColor = AppColors.error;
        statusIcon = Icons.cancel;
        statusText = 'Rejected';
        break;
      case ItemBorrowingStatus.damaged:
        statusColor = AppColors.error;
        statusIcon = Icons.warning;
        statusText = 'Damaged';
        break;
      case ItemBorrowingStatus.extended:
        statusColor = AppColors.purple;
        statusIcon = Icons.update;
        statusText = 'Extended';
        break;
    }

    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(statusIcon, color: statusColor, size: 32),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  statusText,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
                Text(
                  'Borrowing #${_borrowing!.id.substring(0, 8)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemCard(bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: isDark
                      ? Colors.white.withOpacity(0.05)
                      : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.inventory_2,
                  size: 30,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade400,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _item?.name ?? 'Loading...',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isDark
                            ? AppColors.textPrimary
                            : AppColors.lightText,
                      ),
                    ),
                    if (_item?.description != null)
                      Text(
                        _item!.description!,
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark
                              ? AppColors.textMuted
                              : Colors.grey.shade600,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primaryBlue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.numbers,
                    size: 16, color: AppColors.primaryBlue),
                const SizedBox(width: 6),
                Text(
                  'Quantity: ${_borrowing!.quantity}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryBlue,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsCard(bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Borrowing Details',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimary : AppColors.lightText,
            ),
          ),
          const SizedBox(height: 16),
          _buildDetailRow(
            Icons.calendar_today,
            'Start Date',
            _borrowing!.startDate,
            isDark,
          ),
          const SizedBox(height: 12),
          _buildDetailRow(
            Icons.event_available,
            'End Date',
            _borrowing!.endDate,
            isDark,
          ),
          const SizedBox(height: 12),
          _buildDetailRow(
            Icons.person_outline,
            'Borrower',
            _borrowing!.borrowerUsername,
            isDark,
          ),
          if (_borrowing!.notes != null) ...[
            const SizedBox(height: 12),
            _buildDetailRow(
              Icons.notes,
              'Notes',
              _borrowing!.notes!,
              isDark,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDetailRow(
      IconData icon, String label, String value, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 18,
          color: AppColors.primaryBlue,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCancelButton() {
    return ElevatedButton.icon(
      onPressed: () => _showCancelDialog(),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.error,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      icon: const Icon(Icons.cancel),
      label: const Text('Cancel Borrowing'),
    );
  }

  void _showCancelDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Borrowing'),
        content: const Text(
            'Are you sure you want to cancel this borrowing request?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ApiService.cancelItemBorrowing(_borrowing!.id);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Borrowing cancelled successfully')),
                  );
                  Navigator.pop(context); // Go back to list
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }
}

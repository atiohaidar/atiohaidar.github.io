import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/transaction.dart';

/// Transaction History Screen - Shows all transactions with filtering
class TransactionHistoryScreen extends StatefulWidget {
  const TransactionHistoryScreen({super.key});

  @override
  State<TransactionHistoryScreen> createState() =>
      _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends State<TransactionHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WalletProvider>().loadTransactions();
    });
  }

  @override
  Widget build(BuildContext context) {
    final walletProvider = context.watch<WalletProvider>();
    final authProvider = context.watch<AuthProvider>();
    final currentUsername = authProvider.user?.username ?? '';
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transaction History'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          PopupMenuButton<TransactionType?>(
            icon: Icon(
              Icons.filter_list,
              color: walletProvider.filterType != null
                  ? AppColors.primaryBlue
                  : (isDark
                      ? AppColors.textSecondary
                      : AppColors.lightTextSecondary),
            ),
            onSelected: (type) {
              walletProvider.setFilter(type);
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: null,
                child: Row(
                  children: [
                    Icon(
                      Icons.all_inclusive,
                      color: walletProvider.filterType == null
                          ? AppColors.primaryBlue
                          : null,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    const Text('All Transactions'),
                  ],
                ),
              ),
              PopupMenuItem(
                value: TransactionType.transfer,
                child: Row(
                  children: [
                    Icon(
                      Icons.swap_horiz,
                      color:
                          walletProvider.filterType == TransactionType.transfer
                              ? AppColors.primaryBlue
                              : null,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    const Text('Transfers'),
                  ],
                ),
              ),
              PopupMenuItem(
                value: TransactionType.topup,
                child: Row(
                  children: [
                    Icon(
                      Icons.add_circle_outline,
                      color: walletProvider.filterType == TransactionType.topup
                          ? AppColors.primaryBlue
                          : null,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    const Text('Top Ups'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      extendBodyBehindAppBar: true,
      body: GradientBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Summary Card
              Padding(
                padding: const EdgeInsets.all(16),
                child:
                    _buildSummaryCard(walletProvider, currentUsername, isDark),
              ),

              // Transactions List
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () => walletProvider.refresh(),
                  child: _buildTransactionsList(
                    walletProvider,
                    currentUsername,
                    isDark,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCard(
    WalletProvider provider,
    String currentUsername,
    bool isDark,
  ) {
    final summary = provider.getSummary(currentUsername);

    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildSummaryItem(
                icon: Icons.arrow_downward,
                label: 'Income',
                amount: summary['income'] ?? 0,
                color: Colors.green,
                isDark: isDark,
              ),
              Container(
                width: 1,
                height: 50,
                color: isDark ? AppColors.borderLight : Colors.grey.shade300,
              ),
              _buildSummaryItem(
                icon: Icons.arrow_upward,
                label: 'Outcome',
                amount: summary['outcome'] ?? 0,
                color: Colors.red,
                isDark: isDark,
              ),
              Container(
                width: 1,
                height: 50,
                color: isDark ? AppColors.borderLight : Colors.grey.shade300,
              ),
              _buildSummaryItem(
                icon: Icons.add_circle,
                label: 'Top Up',
                amount: summary['topup'] ?? 0,
                color: AppColors.primaryBlue,
                isDark: isDark,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem({
    required IconData icon,
    required String label,
    required double amount,
    required Color color,
    required bool isDark,
  }) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isDark ? AppColors.textMuted : Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _formatCurrency(amount),
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimary : AppColors.lightText,
          ),
        ),
      ],
    );
  }

  Widget _buildTransactionsList(
    WalletProvider provider,
    String currentUsername,
    bool isDark,
  ) {
    if (provider.isLoading) {
      return const LoadingIndicator(message: 'Loading transactions...');
    }

    if (provider.error != null) {
      return ErrorDisplay(
        message: provider.error!,
        onRetry: () => provider.refresh(),
      );
    }

    final transactions = provider.transactions;

    if (transactions.isEmpty) {
      return const EmptyState(
        icon: Icons.receipt_long,
        title: 'No Transactions',
        subtitle: 'Your transaction history will appear here',
      );
    }

    // Group transactions by date
    final grouped = <String, List<Transaction>>{};
    for (final transaction in transactions) {
      final dateKey = DateFormat('yyyy-MM-dd').format(transaction.createdAt);
      grouped.putIfAbsent(dateKey, () => []).add(transaction);
    }

    final dates = grouped.keys.toList()..sort((a, b) => b.compareTo(a));

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: dates.length,
      itemBuilder: (context, index) {
        final date = dates[index];
        final dayTransactions = grouped[date]!;
        final dateTime = DateTime.parse(date);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                _formatDateHeader(dateTime),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                ),
              ),
            ),
            ...dayTransactions.map((transaction) => _buildTransactionCard(
                  transaction,
                  currentUsername,
                  isDark,
                )),
          ],
        );
      },
    );
  }

  Widget _buildTransactionCard(
    Transaction transaction,
    String currentUsername,
    bool isDark,
  ) {
    final isIncome = transaction.isIncome(currentUsername);
    final isTopUp = transaction.type == TransactionType.topup;

    final Color iconColor;
    final IconData icon;

    if (isTopUp) {
      iconColor = AppColors.primaryBlue;
      icon = Icons.add_circle;
    } else if (isIncome) {
      iconColor = Colors.green;
      icon = Icons.arrow_downward;
    } else {
      iconColor = Colors.red;
      icon = Icons.arrow_upward;
    }

    return GlassCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isTopUp
                      ? 'Top Up'
                      : (isIncome
                          ? 'Received from ${transaction.fromUsername ?? 'Unknown'}'
                          : 'Transfer to ${transaction.toUsername}'),
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 4),
                if (transaction.description != null)
                  Text(
                    transaction.description!,
                    style: TextStyle(
                      fontSize: 12,
                      color:
                          isDark ? AppColors.textMuted : Colors.grey.shade600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                Text(
                  DateFormat('HH:mm').format(transaction.createdAt),
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          ),
          Text(
            transaction.getFormattedAmount(currentUsername),
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isTopUp
                  ? AppColors.primaryBlue
                  : (isIncome ? Colors.green : Colors.red),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDateHeader(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final dateOnly = DateTime(date.year, date.month, date.day);

    if (dateOnly == today) {
      return 'Today';
    } else if (dateOnly == yesterday) {
      return 'Yesterday';
    } else if (date.year == now.year) {
      return DateFormat('EEEE, d MMMM').format(date);
    } else {
      return DateFormat('d MMMM yyyy').format(date);
    }
  }

  String _formatCurrency(double amount) {
    if (amount >= 1000000) {
      return 'Rp ${(amount / 1000000).toStringAsFixed(1)}M';
    } else if (amount >= 1000) {
      return 'Rp ${(amount / 1000).toStringAsFixed(0)}K';
    }
    return 'Rp ${amount.toStringAsFixed(0)}';
  }
}

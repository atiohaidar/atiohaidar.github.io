import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Items screen for inventory management
class ItemsScreen extends StatefulWidget {
  const ItemsScreen({super.key});

  @override
  State<ItemsScreen> createState() => _ItemsScreenState();
}

class _ItemsScreenState extends State<ItemsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ItemsProvider>().loadAll();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final itemsProvider = context.watch<ItemsProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Inventory & Items'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryBlue,
          unselectedLabelColor: isDark ? AppColors.textMuted : Colors.grey.shade600,
          indicatorColor: AppColors.primaryBlue,
          tabs: const [
            Tab(text: 'Items'),
            Tab(text: 'My Borrowings'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add item or request borrowing
        },
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildItemsList(itemsProvider, isDark),
          _buildBorrowingsList(itemsProvider, isDark),
        ],
      ),
    );
  }

  Widget _buildItemsList(ItemsProvider provider, bool isDark) {
    if (provider.isLoading && provider.items.isEmpty) {
      return const LoadingIndicator(message: 'Loading items...');
    }

    if (provider.items.isEmpty) {
      return const EmptyState(
        icon: Icons.inventory_2_outlined,
        title: 'No items found',
        subtitle: 'Inventory is empty',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadItems(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.items.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final item = provider.items[index];
          return _buildItemCard(item, isDark);
        },
      ),
    );
  }

  Widget _buildItemCard(Item item, bool isDark) {
    final isAvailable = item.stock > 0;
    
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey.shade100,
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        item.name,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDark ? AppColors.textPrimary : AppColors.lightText,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isAvailable 
                            ? AppColors.success.withOpacity(0.1) 
                            : AppColors.error.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Stock: ${item.stock}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isAvailable ? AppColors.success : AppColors.error,
                        ),
                      ),
                    ),
                  ],
                ),
                if (item.description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    item.description!,
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 8),
                Text(
                  'Owner: ${item.ownerUsername}',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBorrowingsList(ItemsProvider provider, bool isDark) {
    if (provider.isLoading && provider.borrowings.isEmpty) {
      return const LoadingIndicator(message: 'Loading borrowings...');
    }

    if (provider.borrowings.isEmpty) {
      return const EmptyState(
        icon: Icons.assignment_return_outlined,
        title: 'No borrowings',
        subtitle: 'You haven\'t borrowed any items',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadBorrowings(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.borrowings.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final borrowing = provider.borrowings[index];
          // Find item name
          final itemName = provider.items.firstWhere(
            (i) => i.id == borrowing.itemId,
            orElse: () => const Item(id: '', name: 'Unknown Item', stock: 0, ownerUsername: ''),
          ).name;
          
          return _buildBorrowingCard(borrowing, itemName, isDark);
        },
      ),
    );
  }

  Widget _buildBorrowingCard(ItemBorrowing borrowing, String itemName, bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                itemName,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
              ),
              _buildStatusBadge(borrowing.status),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildInfoChip(
                Icons.onetwothree,
                'Qty: ${borrowing.quantity}',
                isDark,
              ),
              const SizedBox(width: 12),
              _buildInfoChip(
                Icons.calendar_today,
                'Until ${borrowing.endDate}',
                isDark,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: isDark ? AppColors.textMuted : Colors.grey.shade600,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? AppColors.textMuted : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(ItemBorrowingStatus status) {
    Color color;
    Color bgColor;
    
    switch (status) {
      case ItemBorrowingStatus.approved:
        color = const Color(0xFF059669);
        bgColor = const Color(0xFFD1FAE5);
        break;
      case ItemBorrowingStatus.pending:
        color = const Color(0xFFD97706);
        bgColor = const Color(0xFFFEF3C7);
        break;
      case ItemBorrowingStatus.returned:
        color = const Color(0xFF2563EB);
        bgColor = const Color(0xFFDBEAFE);
        break;
      case ItemBorrowingStatus.rejected:
      case ItemBorrowingStatus.damaged:
        color = const Color(0xFFDC2626);
        bgColor = const Color(0xFFFEE2E2);
        break;
      case ItemBorrowingStatus.extended:
        color = const Color(0xFF7C3AED);
        bgColor = const Color(0xFFEDE9FE);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.value.toUpperCase(),
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }
}

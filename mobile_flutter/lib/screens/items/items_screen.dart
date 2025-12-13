import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
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

class _ItemsScreenState extends State<ItemsScreen>
    with SingleTickerProviderStateMixin {
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
        title: const Text('Inventaris & Barang'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryBlue,
          unselectedLabelColor:
              isDark ? AppColors.textMuted : Colors.grey.shade600,
          indicatorColor: AppColors.primaryBlue,
          tabs: const [
            Tab(text: 'Barang'),
            Tab(text: 'Peminjaman Saya'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateItemDialog(context),
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

  void _showCreateItemDialog(BuildContext context) {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    final stockController = TextEditingController(text: '1');
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
                  'Tambah Barang Baru',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Barang',
                    hintText: 'Masukkan nama barang',
                  ),
                  autofocus: true,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descController,
                  decoration: const InputDecoration(
                    labelText: 'Deskripsi (opsional)',
                    hintText: 'Masukkan deskripsi barang',
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: stockController,
                  decoration: const InputDecoration(
                    labelText: 'Jumlah Stok',
                    hintText: 'Masukkan jumlah',
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    if (nameController.text.trim().isNotEmpty &&
                        stockController.text.trim().isNotEmpty) {
                      final provider = context.read<ItemsProvider>();
                      final stock =
                          int.tryParse(stockController.text.trim()) ?? 1;

                      final success = await provider.createItem(ItemCreate(
                        name: nameController.text.trim(),
                        description: descController.text.trim().isNotEmpty
                            ? descController.text.trim()
                            : null,
                        stock: stock,
                      ));

                      if (success && context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Barang berhasil ditambahkan')),
                        );
                      }
                    }
                  },
                  child: const Text('Tambah Barang'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildItemsList(ItemsProvider provider, bool isDark) {
    if (provider.isLoading && provider.items.isEmpty) {
      return const LoadingIndicator(message: 'Memuat barang...');
    }

    if (provider.items.isEmpty) {
      return const EmptyState(
        icon: Icons.inventory_2_outlined,
        title: 'Tidak ada barang ditemukan',
        subtitle: 'Inventaris kosong',
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        item.name,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDark
                              ? AppColors.textPrimary
                              : AppColors.lightText,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isAvailable
                            ? AppColors.success.withOpacity(0.1)
                            : AppColors.error.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Stok: ${item.stock}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color:
                              isAvailable ? AppColors.success : AppColors.error,
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
                      color:
                          isDark ? AppColors.textMuted : Colors.grey.shade600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(
                      'Pemilik: ${item.ownerUsername}',
                      style: TextStyle(
                        fontSize: 12,
                        color:
                            isDark ? AppColors.textMuted : Colors.grey.shade500,
                      ),
                    ),
                    const Spacer(),
                    if (isAvailable)
                      SizedBox(
                        height: 32,
                        child: ElevatedButton(
                          onPressed: () => _showBorrowDialog(context, item),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryBlue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            textStyle: const TextStyle(fontSize: 12),
                          ),
                          child: const Text('Pinjam'),
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

  void _showBorrowDialog(BuildContext context, Item item) {
    final qtyController = TextEditingController(text: '1');
    DateTime endDate = DateTime.now().add(const Duration(days: 7));
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
                  'Pinjam Barang',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Meminjam: ${item.name}',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: qtyController,
                  decoration: const InputDecoration(
                    labelText: 'Kuantitas',
                    hintText: 'Masukkan kuantitas',
                  ),
                  keyboardType: TextInputType.number,
                  autofocus: true,
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: endDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (date != null) setState(() => endDate = date);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isDark
                            ? AppColors.borderMedium
                            : Colors.grey.shade300,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.event_available,
                            size: 20,
                            color: isDark
                                ? AppColors.textMuted
                                : Colors.grey.shade600),
                        const SizedBox(width: 8),
                        Text(
                            'Kembalikan sebelum: ${DateFormat('d MMM y').format(endDate)}'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    if (qtyController.text.trim().isNotEmpty) {
                      final provider = context.read<ItemsProvider>();
                      final qty = int.tryParse(qtyController.text.trim()) ?? 1;

                      if (qty > item.stock) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Kuantitas melebihi stok')),
                        );
                        return;
                      }

                      final success =
                          await provider.createBorrowing(ItemBorrowingCreate(
                        itemId: item.id,
                        quantity: qty,
                        startDate:
                            DateTime.now().toIso8601String().split('T')[0],
                        endDate: endDate.toIso8601String().split('T')[0],
                        notes: 'Peminjaman',
                      ));

                      if (success && context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Permintaan peminjaman dikirim')),
                        );
                      }
                    }
                  },
                  child: const Text('Konfirmasi Peminjaman'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBorrowingsList(ItemsProvider provider, bool isDark) {
    if (provider.isLoading && provider.borrowings.isEmpty) {
      return const LoadingIndicator(message: 'Memuat peminjaman...');
    }

    if (provider.borrowings.isEmpty) {
      return const EmptyState(
        icon: Icons.assignment_return_outlined,
        title: 'Belum ada peminjaman',
        subtitle: 'Anda belum meminjam barang apapun',
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
          final itemName = provider.items
              .firstWhere(
                (i) => i.id == borrowing.itemId,
                orElse: () => const Item(
                    id: '',
                    name: 'Barang Tidak Diketahui',
                    stock: 0,
                    ownerUsername: ''),
              )
              .name;

          return _buildBorrowingCard(borrowing, itemName, isDark);
        },
      ),
    );
  }

  Widget _buildBorrowingCard(
      ItemBorrowing borrowing, String itemName, bool isDark) {
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
                'Jml: ${borrowing.quantity}',
                isDark,
              ),
              const SizedBox(width: 12),
              _buildInfoChip(
                Icons.calendar_today,
                'Sampai ${borrowing.endDate}',
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

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Tickets screen for viewing tickets
class TicketsScreen extends StatefulWidget {
  const TicketsScreen({super.key});

  @override
  State<TicketsScreen> createState() => _TicketsScreenState();
}

class _TicketsScreenState extends State<TicketsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TicketsProvider>().loadTickets();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ticketsProvider = context.watch<TicketsProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Column(
        children: [
          _buildStatsCards(ticketsProvider, isDark),
          _buildTabs(isDark),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ticketsProvider.loadTickets(),
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildTicketList(
                      ticketsProvider.tickets, ticketsProvider, isDark),
                  _buildTicketList(
                      ticketsProvider.openTickets, ticketsProvider, isDark),
                  _buildTicketList(ticketsProvider.inProgressTickets,
                      ticketsProvider, isDark),
                  _buildTicketList(
                      ticketsProvider.solvedTickets, ticketsProvider, isDark),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateTicketDialog(context),
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  void _showCreateTicketDialog(BuildContext context) {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    TicketPriority selectedPriority = TicketPriority.medium;
    TicketCategory? selectedCategory;
    final categories = context.read<TicketsProvider>().categories;

    if (categories.isNotEmpty) {
      selectedCategory = categories.first;
    }

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
                  'Create New Ticket',
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
                    labelText: 'Subject',
                    hintText: 'Enter ticket subject',
                  ),
                  autofocus: true,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descController,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    hintText: 'Describe your issue',
                  ),
                  maxLines: 4,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<TicketCategory>(
                  value: selectedCategory,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: categories.map((c) {
                    return DropdownMenuItem(
                      value: c,
                      child: Text(
                        c.name,
                        style: TextStyle(
                          color: isDark
                              ? AppColors.textPrimary
                              : AppColors.lightText,
                        ),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => selectedCategory = val);
                  },
                  dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<TicketPriority>(
                  value: selectedPriority,
                  decoration: const InputDecoration(labelText: 'Priority'),
                  items: TicketPriority.values.map((p) {
                    return DropdownMenuItem(
                      value: p,
                      child: Text(
                        p.toString().split('.').last.toUpperCase(),
                        style: TextStyle(
                          color: isDark
                              ? AppColors.textPrimary
                              : AppColors.lightText,
                        ),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => selectedPriority = val);
                  },
                  dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    if (titleController.text.trim().isNotEmpty &&
                        descController.text.trim().isNotEmpty &&
                        selectedCategory != null) {
                      final provider = context.read<TicketsProvider>();
                      final success = await provider.createTicket(TicketCreate(
                        title: titleController.text.trim(),
                        description: descController.text.trim(),
                        categoryId: selectedCategory!.id,
                        priority: selectedPriority,
                      ));
                      if (success && context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Ticket created successfully')),
                        );
                      }
                    } else if (selectedCategory == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Please select a category')),
                      );
                    }
                  },
                  child: const Text('Submit Ticket'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showEditTicketDialog(BuildContext context, Ticket ticket) {
    final titleController = TextEditingController(text: ticket.title);
    final descController = TextEditingController(text: ticket.description);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    TicketPriority selectedPriority = ticket.priority;
    TicketStatus selectedStatus = ticket.status;
    TicketCategory? selectedCategory;
    final categories = context.read<TicketsProvider>().categories;

    try {
      if (categories.isNotEmpty) {
        selectedCategory =
            categories.firstWhere((c) => c.id == ticket.categoryId);
      }
    } catch (_) {
      // Category might be deleted or not found
      if (categories.isNotEmpty) selectedCategory = categories.first;
    }

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
                  'Edit Ticket #${ticket.id}',
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
                    labelText: 'Subject',
                    hintText: 'Enter ticket subject',
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descController,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    hintText: 'Describe your issue',
                  ),
                  maxLines: 4,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<TicketStatus>(
                  value: selectedStatus,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: TicketStatus.values.map((s) {
                    return DropdownMenuItem(
                      value: s,
                      child: Text(
                        s.value.replaceAll('_', ' ').toUpperCase(),
                        style: TextStyle(
                          color: isDark
                              ? AppColors.textPrimary
                              : AppColors.lightText,
                        ),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => selectedStatus = val);
                  },
                  dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<TicketPriority>(
                  value: selectedPriority,
                  decoration: const InputDecoration(labelText: 'Priority'),
                  items: TicketPriority.values.map((p) {
                    return DropdownMenuItem(
                      value: p,
                      child: Text(
                        p.value.toUpperCase(),
                        style: TextStyle(
                          color: isDark
                              ? AppColors.textPrimary
                              : AppColors.lightText,
                        ),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => selectedPriority = val);
                  },
                  dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    if (titleController.text.trim().isNotEmpty &&
                        descController.text.trim().isNotEmpty) {
                      final provider = context.read<TicketsProvider>();
                      final success = await provider.updateTicket(
                        ticket.id,
                        TicketUpdate(
                          title: titleController.text.trim(),
                          description: descController.text.trim(),
                          priority: selectedPriority,
                          status: selectedStatus,
                          categoryId: selectedCategory?.id,
                        ),
                      );

                      if (success && context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Ticket updated successfully')),
                        );
                      }
                    }
                  },
                  child: const Text('Save Changes'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatsCards(TicketsProvider provider, bool isDark) {
    final stats = provider.stats;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: _buildMiniStat(
                'Total', '${stats?.total ?? 0}', AppColors.primaryBlue, isDark),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildMiniStat(
                'Open', '${stats?.open ?? 0}', AppColors.info, isDark),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildMiniStat('Progress', '${stats?.inProgress ?? 0}',
                AppColors.warning, isDark),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildMiniStat(
                'Solved', '${stats?.solved ?? 0}', AppColors.success, isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat(String label, String value, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: isDark ? AppColors.textMuted : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs(bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSurface.withOpacity(0.5)
            : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: TabBar(
        controller: _tabController,
        labelColor: AppColors.primaryBlue,
        unselectedLabelColor:
            isDark ? AppColors.textMuted : Colors.grey.shade600,
        indicatorSize: TabBarIndicatorSize.tab,
        indicator: BoxDecoration(
          color: AppColors.primaryBlue.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        tabs: const [
          Tab(text: 'All'),
          Tab(text: 'Open'),
          Tab(text: 'Progress'),
          Tab(text: 'Solved'),
        ],
      ),
    );
  }

  Widget _buildTicketList(
      List<Ticket> tickets, TicketsProvider provider, bool isDark) {
    if (provider.isLoading && tickets.isEmpty) {
      return const LoadingIndicator(message: 'Loading tickets...');
    }

    if (provider.error != null && tickets.isEmpty) {
      return ErrorDisplay(
        message: provider.error!,
        onRetry: () => provider.loadTickets(),
      );
    }

    if (tickets.isEmpty) {
      return const EmptyState(
        icon: Icons.confirmation_number_outlined,
        title: 'No tickets',
        subtitle: 'Tickets will appear here',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: tickets.length,
      itemBuilder: (context, index) {
        final ticket = tickets[index];
        return _buildTicketCard(ticket, isDark);
      },
    );
  }

  Widget _buildTicketCard(Ticket ticket, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () => _showEditTicketDialog(context, ticket),
        child: GlassCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _buildStatusBadge(ticket.status),
                  const Spacer(),
                  _buildPriorityBadge(ticket.priority),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                ticket.title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                ticket.description,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  if (ticket.categoryName != null) ...[
                    Icon(
                      Icons.category_outlined,
                      size: 14,
                      color:
                          isDark ? AppColors.textMuted : Colors.grey.shade500,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      ticket.categoryName!,
                      style: TextStyle(
                        fontSize: 12,
                        color:
                            isDark ? AppColors.textMuted : Colors.grey.shade500,
                      ),
                    ),
                    const SizedBox(width: 16),
                  ],
                  Icon(
                    Icons.tag,
                    size: 14,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade500,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '#${ticket.id}',
                    style: TextStyle(
                      fontSize: 12,
                      color:
                          isDark ? AppColors.textMuted : Colors.grey.shade500,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
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
        color = Colors.orange;
        break;
      case TicketStatus.solved:
        color = AppColors.success;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        status.value.replaceAll('_', ' ').toUpperCase(),
        style: TextStyle(
          fontSize: 10,
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
        Icon(Icons.flag, size: 14, color: color),
        const SizedBox(width: 4),
        Text(
          priority.value.toUpperCase(),
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }
}

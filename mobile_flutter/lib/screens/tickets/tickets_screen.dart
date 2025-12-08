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

class _TicketsScreenState extends State<TicketsScreen> with SingleTickerProviderStateMixin {
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
                  _buildTicketList(ticketsProvider.tickets, ticketsProvider, isDark),
                  _buildTicketList(ticketsProvider.openTickets, ticketsProvider, isDark),
                  _buildTicketList(ticketsProvider.inProgressTickets, ticketsProvider, isDark),
                  _buildTicketList(ticketsProvider.solvedTickets, ticketsProvider, isDark),
                ],
              ),
            ),
          ),
        ],
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
            child: _buildMiniStat('Total', '${stats?.total ?? 0}', AppColors.primaryBlue, isDark),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildMiniStat('Open', '${stats?.open ?? 0}', AppColors.info, isDark),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildMiniStat('Progress', '${stats?.inProgress ?? 0}', AppColors.warning, isDark),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildMiniStat('Solved', '${stats?.solved ?? 0}', AppColors.success, isDark),
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
        unselectedLabelColor: isDark ? AppColors.textMuted : Colors.grey.shade600,
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

  Widget _buildTicketList(List<Ticket> tickets, TicketsProvider provider, bool isDark) {
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
                    color: isDark ? AppColors.textMuted : Colors.grey.shade500,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    ticket.categoryName!,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.textMuted : Colors.grey.shade500,
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
                    color: isDark ? AppColors.textMuted : Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(TicketStatus status) {
    Color color;
    Color bgColor;
    String text;
    
    switch (status) {
      case TicketStatus.open:
        color = const Color(0xFF2563EB);
        bgColor = const Color(0xFFDBEAFE);
        text = 'Open';
        break;
      case TicketStatus.inProgress:
        color = const Color(0xFFD97706);
        bgColor = const Color(0xFFFEF3C7);
        text = 'In Progress';
        break;
      case TicketStatus.waiting:
        color = const Color(0xFF7C3AED);
        bgColor = const Color(0xFFEDE9FE);
        text = 'Waiting';
        break;
      case TicketStatus.solved:
        color = const Color(0xFF059669);
        bgColor = const Color(0xFFD1FAE5);
        text = 'Solved';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _buildPriorityBadge(TicketPriority priority) {
    Color color;
    String text;
    
    switch (priority) {
      case TicketPriority.low:
        color = Colors.grey;
        text = 'Low';
        break;
      case TicketPriority.medium:
        color = AppColors.info;
        text = 'Medium';
        break;
      case TicketPriority.high:
        color = AppColors.warning;
        text = 'High';
        break;
      case TicketPriority.critical:
        color = AppColors.error;
        text = 'Critical';
        break;
    }

    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            fontSize: 12,
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Dashboard overview screen matching frontend DashboardOverviewPage
class DashboardOverviewScreen extends StatefulWidget {
  const DashboardOverviewScreen({super.key});

  @override
  State<DashboardOverviewScreen> createState() =>
      _DashboardOverviewScreenState();
}

class _DashboardOverviewScreenState extends State<DashboardOverviewScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadDashboardData();
    });
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final dashboardProvider = context.watch<DashboardProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return RefreshIndicator(
      onRefresh: () => dashboardProvider.refresh(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome card
            _buildWelcomeCard(authProvider.user, isDark),
            const SizedBox(height: 24),

            // Balance Card
            _buildBalanceCard(authProvider.user, isDark),
            const SizedBox(height: 24),

            // Stats grid
            _buildStatsGrid(dashboardProvider, isDark),
            const SizedBox(height: 24),

            // Recent activity section
            _buildRecentActivitySection(dashboardProvider, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeCard(User? user, bool isDark) {
    return GradientGlassCard(
      padding: const EdgeInsets.all(24),
      borderRadius: 24,
      gradientColors: [
        AppColors.gradientBlue.withOpacity(0.15),
        AppColors.gradientCyan.withOpacity(0.15),
        AppColors.gradientIndigo.withOpacity(0.15),
      ],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${_getGreeting()},',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: isDark
                            ? AppColors.textPrimary
                            : AppColors.lightText,
                      ),
                    ),
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(
                        colors: [AppColors.primaryBlue, AppColors.accentCyan],
                      ).createShader(bounds),
                      child: Text(
                        user?.name ?? 'User',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Here's what's happening with your projects today.",
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark
                            ? AppColors.textSecondary
                            : AppColors.lightTextSecondary,
                      ),
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
              color: isDark
                  ? Colors.white.withOpacity(0.1)
                  : Colors.white.withOpacity(0.5),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isDark ? AppColors.borderLight : Colors.grey.shade200,
              ),
            ),
            child: Text(
              DateFormat('EEEE, MMMM d').format(DateTime.now()),
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: isDark ? AppColors.textPrimary : AppColors.lightText,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(DashboardProvider provider, bool isDark) {
    final stats = provider.stats;
    final isLoading = provider.isLoading;

    final statItems = [
      _StatItem(
        title: 'Total Tasks',
        value: isLoading ? '...' : '${stats?.totalTasks ?? 0}',
        icon: Icons.task_alt,
        subtitle: 'Check tasks',
        colors: [const Color(0xFF3B82F6), const Color(0xFF22D3EE)],
      ),
      _StatItem(
        title: 'Unread Messages',
        value: '0',
        icon: Icons.chat_bubble_outline,
        subtitle: 'Chat system',
        colors: [const Color(0xFF2563EB), const Color(0xFF6366F1)],
      ),
      _StatItem(
        title: 'Active Tickets',
        value: isLoading ? '...' : '${provider.activeTicketsCount}',
        icon: Icons.confirmation_number_outlined,
        subtitle: 'Open issues',
        colors: [const Color(0xFFF97316), const Color(0xFFEF4444)],
      ),
      _StatItem(
        title: 'Upcoming Events',
        value: isLoading ? '...' : '${provider.upcomingEventsCount}',
        icon: Icons.event,
        subtitle: 'Next: Soon',
        colors: [const Color(0xFF14B8A6), const Color(0xFF10B981)],
      ),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.1,
      ),
      itemCount: statItems.length,
      itemBuilder: (context, index) {
        final stat = statItems[index];
        return StatsCard(
          title: stat.title,
          value: stat.value,
          icon: stat.icon,
          subtitle: stat.subtitle,
          gradientColors: stat.colors,
        );
      },
    );
  }

  Widget _buildRecentActivitySection(DashboardProvider provider, bool isDark) {
    final activities = [
      ...provider.recentTickets.map((t) => _Activity(
            type: 'Ticket',
            title: t.title,
            time: t.createdAt != null
                ? DateFormat('MMM d').format(DateTime.parse(t.createdAt!))
                : 'Recently',
            status: t.status.value,
          )),
      ...provider.upcomingEvents.map((e) => _Activity(
            type: 'Event',
            title: e.title,
            time: DateFormat('MMM d').format(DateTime.parse(e.eventDate)),
            status: 'Upcoming',
          )),
    ].take(5).toList();

    return GlassCard(
      padding: const EdgeInsets.all(20),
      borderRadius: 24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Recent Activity',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimary : AppColors.lightText,
            ),
          ),
          const SizedBox(height: 20),
          if (provider.isLoading)
            const LoadingIndicator(message: 'Loading activities...')
          else if (activities.isEmpty)
            const EmptyState(
              icon: Icons.history,
              title: 'No recent activity',
              subtitle: 'Your recent activities will appear here',
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: activities.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final activity = activities[index];
                return _buildActivityItem(activity, isDark);
              },
            ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                // Navigate to full activity list
              },
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                side: BorderSide(
                  color: isDark ? AppColors.borderMedium : Colors.grey.shade300,
                ),
              ),
              child: Text(
                'View All Activity',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem(_Activity activity, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 8,
          height: 8,
          margin: const EdgeInsets.only(top: 6),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              colors: [AppColors.primaryBlue, AppColors.accentCyan],
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryBlue.withOpacity(0.5),
                blurRadius: 8,
                spreadRadius: 0,
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                activity.title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                '${activity.type} • ${activity.time} • ${activity.status}',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBalanceCard(User? user, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? [
                  const Color(0xFF1A2230).withOpacity(0.6),
                  const Color(0xFF1A2230).withOpacity(0.4)
                ]
              : [Colors.white.withOpacity(0.6), Colors.white.withOpacity(0.4)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark ? Colors.white.withOpacity(0.05) : Colors.grey.shade100,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Colors.green, Colors.teal],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.green.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Text('💰', style: TextStyle(fontSize: 24)),
              ),
              GestureDetector(
                onTap: () => context.push('/transactions'),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withOpacity(0.1)
                        : Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.history,
                        size: 16,
                        color: isDark
                            ? AppColors.textSecondary
                            : AppColors.lightTextSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'History',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? AppColors.textSecondary
                              : AppColors.lightTextSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Rp ${(user?.balance ?? 0).toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimary : AppColors.lightText,
              height: 1.2,
            ),
          ),
          Text(
            'Total Balance',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color:
                  isDark ? AppColors.textMuted : AppColors.lightTextSecondary,
            ),
          ),
          const SizedBox(height: 20),
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: _buildWalletAction(
                  icon: Icons.send,
                  label: 'Transfer',
                  color: Colors.blue,
                  onTap: () => context.push('/transfer'),
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildWalletAction(
                  icon: Icons.add_circle_outline,
                  label: 'Top Up',
                  color: Colors.green,
                  onTap: () => context.push('/topup'),
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildWalletAction(
                  icon: Icons.receipt_long,
                  label: 'History',
                  color: Colors.orange,
                  onTap: () => context.push('/transactions'),
                  isDark: isDark,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWalletAction({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color.withOpacity(0.2),
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textPrimary : AppColors.lightText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem {
  final String title;
  final String value;
  final IconData icon;
  final String subtitle;
  final List<Color> colors;

  _StatItem({
    required this.title,
    required this.value,
    required this.icon,
    required this.subtitle,
    required this.colors,
  });
}

class _Activity {
  final String type;
  final String title;
  final String time;
  final String status;

  _Activity({
    required this.type,
    required this.title,
    required this.time,
    required this.status,
  });
}

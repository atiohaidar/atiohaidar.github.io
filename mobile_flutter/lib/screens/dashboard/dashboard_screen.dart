import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import 'overview_screen.dart';
import '../tasks/tasks_screen.dart';
import '../tickets/tickets_screen.dart';
import '../events/events_screen.dart';


/// Main dashboard screen with bottom navigation
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  final List<_NavItem> _navItems = [
    _NavItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard'),
    _NavItem(icon: Icons.task_outlined, activeIcon: Icons.task, label: 'Tasks'),
    _NavItem(icon: Icons.confirmation_number_outlined, activeIcon: Icons.confirmation_number, label: 'Tickets'),
    _NavItem(icon: Icons.event_outlined, activeIcon: Icons.event, label: 'Events'),
    _NavItem(icon: Icons.more_horiz, activeIcon: Icons.more_horiz, label: 'More'),
  ];

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GradientBackground(
      showBlobs: false,
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: _buildAppBar(authProvider, isDark),
        body: IndexedStack(
          index: _currentIndex,
          children: [
            const DashboardOverviewScreen(),
            const TasksScreen(),
            const TicketsScreen(),
            const EventsScreen(),
            _buildMoreScreen(authProvider, isDark),
          ],
        ),
        bottomNavigationBar: _buildBottomNav(isDark),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(AuthProvider authProvider, bool isDark) {
    return AppBar(
      backgroundColor: isDark 
          ? AppColors.deepNavy.withOpacity(0.8)
          : Colors.white.withOpacity(0.8),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.gradientBlue, AppColors.gradientCyan],
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.dashboard,
              color: Colors.white,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Text(
            'Dashboard',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimary : AppColors.lightText,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: Icon(
            Icons.notifications_outlined,
            color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
          ),
          onPressed: () {},
        ),
        PopupMenuButton<String>(
          icon: CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.primaryBlue.withOpacity(0.2),
            child: Text(
              (authProvider.user?.name ?? 'U')[0].toUpperCase(),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
            ),
          ),
          onSelected: (value) {
            if (value == 'logout') {
              authProvider.logout();
            }
          },
          itemBuilder: (context) => [
            PopupMenuItem(
              value: 'profile',
              child: Row(
                children: [
                  const Icon(Icons.person_outline, size: 20),
                  const SizedBox(width: 8),
                  Text(authProvider.user?.name ?? 'Profile'),
                ],
              ),
            ),
            const PopupMenuDivider(),
            const PopupMenuItem(
              value: 'logout',
              child: Row(
                children: [
                  Icon(Icons.logout, size: 20, color: AppColors.error),
                  SizedBox(width: 8),
                  Text('Logout', style: TextStyle(color: AppColors.error)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildBottomNav(bool isDark) {
    return Container(
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
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(_navItems.length, (index) {
              final item = _navItems[index];
              final isSelected = _currentIndex == index;
              
              return GestureDetector(
                onTap: () => setState(() => _currentIndex = index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: EdgeInsets.symmetric(
                    horizontal: isSelected ? 16 : 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected 
                        ? AppColors.primaryBlue.withOpacity(0.1)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isSelected ? item.activeIcon : item.icon,
                        color: isSelected 
                            ? AppColors.primaryBlue 
                            : (isDark ? AppColors.textMuted : Colors.grey.shade500),
                        size: 24,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                          color: isSelected 
                              ? AppColors.primaryBlue 
                              : (isDark ? AppColors.textMuted : Colors.grey.shade500),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholderScreen(String title, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: AppColors.primaryBlue.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Coming soon...',
            style: TextStyle(
              fontSize: 14,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.textMuted
                  : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMoreScreen(AuthProvider authProvider, bool isDark) {
    final menuItems = [
      _MenuItem(
        icon: Icons.meeting_room_outlined,
        title: 'Rooms',
        subtitle: 'Manage rooms and bookings',
        onTap: () => context.push('/rooms'),
      ),
      _MenuItem(
        icon: Icons.article_outlined,
        title: 'Articles',
        subtitle: 'Manage articles and content',
        onTap: () => context.push('/articles'),
      ),
      _MenuItem(
        icon: Icons.inventory_2_outlined,
        title: 'Items',
        subtitle: 'Manage items and borrowings',
        onTap: () => context.push('/items'),
      ),
      _MenuItem(
        icon: Icons.dynamic_form_outlined,
        title: 'Forms',
        subtitle: 'Create and manage forms',
        onTap: () => context.push('/forms'),
      ),
      _MenuItem(
        icon: Icons.chat_outlined,
        title: 'Chat',
        subtitle: 'Messages and conversations',
        onTap: () {},
      ),
      if (authProvider.isAdmin)
        _MenuItem(
          icon: Icons.people_outline,
          title: 'Users',
          subtitle: 'Manage system users',
          onTap: () => context.push('/users'),
        ),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'More',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimary : AppColors.lightText,
            ),
          ),
          const SizedBox(height: 16),
          ...menuItems.map((item) => _buildMenuItem(item, isDark)),
        ],
      ),
    );
  }

  Widget _buildMenuItem(_MenuItem item, bool isDark) {
    return GlassCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      onTap: item.onTap,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primaryBlue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              item.icon,
              color: AppColors.primaryBlue,
              size: 22,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  item.subtitle,
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.chevron_right,
            color: isDark ? AppColors.textMuted : Colors.grey.shade400,
          ),
        ],
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

class _MenuItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  _MenuItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
}

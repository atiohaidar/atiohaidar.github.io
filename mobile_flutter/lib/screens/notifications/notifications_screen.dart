import 'package:flutter/material.dart';

import '../../widgets/widgets.dart';

/// Notifications screen
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: _buildBody(isDark),
    );
  }

  Widget _buildBody(bool isDark) {
    // Determine if we should show mock data or empty state
    // For now, let's show an empty state to be safe, or a few mock items.
    final notifications = [];

    if (notifications.isEmpty) {
      return const EmptyState(
        icon: Icons.notifications_none_outlined,
        title: 'No notifications',
        subtitle: 'You\'re all caught up! Check back later.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: notifications.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        // Mock item builder
        return Container();
      },
    );
  }
}

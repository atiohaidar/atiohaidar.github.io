import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Events screen for viewing events
class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  bool _showUpcoming = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<EventsProvider>().loadEvents();
    });
  }

  @override
  Widget build(BuildContext context) {
    final eventsProvider = context.watch<EventsProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: () => eventsProvider.loadEvents(),
        child: _buildBody(eventsProvider, isDark),
      ),
    );
  }

  Widget _buildBody(EventsProvider provider, bool isDark) {
    if (provider.isLoading && provider.events.isEmpty) {
      return const LoadingIndicator(message: 'Loading events...');
    }

    if (provider.error != null && provider.events.isEmpty) {
      return ErrorDisplay(
        message: provider.error!,
        onRetry: () => provider.loadEvents(),
      );
    }

    final displayEvents = _showUpcoming ? provider.upcomingEvents : provider.pastEvents;

    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverToBoxAdapter(
            child: _buildToggle(provider, isDark),
          ),
        ),
        if (displayEvents.isEmpty)
          SliverFillRemaining(
            child: EmptyState(
              icon: Icons.event_outlined,
              title: _showUpcoming ? 'No upcoming events' : 'No past events',
              subtitle: _showUpcoming 
                  ? 'New events will appear here'
                  : 'Past events will appear here',
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final event = displayEvents[index];
                  return _buildEventCard(event, isDark);
                },
                childCount: displayEvents.length,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildToggle(EventsProvider provider, bool isDark) {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _showUpcoming = true),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: _showUpcoming
                    ? AppColors.primaryBlue.withOpacity(0.1)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _showUpcoming
                      ? AppColors.primaryBlue
                      : (isDark ? AppColors.borderLight : Colors.grey.shade300),
                ),
              ),
              child: Column(
                children: [
                  Text(
                    '${provider.upcomingEvents.length}',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: _showUpcoming 
                          ? AppColors.primaryBlue
                          : (isDark ? AppColors.textSecondary : Colors.grey.shade600),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Upcoming',
                    style: TextStyle(
                      fontSize: 12,
                      color: _showUpcoming 
                          ? AppColors.primaryBlue
                          : (isDark ? AppColors.textMuted : Colors.grey.shade500),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _showUpcoming = false),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: !_showUpcoming
                    ? AppColors.primaryBlue.withOpacity(0.1)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: !_showUpcoming
                      ? AppColors.primaryBlue
                      : (isDark ? AppColors.borderLight : Colors.grey.shade300),
                ),
              ),
              child: Column(
                children: [
                  Text(
                    '${provider.pastEvents.length}',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: !_showUpcoming 
                          ? AppColors.primaryBlue
                          : (isDark ? AppColors.textSecondary : Colors.grey.shade600),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Past',
                    style: TextStyle(
                      fontSize: 12,
                      color: !_showUpcoming 
                          ? AppColors.primaryBlue
                          : (isDark ? AppColors.textMuted : Colors.grey.shade500),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEventCard(Event event, bool isDark) {
    final eventDate = DateTime.parse(event.eventDate);
    final isUpcoming = eventDate.isAfter(DateTime.now());
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Date card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                gradient: isUpcoming
                    ? const LinearGradient(
                        colors: [AppColors.gradientBlue, AppColors.gradientCyan],
                      )
                    : null,
                color: isUpcoming ? null : (isDark ? AppColors.darkSurface : Colors.grey.shade200),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Text(
                    DateFormat('d').format(eventDate),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: isUpcoming 
                          ? Colors.white
                          : (isDark ? AppColors.textSecondary : Colors.grey.shade600),
                    ),
                  ),
                  Text(
                    DateFormat('MMM').format(eventDate).toUpperCase(),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isUpcoming 
                          ? Colors.white.withOpacity(0.9)
                          : (isDark ? AppColors.textMuted : Colors.grey.shade500),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          event.title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.textPrimary : AppColors.lightText,
                          ),
                        ),
                      ),
                      if (isUpcoming)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.success.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Upcoming',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppColors.success,
                            ),
                          ),
                        ),
                    ],
                  ),
                  if (event.description != null && event.description!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        event.description!,
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 14,
                        color: isDark ? AppColors.textMuted : Colors.grey.shade500,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        DateFormat('HH:mm').format(eventDate),
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.textMuted : Colors.grey.shade500,
                        ),
                      ),
                      if (event.location != null) ...[
                        const SizedBox(width: 16),
                        Icon(
                          Icons.location_on_outlined,
                          size: 14,
                          color: isDark ? AppColors.textMuted : Colors.grey.shade500,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            event.location!,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? AppColors.textMuted : Colors.grey.shade500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

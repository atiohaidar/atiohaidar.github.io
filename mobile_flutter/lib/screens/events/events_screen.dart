import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
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
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateEventDialog(context),
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildBody(EventsProvider provider, bool isDark) {
    if (provider.isLoading && provider.events.isEmpty) {
      return const LoadingIndicator(message: 'Memuat acara...');
    }

    if (provider.error != null && provider.events.isEmpty) {
      return ErrorDisplay(
        message: provider.error!,
        onRetry: () => provider.loadEvents(),
      );
    }

    final displayEvents =
        _showUpcoming ? provider.upcomingEvents : provider.pastEvents;

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
              title: _showUpcoming
                  ? 'Tidak ada acara mendatang'
                  : 'Tidak ada acara yang lalu',
              subtitle: _showUpcoming
                  ? 'Acara baru akan muncul di sini'
                  : 'Acara yang lalu akan muncul di sini',
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
                          : (isDark
                              ? AppColors.textSecondary
                              : Colors.grey.shade600),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Mendatang',
                    style: TextStyle(
                      fontSize: 12,
                      color: _showUpcoming
                          ? AppColors.primaryBlue
                          : (isDark
                              ? AppColors.textMuted
                              : Colors.grey.shade500),
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
                          : (isDark
                              ? AppColors.textSecondary
                              : Colors.grey.shade600),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Lalu',
                    style: TextStyle(
                      fontSize: 12,
                      color: !_showUpcoming
                          ? AppColors.primaryBlue
                          : (isDark
                              ? AppColors.textMuted
                              : Colors.grey.shade500),
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
    // ... existing implementation ...
    final eventDate = DateTime.parse(event.eventDate);
    final isUpcoming = eventDate.isAfter(DateTime.now());

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        onTap: () => context.push('/events/${event.id}', extra: event),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Date card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                gradient: isUpcoming
                    ? const LinearGradient(
                        colors: [
                          AppColors.gradientBlue,
                          AppColors.gradientCyan
                        ],
                      )
                    : null,
                color: isUpcoming
                    ? null
                    : (isDark ? AppColors.darkSurface : Colors.grey.shade200),
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
                          : (isDark
                              ? AppColors.textSecondary
                              : Colors.grey.shade600),
                    ),
                  ),
                  Text(
                    DateFormat('MMM').format(eventDate).toUpperCase(),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isUpcoming
                          ? Colors.white.withOpacity(0.9)
                          : (isDark
                              ? AppColors.textMuted
                              : Colors.grey.shade500),
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
                            color: isDark
                                ? AppColors.textPrimary
                                : AppColors.lightText,
                          ),
                        ),
                      ),
                      if (isUpcoming)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.success.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Mendatang',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppColors.success,
                            ),
                          ),
                        ),
                    ],
                  ),
                  if (event.description != null &&
                      event.description!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        event.description!,
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark
                              ? AppColors.textMuted
                              : Colors.grey.shade600,
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
                        color:
                            isDark ? AppColors.textMuted : Colors.grey.shade500,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        DateFormat('HH:mm').format(eventDate),
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark
                              ? AppColors.textMuted
                              : Colors.grey.shade500,
                        ),
                      ),
                      if (event.location != null) ...[
                        const SizedBox(width: 16),
                        Icon(
                          Icons.location_on_outlined,
                          size: 14,
                          color: isDark
                              ? AppColors.textMuted
                              : Colors.grey.shade500,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            event.location!,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark
                                  ? AppColors.textMuted
                                  : Colors.grey.shade500,
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

  void _showCreateEventDialog(BuildContext context) {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    final locationController = TextEditingController();
    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
    TimeOfDay selectedTime = const TimeOfDay(hour: 10, minute: 0);
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
                  'Buat Acara Baru',
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
                    labelText: 'Judul',
                    hintText: 'Judul acara',
                  ),
                  autofocus: true,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: selectedDate,
                            firstDate: DateTime.now(),
                            lastDate:
                                DateTime.now().add(const Duration(days: 365)),
                          );
                          if (date != null) setState(() => selectedDate = date);
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
                              Icon(Icons.calendar_today,
                                  size: 20,
                                  color: isDark
                                      ? AppColors.textMuted
                                      : Colors.grey.shade600),
                              const SizedBox(width: 8),
                              Text(DateFormat('d MMM y').format(selectedDate)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: selectedTime,
                          );
                          if (time != null) setState(() => selectedTime = time);
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
                              Icon(Icons.access_time,
                                  size: 20,
                                  color: isDark
                                      ? AppColors.textMuted
                                      : Colors.grey.shade600),
                              const SizedBox(width: 8),
                              Text(selectedTime.format(context)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: locationController,
                  decoration: const InputDecoration(
                    labelText: 'Lokasi',
                    hintText: 'Lokasi acara',
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descController,
                  decoration: const InputDecoration(
                    labelText: 'Deskripsi',
                    hintText: 'Deskripsi acara',
                  ),
                  maxLines: 3,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () async {
                    if (titleController.text.trim().isNotEmpty) {
                      final provider = context.read<EventsProvider>();
                      final eventDateTime = DateTime(
                        selectedDate.year,
                        selectedDate.month,
                        selectedDate.day,
                        selectedTime.hour,
                        selectedTime.minute,
                      );

                      final success = await provider.createEvent(EventCreate(
                        title: titleController.text.trim(),
                        description: descController.text.trim(),
                        eventDate: eventDateTime.toIso8601String(),
                        location: locationController.text.trim(),
                      ));

                      if (success && context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Acara berhasil dibuat')),
                        );
                      }
                    }
                  },
                  child: const Text('Buat Acara'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

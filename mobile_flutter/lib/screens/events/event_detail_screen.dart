import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';
import '../../services/services.dart';

/// Event detail screen with attendee management
class EventDetailScreen extends StatefulWidget {
  final String eventId;
  final Event? event;

  const EventDetailScreen({
    super.key,
    required this.eventId,
    this.event,
  });

  @override
  State<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends State<EventDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  Event? _event;
  List<EventAttendee> _attendees = [];
  List<EventAdmin> _admins = [];
  bool _isLoading = false;
  bool _isRegistered = false;
  EventAttendee? _currentUserAttendee;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _event = widget.event;
    _loadEventData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadEventData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Load event if not provided
      if (_event == null) {
        _event = await ApiService.getEvent(widget.eventId);
      }

      // Load attendees
      _attendees = await ApiService.getEventAttendees(widget.eventId);

      // Load admins
      _admins = await ApiService.getEventAdmins(widget.eventId);

      // Check if current user is registered
      final authProvider = context.read<AuthProvider>();
      if (authProvider.isAuthenticated && authProvider.user != null) {
        final attendees = _attendees.where(
          (a) => a.userUsername == authProvider.user!.username,
        );
        if (attendees.isNotEmpty) {
          _currentUserAttendee = attendees.first;
          _isRegistered = true;
        } else {
          _currentUserAttendee = null;
          _isRegistered = false;
        }
      }

      setState(() {
        _isLoading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Event Details'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryBlue,
          unselectedLabelColor:
              isDark ? AppColors.textMuted : Colors.grey.shade500,
          indicatorColor: AppColors.primaryBlue,
          tabs: const [
            Tab(text: 'Info'),
            Tab(text: 'Attendees'),
            Tab(text: 'Admins'),
          ],
        ),
      ),
      body: _buildBody(isDark),
    );
  }

  Widget _buildBody(bool isDark) {
    if (_isLoading && _event == null) {
      return const LoadingIndicator(message: 'Loading event...');
    }

    if (_error != null) {
      return ErrorMessage(
        message: _error!,
        onRetry: _loadEventData,
      );
    }

    if (_event == null) {
      return const EmptyState(
        icon: Icons.event_outlined,
        message: 'Event not found',
      );
    }

    return TabBarView(
      controller: _tabController,
      children: [
        _buildInfoTab(isDark),
        _buildAttendeesTab(isDark),
        _buildAdminsTab(isDark),
      ],
    );
  }

  Widget _buildInfoTab(bool isDark) {
    return RefreshIndicator(
      onRefresh: _loadEventData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _event!.title,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppColors.textPrimary : AppColors.lightText,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildInfoRow(
                    Icons.calendar_today,
                    'Date',
                    DateFormat('EEEE, MMMM d, yyyy • h:mm a')
                        .format(DateTime.parse(_event!.eventDate)),
                    isDark,
                  ),
                  if (_event!.location != null) ...[
                    const SizedBox(height: 12),
                    _buildInfoRow(
                      Icons.location_on_outlined,
                      'Location',
                      _event!.location!,
                      isDark,
                    ),
                  ],
                  const SizedBox(height: 12),
                  _buildInfoRow(
                    Icons.people_outline,
                    'Attendees',
                    '${_attendees.length} registered',
                    isDark,
                  ),
                  const SizedBox(height: 12),
                  _buildInfoRow(
                    Icons.person_outline,
                    'Created by',
                    _event!.createdBy,
                    isDark,
                  ),
                ],
              ),
            ),
            if (_event!.description != null) ...[
              const SizedBox(height: 16),
              GlassCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Description',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.textPrimary : AppColors.lightText,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _event!.description!,
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark ? AppColors.textSecondary : Colors.grey.shade700,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 16),
            _buildRegistrationButton(isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(
      IconData icon, String label, String value, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: AppColors.primaryBlue,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRegistrationButton(bool isDark) {
    if (!context.read<AuthProvider>().isAuthenticated) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _toggleRegistration,
        style: ElevatedButton.styleFrom(
          backgroundColor:
              _isRegistered ? AppColors.error : AppColors.primaryBlue,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Text(
          _isRegistered ? 'Unregister' : 'Register for Event',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildAttendeesTab(bool isDark) {
    return RefreshIndicator(
      onRefresh: _loadEventData,
      child: _attendees.isEmpty
          ? const EmptyState(
              icon: Icons.people_outline,
              message: 'No attendees yet',
              description: 'Be the first to register!',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _attendees.length,
              itemBuilder: (context, index) {
                final attendee = _attendees[index];
                return _buildAttendeeCard(attendee, isDark);
              },
            ),
    );
  }

  Widget _buildAttendeeCard(EventAttendee attendee, bool isDark) {
    Color statusColor;
    IconData statusIcon;
    switch (attendee.status) {
      case AttendeeStatus.present:
        statusColor = AppColors.success;
        statusIcon = Icons.check_circle;
        break;
      case AttendeeStatus.absent:
        statusColor = AppColors.error;
        statusIcon = Icons.cancel;
        break;
      default:
        statusColor = AppColors.warning;
        statusIcon = Icons.schedule;
    }

    return GlassCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: AppColors.primaryBlue.withOpacity(0.2),
            child: Text(
              attendee.userUsername[0].toUpperCase(),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: AppColors.primaryBlue,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  attendee.userUsername,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                if (attendee.registeredAt != null)
                  Text(
                    'Registered ${_formatDate(DateTime.parse(attendee.registeredAt!))}',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                    ),
                  ),
              ],
            ),
          ),
          Icon(
            statusIcon,
            color: statusColor,
            size: 20,
          ),
        ],
      ),
    );
  }

  Widget _buildAdminsTab(bool isDark) {
    return RefreshIndicator(
      onRefresh: _loadEventData,
      child: _admins.isEmpty
          ? const EmptyState(
              icon: Icons.admin_panel_settings_outlined,
              message: 'No admins assigned',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _admins.length,
              itemBuilder: (context, index) {
                final admin = _admins[index];
                return _buildAdminCard(admin, isDark);
              },
            ),
    );
  }

  Widget _buildAdminCard(EventAdmin admin, bool isDark) {
    return GlassCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: AppColors.primaryBlue.withOpacity(0.2),
            child: const Icon(
              Icons.admin_panel_settings,
              color: AppColors.primaryBlue,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  admin.userUsername,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
                Text(
                  'Assigned by ${admin.assignedBy}',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    } else {
      return DateFormat('MMM d').format(date);
    }
  }

  Future<void> _toggleRegistration() async {
    try {
      setState(() => _isLoading = true);

      if (_isRegistered) {
        // Unregister
        await ApiService.unregisterFromEvent(
            widget.eventId, _currentUserAttendee!.id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Successfully unregistered'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } else {
        // Register
        await ApiService.registerForEvent(widget.eventId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Successfully registered!'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      }

      // Reload data
      await _loadEventData();
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: AppColors.error,
          ),
        );
      }
      setState(() => _isLoading = false);
    }
  }
}
